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
      orders: {
        select: {
          order_status: true,
          total_amount: true,
          paid_amount: true,
          remaining_amount: true
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

  return customers.map(u => {
    const validOrders = u.orders.filter(
      o => o.order_status !== 'cancelled' && o.order_status !== 'rejected'
    )
    const totalOrderAmount = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
    const totalPaidAmount = validOrders.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0)
    const totalRemainingAmount = validOrders.reduce((sum, o) => sum + Number(o.remaining_amount || 0), 0)
    const completedOrdersCount = u.orders.filter(o => o.order_status === 'completed').length

    return {
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
      completedOrdersCount,
      totalOrderAmount,
      totalPaidAmount,
      totalRemainingAmount,
      totalRequests: u._count.product_requests,
      unreadChatCount: u.chat_rooms?.unread_admin_count || 0
    }
  })
})
