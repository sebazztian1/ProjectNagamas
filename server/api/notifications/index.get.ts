import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'
import { autoExpireOverdueOrders } from '../../utils/orders'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda terlebih dahulu.' })
  }

  // Jalankan pengecekan kedaluwarsa pesanan agar notifikasi order_expired langsung terbuat jika ada
  await autoExpireOverdueOrders()

  const [rows, unreadCount] = await Promise.all([
    prisma.notifications.findMany({
      where: { user_id: session.userId },
      orderBy: { created_at: 'desc' },
      take: 60
    }),
    prisma.notifications.count({
      where: {
        user_id: session.userId,
        is_read: false
      }
    })
  ])

  const notifications = rows.map((n) => ({
    id: String(n.id),
    userId: n.user_id,
    type: n.type,
    title: n.title,
    body: n.body || '',
    linkUrl: n.link_url || '/orders',
    isRead: Boolean(n.is_read),
    createdAt: n.created_at.toISOString()
  }))

  return {
    notifications,
    unreadCount
  }
})

