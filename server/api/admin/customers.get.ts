import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  const customers = await prisma.users.findMany({
    where: {
      role: 'customer'
    },
    orderBy: {
      created_at: 'desc'
    },
    select: {
      id: true,
      username: true,
      phone_number: true,
      is_active: true,
      can_order: true,
      can_request: true,
      can_chat: true,
      restriction_reason: true,
      created_at: true,
      _count: {
        select: {
          orders: true,
          product_requests: true
        }
      },
      chat_rooms: {
        select: {
          id: true,
          unread_admin_count: true
        }
      }
    }
  })

  return customers.map(u => ({
    id: u.id,
    username: u.username,
    phone: u.phone_number,
    isActive: u.is_active,
    canOrder: u.can_order,
    canRequest: u.can_request,
    canChat: u.can_chat,
    restrictionReason: u.restriction_reason || null,
    joinedAt: u.created_at,
    totalOrders: u._count.orders,
    totalRequests: u._count.product_requests,
    unreadChatCount: u.chat_rooms?.unread_admin_count || 0
  }))
})
