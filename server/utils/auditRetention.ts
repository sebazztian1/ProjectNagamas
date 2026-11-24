const DAY = 86_400_000

function integer(env: NodeJS.ProcessEnv, key: string, fallback: number, min: number) {
  const raw = env[key]
  if (raw === undefined) return fallback
  const n = Number(raw)
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(n) || n < min || n > 2_147_483_647) throw new Error(key)
  return n
}

function flag(env: NodeJS.ProcessEnv, key: string, fallback: boolean) {
  if (env[key] === undefined) return fallback
  if (env[key] === 'true') return true
  if (env[key] === 'false') return false
  throw new Error(key)
}

export function retentionWindow(now = new Date(), env = process.env) {
  const days = integer(env, 'AUDIT_LOG_RETENTION_DAYS', 60, 60)
  const cutoff = new Date(now.getTime() - days * DAY)
  if (!Number.isFinite(cutoff.getTime()) || cutoff.getUTCFullYear() < 1000) throw new Error('Invalid cutoff')
  return { days, cutoff }
}

export function purgeConfig(env = process.env) {
  const enabled = flag(env, 'AUDIT_LOG_PURGE_ENABLED', false)
  const dryRun = flag(env, 'AUDIT_LOG_PURGE_DRY_RUN', true)
  return {
    mode: !enabled ? 'DISABLED' : dryRun ? 'DRY_RUN' : 'DELETE',
    batch: integer(env, 'AUDIT_LOG_PURGE_BATCH_SIZE', 1000, 1),
    delay: integer(env, 'AUDIT_LOG_PURGE_BATCH_DELAY_MS', 200, 0),
    maxRows: integer(env, 'AUDIT_LOG_PURGE_MAX_ROWS', 100000, 1),
    seconds: integer(env, 'AUDIT_LOG_PURGE_MAX_DURATION_SECONDS', 600, 1)
  } as const
}

export function retainedDates(cutoff: Date, start: Date | null, end: Date | null) {
  return { gte: start && start > cutoff ? start : cutoff, ...(end && { lte: end }) }
}
