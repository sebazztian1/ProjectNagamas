import { defineEventHandler, readBody, getRequestIP, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { validatePasswordRules, generateRecoveryCode } from '../../utils/authValidation'

// Recovery rate limit per IP & identifier: 5 attempts per hour
const resetAttempts = new Map<string, { count: number; lockUntil: number }>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'local'
  const body = await readBody(event)
  const identifier = String(body?.identifier || '').trim()
  const rawRecoveryCode = String(body?.recoveryCode || '').trim()
  const newPassword = String(body?.newPassword || '')

  if (!identifier || !rawRecoveryCode || !newPassword) {
    throw createError({ statusCode: 400, message: 'Harap lengkapi semua kolom.' })
  }

  const rateKey = `${ip}:${identifier.toLowerCase()}`
  const now = Date.now()
  const attempt = resetAttempts.get(rateKey)

  if (attempt && attempt.lockUntil > now) {
    throw createError({
      statusCode: 429,
      message: 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit'
    })
  }

  // Find user by username or phone
  const digitsOnly = identifier.replace(/[\s\-\(\)\.]/g, '')
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

  const cleanInput = rawRecoveryCode.replace(/[\s-]/g, '').toUpperCase()
  const formattedCode = cleanInput.length === 12
    ? `${cleanInput.slice(0, 4)}-${cleanInput.slice(4, 8)}-${cleanInput.slice(8, 12)}`
    : rawRecoveryCode.trim()

  // 1. Direct database query to verify user identity and authentic recovery code
  let user = await prisma.users.findFirst({
    where: {
      AND: [
        {
          OR: [
            { username: identifier.toLowerCase() },
            { phone_number: normalizedPhone },
            { phone_number: localPhone },
            { phone_number: identifier }
          ]
        },
        {
          OR: [
            { recovery_code: formattedCode },
            { recovery_code: cleanInput },
            { recovery_code: rawRecoveryCode.trim() }
          ]
        }
      ]
    },
    select: {
      id: true,
      username: true,
      phone_number: true,
      recovery_code: true
    }
  })

  // Fallback migration for legacy records if users table column was not populated yet
  if (!user) {
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: identifier.toLowerCase() },
          { phone_number: normalizedPhone },
          { phone_number: localPhone },
          { phone_number: identifier }
        ]
      },
      select: {
        id: true,
        username: true,
        phone_number: true,
        recovery_code: true
      }
    })

    if (existingUser) {
      const row = await prisma.store_settings.findUnique({
        where: { setting_key: `user_recovery_${existingUser.id}` }
      })
      if (row?.setting_value) {
        try {
          const parsed = JSON.parse(row.setting_value)
          const storedCode = (parsed.plain_code || '').replace(/[\s-]/g, '').toUpperCase()
          const storedHash = parsed.hash || ''
          let legacyMatch = storedCode === cleanInput
          if (!legacyMatch && storedHash) {
            legacyMatch = await bcrypt.compare(cleanInput, storedHash)
          }
          if (legacyMatch) {
            await prisma.users.update({
              where: { id: existingUser.id },
              data: {
                recovery_code: formattedCode,
                recovery_code_last_rotated: new Date()
              }
            })
            user = {
              ...existingUser,
              recovery_code: formattedCode
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  // Neutral error response to avoid account enumeration (design-password_spec.md Section 8)
  if (!user) {
    registerFailedReset(rateKey)
    throw createError({ statusCode: 400, message: 'Kode pemulihan tidak cocok' })
  }

  // Validate new password
  const passVal = await validatePasswordRules(newPassword, {
    username: user.username,
    phone: user.phone_number
  })
  if (!passVal.valid) {
    throw createError({ statusCode: 400, message: passVal.error })
  }

  // Hash new password. Recovery code remains valid for multiple uses.
  const newPasswordHash = await bcrypt.hash(newPassword, 12)

  await prisma.users.update({
    where: { id: user.id },
    data: {
      password_hash: newPasswordHash,
      updated_at: new Date()
    }
  })

  resetAttempts.delete(rateKey)

  return {
    success: true,
    message: 'Kata sandi berhasil diubah',
    recoveryCode: user.recovery_code || formattedCode
  }
})

function registerFailedReset(key: string) {
  const now = Date.now()
  const entry = resetAttempts.get(key) || { count: 0, lockUntil: 0 }
  entry.count += 1
  if (entry.count >= 5) {
    entry.lockUntil = now + 60 * 60 * 1000 // 1 hour lockout
  }
  resetAttempts.set(key, entry)
}

