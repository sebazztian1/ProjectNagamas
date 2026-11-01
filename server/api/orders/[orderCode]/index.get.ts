import { defineEventHandler, getRouterParam, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { autoExpireOverdueOrders, formatOrderResponse } from '../../../utils/orders'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harap masuk ke akun Anda terlebih dahulu.' })
  }

  const orderCode = getRouterParam(event, 'orderCode')
  if (!orderCode) {
    throw createError({ statusCode: 400, message: 'Kode pesanan tidak valid.' })
  }

  await autoExpireOverdueOrders()

  const order = await prisma.orders.findUnique({
    where: { order_code: orderCode },
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
    }
  })

  if (!order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan.' })
  }

  const isAdmin = session.role === 'admin' || session.role === 'staff'
  if (!isAdmin && order.user_id !== session.userId) {
    throw createError({ statusCode: 403, message: 'Anda tidak memiliki akses ke pesanan ini.' })
  }

  return await formatOrderResponse(order)
})

