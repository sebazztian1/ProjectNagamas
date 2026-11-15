export interface CsvColumn<T> {
  header: string
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
  includeBom?: boolean
}

export interface DownloadCsvOptions<T> extends BuildCsvOptions<T> {
  filenamePrefix: string
}

const WIB_TIMEZONE = 'Asia/Jakarta'

function getWibDateParts(date: Date): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: WIB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  })

  const parts: Record<string, string> = {}
  for (const part of formatter.formatToParts(date)) {
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

export function formatCsvTimestamp(input: string | number | Date | null | undefined): string {
  const date = parseDateValue(input)
  if (!date) return ''
  const p = getWibDateParts(date)
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`
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

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Ya' : 'Tidak'
  }

  if (value instanceof Date) {
    return formatCsvTimestamp(value)
  }

  let str = String(value)
  if (!str) return ''

  // Defend against CSV spreadsheet formula injection on string values
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
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

export function buildCsvContent<T>(options: BuildCsvOptions<T>): string {
  const {
    columns,
    rows,
    minTimestamp = null,
    maxTimestamp = null,
    filterStartDate = '',
    filterEndDate = '',
    reportTitle = '',
    summaryItems = [],
    exportedAt = new Date(),
    includeBom = true
  } = options

  const lines: string[] = []
  lines.push(columns.map(col => sanitizeCsvCell(col.header)).join(','))

  rows.forEach((row, index) => {
    const line = columns
      .map((col) => {
        const raw = col.format
          ? col.format(row, index)
          : col.key !== undefined
            ? row[col.key]
            : ''
        return sanitizeCsvCell(raw)
      })
      .join(',')
    lines.push(line)
  })

  // Append clean accounting audit footer below the data table
  lines.push('')
  lines.push([sanitizeCsvCell('RINGKASAN LAPORAN'), sanitizeCsvCell(reportTitle || 'Export CSV')].join(','))
  lines.push([
    sanitizeCsvCell('Timestamp Minimal (Data)'),
    sanitizeCsvCell(minTimestamp ? formatCsvTimestamp(minTimestamp) + ' WIB' : '-')
  ].join(','))
  lines.push([
    sanitizeCsvCell('Timestamp Maksimal (Data)'),
    sanitizeCsvCell(maxTimestamp ? formatCsvTimestamp(maxTimestamp) + ' WIB' : '-')
  ].join(','))

  const filterLabel = filterStartDate || filterEndDate
    ? `${filterStartDate || 'Awal'} s/d ${filterEndDate || 'Sekarang'}`
    : 'Semua Periode'
  lines.push([sanitizeCsvCell('Filter Tanggal Dipilih'), sanitizeCsvCell(filterLabel)].join(','))
  lines.push([sanitizeCsvCell('Waktu Export'), sanitizeCsvCell(formatCsvTimestamp(exportedAt) + ' WIB')].join(','))
  lines.push([sanitizeCsvCell('Total Baris Data'), sanitizeCsvCell(rows.length)].join(','))

  for (const item of summaryItems) {
    lines.push([sanitizeCsvCell(item.label), sanitizeCsvCell(item.value)].join(','))
  }

  const content = lines.join('\r\n')
  return includeBom ? `\uFEFF${content}` : content
}

export function downloadCsvFile<T>(options: DownloadCsvOptions<T>): {
  filename: string
  rowCount: number
} {
  const csv = buildCsvContent(options)
  const filename = buildCsvFilename(
    options.filenamePrefix,
    options.minTimestamp ?? null,
    options.maxTimestamp ?? null,
    options.filterStartDate,
    options.filterEndDate
  )

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  return {
    filename,
    rowCount: options.rows.length
  }
}

