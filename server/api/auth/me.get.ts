import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent, clearSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)

  if (!session) {
    return {
      user: null
    }
  }

  const user = await prisma.users.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      phone_number: true,
      role: true,
      is_active: true
    }
  })

  if (!user || !user.is_active) {
    clearSessionCookie(event)
    return {
      user: null
    }
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      phone_number: user.phone_number,
      role: user.role
    }
  }
})
