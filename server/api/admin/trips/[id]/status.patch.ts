import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'
import { recordAuditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
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

  await recordAuditLog(session, {
    action: `UPDATE_TRIP_STATUS_${nextStatus.toUpperCase()}`,
    entityType: 'trip',
    entityId: updated.id,
    detail: {
      title: updated.title,
      fromStatus: existing.status,
      toStatus: nextStatus
    }
  })

  // Automatically create notification for customers who have orders in this trip
  const tripNotifMessages: Record<string, { type: string; title: string; getBody: (code: string) => string }> = {
    purchasing: {
      type: 'trip_purchasing',
      title: `Trip ${existing.title} Sedang Belanja di Luar Negeri!`,
      getBody: (code) => `Tim dbb_luxe sedang membelikan barang titipan untuk trip ${existing.title} (Pesanan #${code}).`
    },
    arrived: {
      type: 'trip_arrived',
      title: `Barang Trip ${existing.title} Telah Tiba!`,
      getBody: (code) => `Koper jastip dari trip ${existing.title} sudah tiba di Indonesia. Pesanan Anda (#${code}) sedang dalam proses sortir & persiapan pengiriman.`
    },
    completed: {
      type: 'trip_completed',
      title: `Jadwal Trip ${existing.title} Selesai`,
      getBody: (code) => `Seluruh rangkaian pengiriman trip ${existing.title} untuk pesanan #${code} telah selesai. Terima kasih telah menitip di dbb_luxe!`
    },
    cancelled: {
      type: 'trip_cancelled',
      title: `Jadwal Trip ${existing.title} Dibatalkan`,
      getBody: (code) => `Mohon maaf, jadwal trip ${existing.title} terkait pesanan #${code} mengalami pembatalan. Silakan cek detail pesanan atau hubungi Admin.`
    }
  }

  const notifTemplate = tripNotifMessages[nextStatus]
  if (notifTemplate && existing.orders.length > 0) {
    for (const ord of existing.orders) {
      try {
        await prisma.notifications.create({
          data: {
            user_id: ord.user_id,
            type: notifTemplate.type,
            title: notifTemplate.title,
            body: notifTemplate.getBody(ord.order_code),
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
