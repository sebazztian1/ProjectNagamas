import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
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
      created_at: true,
      _count: {
        select: {
          orders: true
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
    joinedAt: u.created_at,
    totalOrders: u._count.orders,
    unreadChatCount: u.chat_rooms?.unread_admin_count || 0
  }))
})
