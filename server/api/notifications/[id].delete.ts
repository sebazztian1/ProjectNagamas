import { defineEventHandler, getRouterParam, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda terlebih dahulu.' })
  }

  const idParam = getRouterParam(event, 'id')
  if (!idParam) {
    throw createError({ statusCode: 400, message: 'ID notifikasi tidak valid.' })
  }

  if (idParam === 'read') {
    await prisma.notifications.deleteMany({
      where: {
        user_id: session.userId,
        is_read: true
      }
    })
  } else {
    try {
      const notifId = BigInt(idParam)
      await prisma.notifications.deleteMany({
        where: {
          id: notifId,
          user_id: session.userId
        }
      })
    } catch {
      throw createError({ statusCode: 400, message: 'ID notifikasi tidak valid.' })
    }
  }

  const unreadCount = await prisma.notifications.count({
    where: {
      user_id: session.userId,
      is_read: false
    }
  })

  return {
    success: true,
    unreadCount
  }
})

