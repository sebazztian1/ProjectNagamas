import { defineEventHandler, readBody, createError } from 'h3'
import { getSessionFromEvent } from '../../utils/session'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harus login' })
  }

  const body = await readBody(event)
  const isAdmin = session.role === 'admin' || session.role === 'staff'

  if (isAdmin) {
    const roomId = Number(body?.roomId)
    if (!roomId || isNaN(roomId)) {
      throw createError({ statusCode: 400, message: 'roomId diperlukan' })
    }
    await Promise.all([
      prisma.chat_rooms.update({
        where: { id: roomId },
        data: { unread_admin_count: 0 }
      }),
      prisma.chat_messages.updateMany({
        where: { room_id: roomId, sender_role: 'customer', is_read: false },
        data: { is_read: true }
      })
    ])
  } else {
    const room = await prisma.chat_rooms.findUnique({
      where: { customer_id: session.userId }
    })
    if (room) {
      await Promise.all([
        prisma.chat_rooms.update({
          where: { id: room.id },
          data: { unread_customer_count: 0 }
        }),
        prisma.chat_messages.updateMany({
          where: {
            room_id: room.id,
            sender_role: { in: ['admin', 'staff'] },
            is_read: false
          },
          data: { is_read: true }
        })
      ])
    }
  }

  return { success: true }
})

