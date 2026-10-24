/**
 * Centralized formatting and calculation helpers for dbb_luxe
 */

export const formatRupiah = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return 'Rp 0'
  const num = typeof val === 'string' ? parseFloat(val) : val
  return 'Rp ' + Math.round(num).toLocaleString('id-ID')
}

export const formatDate = (
  dateInput: string | Date | null | undefined,
  includeTime = false
): string => {
  if (!dateInput) return '-'
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return '-'

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ]

  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year}, ${hours}:${mins} WIB`
  }

  return `${day} ${month} ${year}`
}

export const calculateJastipPrice = (
  originalPrice: number,
  exchangeRate: number,
  feeValue: number,
  feeType: 'flat' | 'percent' = 'flat'
): number => {
  const convertedBase = originalPrice * exchangeRate
  if (feeType === 'percent') {
    return Math.round(convertedBase + (convertedBase * (feeValue / 100)))
  }
  return Math.round(convertedBase + feeValue)
}

export const generateUniqueCode = (): number => {
  return Math.floor(100 + Math.random() * 899)
}

export const generateOrderCode = (type: 'ready' | 'jastip'): string => {
  const prefix = type === 'ready' ? 'RDY' : 'JST'
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${y}${m}${d}-${randomSuffix}`
}
