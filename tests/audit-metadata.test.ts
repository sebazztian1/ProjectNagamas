import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createApp, createRouter, toNodeListener } from 'h3'
import { auditStorageMetadata, auditPresentation } from '../server/utils/auditMetadata'
import { createSessionToken } from '../server/utils/session'

test('metadata baru hanya menyimpan field yang diizinkan, termasuk IP valid', () => {
  const raw = { name: 'Dompet', ip: '192.0.2.8', password: 'private', token: 'private', otp: '123456', cookie: 'private',
    current: { name: 'Tas', slug: { sessionCookie: 'private' }, accessToken: 'private' }, previous: { slug: 'token=private' } }
  assert.deepEqual(auditStorageMetadata('category', raw), { name: 'Dompet', ip: '192.0.2.8', current: { name: 'Tas' }, previous: {} })
  assert.equal(auditStorageMetadata('auth', { ip: 'not an address' }).ip, undefined)
})

test('ringkasan membedakan perubahan, nilai kosong, dan nilai yang tidak pernah dicatat', () => {
  const detail = { previous: { stockQuantity: 0, stockStatus: 'in_stock', price: null }, current: { stockQuantity: 2, stockStatus: 'in_stock', price: 10000 } }
  const result = auditPresentation('product', 'UPDATE_PRODUCT', detail)
  assert.deepEqual(result.changes, [
    { label: 'Harga', before: 'Kosong', after: 'Rp 10.000' }, { label: 'Jumlah stok', before: '0', after: '2' }
  ])
  assert.equal(auditPresentation('category', 'UPDATE_CATEGORY', '{"name":"Tas"}').changes[0]?.before, 'Tidak tercatat')
  assert.equal(auditPresentation('unknown', 'ANY', { secret: 'private' }).facts.length, 0)
})

test('HTTP membatasi detail, pencarian dan ekspor menggunakan sesi dan ID Owner server', async t => {
  const original = process.env.AUDIT_LOG_OWNER_USER_ID
  process.env.AUDIT_LOG_OWNER_USER_ID = '1'
  t.after(() => { if (original === undefined) delete process.env.AUDIT_LOG_OWNER_USER_ID; else process.env.AUDIT_LOG_OWNER_USER_ID = original })
  const raw = { ip: '192.0.2.8', userAgent: 'AgentRahasia', password: 'SecretFixture', username: 'Budi', role: 'admin' }
  const row = { id: 1n, user_id: 1, users: { username: 'Budi', role: 'admin' }, entity_type: 'auth', action: 'LOGIN_ADMIN', entity_id: 1, detail: raw, created_at: new Date() }
  const fixture = {
    users: { findFirst: async ({ where }: { where: { id: number; role: string } }) => where.id === 4 ? null : where },
    audit_logs: { findMany: async () => [row], count: async () => 1 }
  }
  // The server's Prisma singleton is supplied before loading the route in this isolated test process.
  const globals = globalThis as typeof globalThis & { prisma?: typeof fixture }
  const previous = globals.prisma
  globals.prisma = fixture
  t.after(() => { if (previous) globals.prisma = previous; else delete globals.prisma })
  const { default: handler } = await import('../server/api/admin/logs.get')
  const router = createRouter().get('/api/admin/logs', handler).get('/audit-log/:id', handler)
  const server = createServer(toNodeListener(createApp().use(router)))
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => server.close())
  const port = (server.address() as { port: number }).port
  const get = (path: string, userId: number, role: 'admin' | 'staff' | 'customer') => fetch('http://127.0.0.1:' + port + path, {
    headers: { authorization: 'Bearer ' + createSessionToken({ role, userId, username: 'test', phone_number: '' }) }
  })
  for (const [id, role] of [[1, 'admin'], [2, 'admin'], [3, 'staff']] as const) {
    for (const path of ['/api/admin/logs', '/api/admin/logs?exportAll=true', '/audit-log/1', '/audit-log/1?exportAll=true']) {
      const res = await get(path, id, role)
      assert.equal(res.status, 200)
      const body = await res.json()
      const log = body.logs[0]
      assert.equal(log.ipAddress, path === '/audit-log/1' && id === 1 ? raw.ip : undefined)
      assert.equal(log.detail, undefined)
      assert.doesNotMatch(JSON.stringify(body), /AgentRahasia|SecretFixture|userAgent|"password"/)
      if (log.ipAddress === undefined) assert.ok(!JSON.stringify(body).includes(raw.ip))
    }
    for (const hidden of [raw.ip, raw.userAgent, raw.password]) {
      const res = await get('/api/admin/logs?search=' + hidden, id, role)
      assert.equal((await res.json()).pagination.total, 0)
    }
  }
  delete process.env.AUDIT_LOG_OWNER_USER_ID
  assert.equal((await (await get('/audit-log/1', 1, 'admin')).json()).logs[0].ipAddress, undefined)
  assert.equal((await get('/audit-log/1', 4, 'admin')).status, 403)
  assert.equal((await get('/audit-log/1', 5, 'customer')).status, 403)
})
