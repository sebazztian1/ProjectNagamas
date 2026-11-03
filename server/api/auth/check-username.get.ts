import { defineEventHandler, getQuery, getRequestIP, setResponseHeader, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { validateUsername } from '../../utils/authValidation'

const ipRateLimits = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'local'
  const now = Date.now()
  const entry = ipRateLimits.get(ip)

  if (entry && entry.resetAt > now) {
    if (entry.count >= 60) {
      throw createError({ statusCode: 429, message: 'Terlalu banyak pengecekan. Coba beberapa saat lagi.' })
    }
    entry.count += 1
  } else {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 60_000 })
  }

  const query = getQuery(event)
  const username = String(query.username || '').trim()

  if (!username) {
    return { available: false, message: 'Username wajib diisi' }
  }

  // Validate format and reserved words
  const validation = validateUsername(username)
  if (!validation.valid) {
    return { available: false, message: validation.error }
  }

  const existing = await prisma.users.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true }
  })

  if (existing) {
    return { available: false, message: 'Username sudah dipakai, coba yang lain' }
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { available: true, message: 'Username tersedia' }
})

