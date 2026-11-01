import { defineEventHandler, getQuery, getRequestIP, setResponseHeader, createError } from 'h3'
import { searchRegions } from '../../utils/indonesiaRegions'

const searchRateLimit = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'local'
  const now = Date.now()
  const entry = searchRateLimit.get(ip)

  if (entry && entry.resetAt > now) {
    if (entry.count >= 40) {
      throw createError({ statusCode: 429, message: 'Terlalu banyak pencarian. Coba beberapa saat lagi.' })
    }
    entry.count += 1
  } else {
    searchRateLimit.set(ip, { count: 1, resetAt: now + 60_000 })
  }

  const query = getQuery(event)
  const q = String(query.q || '').trim()
  if (q.length < 3) {
    return []
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return searchRegions(q)
})

