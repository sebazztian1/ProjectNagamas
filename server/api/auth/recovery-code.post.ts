import { defineEventHandler, createError } from 'h3'
import { getSessionFromEvent } from '../../utils/session'
import { prisma } from '../../utils/prisma'
import { generateRecoveryCode } from '../../utils/authValidation'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan login terlebih dahulu' })
  }

  const user = await prisma.users.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      recovery_code: true,
      recovery_code_last_rotated: true
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'Pengguna tidak ditemukan' })
  }

  const now = Date.now()
  const lastTime = user.recovery_code_last_rotated ? new Date(user.recovery_code_last_rotated).getTime() : 0
  const timeSinceLast = now - lastTime

  if (lastTime > 0 && timeSinceLast < THREE_DAYS_MS) {
    const remainingHours = Math.ceil((THREE_DAYS_MS - timeSinceLast) / (1000 * 60 * 60))
    throw createError({
      statusCode: 429,
      message: `Kode pemulihan hanya dapat di-shuffle setiap 3 hari sekali. Silakan coba lagi dalam ${remainingHours} jam.`
    })
  }

  const newCode = generateRecoveryCode()
  const newDate = new Date()

  await prisma.users.update({
    where: { id: user.id },
    data: {
      recovery_code: newCode,
      recovery_code_last_rotated: newDate
    }
  })

  return {
    success: true,
    message: 'Kode pemulihan berhasil diacak ulang.',
    recoveryCode: newCode,
    canShuffle: false,
    lastRotatedAt: newDate.toISOString(),
    nextAvailableInHours: 72,
    nextAvailableInDays: 3
  }
})
