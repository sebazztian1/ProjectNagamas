import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { setSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, phone_number, password, confirmPassword } = body

  // 1. Validation for username
  if (!username || typeof username !== 'string') {
    throw createError({ statusCode: 400, message: 'Username wajib diisi' })
  }

  const cleanUsername = username.trim().toLowerCase()
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  if (!usernameRegex.test(cleanUsername)) {
    throw createError({
      statusCode: 400,
      message: 'Username harus 3-30 karakter, hanya berupa huruf, angka, atau underscore tanpa spasi'
    })
  }

  // 2. Validation for phone number
  if (!phone_number || typeof phone_number !== 'string') {
    throw createError({ statusCode: 400, message: 'Nomor WhatsApp/HP wajib diisi' })
  }

  let cleanPhone = phone_number.trim().replace(/[\s-]/g, '')
  if (cleanPhone.startsWith('+62')) {
    cleanPhone = '0' + cleanPhone.slice(3)
  } else if (cleanPhone.startsWith('62')) {
    cleanPhone = '0' + cleanPhone.slice(2)
  }

  const phoneRegex = /^08[1-9][0-9]{7,11}$/
  if (!phoneRegex.test(cleanPhone)) {
    throw createError({ statusCode: 400, message: 'Nomor WhatsApp/HP tidak valid (contoh: 081234567890)' })
  }

  // 3. Validation for password
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw createError({ statusCode: 400, message: 'Kata sandi minimal 6 karakter' })
  }

  if (confirmPassword && confirmPassword !== password) {
    throw createError({ statusCode: 400, message: 'Konfirmasi kata sandi tidak cocok' })
  }

  // 4. Check existing username
  const existingUsername = await prisma.users.findUnique({
    where: { username: cleanUsername }
  })
  if (existingUsername) {
    throw createError({ statusCode: 400, message: 'Username sudah digunakan. Silakan gunakan username lain.' })
  }

  // 5. Check existing phone number
  const existingPhone = await prisma.users.findUnique({
    where: { phone_number: cleanPhone }
  })
  if (existingPhone) {
    throw createError({ statusCode: 400, message: 'Nomor WhatsApp/HP sudah terdaftar. Silakan gunakan nomor lain atau masuk.' })
  }

  // 6. Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // 7. Create user in database
  const newUser = await prisma.users.create({
    data: {
      username: cleanUsername,
      phone_number: cleanPhone,
      password_hash: passwordHash,
      role: 'customer',
      is_active: true
    }
  })

  // 8. Establish session
  setSessionCookie(event, {
    userId: newUser.id,
    username: newUser.username,
    phone_number: newUser.phone_number,
    role: newUser.role
  })

  return {
    success: true,
    message: 'Registrasi akun berhasil',
    user: {
      id: newUser.id,
      username: newUser.username,
      phone_number: newUser.phone_number,
      role: newUser.role
    }
  }
})
