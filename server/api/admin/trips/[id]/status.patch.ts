import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const idStr = event.context.params?.id
  const id = Number(idStr)
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID trip tidak valid' })
  }

  const existing = await prisma.jastip_trips.findUnique({
    where: { id },
    include: {
      orders: {
        select: { id: true, user_id: true, order_code: true }
      }
    }
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Jadwal trip tidak ditemukan' })
  }

  const body = await readBody(event)
  const nextStatus = body.status || 'closed'

  const VALID_STATUSES = ['draft', 'open', 'closed', 'purchasing', 'arrived', 'completed', 'cancelled']
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw createError({ statusCode: 400, message: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` })
  }

  const updated = await prisma.jastip_trips.update({
    where: { id },
    data: {
      status: nextStatus as any,
      updated_at: new Date()
    }
  })

  // If status is changed to arrived or completed, we can automatically create notification for customers
  if (nextStatus === 'arrived') {
    for (const ord of existing.orders) {
      try {
        await prisma.notifications.create({
          data: {
            user_id: ord.user_id,
            type: 'trip_arrived',
            title: `Barang Trip ${existing.title} Telah Tiba!`,
            body: `Koper jastip dari trip ${existing.title} sudah tiba di Indonesia. Pesanan Anda (${ord.order_code}) sedang dalam proses sortir & persiapan pengiriman.`,
            link_url: `/orders/${ord.order_code}`
          }
        })
      } catch (err) {
        // Notification creation non-blocking
      }
    }
  }

  return {
    success: true,
    message: `Status trip berhasil diubah menjadi "${nextStatus}".`,
    status: updated.status
  }
})
