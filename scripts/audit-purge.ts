import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'
import { PrismaClient } from '@prisma/client'
import { purgeConfig, retentionWindow } from '../server/utils/auditRetention'

export async function runPurge(db: PrismaClient, env = process.env, now = new Date(), stop = () => false) {
  const id = randomUUID()
  const history = db.audit_log_purge_history
  // GET_LOCK is session scoped. The CLI owns a private, single-connection pool.
  const lock = 'nagamas.audit-retention.v1'
  let locked = false
  let message = 'Konfigurasi retensi tidak valid.'
  let estimate: bigint | undefined
  await history.create({ data: { id, started_at: now, mode: 'UNKNOWN', status: 'RUNNING' } })
  try {
    const { days, cutoff } = retentionWindow(now, env)
    const cfg = purgeConfig(env)
    if (cutoff.getTime() > Date.now() - days * 86400000) throw new Error(message)
    const deadline = performance.now() + cfg.seconds * 1000
    await history.update({ where: { id }, data: { cutoff, mode: cfg.mode, deadline_at: new Date(now.getTime() + cfg.seconds * 1000) } })
    let status = 'SKIPPED'
    if (cfg.mode !== 'DISABLED') {
      message = 'Gagal memperoleh lock database.'
      const [result] = await db.$queryRaw<{ acquired: bigint }[]>`SELECT GET_LOCK(${lock}, 0) AS acquired`
      if (result.acquired === null) throw new Error(message)
      locked = Number(result.acquired) === 1
    }
    if (locked) {
      message = 'Pemeriksaan atau pemrosesan database gagal.'
      const expired = { created_at: { lt: cutoff } }
      const count = async () => {
        const [row] = await db.$queryRaw<{ n: bigint }[]>`SELECT /*+ MAX_EXECUTION_TIME(30000) */ COUNT(*) AS n FROM audit_logs WHERE created_at < ${cutoff}`
        return row.n
      }
      const eligible = await count()
      await history.update({ where: { id }, data: { eligible, remaining: eligible } })
      if (cfg.mode === 'DRY_RUN') {
        status = 'DRY_RUN'
        estimate = eligible < BigInt(cfg.maxRows) ? eligible : BigInt(cfg.maxRows)
      } else {
        // The current schema has no dependent reviews or DELETE triggers.
        // Refuse an unreviewed database relationship instead of cascading into other data.
        const [deps] = await db.$queryRaw<{ n: bigint }[]>`SELECT
          (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME='audit_logs') +
          (SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE='audit_logs' AND EVENT_MANIPULATION='DELETE') AS n`
        if (Number(deps.n)) throw new Error(message)
        let deleted = 0
        while (eligible > 0n && deleted < cfg.maxRows && performance.now() < deadline && !stop()) {
          const size = Math.min(cfg.batch, cfg.maxRows - deleted, 10000)
          const batch = await db.$transaction(async tx => {
            const [owner] = await tx.$queryRaw<{ held: bigint }[]>`SELECT IS_USED_LOCK(${lock}) = CONNECTION_ID() AS held`
            if (Number(owner.held) !== 1) throw new Error('Lock lost')
            const candidates = await tx.audit_logs.findMany({ where: expired, select: { id: true }, orderBy: [{ created_at: 'asc' }, { id: 'asc' }], take: size })
            if (!candidates.length) return { count: 0, more: false }
            const { count } = await tx.audit_logs.deleteMany({ where: { ...expired, id: { in: candidates.map(row => row.id) } } })
            await tx.audit_log_purge_history.update({ where: { id }, data: { deleted: { increment: count }, remaining: null } })
            return { count, more: candidates.length === size }
          }, { timeout: Math.max(1, Math.min(30000, Math.ceil(deadline - performance.now()))) })
          deleted += batch.count
          if (!batch.more || deleted >= cfg.maxRows || stop()) break
          await sleep(Math.max(0, Math.min(cfg.delay, deadline - performance.now())))
        }
        const remaining = await count()
        await history.update({ where: { id }, data: { remaining } })
        status = remaining > 0n ? 'PARTIAL' : 'SUCCESS'
      }
    }
    const row = await history.update({ where: { id }, data: { status, finished_at: new Date() } })
    return { ...row, estimate }
  } catch {
    await history.update({ where: { id }, data: { status: 'FAILED', error_message: message, finished_at: new Date() } })
    throw new Error(message)
  } finally {
    if (locked) await db.$queryRaw`SELECT RELEASE_LOCK(${lock}) AS released`
  }
}

async function main() {
  const url = new URL(process.env.AUDIT_LOG_PURGE_DATABASE_URL ?? process.env.DATABASE_URL ?? '')
  url.searchParams.set('connection_limit', '1')
  const db = new PrismaClient({ datasourceUrl: url.toString() })
  let stopping = false
  process.once('SIGTERM', () => { stopping = true })
  process.once('SIGINT', () => { stopping = true })
  try {
    const row = await runPurge(db, process.env, new Date(), () => stopping)
    console.log(JSON.stringify(row, (_, value) => typeof value === 'bigint' ? value.toString() : value))
  } finally { await db.$disconnect() }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Job retensi gagal. Periksa koneksi dan purge history.'); process.exitCode = 1 })
}
