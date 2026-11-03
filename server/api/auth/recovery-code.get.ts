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

  let code = user.recovery_code
  let lastRotated = user.recovery_code_last_rotated

  // If user does not have a recovery code yet, generate a random one and persist to database column
  if (!code) {
    code = generateRecoveryCode()
    lastRotated = new Date()
    await prisma.users.update({
      where: { id: user.id },
      data: {
        recovery_code: code,
        recovery_code_last_rotated: lastRotated
      }
    })
  }

  const now = Date.now()
  const lastTime = lastRotated ? new Date(lastRotated).getTime() : 0
  const timeSinceLast = now - lastTime
  const canShuffle = timeSinceLast >= THREE_DAYS_MS
  const remainingMs = Math.max(0, THREE_DAYS_MS - timeSinceLast)
  const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60))
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

  return {
    recoveryCode: code,
    canShuffle,
    lastRotatedAt: lastRotated ? lastRotated.toISOString() : null,
    nextAvailableInHours: remainingHours,
    nextAvailableInDays: remainingDays
  }
})
