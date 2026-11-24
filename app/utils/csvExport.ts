type ColumnKind = 'date' | 'datetime' | 'identifier' | 'status' | 'number' | 'sequence'

interface ReportColumn {
  header: string
  kind?: ColumnKind
  minWidth?: number
  numberFormat?: string
}

export interface CsvColumn<T> extends ReportColumn {
  key?: keyof T
  format?: (row: T, index: number) => string | number | boolean | Date | null | undefined
}

export interface CsvSummaryItem {
  label: string
  value: string | number
}

export interface DateRangeFilterResult<T> {
  items: T[]
  totalBeforeFilter: number
  minTimestamp: Date | null
  maxTimestamp: Date | null
  filterStartDate: string
  filterEndDate: string
}

export interface BuildCsvOptions<T> {
  columns: CsvColumn<T>[]
  rows: T[]
  minTimestamp?: Date | null
  maxTimestamp?: Date | null
  filterStartDate?: string
  filterEndDate?: string
  reportTitle?: string
  summaryItems?: CsvSummaryItem[]
  exportedAt?: Date
}

export interface DownloadCsvOptions<T> extends BuildCsvOptions<T> {
  filenamePrefix: string
}

const WIB_TIMEZONE = 'Asia/Jakarta'
const wibFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: WIB_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
})

function getWibDateParts(date: Date): Record<string, string> {
  const parts: Record<string, string> = {}
  for (const part of wibFormatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      parts[part.type] = part.value
    }
  }
  return parts
}

export function parseDateValue(input: string | number | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') return null
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatCsvDateOnly(input: string | number | Date | null | undefined): string {
  const date = parseDateValue(input)
  if (!date) return ''
  const p = getWibDateParts(date)
  return `${p.year}-${p.month}-${p.day}`
}

export function formatReadableTimestamp(input: string | number | Date | null | undefined): string {
  const date = parseDateValue(input)
  if (!date) return '-'
  const formatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: WIB_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).format(date)
  return `${formatted} WIB`
}

export function getTodayWibDateInput(baseDate: Date = new Date()): string {
  return formatCsvDateOnly(baseDate)
}

export function getWibDateOffsetInput(daysOffset: number, baseDate: Date = new Date()): string {
  const wibToday = getTodayWibDateInput(baseDate)
  const anchor = parseWibDateBound(wibToday, 'start')
  if (!anchor) return wibToday
  const shifted = new Date(anchor.getTime() + daysOffset * 24 * 60 * 60 * 1000)
  return formatCsvDateOnly(shifted)
}

export function getWibMonthStartInput(baseDate: Date = new Date()): string {
  const today = getTodayWibDateInput(baseDate)
  return `${today.slice(0, 7)}-01`
}

export function parseWibDateBound(dateStr: string | undefined | null, boundary: 'start' | 'end'): Date | null {
  if (!dateStr) return null
  const trimmed = dateStr.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const timeSuffix = boundary === 'start' ? '00:00:00.000' : '23:59:59.999'
  const parsed = new Date(`${trimmed}T${timeSuffix}+07:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isValidDateRange(startDate?: string | null, endDate?: string | null): boolean {
  if (!startDate || !endDate) return true
  const start = parseWibDateBound(startDate, 'start')
  const end = parseWibDateBound(endDate, 'end')
  if (!start || !end) return false
  return start.getTime() <= end.getTime()
}

export function filterByDateRange<T>(
  items: readonly T[],
  getTimestamp: (item: T) => string | number | Date | null | undefined,
  startDate?: string | null,
  endDate?: string | null,
  sortOrder: 'asc' | 'desc' = 'desc'
): DateRangeFilterResult<T> {
  const cleanStart = (startDate || '').trim()
  const cleanEnd = (endDate || '').trim()
  const startBound = cleanStart ? parseWibDateBound(cleanStart, 'start') : null
  const endBound = cleanEnd ? parseWibDateBound(cleanEnd, 'end') : null

  if (startBound && endBound && startBound.getTime() > endBound.getTime()) {
    return {
      items: [],
      totalBeforeFilter: items.length,
      minTimestamp: null,
      maxTimestamp: null,
      filterStartDate: cleanStart,
      filterEndDate: cleanEnd
    }
  }

  const hasFilter = Boolean(startBound || endBound)
  const matched: { item: T; timeMs: number | null; date: Date | null }[] = []

  for (const item of items) {
    const parsed = parseDateValue(getTimestamp(item))
    if (!parsed) {
      if (!hasFilter) {
        matched.push({ item, timeMs: null, date: null })
      }
      continue
    }

    const ms = parsed.getTime()
    if (startBound && ms < startBound.getTime()) continue
    if (endBound && ms > endBound.getTime()) continue

    matched.push({ item, timeMs: ms, date: parsed })
  }

  matched.sort((a, b) => {
    if (a.timeMs === null && b.timeMs === null) return 0
    if (a.timeMs === null) return 1
    if (b.timeMs === null) return -1
    return sortOrder === 'asc' ? a.timeMs - b.timeMs : b.timeMs - a.timeMs
  })

  let minMs: number | null = null
  let maxMs: number | null = null
  for (const entry of matched) {
    if (entry.timeMs === null) continue
    if (minMs === null || entry.timeMs < minMs) minMs = entry.timeMs
    if (maxMs === null || entry.timeMs > maxMs) maxMs = entry.timeMs
  }

  return {
    items: matched.map(entry => entry.item),
    totalBeforeFilter: items.length,
    minTimestamp: minMs !== null ? new Date(minMs) : null,
    maxTimestamp: maxMs !== null ? new Date(maxMs) : null,
    filterStartDate: cleanStart,
    filterEndDate: cleanEnd
  }
}

interface ReportDate {
  value: Date
  text: string
  withTime: boolean
}

export type ReportCell = string | number | ReportDate

export interface ReportTable {
  columns: ReportColumn[]
  rows: ReportCell[][]
}

export interface ReportFile {
  format: 'CSV' | 'XLSX'
  filename: string
  blob: Blob
}

const reportNumber = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 20 })
// Excel's default list separator follows the regional decimal separator.
const csvDelimiter = new Intl.NumberFormat().format(1.1).includes(',') ? ';' : ','
const statusLabels: Record<string, string> = {
  pending_approval: 'Menunggu persetujuan', pending_payment: 'Menunggu pembayaran',
  payment_uploaded: 'Bukti pembayaran diunggah', verified: 'Terverifikasi',
  pending: 'Menunggu verifikasi', purchasing: 'Dalam pembelian', arrived: 'Tiba di Indonesia',
  ready_handover: 'Sedang dikirim', ready_pickup: 'Sedang dikirim', completed: 'Selesai',
  rejected: 'Ditolak', cancelled: 'Dibatalkan', expired: 'Kedaluwarsa', draft: 'Draf',
  open: 'Dibuka', closed: 'Ditutup', in_stock: 'Tersedia', out_of_stock: 'Habis'
}

function reportCell(raw: unknown, kind?: ColumnKind): ReportCell {
  if (kind === 'date' || kind === 'datetime' || raw instanceof Date) {
    const date = parseDateValue(raw as string | number | Date | null | undefined)
    if (!date) return '-'
    const p = getWibDateParts(date)
    const withTime = kind !== 'date'
    const day = `${p.day}/${p.month}/${p.year}`
    const time = `${p.hour}:${p.minute}:${p.second}`
    // Excel stores a wall-clock time without a timezone. Encode the WIB clock as UTC.
    const value = new Date(`${p.year}-${p.month}-${p.day}T${withTime ? time : '00:00:00'}Z`)
    return { value, text: withTime ? `${day} ${time}` : day, withTime }
  }
  if (raw == null || (typeof raw === 'string' && !raw.trim())) return '-'
  if (kind === 'identifier') return String(raw)
  if (kind === 'status' && typeof raw === 'string' && Object.hasOwn(statusLabels, raw)) {
    return statusLabels[raw]!
  }
  if (kind === 'number') {
    const number = Number(raw)
    return Number.isFinite(number) ? number : '-'
  }
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : '-'
  if (typeof raw === 'boolean') return raw ? 'Ya' : 'Tidak'
  return String(raw)
}

export function reportCellText(cell: ReportCell): string {
  if (typeof cell === 'number') return reportNumber.format(cell)
  return typeof cell === 'string' ? cell : cell.text
}

function csvField(cell: ReportCell): string {
  let text = reportCellText(cell)
  if (typeof cell === 'string' && text !== '-' && /^(?:\s*[=+@-]|[\t\r\n])/.test(text)) {
    text = `'${text}`
  }
  const singleLine = text.replace(/\s*[\r\n]+\s*/g, ' ')
  return `"${singleLine.replace(/"/g, '""')}"`
}

function reportTable<T>({ columns, rows }: BuildCsvOptions<T>, dateIndex: number): ReportTable {
  return {
    columns: [
      { header: 'Timestamp (WIB)', kind: 'datetime', numberFormat: 'yyyy-mm-dd hh:mm:ss' },
      { header: 'No', kind: 'sequence' }, ...columns
    ],
    rows: rows.map((row, index) => {
      const cells = columns.map(col => {
        const value = col.format ? col.format(row, index) : col.key !== undefined ? row[col.key] : null
        return reportCell(value, col.kind)
      })
      const date = cells[dateIndex]
      // ReportDate.value already represents the WIB wall clock.
      const timestamp = typeof date === 'object'
        ? { ...date, text: date.value.toISOString().slice(0, 19).replace('T', ' '), withTime: true }
        : ''
      return [timestamp, index + 1, ...cells]
    })
  }
}

function csvContent(table: ReportTable): string {
  const headers = table.columns.map(column => column.header)
  const lines = [headers.map(csvField).join(csvDelimiter)]
  for (const row of table.rows) {
    lines.push(row.map(csvField).join(csvDelimiter))
  }
  return '\uFEFF' + lines.join('\r\n')
}

function timestampedCsvFilename<T>(options: DownloadCsvOptions<T>): string {
  const names: Record<string, string> = {
    nagamas_rekap_pesanan: 'dashboard_rekap-pesanan',
    nagamas_mutasi_pembayaran: 'dashboard_mutasi-pembayaran',
    nagamas_laporan_trip: 'dashboard_batch-trip-kurs',
    nagamas_valuasi_produk: 'dashboard_valuasi-stok',
    nagamas_audit_log: 'dashboard_audit-log',
    trip_jastip_nagamas: 'trip_daftar-trip',
    produk_valuasi_stok: 'produk_valuasi-stok',
    pelanggan_rekap_accounting: 'pelanggan_rekap-pelanggan',
    pesanan_rekap: 'pesanan_rekap-pesanan',
    pesanan_detail_item: 'pesanan_detail-item',
    mutasi_pembayaran: 'pesanan_mutasi-pembayaran',
    audit_log_nagamas: 'log_audit-log',
    request_produk_pipeline: 'request_permintaan-produk'
  }
  const prefix = options.filenamePrefix
  const detail = /^(trip|pelanggan)_.+_(pesanan|request|daftar_belanja|katalog_margin)$/.exec(prefix)
  const name = detail ? `${detail[1]}_${detail[2]!.replace(/_/g, '-')}` : names[prefix] ?? 'laporan_export'
  const start = options.filterStartDate?.replace(/-/g, '')
  const end = options.filterEndDate?.replace(/-/g, '')
  const range = [start && `dari-${start}`, end && `sampai-${end}`].filter(Boolean).join('_sd_')
  const p = getWibDateParts(options.exportedAt ?? new Date())
  const time = `${p.year}${p.month}${p.day}-${p.hour}${p.minute}${p.second}`
  return [name, range, time].filter(Boolean).join('_') + '.csv'
}

function summaryTable<T>(options: BuildCsvOptions<T>): ReportTable {
  const { filterStartDate, filterEndDate } = options
  const period = filterStartDate || filterEndDate
    ? `${filterStartDate ? reportCellText(reportCell(filterStartDate, 'date')) : 'Awal'} s/d ${filterEndDate ? reportCellText(reportCell(filterEndDate, 'date')) : 'Sekarang'}`
    : 'Semua periode'
  return {
    columns: [{ header: 'Keterangan' }, { header: 'Nilai' }],
    rows: [
      ['Nama laporan', options.reportTitle || 'Laporan admin'],
      ['Waktu data paling awal (WIB)', reportCell(options.minTimestamp, 'datetime')],
      ['Waktu data paling akhir (WIB)', reportCell(options.maxTimestamp, 'datetime')],
      ['Periode yang dipilih', period],
      ['Waktu ekspor (WIB)', reportCell(options.exportedAt ?? new Date(), 'datetime')],
      ['Jumlah baris data', options.rows.length],
      ...(options.summaryItems ?? []).map(item => [item.label, reportCell(item.value)])
    ]
  }
}

export function buildCsvFilename(
  prefix: string,
  minTimestamp?: Date | null,
  maxTimestamp?: Date | null,
  filterStartDate?: string,
  filterEndDate?: string
): string {
  const safePrefix = (prefix || 'laporan_export')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'laporan_export'

  const minLabel = minTimestamp ? formatCsvDateOnly(minTimestamp) : (filterStartDate || '').trim()
  const maxLabel = maxTimestamp ? formatCsvDateOnly(maxTimestamp) : (filterEndDate || '').trim()

  if (minLabel && maxLabel) {
    return `${safePrefix}_${minLabel}_sd_${maxLabel}.csv`
  }
  if (minLabel) {
    return `${safePrefix}_dari_${minLabel}.csv`
  }
  if (maxLabel) {
    return `${safePrefix}_sampai_${maxLabel}.csv`
  }
  return `${safePrefix}_${getTodayWibDateInput()}.csv`
}

export async function prepareReportFiles<T>(options: DownloadCsvOptions<T>): Promise<ReportFile[]> {
  const exportedAt = options.exportedAt ?? new Date()
  // Each admin dataset exports its range-filter date as its first date column.
  const dateIndex = options.columns.findIndex(column => column.kind === 'datetime' || column.kind === 'date')
  const table = reportTable(options, dateIndex)
  const summary = summaryTable({ ...options, exportedAt })
  if (dateIndex >= 0) summary.rows.push(['Dasar Timestamp (WIB)', options.columns[dateIndex]!.header])
  const csvFilename = timestampedCsvFilename({ ...options, exportedAt })
  const csv = new Blob([csvContent(table)], { type: 'text/csv;charset=utf-8' })
  const { buildReportWorkbook } = await import('./reportWorkbook.ts')
  const xlsx = await buildReportWorkbook(table, summary)
  return [
    { format: 'CSV', filename: csvFilename, blob: csv },
    { format: 'XLSX', filename: csvFilename.replace(/\.csv$/, '.xlsx'), blob: xlsx }
  ]
}

