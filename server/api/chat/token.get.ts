import { defineEventHandler, createError } from 'h3'
import { getSessionFromEvent, clearSessionCookie } from '../../utils/session'
import { prisma } from '../../utils/prisma'
import { requireAblyRest } from '../../utils/ably'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harus login untuk mengakses live chat' })
  }

  // Validate that the user in session actually exists in the current database
  const user = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, is_active: true }
  })

  if (!user || !user.is_active) {
    clearSessionCookie(event)
    throw createError({
      statusCode: 401,
      message: 'Sesi akun tidak valid atau sudah tidak ada di database. Silakan masuk kembali.'
    })
  }

  const ably = requireAblyRest()
  let capability: Record<string, string[]> = {}

  if (session.role === 'admin' || session.role === 'staff') {
    capability = {
      'chat:room-*': ['subscribe', 'publish', 'presence'],
      'chat:admin-inbox': ['subscribe', 'publish']
    }
  } else {
    const room = await prisma.chat_rooms.upsert({
      where: { customer_id: session.userId },
      update: {},
      create: {
        customer_id: session.userId,
        updated_at: new Date()
      }
    })
    capability = {
      [`chat:room-${room.id}`]: ['subscribe', 'presence']
    }
  }

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: `user-${session.userId}`,
    capability: JSON.stringify(capability)
  })

  return tokenRequest
})

