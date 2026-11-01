import { defineEventHandler, createError } from 'h3'
import { getSessionFromEvent } from '../../utils/session'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Khusus admin.' })
  }

  const rooms = await prisma.chat_rooms.findMany({
    orderBy: [
      { updated_at: 'desc' },
      { id: 'desc' }
    ],
    include: {
      users: {
        select: {
          id: true,
          username: true,
          phone_number: true
        }
      }
    }
  })

  return rooms.map(r => ({
    id: r.id,
    customerId: r.customer_id,
    customerUsername: r.users?.username || `Customer #${r.customer_id}`,
    customerPhone: r.users?.phone_number || '-',
    lastMessage: r.last_message || 'Belum ada pesan',
    unreadAdminCount: r.unread_admin_count,
    unreadCustomerCount: r.unread_customer_count,
    updatedAt: r.updated_at
  }))
})

