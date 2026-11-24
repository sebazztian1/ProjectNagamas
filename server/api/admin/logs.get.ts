import { defineEventHandler, getQuery, getRouterParam, createError, setHeader } from 'h3'
import { purgeConfig, retainedDates, retentionWindow } from '../../utils/auditRetention'
import { auditPurgeSummary } from '../../utils/auditPurgeSummary'
import { auditOwner, auditPresentation, auditDetailIp } from '../../utils/auditMetadata'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

function parseWibDateBound(raw: unknown, boundary: 'start' | 'end'): Date | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const timeSuffix = boundary === 'start' ? '00:00:00.000' : '23:59:59.999'
  const parsed = new Date(`${trimmed}T${timeSuffix}+07:00`)
  return Number.isNaN(parsed.getTime()) || new Date(parsed.getTime() + 7 * 3600000).toISOString().slice(0, 10) !== trimmed ? null : parsed
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  const query = getQuery(event)
  const viewer = await prisma.users.findFirst({ where: { id: session.userId, is_active: true, role: session.role }, select: { id: true, role: true } })
  if (!viewer) throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  setHeader(event, 'Cache-Control', 'private, no-store')
  const now = new Date()
  const { days, cutoff } = retentionWindow(now)
  let active = false
  try { active = purgeConfig().mode === 'DELETE' } catch { /* Invalid settings disable purge. */ }
  const rawPage = Number(query.page)
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1

  const rawLimit = Number(query.limit)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(100, Math.max(1, Math.floor(rawLimit)))
    : 25

  const entityType = typeof query.entityType === 'string' ? query.entityType.trim() : ''
  const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : ''
  const exportAll = query.exportAll === 'true' || query.exportAll === '1'

  const startBound = parseWibDateBound(query.startDate, 'start')
  const endBound = parseWibDateBound(query.endDate, 'end')

  if ((query.startDate !== undefined && !startBound) || (query.endDate !== undefined && !endBound) || (startBound && endBound && startBound > endBound)) {
    throw createError({ statusCode: 400, message: 'Rentang tanggal audit log tidak valid.' })
  }
  const where: any = { created_at: retainedDates(cutoff, startBound, endBound) }
  const id = getRouterParam(event, 'id')
  if (id !== undefined) {
    if (!/^\d{1,20}$/.test(id) || BigInt(id) > 18446744073709551615n) throw createError({ statusCode: 404 })
    where.id = BigInt(id)
  }
  if (entityType && entityType.toLowerCase() !== 'all') {
    where.entity_type = entityType
  }

  const include = {
    users: {
      select: {
        id: true,
        username: true,
        role: true
      }
    }
  }
  const orderBy = [{ created_at: 'desc' as const }, { id: 'desc' as const }]

  let rows: any[] = []
  let total = 0

  if (!search) {
    const [count, fetched] = await Promise.all([
      prisma.audit_logs.count({ where }),
      prisma.audit_logs.findMany({
        where,
        include,
        orderBy,
        ...(exportAll
          ? { take: 10000 }
          : { skip: (page - 1) * limit, take: limit })
      })
    ])
    total = count
    rows = fetched
  } else {
    const candidates = await prisma.audit_logs.findMany({
      where,
      include,
      orderBy,
      take: 5000
    })

    const filtered = candidates.filter((row) => {
      const presentation = auditPresentation(row.entity_type, row.action, row.detail)
      const haystacks = [
        row.action,
        row.entity_type,
        row.entity_id !== null ? String(row.entity_id) : '',
        row.entity_id !== null ? `#${row.entity_id}` : '',
        row.users?.username || '',
        row.users?.username ? `@${row.users.username}` : '',
        presentation.summary,
        presentation.target || ''
      ]
      return haystacks.some((value) => value.toLowerCase().includes(search))
    })

    total = filtered.length
    rows = exportAll
      ? filtered
      : filtered.slice((page - 1) * limit, page * limit)
  }

  const formattedLogs = rows.map((row) => ({
    id: row.id.toString(),
    userId: row.user_id ?? null,
    user: row.users?.username ? `@${row.users.username}` : 'Sistem',
    userRole: row.users?.role || 'system',
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? null,
    ...auditPresentation(row.entity_type, row.action, row.detail),
    ...(id !== undefined && !exportAll && auditOwner(viewer.role, viewer.id) ? { ipAddress: auditDetailIp(row.detail) } : {}),
    createdAt: row.created_at.toISOString()
  }))

  if (id !== undefined && !formattedLogs.length) throw createError({ statusCode: 404 })
  return {
    success: true,
    retention: { days, active, cutoff: cutoff.toISOString(), minDate: new Date(+cutoff + 7 * 3600000).toISOString().slice(0, 10) },
    monitor: query.monitor === 'true' && viewer.role === 'admin'
      ? await auditPurgeSummary(now, active).catch(() => ({
        lastStatus: null, cleanup: null, dry: null, warnings: ['Riwayat pembersihan belum dapat dibaca.']
      })) : null,
    logs: formattedLogs,
    pagination: {
      page: exportAll ? 1 : page,
      limit: exportAll ? total : limit,
      total,
      totalPages: exportAll ? 1 : Math.max(1, Math.ceil(total / limit))
    }
  }
})
