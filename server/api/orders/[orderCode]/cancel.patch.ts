import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { restoreOrderStock, formatOrderResponse } from '../../../utils/orders'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harap masuk ke akun Anda terlebih dahulu.' })
  }

  const orderCode = getRouterParam(event, 'orderCode')
  if (!orderCode) {
    throw createError({ statusCode: 400, message: 'Kode pesanan tidak valid.' })
  }

  const order = await prisma.orders.findUnique({
    where: { order_code: orderCode }
  })

  if (!order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan.' })
  }

  if (order.user_id !== session.userId && session.role !== 'admin' && session.role !== 'staff') {
    throw createError({ statusCode: 403, message: 'Anda tidak memiliki akses ke pesanan ini.' })
  }

  // Aturan batal (9.6): bebas sebelum di-ACC atau sebelum pembayaran diverifikasi;
  // tidak bisa dibatalkan setelah diverifikasi / sedang dibelikan di luar negeri.
  if (!['pending_approval', 'pending_payment'].includes(order.order_status)) {
    throw createError({
      statusCode: 400,
      message: 'Pesanan tidak dapat dibatalkan karena pembayaran sedang/telah diverifikasi atau barang sudah dalam proses pembelian.'
    })
  }

  const body = await readBody(event).catch(() => ({}))
  const reason = String(body?.reason || 'Dibatalkan oleh customer').trim()

  const prevStatus = order.order_status
  await prisma.orders.update({
    where: { id: order.id },
    data: {
      order_status: 'cancelled',
      rejection_reason: reason,
      updated_at: new Date()
    }
  })

  await prisma.order_status_logs.create({
    data: {
      order_id: order.id,
      from_status: prevStatus,
      to_status: 'cancelled',
      changed_by: session.userId,
      note: `Pesanan dibatalkan: ${reason}`
    }
  })

  await restoreOrderStock(order.id)

  const updated = await prisma.orders.findUnique({
    where: { id: order.id },
    include: {
      users: { select: { id: true, username: true, phone_number: true } },
      jastip_trips: { select: { id: true, title: true, slug: true } },
      order_items: {
        include: { products: { select: { id: true, slug: true, image_url: true } } }
      },
      payments: {
        include: { bank_accounts: { select: { id: true, bank_name: true } } },
        orderBy: { created_at: 'desc' }
      },
      order_status_logs: {
        include: { users: { select: { id: true, username: true } } },
        orderBy: { created_at: 'asc' }
      }
    }
  })

  return await formatOrderResponse(updated)
})

