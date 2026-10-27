/**
 * Server Country Flag and Currency Mapping Utility
 */

export const isoToFlag = (iso: string): string => {
  if (!iso || iso.length !== 2) return '🌐'
  const chars = iso.toUpperCase().split('')
  return String.fromCodePoint(127397 + chars[0].charCodeAt(0), 127397 + chars[1].charCodeAt(0))
}

const COUNTRY_MAP: Record<string, { flag: string; currency: string; rate?: number }> = {
  // Indonesian
  'jepang': { flag: '🇯🇵', currency: 'JPY', rate: 108 },
  'korea': { flag: '🇰🇷', currency: 'KRW', rate: 12 },
  'korea selatan': { flag: '🇰🇷', currency: 'KRW', rate: 12 },
  'singapura': { flag: '🇸🇬', currency: 'SGD', rate: 12300 },
  'thailand': { flag: '🇹🇭', currency: 'THB', rate: 470 },
  'malaysia': { flag: '🇲🇾', currency: 'MYR', rate: 3600 },
  'australia': { flag: '🇦🇺', currency: 'AUD', rate: 10800 },
  'prancis': { flag: '🇫🇷', currency: 'EUR', rate: 17500 },
  'inggris': { flag: '🇬🇧', currency: 'GBP', rate: 20800 },
  'amerika': { flag: '🇺🇸', currency: 'USD', rate: 16200 },
  'amerika serikat': { flag: '🇺🇸', currency: 'USD', rate: 16200 },
  'tiongkok': { flag: '🇨🇳', currency: 'CNY', rate: 2280 },
  'china': { flag: '🇨🇳', currency: 'CNY', rate: 2280 },
  'hong kong': { flag: '🇭🇰', currency: 'HKD', rate: 2100 },
  'taiwan': { flag: '🇹🇼', currency: 'TWD', rate: 510 },
  'jerman': { flag: '🇩🇪', currency: 'EUR', rate: 17500 },
  'italia': { flag: '🇮🇹', currency: 'EUR', rate: 17500 },
  'belanda': { flag: '🇳🇱', currency: 'EUR', rate: 17500 },
  'swiss': { flag: '🇨🇭', currency: 'CHF', rate: 18500 },
  'uni emirat arab': { flag: '🇦🇪', currency: 'AED', rate: 4400 },
  'arab saudi': { flag: '🇸🇦', currency: 'SAR', rate: 4300 },
  'turki': { flag: '🇹🇷', currency: 'TRY', rate: 500 },
  'vietnam': { flag: '🇻🇳', currency: 'VND', rate: 0.65 },
  'kanada': { flag: '🇨🇦', currency: 'CAD', rate: 11800 },
  'selandia baru': { flag: '🇳🇿', currency: 'NZD', rate: 9800 },
  'spanyol': { flag: '🇪🇸', currency: 'EUR', rate: 17500 },
  'rusia': { flag: '🇷🇺', currency: 'RUB', rate: 175 },
  'mesir': { flag: '🇪🇬', currency: 'EGP', rate: 335 },
  'brasil': { flag: '🇧🇷', currency: 'BRL', rate: 2900 },
  'india': { flag: '🇮🇳', currency: 'INR', rate: 195 },

  // English
  'japan': { flag: '🇯🇵', currency: 'JPY', rate: 108 },
  'south korea': { flag: '🇰🇷', currency: 'KRW', rate: 12 },
  'singapore': { flag: '🇸🇬', currency: 'SGD', rate: 12300 },
  'france': { flag: '🇫🇷', currency: 'EUR', rate: 17500 },
  'united kingdom': { flag: '🇬🇧', currency: 'GBP', rate: 20800 },
  'uk': { flag: '🇬🇧', currency: 'GBP', rate: 20800 },
  'united states': { flag: '🇺🇸', currency: 'USD', rate: 16200 },
  'usa': { flag: '🇺🇸', currency: 'USD', rate: 16200 },
  'germany': { flag: '🇩🇪', currency: 'EUR', rate: 17500 },
  'italy': { flag: '🇮🇹', currency: 'EUR', rate: 17500 },
  'netherlands': { flag: '🇳🇱', currency: 'EUR', rate: 17500 },
  'switzerland': { flag: '🇨🇭', currency: 'CHF', rate: 18500 },
  'uae': { flag: '🇦🇪', currency: 'AED', rate: 4400 },
  'turkey': { flag: '🇹🇷', currency: 'TRY', rate: 500 },
}

export function getCountryFlag(country: string): string {
  if (!country) return '🌐'
  const trimmed = country.trim().toLowerCase()
  if (COUNTRY_MAP[trimmed]) {
    return COUNTRY_MAP[trimmed].flag
  }
  const stripped = trimmed.replace(/\(.*?\)/g, '').trim()
  if (COUNTRY_MAP[stripped]) {
    return COUNTRY_MAP[stripped].flag
  }
  if (/^[a-z]{2}$/i.test(trimmed)) {
    return isoToFlag(trimmed)
  }
  return '✈️'
}
