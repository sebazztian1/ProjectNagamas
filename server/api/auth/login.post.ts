import { defineEventHandler, readBody, getRequestIP, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { setSessionCookie } from '../../utils/session'
import { recordAuditLog } from '../../utils/audit'

// In-memory rate limiting for login protection:
// 5 failed attempts per identifier/IP in 15 minutes triggers lockout delay
interface LoginAttempt {
  count: number
  lockUntil: number
}
const loginAttempts = new Map<string, LoginAttempt>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'local'
  const body = await readBody(event)
  const { identifier, username, email, phone, password } = body

  const loginInput = String(identifier || username || email || phone || '').trim()
  const rawPassword = String(password || '')

  if (!loginInput || !rawPassword) {
    throw createError({ statusCode: 400, message: 'Username atau kata sandi salah' })
  }

  const rateKey = `${ip}:${loginInput.toLowerCase()}`
  const now = Date.now()
  const attempt = loginAttempts.get(rateKey)

  if (attempt && attempt.lockUntil > now) {
    const remainingMins = Math.ceil((attempt.lockUntil - now) / 60000)
    throw createError({
      statusCode: 429,
      message: `Terlalu banyak percobaan. Coba lagi dalam ${remainingMins} menit`
    })
  }

  // Normalize phone if input resembles a phone number
  const digitsOnly = loginInput.replace(/[\s\-\(\)\.]/g, '')
  let normalizedPhone = digitsOnly
  let localPhone = digitsOnly

  if (digitsOnly.startsWith('+62')) {
    normalizedPhone = digitsOnly.slice(1)
    localPhone = '0' + digitsOnly.slice(3)
  } else if (digitsOnly.startsWith('62')) {
    normalizedPhone = digitsOnly
    localPhone = '0' + digitsOnly.slice(2)
  } else if (digitsOnly.startsWith('08')) {
    normalizedPhone = '62' + digitsOnly.slice(1)
    localPhone = digitsOnly
  }

  // Find user by username (case-insensitive) or phone number (both normalized and local formats)
  const user = await prisma.users.findFirst({
    where: {
      OR: [
        { username: loginInput.toLowerCase() },
        { phone_number: normalizedPhone },
        { phone_number: localPhone },
        { phone_number: loginInput }
      ]
    }
  })

  // Generic failure for security (design-password_spec.md Section 4 & 12)
  if (!user) {
    registerFailedAttempt(rateKey)
    throw createError({ statusCode: 401, message: 'Username atau kata sandi salah' })
  }

  if (!user.is_active) {
    throw createError({ statusCode: 403, message: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.' })
  }

  // Verify password with bcrypt
  const isMatch = await bcrypt.compare(rawPassword, user.password_hash)
  if (!isMatch) {
    registerFailedAttempt(rateKey)
    throw createError({ statusCode: 401, message: 'Username atau kata sandi salah' })
  }

  // Login successful: reset rate limit attempts
  loginAttempts.delete(rateKey)

  // Update last_login timestamp if needed
  await prisma.users.update({
    where: { id: user.id },
    data: { updated_at: new Date() }
  }).catch(() => {})

  // Set session cookie
  setSessionCookie(event, {
    userId: user.id,
    username: user.username,
    phone_number: user.phone_number,
    role: user.role
  })

  // Log admin / staff login activity
  if (user.role === 'admin' || user.role === 'staff') {
    await recordAuditLog(user.id, {
      action: 'LOGIN_ADMIN',
      entityType: 'auth',
      entityId: user.id,
      detail: {
        username: user.username,
        role: user.role,
        ip
      }
    })
  }

  return {
    success: true,
    message: 'Berhasil masuk',
    user: {
      id: user.id,
      username: user.username,
      phone_number: user.phone_number,
      role: user.role
    }
  }
})

function registerFailedAttempt(key: string) {
  const now = Date.now()
  const entry = loginAttempts.get(key) || { count: 0, lockUntil: 0 }
  entry.count += 1
  if (entry.count >= 5) {
    // Lock for 15 minutes
    entry.lockUntil = now + 15 * 60 * 1000
  }
  loginAttempts.set(key, entry)
}
