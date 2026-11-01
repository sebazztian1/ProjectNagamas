import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { autoExpireOverdueOrders, formatOrderResponse } from '../../../utils/orders'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  await autoExpireOverdueOrders()

  const orders = await prisma.orders.findMany({
    include: {
      users: {
        select: { id: true, username: true, phone_number: true }
      },
      jastip_trips: {
        select: { id: true, title: true, slug: true }
      },
      order_items: {
        include: {
          products: {
            select: { id: true, slug: true, image_url: true }
          }
        }
      },
      payments: {
        include: {
          bank_accounts: {
            select: { id: true, bank_name: true }
          }
        },
        orderBy: { created_at: 'desc' }
      },
      order_status_logs: {
        include: {
          users: {
            select: { id: true, username: true }
          }
        },
        orderBy: { created_at: 'asc' }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  return await Promise.all(orders.map(formatOrderResponse))
})

