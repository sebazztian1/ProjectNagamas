import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk terlebih dahulu' })
  }

  const body = await readBody(event)
  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || typeof currentPassword !== 'string') {
    throw createError({ statusCode: 400, message: 'Kata sandi saat ini wajib diisi' })
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw createError({ statusCode: 400, message: 'Kata sandi baru minimal 6 karakter' })
  }

  if (confirmPassword && confirmPassword !== newPassword) {
    throw createError({ statusCode: 400, message: 'Konfirmasi kata sandi baru tidak cocok' })
  }

  const user = await prisma.users.findUnique({
    where: { id: session.userId }
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'Pengguna tidak ditemukan' })
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isMatch) {
    throw createError({ statusCode: 400, message: 'Kata sandi saat ini salah' })
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10)

  await prisma.users.update({
    where: { id: session.userId },
    data: {
      password_hash: newHash
    }
  })

  return {
    success: true,
    message: 'Kata sandi berhasil diperbarui'
  }
})
