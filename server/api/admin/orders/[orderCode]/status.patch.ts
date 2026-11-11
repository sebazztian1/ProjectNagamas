import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'
import { restoreOrderStock, formatOrderResponse } from '../../../../utils/orders'
import { recordAuditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  const orderCode = getRouterParam(event, 'orderCode')
  if (!orderCode) {
    throw createError({ statusCode: 400, message: 'Kode pesanan tidak valid.' })
  }

  const order = await prisma.orders.findUnique({
    where: { order_code: orderCode },
    include: {
      payments: {
        orderBy: { created_at: 'desc' }
      }
    }
  })

  if (!order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan.' })
  }

  const body = await readBody(event)
  const action = String(body?.action || '').trim()
  const now = new Date()
  const prevStatus = order.order_status

  if (action === 'acc') {
    const shippingCost = Math.max(0, Number(body?.shippingCost) || 0)
    const adminNote = body?.adminNote ? String(body.adminNote).trim() : order.admin_note
    const subtotal = Number(order.subtotal)
    const totalAmount = subtotal + shippingCost
    const dpAmount = order.payment_type === 'dp' ? Math.ceil(totalAmount / 2) : null
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        order_status: 'pending_payment',
        shipping_cost: shippingCost,
        unique_code: 0,
        total_amount: totalAmount,
        dp_amount: dpAmount,
        remaining_amount: totalAmount - Number(order.paid_amount || 0),
        approved_at: now,
        payment_deadline: deadline,
        admin_note: adminNote,
        updated_at: now
      }
    })

    const shippingNote =
      shippingCost > 0
        ? ` Ongkir disepakati: Rp ${shippingCost.toLocaleString('id-ID')}. Total tagihan: Rp ${totalAmount.toLocaleString('id-ID')}.`
        : ''

    await prisma.order_status_logs.create({
      data: {
        order_id: order.id,
        from_status: prevStatus,
        to_status: 'pending_payment',
        changed_by: session.userId,
        note: `Admin menyetujui pesanan (ACC).${shippingNote} Batas waktu pembayaran 24 jam telah aktif.`
      }
    })

    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'order_approved',
        title: `Pesanan #${order.order_code} Disetujui (ACC)!`,
        body: `Pesanan Anda telah disetujui oleh admin.${shippingNote} Silakan selesaikan pembayaran dalam 24 jam.`,
        link_url: `/orders/${order.order_code}/bayar`
      }
    })

    await recordAuditLog(session, {
      action: 'ACC_ORDER',
      entityType: 'order',
      entityId: order.id,
      detail: {
        orderCode: order.order_code,
        shippingCost,
        totalAmount,
        note: adminNote || null
      }
    })
  } else if (action === 'reject_order') {
    const reason = String(body?.reason || 'Stok atau kuota tidak mencukupi.').trim()

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        order_status: 'rejected',
        rejection_reason: reason,
        updated_at: now
      }
    })

    await prisma.order_status_logs.create({
      data: {
        order_id: order.id,
        from_status: prevStatus,
        to_status: 'rejected',
        changed_by: session.userId,
        note: `Pesanan ditolak admin. Alasan: ${reason}`
      }
    })

    await restoreOrderStock(order.id)

    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'order_rejected',
        title: `Pesanan #${order.order_code} Ditolak`,
        body: `Mohon maaf, pesanan Anda belum dapat diproses. Alasan: ${reason}`,
        link_url: `/orders/${order.order_code}`
      }
    })

    await recordAuditLog(session, {
      action: 'REJECT_ORDER',
      entityType: 'order',
      entityId: order.id,
      detail: {
        orderCode: order.order_code,
        reason
      }
    })
  } else if (action === 'verify_payment') {
    const latestPayment = order.payments?.[0]
    let verifiedAmount = Number(order.total_amount)

    if (latestPayment) {
      verifiedAmount = Number(latestPayment.amount)
      await prisma.payments.update({
        where: { id: latestPayment.id },
        data: {
          status: 'verified',
          verified_by: session.userId,
          verified_at: now
        }
      })
    }

    const nextPaid = Number(order.paid_amount || 0) + verifiedAmount
    const nextRemaining = Math.max(0, Number(order.total_amount) - nextPaid)

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        order_status: 'verified',
        paid_amount: nextPaid,
        remaining_amount: nextRemaining,
        updated_at: now
      }
    })

    await prisma.order_status_logs.create({
      data: {
        order_id: order.id,
        from_status: prevStatus,
        to_status: 'verified',
        changed_by: session.userId,
        note: `Pembayaran sebesar Rp ${verifiedAmount.toLocaleString('id-ID')} telah diverifikasi oleh @${session.username}.`
      }
    })

    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'payment_verified',
        title: `Pembayaran #${order.order_code} Terverifikasi!`,
        body: `Terima kasih! Pembayaran Anda sebesar Rp ${verifiedAmount.toLocaleString('id-ID')} telah diverifikasi.`,
        link_url: `/orders/${order.order_code}`
      }
    })

    await recordAuditLog(session, {
      action: 'VERIFY_PAYMENT',
      entityType: 'order',
      entityId: order.id,
      detail: {
        orderCode: order.order_code,
        verifiedAmount,
        totalAmount: Number(order.total_amount)
      }
    })
  } else if (action === 'reject_payment') {
    const reason = String(body?.reason || 'Bukti transfer tidak sesuai dengan mutasi rekening. Mohon unggah ulang bukti yang valid.').trim()
    const latestPayment = order.payments?.[0]

    if (latestPayment) {
      await prisma.payments.update({
        where: { id: latestPayment.id },
        data: {
          status: 'rejected',
          admin_note: reason,
          verified_by: session.userId,
          verified_at: now
        }
      })
    }

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        order_status: 'pending_payment',
        updated_at: now
      }
    })

    await prisma.order_status_logs.create({
      data: {
        order_id: order.id,
        from_status: prevStatus,
        to_status: 'pending_payment',
        changed_by: session.userId,
        note: `Bukti transfer ditolak oleh @${session.username}: ${reason}`
      }
    })

    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'payment_rejected',
        title: `Bukti Transfer #${order.order_code} Perlu Diunggah Ulang`,
        body: reason,
        link_url: `/orders/${order.order_code}/bayar`
      }
    })

    await recordAuditLog(session, {
      action: 'REJECT_PAYMENT',
      entityType: 'order',
      entityId: order.id,
      detail: {
        orderCode: order.order_code,
        reason
      }
    })
  } else if (action === 'advance_status') {
    let targetStatus = String(body?.nextStatus || '').trim()
    if (!targetStatus) {
      if (prevStatus === 'verified') {
        targetStatus = order.order_type === 'ready' ? 'ready_handover' : 'purchasing'
      } else if (prevStatus === 'purchasing') {
        targetStatus = 'arrived'
      } else if (prevStatus === 'arrived') {
        targetStatus = 'ready_handover'
      } else if (prevStatus === 'ready_handover') {
        targetStatus = 'completed'
      }
    }

    if (targetStatus === 'ready_pickup') {
      targetStatus = 'ready_handover'
    }

    const adminNote = body?.adminNote !== undefined ? String(body.adminNote).trim() : order.admin_note
    const logNote = String(body?.note || '').trim()
    const proofImageUrl = body?.proofImageUrl ? String(body.proofImageUrl).trim() : null

    const defaultNotes: Record<string, string> = {
      purchasing: 'Barang sedang dibelikan langsung di toko fisik luar negeri.',
      arrived: 'Barang titipan telah tiba di Indonesia dan sedang disortir.',
      ready_handover: adminNote
        ? `Pesanan sedang dikirim ke alamat tujuan (${adminNote}).`
        : 'Pesanan telah dikemas dan diserahkan ke kurir menuju alamat tujuan.',
      completed: 'Pesanan telah diterima dan transaksi selesai. Terima kasih telah berbelanja di dbb_luxe!'
    }

    const finalNote = logNote || defaultNotes[targetStatus] || `Status diperbarui menjadi ${targetStatus}`

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        order_status: targetStatus as any,
        admin_note: adminNote || order.admin_note,
        updated_at: now
      }
    })

    await prisma.order_status_logs.create({
      data: {
        order_id: order.id,
        from_status: prevStatus,
        to_status: targetStatus,
        changed_by: session.userId,
        note: finalNote,
        proof_image_url: proofImageUrl
      }
    })

    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'order_status_updated',
        title: `Update Status Pesanan #${order.order_code}`,
        body: finalNote,
        link_url: `/orders/${order.order_code}`
      }
    })

    await recordAuditLog(session, {
      action: `UPDATE_STATUS_${targetStatus.toUpperCase()}`,
      entityType: 'order',
      entityId: order.id,
      detail: {
        orderCode: order.order_code,
        fromStatus: prevStatus,
        toStatus: targetStatus,
        note: finalNote,
        proofImageUrl: proofImageUrl || undefined
      }
    })
  } else if (action === 'refund') {
    const refundNote = String(body?.reason || 'Barang out of stock di luar negeri — 100% Full Refund telah diproses manual ke rekening customer.').trim()

    await prisma.orders.update({
      where: { id: order.id },
      data: {
        order_status: 'cancelled',
        rejection_reason: `REFUND 100%: ${refundNote}`,
        admin_note: `REFUND 100%: ${refundNote}`,
        updated_at: now
      }
    })

    await prisma.order_status_logs.create({
      data: {
        order_id: order.id,
        from_status: prevStatus,
        to_status: 'cancelled',
        changed_by: session.userId,
        note: `Refund Manual 100% oleh @${session.username}: ${refundNote}`
      }
    })

    await restoreOrderStock(order.id)

    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'order_refunded',
        title: `Refund 100% Pesanan #${order.order_code}`,
        body: refundNote,
        link_url: `/orders/${order.order_code}`
      }
    })

    await recordAuditLog(session, {
      action: 'REFUND_ORDER',
      entityType: 'order',
      entityId: order.id,
      detail: {
        orderCode: order.order_code,
        reason: refundNote
      }
    })
  } else {
    throw createError({ statusCode: 400, message: 'Aksi tidak dikenali.' })
  }

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

