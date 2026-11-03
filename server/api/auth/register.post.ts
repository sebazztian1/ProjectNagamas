import { defineEventHandler, readBody, getRequestIP, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { setSessionCookie } from '../../utils/session'
import {
  validateUsername,
  validateAndNormalizePhone,
  validatePasswordRules,
  generateRecoveryCode
} from '../../utils/authValidation'

// Signup rate limit per IP: 10 per hour
const signupRateLimits = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'local'
  const now = Date.now()
  const entry = signupRateLimits.get(ip)

  if (entry && entry.resetAt > now) {
    if (entry.count >= 10) {
      throw createError({
        statusCode: 429,
        message: 'Terlalu banyak percobaan pendaftaran dari koneksi ini. Coba lagi nanti.'
      })
    }
    entry.count += 1
  } else {
    signupRateLimits.set(ip, { count: 1, resetAt: now + 3600_000 })
  }

  const body = await readBody(event)
  const rawUsername = String(body?.username || '').trim()
  const rawPhone = String(body?.phone || body?.phone_number || '').trim()
  const rawPassword = String(body?.password || '')

  // 1. Username Validation
  const userVal = validateUsername(rawUsername)
  if (!userVal.valid) {
    throw createError({ statusCode: 400, message: userVal.error })
  }

  // 2. Phone Validation & Normalization
  const phoneVal = validateAndNormalizePhone(rawPhone)
  if (!phoneVal.valid || !phoneVal.normalized) {
    throw createError({ statusCode: 400, message: phoneVal.error })
  }

  // 3. Password Rules Validation (length min 12, no personal data, no common/breached)
  const passVal = await validatePasswordRules(rawPassword, {
    username: rawUsername,
    phone: phoneVal.normalized
  })
  if (!passVal.valid) {
    throw createError({ statusCode: 400, message: passVal.error })
  }

  // 4. Check existing username (case-insensitive)
  const cleanUsernameLower = rawUsername.toLowerCase()
  const existingUsername = await prisma.users.findUnique({
    where: { username: cleanUsernameLower },
    select: { id: true }
  })
  if (existingUsername) {
    throw createError({ statusCode: 400, message: 'Username sudah dipakai, coba yang lain' })
  }

  // 5. Check existing phone number
  // Also check local format 08... if previously stored
  const localPhone = '0' + phoneVal.normalized.slice(2)
  const existingPhone = await prisma.users.findFirst({
    where: {
      OR: [
        { phone_number: phoneVal.normalized },
        { phone_number: localPhone }
      ]
    },
    select: { id: true }
  })
  if (existingPhone) {
    throw createError({ statusCode: 400, message: 'Nomor ini sudah terdaftar. Masuk atau hubungi admin' })
  }

  // 6. Generate Random Recovery Code (12 chars unambiguous, e.g. K7M2-9QXD-4TPA)
  const plainRecoveryCode = generateRecoveryCode()

  // 7. Hash password with bcrypt cost 12
  const passwordHash = await bcrypt.hash(rawPassword, 12)

  // 8. Create user in database (preserve username as typed, phone normalized to 628...)
  const newUser = await prisma.users.create({
    data: {
      username: rawUsername,
      phone_number: phoneVal.normalized,
      password_hash: passwordHash,
      role: 'customer',
      is_active: true,
      recovery_code: plainRecoveryCode,
      recovery_code_last_rotated: new Date()
    }
  })

  // 9. Establish session
  setSessionCookie(event, {
    userId: newUser.id,
    username: newUser.username,
    phone_number: newUser.phone_number,
    role: newUser.role
  })

  return {
    success: true,
    message: 'Registrasi akun berhasil',
    recoveryCode: plainRecoveryCode,
    user: {
      id: newUser.id,
      username: newUser.username,
      phone_number: newUser.phone_number,
      role: newUser.role
    }
  }
})
