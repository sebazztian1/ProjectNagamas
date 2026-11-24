import test from 'node:test'
import assert from 'node:assert/strict'
import { purgeConfig, retainedDates, retentionWindow } from '../server/utils/auditRetention'

test('cutoff UTC inklusif dan filter WIB tidak bisa memperluas retensi', () => {
  const { cutoff } = retentionWindow(new Date('2026-11-24T00:00:00Z'), {})
  assert.equal(cutoff.toISOString(), '2026-09-25T00:00:00.000Z')
  const start = new Date('2026-09-25T00:00:00+07:00')
  const end = new Date('2026-09-24T23:59:59+07:00')
  assert.deepEqual(retainedDates(cutoff, start, end), { gte: cutoff, lte: end })
  assert.ok(end < cutoff)
  assert.throws(() => retentionWindow(new Date(NaN), {}))
  assert.throws(() => retentionWindow(new Date(), { AUDIT_LOG_RETENTION_DAYS: '59' }))
})

test('penghapusan mensyaratkan kedua flag eksplisit', () => {
  assert.equal(purgeConfig({}).mode, 'DISABLED')
  for (const enabled of ['false', 'true']) for (const dry of ['false', 'true']) {
    assert.equal(purgeConfig({ AUDIT_LOG_PURGE_ENABLED: enabled, AUDIT_LOG_PURGE_DRY_RUN: dry }).mode,
      enabled === 'false' ? 'DISABLED' : dry === 'true' ? 'DRY_RUN' : 'DELETE')
  }
  for (const raw of ['', 'True', '1', ' true']) assert.throws(() => purgeConfig({ AUDIT_LOG_PURGE_ENABLED: raw }))
  assert.throws(() => purgeConfig({ AUDIT_LOG_PURGE_MAX_ROWS: '0' }))
})
