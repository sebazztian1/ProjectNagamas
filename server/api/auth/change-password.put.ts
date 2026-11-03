import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'
import { validatePasswordRules } from '../../utils/authValidation'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk terlebih dahulu' })
  }

  const body = await readBody(event)
  const currentPassword = String(body?.currentPassword || '')
  const newPassword = String(body?.newPassword || '')
  const confirmPassword = String(body?.confirmPassword || '')

  if (!currentPassword) {
    throw createError({ statusCode: 400, message: 'Kata sandi saat ini wajib diisi' })
  }

  if (!newPassword) {
    throw createError({ statusCode: 400, message: 'Kata sandi baru wajib diisi' })
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

  // 1. Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isMatch) {
    throw createError({ statusCode: 400, message: 'Kata sandi saat ini salah' })
  }

  // 2. Prevent reusing identical current password
  const isSameAsCurrent = await bcrypt.compare(newPassword, user.password_hash)
  if (isSameAsCurrent) {
    throw createError({ statusCode: 400, message: 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini' })
  }

  // 3. Password Rules Validation (length min 12, no personal data, no common/breached)
  const passVal = await validatePasswordRules(newPassword, {
    username: user.username,
    phone: user.phone_number
  })
  if (!passVal.valid) {
    throw createError({ statusCode: 400, message: passVal.error })
  }

  // 4. Hash new password with bcrypt cost 12
  const newHash = await bcrypt.hash(newPassword, 12)

  await prisma.users.update({
    where: { id: session.userId },
    data: {
      password_hash: newHash,
      updated_at: new Date()
    }
  })

  return {
    success: true,
    message: 'Kata sandi berhasil diperbarui'
  }
})
