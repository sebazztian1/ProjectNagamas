import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import crypto from 'crypto'
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
    where: { order_code: orderCode }
  })

  if (!order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan.' })
  }

  if (order.user_id !== session.userId && session.role !== 'admin' && session.role !== 'staff') {
    throw createError({ statusCode: 403, message: 'Anda tidak memiliki akses ke pesanan ini.' })
  }

  if (order.order_status === 'pending_approval') {
    throw createError({
      statusCode: 400,
      message: 'Pesanan menunggu persetujuan admin.'
    })
  }

  if (['rejected', 'cancelled', 'expired'].includes(order.order_status)) {
    throw createError({
      statusCode: 400,
      message: `Pesanan ini berstatus ${order.order_status} dan tidak dapat dibayar.`
    })
  }

  const body = await readBody(event)
  const bankAccountId = Number(body?.bankAccountId)
  const senderName = String(body?.senderName || '').trim()
  const senderBank = String(body?.senderBank || '').trim()
  const amount = Number(body?.amount)
  const receiptUrl = String(body?.receiptUrl || '').trim()

  if (!senderName || !senderBank || !amount || isNaN(amount) || !receiptUrl) {
    throw createError({
      statusCode: 400,
      message: 'Nama pengirim, bank asal, nominal transfer, dan foto bukti transfer wajib diisi.'
    })
  }

  // Find target bank account (or default to first active bank account)
  let bankAccount = null
  if (bankAccountId && !isNaN(bankAccountId)) {
    bankAccount = await prisma.bank_accounts.findUnique({ where: { id: bankAccountId } })
  }
  if (!bankAccount) {
    bankAccount = await prisma.bank_accounts.findFirst({ where: { is_active: true } })
  }
  if (!bankAccount) {
    throw createError({ statusCode: 400, message: 'Rekening tujuan toko belum tersedia.' })
  }

  // Determine expected transfer amount (full, dp, or remaining)
  const totalAmount = Number(order.total_amount)
  const paidAmount = Number(order.paid_amount || 0)
  const remainingAmount = Number(order.remaining_amount || totalAmount)
  const dpAmount = order.dp_amount ? Number(order.dp_amount) : Math.ceil(totalAmount / 2)

  let paymentKind: 'dp' | 'full' | 'remaining' = 'full'
  if (paidAmount > 0 && remainingAmount > 0) {
    paymentKind = 'remaining'
  } else if (order.payment_type === 'dp' && paidAmount === 0) {
    paymentKind = 'dp'
  }

  const expectedAmount =
    paymentKind === 'dp'
      ? dpAmount
      : paymentKind === 'remaining'
        ? remainingAmount
        : totalAmount

  if (Math.round(amount) !== Math.round(expectedAmount)) {
    throw createError({
      statusCode: 400,
      message: `Nominal transfer harus sesuai dengan tagihan persis (Rp ${expectedAmount.toLocaleString('id-ID')}).`
    })
  }

  const receiptHash = crypto
    .createHash('sha256')
    .update(`${order.id}:${receiptUrl}:${amount}:${Date.now()}`)
    .digest('hex')

  await prisma.payments.create({
    data: {
      order_id: order.id,
      payment_kind: paymentKind,
      bank_account_id: bankAccount.id,
      sender_name: senderName,
      sender_bank: senderBank,
      amount,
      receipt_url: receiptUrl,
      receipt_hash: receiptHash,
      status: 'pending'
    }
  })

  const prevStatus = order.order_status
  await prisma.orders.update({
    where: { id: order.id },
    data: {
      order_status: 'payment_uploaded',
      updated_at: new Date()
    }
  })

  await prisma.order_status_logs.create({
    data: {
      order_id: order.id,
      from_status: prevStatus,
      to_status: 'payment_uploaded',
      changed_by: session.userId,
      note: `Bukti transfer ${senderBank} a.n. ${senderName} Rp ${amount.toLocaleString('id-ID')}. Menunggu verifikasi.`
    }
  })

  try {
    await prisma.notifications.create({
      data: {
        user_id: order.user_id,
        type: 'payment_uploaded',
        title: `Bukti Transfer #${order.order_code} Terkirim`,
        body: `Rp ${amount.toLocaleString('id-ID')} via ${senderBank}. Menunggu verifikasi admin.`,
        link_url: `/orders/${order.order_code}`
      }
    })
  } catch {
    // Non-blocking
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

