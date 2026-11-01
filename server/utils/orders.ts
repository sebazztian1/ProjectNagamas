import { prisma } from './prisma'
import { signPrivate } from './r2'

const STATUS_TITLES: Record<string, string> = {
  pending_approval: 'Pesanan Diajukan (Menunggu ACC Admin)',
  pending_payment: 'Pesanan Disetujui Admin (ACC)',
  payment_uploaded: 'Bukti Transfer Diunggah',
  verified: 'Pembayaran Terverifikasi',
  purchasing: 'Sedang Dibelikan di Toko Asal',
  arrived: 'Barang Tiba di Indonesia',
  ready_handover: 'Pesanan Dikirim ke Alamat Tujuan',
  completed: 'Pesanan Selesai',
  rejected: 'Pesanan Ditolak Admin',
  cancelled: 'Pesanan Dibatalkan',
  expired: 'Batas Waktu Pembayaran Berakhir (Kedaluwarsa)'
}

export function getStatusTitle(status: string): string {
  return STATUS_TITLES[status] || status
}

/**
 * Generate kode pesanan unik: RDY-YYYYMMDD-XXX atau JST-YYYYMMDD-XXX
 */
export async function generateOrderCode(orderType: 'ready' | 'jastip'): Promise<string> {
  const prefix = orderType === 'ready' ? 'RDY' : 'JST'
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const datePart = `${y}${m}${d}`

  for (let attempt = 0; attempt < 10; attempt++) {
    const rand = Math.floor(100 + Math.random() * 900)
    const candidate = `${prefix}-${datePart}-${rand}`
    const exists = await prisma.orders.findUnique({
      where: { order_code: candidate },
      select: { id: true }
    })
    if (!exists) return candidate
  }

  return `${prefix}-${datePart}-${Date.now().toString().slice(-4)}`
}

/**
 * Kode unik 3 digit dinonaktifkan (selalu 0)
 */
export function generateUniqueCode(): number {
  return 0
}

/**
 * Kembalikan stok (ready) atau kuota (jastip) saat order dibatalkan/ditolak/expired
 */
export async function restoreOrderStock(orderId: number) {
  const items = await prisma.order_items.findMany({
    where: { order_id: orderId },
    include: { products: true }
  })

  for (const item of items) {
    const prod = item.products
    if (!prod) continue

    if (prod.product_type === 'ready' && prod.stock_quantity !== null) {
      const nextStock = prod.stock_quantity + item.qty
      await prisma.products.update({
        where: { id: prod.id },
        data: {
          stock_quantity: nextStock,
          stock_status: nextStock > 0 ? 'in_stock' : prod.stock_status
        }
      })
    } else if (prod.product_type === 'jastip' && prod.quota !== null) {
      const nextQuota = prod.quota + item.qty
      await prisma.products.update({
        where: { id: prod.id },
        data: {
          quota: nextQuota,
          stock_status: nextQuota > 0 ? 'in_stock' : prod.stock_status
        }
      })
    }
  }
}

/**
 * Auto-expire pesanan dengan status `pending_payment` yang telah melewati `payment_deadline`
 */
export async function autoExpireOverdueOrders() {
  const now = new Date()
  try {
    const overdueOrders = await prisma.orders.findMany({
      where: {
        order_status: 'pending_payment',
        payment_deadline: {
          lt: now
        }
      },
      select: {
        id: true,
        user_id: true,
        order_code: true
      }
    })

    for (const ord of overdueOrders) {
      await prisma.orders.update({
        where: { id: ord.id },
        data: {
          order_status: 'expired',
          updated_at: now
        }
      })

      await prisma.order_status_logs.create({
        data: {
          order_id: ord.id,
          from_status: 'pending_payment',
          to_status: 'expired',
          changed_by: ord.user_id,
          note: 'Melewati batas waktu pembayaran 24 jam. Stok/kuota otomatis dikembalikan.'
        }
      })

      await restoreOrderStock(ord.id)

      await prisma.notifications.create({
        data: {
          user_id: ord.user_id,
          type: 'order_expired',
          title: `Pesanan #${ord.order_code} Kedaluwarsa`,
          body: 'Batas waktu pembayaran 24 jam telah berakhir. Silakan ajukan pesanan kembali jika masih berminat.',
          link_url: `/orders/${ord.order_code}`
        }
      })
    }
  } catch (err) {
    console.error('[orders] Error auto-expiring overdue orders:', err)
  }
}

/**
 * Format objek order dari Prisma untuk dikonsumsi frontend (beserta presigned URL R2 untuk file privat)
 */
export async function formatOrderResponse(o: any) {
  const latestPayment = o.payments?.[0] || null
  let signedReceiptUrl: string | null = null
  if (latestPayment?.receipt_url) {
    try {
      signedReceiptUrl = await signPrivate(latestPayment.receipt_url)
    } catch {
      signedReceiptUrl = latestPayment.receipt_url
    }
  }

  const formattedLogs = await Promise.all(
    (o.order_status_logs || []).map(async (log: any) => {
      let signedProof: string | null = null
      if (log.proof_image_url) {
        try {
          signedProof = await signPrivate(log.proof_image_url)
        } catch {
          signedProof = log.proof_image_url
        }
      }
      return {
        id: String(log.id),
        fromStatus: log.from_status || '',
        toStatus: log.to_status,
        title: getStatusTitle(log.to_status),
        note: log.note || '',
        proofImageUrl: signedProof,
        changedBy: log.users?.username || 'Sistem',
        createdAt: new Date(log.created_at).toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    })
  )

  const formattedPayments = await Promise.all(
    (o.payments || []).map(async (p: any) => {
      let url: string | null = null
      if (p.receipt_url) {
        try {
          url = await signPrivate(p.receipt_url)
        } catch {
          url = p.receipt_url
        }
      }
      return {
        id: p.id,
        paymentKind: p.payment_kind,
        bankAccountId: p.bank_account_id,
        bankName: p.bank_accounts?.bank_name || '-',
        senderName: p.sender_name,
        senderBank: p.sender_bank || '-',
        amount: Number(p.amount),
        receiptUrl: url,
        status: p.status,
        adminNote: p.admin_note || null,
        verifiedAt: p.verified_at ? new Date(p.verified_at).toISOString() : null,
        createdAt: new Date(p.created_at).toISOString()
      }
    })
  )

  // Map `ready_handover` internal enum so both `ready_handover` and `ready_pickup` work seamlessly in UI
  return {
    id: o.id,
    orderCode: o.order_code,
    userId: o.user_id,
    customerName: o.recipient_name || o.users?.username || 'Customer',
    customerUsername: o.users?.username || 'customer',
    customerPhone: o.recipient_phone || o.users?.phone_number || '-',
    orderType: o.order_type,
    tripId: o.trip_id,
    tripTitle: o.jastip_trips?.title || null,
    tripSlug: o.jastip_trips?.slug || null,
    subtotal: Number(o.subtotal),
    shippingCost: o.shipping_cost !== null && o.shipping_cost !== undefined ? Number(o.shipping_cost) : 0,
    uniqueCode: Number(o.unique_code || 0),
    totalAmount: Number(o.total_amount),
    paymentType: o.payment_type,
    dpAmount: o.dp_amount !== null && o.dp_amount !== undefined ? Number(o.dp_amount) : 0,
    paidAmount: Number(o.paid_amount || 0),
    remainingAmount: Number(o.remaining_amount || 0),
    orderStatus: o.order_status,
    rejectionReason: o.rejection_reason || null,
    approvedAt: o.approved_at ? new Date(o.approved_at).toISOString() : null,
    paymentDeadline: o.payment_deadline ? new Date(o.payment_deadline).toISOString() : null,
    fulfillmentMethod: o.fulfillment_method,
    recipientName: o.recipient_name || o.users?.username || '',
    recipientPhone: o.recipient_phone || o.users?.phone_number || '',
    shippingAddress: o.shipping_address || '',
    customerNote: o.customer_note || null,
    adminNote: o.admin_note || null,
    receiptUrl: signedReceiptUrl,
    latestPayment: formattedPayments[0] || null,
    payments: formattedPayments,
    items: (o.order_items || []).map((it: any) => ({
      id: it.id,
      productId: it.product_id,
      productSlug: it.products?.slug || '',
      productName: it.product_name_snapshot,
      productImage: it.products?.image_url || null,
      variant: it.variant_snapshot || 'Standard',
      priceAtOrder: Number(it.price_at_order),
      quantity: it.qty,
      subtotal: Number(it.subtotal)
    })),
    logs: formattedLogs,
    createdAt: new Date(o.created_at).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAtIso: new Date(o.created_at).toISOString()
  }
}

