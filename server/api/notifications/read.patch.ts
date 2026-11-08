import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda terlebih dahulu.' })
  }

  const body = await readBody(event).catch(() => ({}))

  if (body?.all === true) {
    await prisma.notifications.updateMany({
      where: {
        user_id: session.userId,
        is_read: false
      },
      data: {
        is_read: true
      }
    })
  } else if (body?.id) {
    try {
      const notifId = BigInt(String(body.id))
      await prisma.notifications.updateMany({
        where: {
          id: notifId,
          user_id: session.userId
        },
        data: {
          is_read: true
        }
      })
    } catch {
      throw createError({ statusCode: 400, message: 'ID notifikasi tidak valid.' })
    }
  } else {
    throw createError({ statusCode: 400, message: 'Parameter id atau all wajib dikirim.' })
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

