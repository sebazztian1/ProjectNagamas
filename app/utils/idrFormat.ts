/**
 * Pure IDR formatting, parsing, and caret helpers for formatted numeric inputs.
 */

export const MAX_IDR_DIGITS = 15

export interface NormalizedIdrInput {
  digits: string
  formatted: string
  numericValue: number | null
  strippedLeadingZeros: number
}

export const formatIdrDigits = (digits: string): string => {
  return digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

export const normalizeIdrInput = (raw: string): NormalizedIdrInput => {
  // Strip optional trailing Indonesian cent suffix (e.g. "Rp 1.500.000,00") before digit extraction
  const cleanedRaw = raw.trim().replace(/,\d{1,2}$/, '')
  const rawDigits = cleanedRaw.replace(/\D/g, '')
  if (!rawDigits) {
    return {
      digits: '',
      formatted: '',
      numericValue: null,
      strippedLeadingZeros: 0,
    }
  }

  const withoutLeadingZeros = rawDigits.replace(/^0+(?=\d)/, '')
  const strippedLeadingZeros = rawDigits.length - withoutLeadingZeros.length
  const digits = withoutLeadingZeros.slice(0, MAX_IDR_DIGITS)

  return {
    digits,
    formatted: formatIdrDigits(digits),
    numericValue: Number(digits),
    strippedLeadingZeros,
  }
}

export const formatIdrValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'string' && value.trim() === '') return ''

  // Convert numeric strings (such as DB decimal strings "150000.00") as numbers first
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    const digits = String(Math.trunc(Math.abs(num))).slice(0, MAX_IDR_DIGITS)
    return formatIdrDigits(digits)
  }

  return normalizeIdrInput(String(value)).formatted
}

export const caretPosForDigitCount = (formatted: string, digitCount: number): number => {
  if (digitCount <= 0) return 0
  let seenDigits = 0
  for (let i = 0; i < formatted.length; i++) {
    const code = formatted.charCodeAt(i)
    if (code >= 48 && code <= 57) {
      seenDigits++
      if (seenDigits === digitCount) {
        return i + 1
      }
    }
  }
  return formatted.length
}
