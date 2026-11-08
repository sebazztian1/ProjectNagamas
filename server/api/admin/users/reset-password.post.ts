import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk terlebih dahulu' })
  }

  if (session.role !== 'admin' && session.role !== 'staff') {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Hanya admin/staff yang dapat mereset kata sandi.' })
  }

  const body = await readBody(event)
  const { userId, newPassword } = body

  if (!userId || typeof userId !== 'number') {
    throw createError({ statusCode: 400, message: 'ID pengguna tidak valid' })
  }

  if (!newPassword || typeof newPassword !== 'string' || Array.from(newPassword).length < 8) {
    throw createError({ statusCode: 400, message: 'Kata sandi baru minimal 8 karakter' })
  }

  if (!/[^a-zA-Z\s]/.test(newPassword)) {
    throw createError({ statusCode: 400, message: 'Kata sandi harus mengandung minimal 1 angka atau simbol' })
  }

  const user = await prisma.users.findUnique({
    where: { id: userId }
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'Pengguna tidak ditemukan' })
  }

  const newHash = await bcrypt.hash(newPassword, 10)

  await prisma.users.update({
    where: { id: userId },
    data: { password_hash: newHash }
  })

  return {
    success: true,
    message: `Kata sandi untuk pengguna @${user.username} (${user.phone_number}) berhasil direset`
  }
})
