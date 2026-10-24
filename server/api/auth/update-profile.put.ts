import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent, setSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk terlebih dahulu' })
  }

  const body = await readBody(event)
  const { phone_number } = body

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

  // Check if another user already has this phone number
  const existingOther = await prisma.users.findFirst({
    where: {
      phone_number: cleanPhone,
      NOT: { id: session.userId }
    }
  })

  if (existingOther) {
    throw createError({ statusCode: 400, message: 'Nomor WhatsApp/HP sudah digunakan oleh akun lain' })
  }

  const updatedUser = await prisma.users.update({
    where: { id: session.userId },
    data: {
      phone_number: cleanPhone
    },
    select: {
      id: true,
      username: true,
      phone_number: true,
      role: true
    }
  })

  // Refresh session cookie
  setSessionCookie(event, {
    userId: updatedUser.id,
    username: updatedUser.username,
    phone_number: updatedUser.phone_number,
    role: updatedUser.role
  })

  return {
    success: true,
    message: 'Nomor WhatsApp berhasil diperbarui',
    user: updatedUser
  }
})
