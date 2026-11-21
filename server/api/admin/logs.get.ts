import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

function parseWibDateBound(raw: unknown, boundary: 'start' | 'end'): Date | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const timeSuffix = boundary === 'start' ? '00:00:00.000' : '23:59:59.999'
  const parsed = new Date(`${trimmed}T${timeSuffix}+07:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  const query = getQuery(event)
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

  const where: any = {}
  if (entityType && entityType.toLowerCase() !== 'all') {
    where.entity_type = entityType
  }

  if (startBound || endBound) {
    where.created_at = {}
    if (startBound) where.created_at.gte = startBound
    if (endBound) where.created_at.lte = endBound
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
      const haystacks = [
        row.action,
        row.entity_type,
        row.entity_id !== null ? String(row.entity_id) : '',
        row.entity_id !== null ? `#${row.entity_id}` : '',
        row.users?.username || '',
        row.users?.username ? `@${row.users.username}` : '',
        row.detail ? JSON.stringify(row.detail) : ''
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
    detail: row.detail ?? null,
    createdAt: row.created_at.toISOString()
  }))

  return {
    success: true,
    logs: formattedLogs,
    pagination: {
      page: exportAll ? 1 : page,
      limit: exportAll ? total : limit,
      total,
      totalPages: exportAll ? 1 : Math.max(1, Math.ceil(total / limit))
    }
  }
})
