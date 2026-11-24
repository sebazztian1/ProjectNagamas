import { prisma } from './prisma'

export async function auditPurgeSummary(now: Date, active: boolean) {
  const history = prisma.audit_log_purge_history
  const orderBy = { started_at: 'desc' as const }
  const [last, cleanup, dry, stale, failed] = await Promise.all([
    history.findFirst({ orderBy }),
    history.findFirst({ where: { status: { in: ['SUCCESS', 'PARTIAL'] }, mode: 'DELETE' }, orderBy }),
    history.findFirst({ where: { status: 'DRY_RUN' }, orderBy }),
    history.findFirst({ where: { status: 'RUNNING', OR: [
      { deadline_at: { lt: now } },
      { deadline_at: null, started_at: { lt: new Date(+now - 600000) } }
    ] }, select: { id: true } }),
    history.findFirst({ where: { status: { notIn: ['SKIPPED', 'RUNNING'] } }, orderBy })
  ])
  const warnings: string[] = []
  if (failed?.status === 'FAILED') warnings.push('Eksekusi terakhir gagal.')
  if (stale) warnings.push('Ada eksekusi yang melewati batas waktu dan belum selesai.')
  if (cleanup?.status === 'PARTIAL' && cleanup.remaining) warnings.push('Masih ada log kedaluwarsa yang menunggu pembersihan.')
  const activated = Date.parse(process.env.AUDIT_LOG_PURGE_ACTIVATED_AT || '')
  const since = Math.max(+(cleanup?.finished_at ?? 0), Number.isFinite(activated) && activated <= +now ? activated : 0)
  if (active && +now - since > 48 * 3600000) warnings.push('Belum ada pembersihan berhasil dalam 48 jam terakhir.')
  return {
    lastStatus: last?.status ?? null,
    cleanup: cleanup && { at: cleanup.finished_at, deleted: String(cleanup.deleted) },
    dry: dry && { at: dry.finished_at, eligible: String(dry.eligible) },
    warnings
  }
}
