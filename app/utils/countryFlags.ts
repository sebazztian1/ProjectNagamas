/**
 * Country Flag, Currency, and Complete World Directory Utility
 * Supports Indonesian, English country names, and ISO 2-letter codes.
 */

export interface CountryInfo {
  name: string
  flag: string
  currency: string
  exchangeRateApprox?: number
}

// Helper to convert 2-letter ISO code to flag emoji
export const isoToFlag = (iso: string): string => {
  if (!iso || iso.length !== 2) return '🌐'
  const chars = iso.toUpperCase().split('')
  return String.fromCodePoint(127397 + chars[0].charCodeAt(0), 127397 + chars[1].charCodeAt(0))
}

// 1. Destinasi Populer Jastip (Frequent destinations)
export const POPULAR_JASTIP_COUNTRIES: CountryInfo[] = [
  { name: 'Jepang', flag: '🇯🇵', currency: 'JPY', exchangeRateApprox: 108 },
  { name: 'Korea Selatan', flag: '🇰🇷', currency: 'KRW', exchangeRateApprox: 12 },
  { name: 'Singapura', flag: '🇸🇬', currency: 'SGD', exchangeRateApprox: 12300 },
  { name: 'Thailand', flag: '🇹🇭', currency: 'THB', exchangeRateApprox: 470 },
  { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', exchangeRateApprox: 3600 },
  { name: 'Australia', flag: '🇦🇺', currency: 'AUD', exchangeRateApprox: 10800 },
  { name: 'Prancis', flag: '🇫🇷', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Inggris', flag: '🇬🇧', currency: 'GBP', exchangeRateApprox: 20800 },
  { name: 'Amerika Serikat', flag: '🇺🇸', currency: 'USD', exchangeRateApprox: 16200 },
  { name: 'China', flag: '🇨🇳', currency: 'CNY', exchangeRateApprox: 2280 },
  { name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', exchangeRateApprox: 2100 },
  { name: 'Taiwan', flag: '🇹🇼', currency: 'TWD', exchangeRateApprox: 510 },
  { name: 'Jerman', flag: '🇩🇪', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Italia', flag: '🇮🇹', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Belanda', flag: '🇳🇱', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Swiss', flag: '🇨🇭', currency: 'CHF', exchangeRateApprox: 18500 },
  { name: 'Uni Emirat Arab', flag: '🇦🇪', currency: 'AED', exchangeRateApprox: 4400 },
  { name: 'Arab Saudi', flag: '🇸🇦', currency: 'SAR', exchangeRateApprox: 4300 },
  { name: 'Turki', flag: '🇹🇷', currency: 'TRY', exchangeRateApprox: 500 },
  { name: 'Vietnam', flag: '🇻🇳', currency: 'VND', exchangeRateApprox: 0.65 },
]

// 2. Daftar Lengkap Seluruh Negara di Dunia (A - Z)
export const ALL_WORLD_COUNTRIES: CountryInfo[] = [
  // A
  { name: 'Afganistan', flag: '🇦🇫', currency: 'AFN' },
  { name: 'Afrika Selatan', flag: '🇿🇦', currency: 'ZAR', exchangeRateApprox: 900 },
  { name: 'Albania', flag: '🇦🇱', currency: 'ALL' },
  { name: 'Aljazair', flag: '🇩🇿', currency: 'DZD' },
  { name: 'Amerika Serikat', flag: '🇺🇸', currency: 'USD', exchangeRateApprox: 16200 },
  { name: 'Andorra', flag: '🇦🇩', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Angola', flag: '🇦🇴', currency: 'AOA' },
  { name: 'Arab Saudi', flag: '🇸🇦', currency: 'SAR', exchangeRateApprox: 4300 },
  { name: 'Argentina', flag: '🇦🇷', currency: 'ARS', exchangeRateApprox: 17 },
  { name: 'Armenia', flag: '🇦🇲', currency: 'AMD' },
  { name: 'Australia', flag: '🇦🇺', currency: 'AUD', exchangeRateApprox: 10800 },
  { name: 'Austria', flag: '🇦🇹', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Azerbaijan', flag: '🇦🇿', currency: 'AZN' },

  // B
  { name: 'Bahama', flag: '🇧🇸', currency: 'BSD', exchangeRateApprox: 16200 },
  { name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', exchangeRateApprox: 43000 },
  { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', exchangeRateApprox: 135 },
  { name: 'Barbados', flag: '🇧🇧', currency: 'BBD' },
  { name: 'Belanda', flag: '🇳🇱', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Belarus', flag: '🇧🇾', currency: 'BYN' },
  { name: 'Belgia', flag: '🇧🇪', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Belize', flag: '🇧🇿', currency: 'BZD' },
  { name: 'Benin', flag: '🇧🇯', currency: 'XOF' },
  { name: 'Bhutan', flag: '🇧🇹', currency: 'BTN' },
  { name: 'Bolivia', flag: '🇧🇴', currency: 'BOB' },
  { name: 'Bosnia dan Herzegovina', flag: '🇧🇦', currency: 'BAM' },
  { name: 'Botswana', flag: '🇧🇼', currency: 'BWP' },
  { name: 'Brasil', flag: '🇧🇷', currency: 'BRL', exchangeRateApprox: 2900 },
  { name: 'Brunei Darussalam', flag: '🇧🇳', currency: 'BND', exchangeRateApprox: 12300 },
  { name: 'Bulgaria', flag: '🇧🇬', currency: 'BGN' },
  { name: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF' },
  { name: 'Burundi', flag: '🇧🇮', currency: 'BIF' },

  // C
  { name: 'Ceko', flag: '🇨🇿', currency: 'CZK', exchangeRateApprox: 700 },
  { name: 'Chad', flag: '🇹🇩', currency: 'XAF' },
  { name: 'Chili', flag: '🇨🇱', currency: 'CLP', exchangeRateApprox: 17 },
  { name: 'China (Tiongkok)', flag: '🇨🇳', currency: 'CNY', exchangeRateApprox: 2280 },

  // D
  { name: 'Denmark', flag: '🇩🇰', currency: 'DKK', exchangeRateApprox: 2350 },
  { name: 'Djibouti', flag: '🇩🇯', currency: 'DJF' },
  { name: 'Dominika', flag: '🇩🇲', currency: 'XCD' },

  // E
  { name: 'Ekuador', flag: '🇪🇨', currency: 'USD', exchangeRateApprox: 16200 },
  { name: 'El Salvador', flag: '🇸🇻', currency: 'USD', exchangeRateApprox: 16200 },
  { name: 'Eritrea', flag: '🇪🇷', currency: 'ERN' },
  { name: 'Estonia', flag: '🇪🇪', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Eswatini', flag: '🇸🇿', currency: 'SZL' },
  { name: 'Etiopia', flag: '🇪🇹', currency: 'ETB' },

  // F
  { name: 'Fiji', flag: '🇫🇯', currency: 'FJD' },
  { name: 'Filipina', flag: '🇵🇭', currency: 'PHP', exchangeRateApprox: 285 },
  { name: 'Finlandia', flag: '🇫🇮', currency: 'EUR', exchangeRateApprox: 17500 },

  // G
  { name: 'Gabon', flag: '🇬🇦', currency: 'XAF' },
  { name: 'Gambia', flag: '🇬🇲', currency: 'GMD' },
  { name: 'Georgia', flag: '🇬🇪', currency: 'GEL' },
  { name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  { name: 'Grenada', flag: '🇬🇩', currency: 'XCD' },
  { name: 'Guatemala', flag: '🇬🇹', currency: 'GTQ' },
  { name: 'Guinea', flag: '🇬🇳', currency: 'GNF' },
  { name: 'Guinea-Bissau', flag: '🇬🇼', currency: 'XOF' },
  { name: 'Guyana', flag: '🇬🇾', currency: 'GYD' },

  // H
  { name: 'Haiti', flag: '🇭🇹', currency: 'HTG' },
  { name: 'Honduras', flag: '🇭🇳', currency: 'HNL' },
  { name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', exchangeRateApprox: 2100 },
  { name: 'Hongaria', flag: '🇭🇺', currency: 'HUF', exchangeRateApprox: 44 },

  // I
  { name: 'India', flag: '🇮🇳', currency: 'INR', exchangeRateApprox: 195 },
  { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', exchangeRateApprox: 1 },
  { name: 'Inggris (UK)', flag: '🇬🇧', currency: 'GBP', exchangeRateApprox: 20800 },
  { name: 'Irak', flag: '🇮🇶', currency: 'IQD' },
  { name: 'Iran', flag: '🇮🇷', currency: 'IRR' },
  { name: 'Irlandia', flag: '🇮🇪', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Islandia', flag: '🇮🇸', currency: 'ISK', exchangeRateApprox: 120 },
  { name: 'Israel', flag: '🇮🇱', currency: 'ILS' },
  { name: 'Italia', flag: '🇮🇹', currency: 'EUR', exchangeRateApprox: 17500 },

  // J
  { name: 'Jamaika', flag: '🇯🇲', currency: 'JMD' },
  { name: 'Jepang', flag: '🇯🇵', currency: 'JPY', exchangeRateApprox: 108 },
  { name: 'Jerman', flag: '🇩🇪', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Yordania', flag: '🇯🇴', currency: 'JOD', exchangeRateApprox: 22800 },

  // K
  { name: 'Kamboja', flag: '🇰🇭', currency: 'KHR', exchangeRateApprox: 4 },
  { name: 'Kamerun', flag: '🇨🇲', currency: 'XAF' },
  { name: 'Kanada', flag: '🇨🇦', currency: 'CAD', exchangeRateApprox: 11800 },
  { name: 'Kazakhstan', flag: '🇰🇿', currency: 'KZT', exchangeRateApprox: 34 },
  { name: 'Kenya', flag: '🇰🇪', currency: 'KES' },
  { name: 'Kirgizstan', flag: '🇰🇬', currency: 'KGS' },
  { name: 'Kiribati', flag: '🇰🇮', currency: 'AUD' },
  { name: 'Kolombia', flag: '🇨🇴', currency: 'COP', exchangeRateApprox: 3.9 },
  { name: 'Komoro', flag: '🇰🇲', currency: 'KMF' },
  { name: 'Korea Selatan', flag: '🇰🇷', currency: 'KRW', exchangeRateApprox: 12 },
  { name: 'Korea Utara', flag: '🇰🇵', currency: 'KPW' },
  { name: 'Kosta Rika', flag: '🇨🇷', currency: 'CRC' },
  { name: 'Kroasia', flag: '🇭🇷', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Kuba', flag: '🇨🇺', currency: 'CUP' },
  { name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', exchangeRateApprox: 52800 },

  // L
  { name: 'Laos', flag: '🇱🇦', currency: 'LAK', exchangeRateApprox: 0.75 },
  { name: 'Latvia', flag: '🇱🇻', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Lebanon', flag: '🇱🇧', currency: 'LBP' },
  { name: 'Lesotho', flag: '🇱🇸', currency: 'LSL' },
  { name: 'Liberia', flag: '🇱🇷', currency: 'LRD' },
  { name: 'Libya', flag: '🇱🇾', currency: 'LYD' },
  { name: 'Liechtenstein', flag: '🇱🇮', currency: 'CHF', exchangeRateApprox: 18500 },
  { name: 'Lituania', flag: '🇱🇹', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Luksemburg', flag: '🇱🇺', currency: 'EUR', exchangeRateApprox: 17500 },

  // M
  { name: 'Madagaskar', flag: '🇲🇬', currency: 'MGA' },
  { name: 'Maladewa (Maldives)', flag: '🇲🇻', currency: 'MVR', exchangeRateApprox: 1050 },
  { name: 'Malawi', flag: '🇲🇼', currency: 'MWK' },
  { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', exchangeRateApprox: 3600 },
  { name: 'Mali', flag: '🇲🇱', currency: 'XOF' },
  { name: 'Malta', flag: '🇲🇹', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Maroko', flag: '🇲🇦', currency: 'MAD', exchangeRateApprox: 1650 },
  { name: 'Mauritania', flag: '🇲🇷', currency: 'MRU' },
  { name: 'Mauritius', flag: '🇲🇺', currency: 'MUR' },
  { name: 'Meksiko', flag: '🇲🇽', currency: 'MXN', exchangeRateApprox: 840 },
  { name: 'Mesir', flag: '🇪🇬', currency: 'EGP', exchangeRateApprox: 335 },
  { name: 'Mikronesia', flag: '🇫🇲', currency: 'USD' },
  { name: 'Moldova', flag: '🇲🇩', currency: 'MDL' },
  { name: 'Monako', flag: '🇲🇨', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Mongolia', flag: '🇲🇳', currency: 'MNT' },
  { name: 'Montenegro', flag: '🇲🇪', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Mozambik', flag: '🇲🇿', currency: 'MZN' },
  { name: 'Myanmar', flag: '🇲🇲', currency: 'MMK', exchangeRateApprox: 7.7 },

  // N
  { name: 'Namibia', flag: '🇳🇦', currency: 'NAD' },
  { name: 'Nauru', flag: '🇳🇷', currency: 'AUD' },
  { name: 'Nepal', flag: '🇳🇵', currency: 'NPR', exchangeRateApprox: 120 },
  { name: 'Nikaragua', flag: '🇳🇮', currency: 'NIO' },
  { name: 'Niger', flag: '🇳🇪', currency: 'XOF' },
  { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { name: 'Makedonia Utara', flag: '🇲🇰', currency: 'MKD' },
  { name: 'Norwegia', flag: '🇳🇴', currency: 'NOK', exchangeRateApprox: 1520 },

  // O
  { name: 'Oman', flag: '🇴🇲', currency: 'OMR', exchangeRateApprox: 42000 },

  // P
  { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', exchangeRateApprox: 58 },
  { name: 'Palau', flag: '🇵🇼', currency: 'USD' },
  { name: 'Palestina', flag: '🇵🇸', currency: 'ILS' },
  { name: 'Panama', flag: '🇵🇦', currency: 'USD', exchangeRateApprox: 16200 },
  { name: 'Pantai Gading', flag: '🇨🇮', currency: 'XOF' },
  { name: 'Papua Nugini', flag: '🇵🇬', currency: 'PGK' },
  { name: 'Paraguay', flag: '🇵🇾', currency: 'PYG' },
  { name: 'Peru', flag: '🇵🇪', currency: 'PEN', exchangeRateApprox: 4350 },
  { name: 'Polandia', flag: '🇵🇱', currency: 'PLN', exchangeRateApprox: 4050 },
  { name: 'Portugal', flag: '🇵🇹', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Prancis', flag: '🇫🇷', currency: 'EUR', exchangeRateApprox: 17500 },

  // Q
  { name: 'Qatar', flag: '🇶🇦', currency: 'QAR', exchangeRateApprox: 4450 },

  // R
  { name: 'Republik Afrika Tengah', flag: '🇨🇫', currency: 'XAF' },
  { name: 'Republik Kongo', flag: '🇨🇬', currency: 'XAF' },
  { name: 'Republik Dominika', flag: '🇩🇴', currency: 'DOP' },
  { name: 'Rumania', flag: '🇷🇴', currency: 'RON', exchangeRateApprox: 3500 },
  { name: 'Rusia', flag: '🇷🇺', currency: 'RUB', exchangeRateApprox: 175 },
  { name: 'Rwanda', flag: '🇷🇼', currency: 'RWF' },

  // S
  { name: 'Samoa', flag: '🇼🇸', currency: 'WST' },
  { name: 'San Marino', flag: '🇸🇲', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Selandia Baru (New Zealand)', flag: '🇳🇿', currency: 'NZD', exchangeRateApprox: 9800 },
  { name: 'Senegal', flag: '🇸🇳', currency: 'XOF' },
  { name: 'Serbia', flag: '🇷🇸', currency: 'RSD' },
  { name: 'Seychelles', flag: '🇸🇨', currency: 'SCR' },
  { name: 'Sierra Leone', flag: '🇸🇱', currency: 'SLL' },
  { name: 'Singapura', flag: '🇸🇬', currency: 'SGD', exchangeRateApprox: 12300 },
  { name: 'Siprus', flag: '🇨🇾', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Slowakia', flag: '🇸🇰', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Slovenia', flag: '🇸🇮', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Kepulauan Solomon', flag: '🇸🇧', currency: 'SBD' },
  { name: 'Somalia', flag: '🇸🇴', currency: 'SOS' },
  { name: 'Spanyol', flag: '🇪🇸', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR', exchangeRateApprox: 54 },
  { name: 'Sudan', flag: '🇸🇩', currency: 'SDG' },
  { name: 'Suriname', flag: '🇸🇷', currency: 'SRD' },
  { name: 'Swedia', flag: '🇸🇪', currency: 'SEK', exchangeRateApprox: 1550 },
  { name: 'Swiss', flag: '🇨🇭', currency: 'CHF', exchangeRateApprox: 18500 },
  { name: 'Suriah', flag: '🇸🇾', currency: 'SYP' },

  // T
  { name: 'Taiwan', flag: '🇹🇼', currency: 'TWD', exchangeRateApprox: 510 },
  { name: 'Tajikistan', flag: '🇹🇯', currency: 'TJS' },
  { name: 'Tanzania', flag: '🇹🇿', currency: 'TZS' },
  { name: 'Thailand', flag: '🇹🇭', currency: 'THB', exchangeRateApprox: 470 },
  { name: 'Timor Leste', flag: '🇹🇱', currency: 'USD', exchangeRateApprox: 16200 },
  { name: 'Togo', flag: '🇹🇬', currency: 'XOF' },
  { name: 'Tonga', flag: '🇹🇴', currency: 'TOP' },
  { name: 'Trinidad dan Tobago', flag: '🇹🇹', currency: 'TTD' },
  { name: 'Tunisia', flag: '🇹🇳', currency: 'TND' },
  { name: 'Turki (Turkiye)', flag: '🇹🇷', currency: 'TRY', exchangeRateApprox: 500 },
  { name: 'Turkmenistan', flag: '🇹🇲', currency: 'TMT' },
  { name: 'Tuvalu', flag: '🇹🇻', currency: 'AUD' },

  // U
  { name: 'Uganda', flag: '🇺🇬', currency: 'UGX' },
  { name: 'Ukraina', flag: '🇺🇦', currency: 'UAH', exchangeRateApprox: 390 },
  { name: 'Uni Emirat Arab (Dubai)', flag: '🇦🇪', currency: 'AED', exchangeRateApprox: 4400 },
  { name: 'Uruguay', flag: '🇺🇾', currency: 'UYU' },
  { name: 'Uzbekistan', flag: '🇺🇿', currency: 'UZS', exchangeRateApprox: 1.25 },

  // V
  { name: 'Vanuatu', flag: '🇻🇺', currency: 'VUV' },
  { name: 'Vatikan', flag: '🇻🇦', currency: 'EUR', exchangeRateApprox: 17500 },
  { name: 'Venezuela', flag: '🇻🇪', currency: 'VES' },
  { name: 'Vietnam', flag: '🇻🇳', currency: 'VND', exchangeRateApprox: 0.65 },

  // Y
  { name: 'Yaman', flag: '🇾🇪', currency: 'YER' },
  { name: 'Yunani', flag: '🇬🇷', currency: 'EUR', exchangeRateApprox: 17500 },

  // Z
  { name: 'Zambia', flag: '🇿🇲', currency: 'ZMW' },
  { name: 'Zimbabwe', flag: '🇿🇼', currency: 'ZWL' }
]

// Index lookup map for fast query (Indonesian & English)
const COUNTRY_MAP: Record<string, { flag: string; currency: string; rate?: number }> = {}

// Populate from world countries
ALL_WORLD_COUNTRIES.forEach(c => {
  const key = c.name.toLowerCase()
  COUNTRY_MAP[key] = { flag: c.flag, currency: c.currency, rate: c.exchangeRateApprox }

  // Clean name without parenthesis (e.g. "Inggris (UK)" -> "inggris")
  const cleanName = key.replace(/\(.*?\)/g, '').trim()
  if (cleanName && cleanName !== key) {
    COUNTRY_MAP[cleanName] = { flag: c.flag, currency: c.currency, rate: c.exchangeRateApprox }
  }
})

// Add common English aliases
const ALIASES: Record<string, { flag: string; currency: string; rate?: number }> = {
  'japan': { flag: '🇯🇵', currency: 'JPY', rate: 108 },
  'south korea': { flag: '🇰🇷', currency: 'KRW', rate: 12 },
  'korea': { flag: '🇰🇷', currency: 'KRW', rate: 12 },
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
  'spain': { flag: '🇪🇸', currency: 'EUR', rate: 17500 },
  'greece': { flag: '🇬🇷', currency: 'EUR', rate: 17500 },
  'new zealand': { flag: '🇳🇿', currency: 'NZD', rate: 9800 },
  'russia': { flag: '🇷🇺', currency: 'RUB', rate: 175 },
  'egypt': { flag: '🇪🇬', currency: 'EGP', rate: 335 },
  'brazil': { flag: '🇧🇷', currency: 'BRL', rate: 2900 },
  'saudi arabia': { flag: '🇸🇦', currency: 'SAR', rate: 4300 },
}

Object.entries(ALIASES).forEach(([k, v]) => {
  COUNTRY_MAP[k.toLowerCase()] = v
})

/**
 * Returns flag emoji for a given country name or 2-letter ISO code.
 * Example: getCountryFlag('Jepang') -> '🇯🇵'
 */
export function getCountryFlag(country: string): string {
  if (!country) return '🌐'
  const trimmed = country.trim().toLowerCase()
  if (COUNTRY_MAP[trimmed]) {
    return COUNTRY_MAP[trimmed].flag
  }
  // Remove parenthesis if any
  const stripped = trimmed.replace(/\(.*?\)/g, '').trim()
  if (COUNTRY_MAP[stripped]) {
    return COUNTRY_MAP[stripped].flag
  }
  // Convert 2-letter ISO code (e.g., 'JP' -> 🇯🇵)
  if (/^[a-z]{2}$/i.test(trimmed)) {
    return isoToFlag(trimmed)
  }
  return '✈️'
}

/**
 * Returns default currency for a given country name
 */
export function getCountryCurrency(country: string): string {
  if (!country) return 'USD'
  const trimmed = country.trim().toLowerCase()
  if (COUNTRY_MAP[trimmed]) {
    return COUNTRY_MAP[trimmed].currency
  }
  const stripped = trimmed.replace(/\(.*?\)/g, '').trim()
  if (COUNTRY_MAP[stripped]) {
    return COUNTRY_MAP[stripped].currency
  }
  return 'USD'
}

/**
 * Returns estimated exchange rate for a given country name
 */
export function getCountryDefaultRate(country: string): number {
  if (!country) return 16000
  const trimmed = country.trim().toLowerCase()
  if (COUNTRY_MAP[trimmed] && COUNTRY_MAP[trimmed].rate) {
    return COUNTRY_MAP[trimmed].rate!
  }
  const stripped = trimmed.replace(/\(.*?\)/g, '').trim()
  if (COUNTRY_MAP[stripped] && COUNTRY_MAP[stripped].rate) {
    return COUNTRY_MAP[stripped].rate!
  }
  return 16000
}
