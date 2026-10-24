import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { setSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, username, email, password } = body

  const loginInput = String(identifier || username || email || '').trim()

  if (!loginInput || !password) {
    throw createError({ statusCode: 400, message: 'Username / No. WhatsApp dan kata sandi wajib diisi' })
  }

  // Normalize phone if input resembles a phone number
  let cleanPhone = loginInput.replace(/[\s-]/g, '')
  if (cleanPhone.startsWith('+62')) {
    cleanPhone = '0' + cleanPhone.slice(3)
  } else if (cleanPhone.startsWith('62')) {
    cleanPhone = '0' + cleanPhone.slice(2)
  }

  // Find user by username or phone_number
  const user = await prisma.users.findFirst({
    where: {
      OR: [
        { username: loginInput.toLowerCase() },
        { phone_number: cleanPhone }
      ]
    }
  })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Username / No. WhatsApp atau kata sandi tidak cocok' })
  }

  if (!user.is_active) {
    throw createError({ statusCode: 403, message: 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.' })
  }

  // Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw createError({ statusCode: 401, message: 'Username / No. WhatsApp atau kata sandi tidak cocok' })
  }

  // Set session cookie
  setSessionCookie(event, {
    userId: user.id,
    username: user.username,
    phone_number: user.phone_number,
    role: user.role
  })

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
