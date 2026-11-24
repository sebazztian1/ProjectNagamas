import ExcelJS from 'exceljs'
import type { Border, Workbook } from 'exceljs'
import { reportCellText, type ReportTable } from './csvExport.ts'

const border: Partial<Border> = { style: 'thin', color: { argb: 'FFCAD3DF' } }
const edges = { top: border, bottom: border, left: border, right: border }
const maxWidth = 64

// Excel column widths are measured in digits of the workbook's default font.
function textMeasurer() {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null
  const context = canvas?.getContext('2d')
  if (context) {
    context.font = '11pt Calibri, Arial, sans-serif'
    const digitWidth = context.measureText('0').width
    return (line: string) => context.measureText(line).width / digitWidth
  }
  return (line: string) => Array.from(line).reduce((n, c) => n + (c.codePointAt(0)! > 0xff ? 2 : 1), 0)
}

function wrappedLineCount(text: string, width: number, measure: (line: string) => number) {
  const usable = Math.max(1, width - 2)
  let count = 0
  for (const line of text.split(/\r\n|\r|\n/)) {
    count++
    if (measure(line) <= usable) continue
    let used = 0
    for (const word of line.split(/\s+/)) {
      let size = measure(word)
      if (used && used + 1 + size > usable) {
        count++
        used = 0
      }
      const extra = Math.max(0, Math.ceil(size / usable) - 1)
      count += extra
      size -= extra * usable
      used = used ? used + 1 + size : size
    }
  }
  return count
}

function addReportSheet(workbook: Workbook, name: string, table: ReportTable) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] })
  const measure = textMeasurer()
  const widths = table.columns.map(({ header, kind, minWidth = 15 }) => {
    if (kind === 'sequence') return 8
    const dateWidth = kind === 'date' ? 20 : kind === 'datetime' ? 24 : 0
    return Math.max(15, minWidth, dateWidth, Math.ceil(measure(header)) + 3)
  })
  for (const row of table.rows) {
    row.forEach((value, i) => {
      for (const line of reportCellText(value).split(/\r\n|\r|\n/)) {
        widths[i] = Math.max(widths[i]!, Math.ceil(measure(line)) + 3)
      }
    })
  }
  widths.forEach((width, i) => { sheet.getColumn(i + 1).width = Math.min(width, maxWidth) })
  const header = sheet.addRow(table.columns.map(column => column.header))
  header.eachCell((cell, i) => {
    cell.font = { name: 'Calibri', size: 11, color: { argb: 'FFFFFFFF' }, bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF193451' } }
    cell.border = edges
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    const lines = wrappedLineCount(cell.text, sheet.getColumn(i).width! - 2, measure)
    header.height = Math.max(header.height || 28, lines * 17 + 9)
  })

  for (const values of table.rows) {
    const row = sheet.addRow(values.map(value => typeof value === 'object' ? value.value : value === '' ? null : value))
    let lines = 1
    row.eachCell({ includeEmpty: true }, (cell, i) => {
      const value = values[i - 1]!
      const isDate = typeof value === 'object'
      const isNumber = typeof value === 'number'
      const kind = table.columns[i - 1]!.kind
      const center = isDate || kind === 'status' || kind === 'sequence' || kind === 'date' || kind === 'datetime'
      if (isDate) cell.numFmt = table.columns[i - 1]!.numberFormat ?? (value.withTime ? 'dd/mm/yyyy hh:mm:ss' : 'dd/mm/yyyy')
      if (isNumber) cell.numFmt = Number.isInteger(value) ? '#,##0' : '#,##0.###############'
      cell.alignment = { horizontal: center ? 'center' : isNumber ? 'right' : 'left', vertical: 'middle', wrapText: true }
      cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF172B40' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row.number % 2 ? 'FFF0F3F6' : 'FFFFFFFF' } }
      cell.border = edges
      lines = Math.max(lines, wrappedLineCount(reportCellText(value), sheet.getColumn(i).width!, measure))
    })
    row.height = Math.min(409, 18 * lines + 6)
  }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: sheet.rowCount, column: table.columns.length } }
}

export async function buildReportWorkbook(data: ReportTable, summary: ReportTable): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  addReportSheet(workbook, 'Data', data)
  addReportSheet(workbook, 'Ringkasan', summary)
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer())
  return new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
