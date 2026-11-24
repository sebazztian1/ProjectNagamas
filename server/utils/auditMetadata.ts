import { isIP } from 'node:net'

type Scalar = string | number | boolean | null
type Metadata = Record<string, unknown>
const fields: Record<string, Record<string, string>> = {
  category: { name: 'Nama kategori', slug: 'Slug' },
  auth: { username: 'Nama pengguna', role: 'Peran' },
  customer: { username: 'Nama pengguna', isActive: 'Akun aktif', canOrder: 'Boleh memesan', canRequest: 'Boleh mengajukan permintaan', canChat: 'Boleh mengirim pesan' },
  order: { orderCode: 'Kode pesanan', status: 'Status pesanan', shippingCost: 'Ongkos kirim', totalAmount: 'Total tagihan', verifiedAmount: 'Pembayaran terverifikasi' },
  request: { productName: 'Nama produk', status: 'Status permintaan', quotedPrice: 'Harga penawaran', tripTitle: 'Trip', productId: 'ID produk', tripId: 'ID trip' },
  product: { name: 'Nama produk', price: 'Harga', productType: 'Jenis produk', stockStatus: 'Status stok', stockQuantity: 'Jumlah stok', categoryId: 'ID kategori', tripId: 'ID trip', quota: 'Kuota', maxQtyPerOrder: 'Batas per pesanan', isActive: 'Produk aktif', sourceProductId: 'ID produk asal' },
  trip: { title: 'Nama trip', country: 'Negara', city: 'Kota', currency: 'Mata uang', exchangeRate: 'Kurs', status: 'Status trip', quota: 'Kuota', openDate: 'Tanggal buka', closeDate: 'Tanggal tutup', departureDate: 'Tanggal berangkat', arrivalDate: 'Estimasi tiba' }
}
function object(value: unknown): Metadata {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Metadata : {}
}
function decode(raw: unknown) {
  if (typeof raw !== 'string') return object(raw)
  try { return object(JSON.parse(raw)) } catch { return {} }
}
function scalar(value: unknown): value is Scalar {
  if (value === null || typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  return typeof value === 'string' && value.length <= 256 &&
    !/[\x00-\x1f{}\[\]]|:\/\/|\bBearer\s+|\beyJ[\w-]+\.[\w-]+\.|(?:password|passwd|token|otp|cookie|authorization|secret|api[_-]?key)\s*[:=]/i.test(value)
}
function pick(data: Metadata, keys: string[]) {
  const result: Record<string, Scalar> = {}
  for (const key of keys) {
    const value = data[key]
    if (Object.hasOwn(data, key) && scalar(value)) result[key] = value
  }
  return result
}
function labels(entity: string): Record<string, string> { return Object.hasOwn(fields, entity) ? fields[entity]! : {} }

export function auditStorageMetadata(entity: string, raw: unknown) {
  const data = decode(raw)
  const keys = Object.keys(labels(entity))
  const result: Metadata = pick(data, [...keys, 'fromStatus', 'toStatus', 'slug'])
  for (const key of ['previous', 'current']) {
    if (Object.hasOwn(data, key)) result[key] = pick(object(data[key]), keys)
  }
  if (typeof data.ip === 'string' && isIP(data.ip)) result.ip = data.ip
  if (typeof data.phone === 'string' && /^\+?[\d ()-]{5,24}$/.test(data.phone)) result.phone = data.phone
  return result
}

const statuses: Record<string, string> = {
  in_stock: 'Tersedia', out_of_stock: 'Habis', pending_payment: 'Menunggu pembayaran', verified: 'Terverifikasi',
  rejected: 'Ditolak', cancelled: 'Dibatalkan', arrived: 'Tiba', purchasing: 'Dalam pembelian', ready_handover: 'Siap diserahkan',
  completed: 'Selesai', pending: 'Menunggu', quoted: 'Ditawarkan', accepted: 'Diterima', available: 'Tersedia', open: 'Dibuka', closed: 'Ditutup',
  pending_approval: 'Menunggu persetujuan', payment_uploaded: 'Bukti pembayaran diunggah', expired: 'Kedaluwarsa', reviewed: 'Ditinjau', draft: 'Draf'
}
function display(key: string, value: Scalar | undefined) {
  if (value === undefined) return 'Tidak tercatat'
  if (value === null || value === '') return 'Kosong'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (typeof value === 'number' && ['price','quotedPrice','totalAmount','shippingCost','verifiedAmount'].includes(key)) return 'Rp ' + value.toLocaleString('id-ID')
  if ((key === 'status' || key === 'stockStatus') && Object.hasOwn(statuses, String(value))) return statuses[String(value)]!
  return String(value)
}

export function auditPresentation(entity: string, action: string, raw: unknown) {
  const data = decode(raw)
  const allowed = labels(entity)
  const keys = Object.keys(allowed)
  const values = pick(data, keys)
  const before = pick(object(data.previous), keys)
  const after = pick(object(data.current), keys)
  if (allowed.status && scalar(data.toStatus)) {
    after.status = data.toStatus
    if (scalar(data.fromStatus)) before.status = data.fromStatus
  }
  const hasSnapshot = 'previous' in data || 'current' in data || Object.hasOwn(after, 'status')
  const legacyUpdate = !hasSnapshot && /^(UPDATE_|REQUEST_)/.test(action)
  const changes: { label: string; before: string; after: string }[] = []
  const facts: { label: string; value: string }[] = []
  for (const key of keys) {
    if (legacyUpdate && Object.hasOwn(values, key) && !['orderCode','username','productName'].includes(key)) after[key] = values[key]!
    if (Object.hasOwn(after, key)) {
      if (before[key] !== after[key]) changes.push({ label: allowed[key]!, before: display(key, before[key]), after: display(key, after[key]) })
    } else if (!hasSnapshot && !legacyUpdate && Object.hasOwn(values, key)) {
      facts.push({ label: allowed[key]!, value: display(key, values[key]) })
    }
  }
  const target = values.orderCode ?? values.name ?? values.title ?? values.productName ?? (values.username ? '@' + values.username : null)
  const summary = [...changes.map(x => x.label + ': ' + x.before + ' → ' + x.after), ...facts.map(x => x.label + ': ' + x.value)].join(' · ')
  return { target: target === null ? null : String(target), facts, changes, summary: summary || 'Tidak ada rincian tambahan.' }
}

export function auditOwner(role: string, userId: number, configured = process.env.AUDIT_LOG_OWNER_USER_ID) {
  return role === 'admin' && Number.isSafeInteger(userId) && userId > 0 && configured === String(userId)
}
export function auditDetailIp(raw: unknown) {
  const ip = decode(raw).ip
  return typeof ip === 'string' && isIP(ip) ? ip : null
}
