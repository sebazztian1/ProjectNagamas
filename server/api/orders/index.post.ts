import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'
import { generateOrderCode, formatOrderResponse } from '../../utils/orders'
import { validateAndBuildAddressSnapshot, saveUserAddress } from '../../utils/addresses'
import { normalizeIndonesianPhone } from '../../utils/indonesiaRegions'
import { normalizeProductVariants, findVariantCombination, syncProductVariantsTable } from '../../utils/variants'

interface CheckoutItemInput {
  productId?: number
  qty: number
  variant?: string
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harap masuk ke akun Anda untuk melakukan pemesanan.' })
  }

  if (session.role === 'admin' || session.role === 'staff') {
    throw createError({ statusCode: 403, message: 'Akun admin tidak dapat mengajukan pesanan customer.' })
  }

  const body = await readBody(event)

  const fulfillmentMethod: 'pickup' | 'delivery' =
    body?.fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery'

  let recipientName = String(body?.recipientName || '').trim()
  let recipientPhone = String(body?.recipientPhone || '').trim()
  let shippingAddress = String(body?.shippingAddress || '').trim()
  const customerNote = body?.customerNote
    ? String(body.customerNote).trim().slice(0, 500)
    : body?.courierNote
      ? String(body.courierNote).trim().slice(0, 200)
      : null
  const requestedPaymentType: 'full' | 'dp' = body?.paymentType === 'dp' ? 'dp' : 'full'

  if (fulfillmentMethod === 'pickup') {
    const userRow = await prisma.users.findUnique({ where: { id: session.userId } })
    if (!recipientName || recipientName.length < 2) {
      recipientName = userRow?.username || session.username
    }
    const normPhone = normalizeIndonesianPhone(recipientPhone || userRow?.phone_number || '')
    recipientPhone = normPhone || recipientPhone || userRow?.phone_number || '-'
    shippingAddress = 'Ambil sendiri di Pasar Baru'
  } else if (body?.provinceCode || body?.province_code) {
    // Full server-side validation according to design_address.md
    const validation = validateAndBuildAddressSnapshot({
      recipient_name: recipientName,
      phone: recipientPhone,
      province_code: body?.provinceCode ?? body?.province_code,
      regency_code: body?.regencyCode ?? body?.regency_code,
      district_code: body?.districtCode ?? body?.district_code,
      village_code: body?.villageCode ?? body?.village_code,
      postal_code: body?.postalCode ?? body?.postal_code,
      street: body?.street ?? body?.streetAddress,
      courier_note: body?.courierNote ?? body?.courier_note
    })

    if (!validation.valid || !validation.data) {
      const firstErr = Object.values(validation.errors)[0] || 'Data alamat pengiriman belum lengkap atau tidak valid.'
      throw createError({
        statusCode: 400,
        message: firstErr,
        data: { errors: validation.errors }
      })
    }

    recipientName = validation.data.recipient_name
    recipientPhone = validation.data.phone
    shippingAddress = validation.data.formatted_address

    if (body?.saveAddress) {
      await saveUserAddress(session.userId, validation.data)
    }
  } else {
    // Fallback for legacy/direct payloads
    if (!recipientName || recipientName.length < 2) {
      throw createError({ statusCode: 400, message: 'Nama penerima wajib diisi' })
    }
    const normPhone = normalizeIndonesianPhone(recipientPhone)
    if (!normPhone) {
      throw createError({ statusCode: 400, message: 'Masukkan nomor HP yang valid, contoh: 081234567890' })
    }
    recipientPhone = normPhone
    if (!shippingAddress || shippingAddress.length < 10) {
      throw createError({ statusCode: 400, message: 'Tulis alamat lengkap (nama jalan, nomor, RT/RW)' })
    }
  }

  // Support either quoteId (from approved product request) or items array
  const quoteId = body?.quoteId ? Number(body.quoteId) : null
  const rawItems: CheckoutItemInput[] = Array.isArray(body?.items)
    ? body.items
    : body?.productId
      ? [{ productId: Number(body.productId), qty: Number(body.qty) || 1, variant: body.variant || 'Standard' }]
      : []

  if (!quoteId && rawItems.length === 0) {
    throw createError({ statusCode: 400, message: 'Keranjang belanja kosong. Pilih minimal 1 produk.' })
  }

  // Group items into order buckets:
  // - 'ready' bucket for ready stock items
  // - 'jastip:<tripId>' bucket per trip for jastip items
  interface ResolvedItem {
    productId: number
    productName: string
    variant: string
    variantKey?: string | null
    variantId?: number | null
    qty: number
    priceAtOrder: number
    subtotal: number
    productType: 'ready' | 'jastip'
    tripId: number | null
  }

  const resolvedItems: ResolvedItem[] = []

  if (quoteId) {
    const req = await prisma.product_requests.findUnique({
      where: { id: quoteId },
      include: { jastip_trips: true }
    })

    if (!req || req.user_id !== session.userId) {
      throw createError({ statusCode: 404, message: 'Penawaran request produk tidak ditemukan.' })
    }

    if (!req.quoted_price || Number(req.quoted_price) <= 0) {
      throw createError({ statusCode: 400, message: 'Request ini belum memiliki harga penawaran dari admin.' })
    }

    // Find or create a product record for this custom request so order_items foreign key is satisfied
    let reqProduct = await prisma.products.findFirst({
      where: { slug: `custom-request-${req.id}` }
    })

    if (!reqProduct) {
      let defaultCat = await prisma.categories.findFirst({ where: { slug: 'lainnya' } })
      if (!defaultCat) {
        defaultCat = await prisma.categories.findFirst()
      }
      if (!defaultCat) {
        defaultCat = await prisma.categories.create({ data: { name: 'Lainnya', slug: 'lainnya' } })
      }

      reqProduct = await prisma.products.create({
        data: {
          name: req.product_name,
          slug: `custom-request-${req.id}`,
          description: req.description || 'Produk request khusus customer',
          category_id: defaultCat.id,
          product_type: 'jastip',
          trip_id: req.trip_id,
          price: req.quoted_price,
          image_url: req.reference_image_url,
          stock_status: 'in_stock',
          quota: 10,
          is_active: false // Hidden from public catalog
        }
      })
    }

    const qty = Math.max(1, Number(body?.qty) || 1)
    const unitPrice = Number(req.quoted_price)

    resolvedItems.push({
      productId: reqProduct.id,
      productName: req.product_name,
      variant: 'Custom Request',
      qty,
      priceAtOrder: unitPrice,
      subtotal: unitPrice * qty,
      productType: 'jastip',
      tripId: req.trip_id || null
    })

    if (req.status !== 'accepted') {
      await prisma.product_requests.update({
        where: { id: req.id },
        data: { status: 'accepted', updated_at: new Date() }
      })
    }
  } else {
    const now = new Date()

    for (const raw of rawItems) {
      const pid = Number(raw.productId)
      const qty = Math.max(1, Math.floor(Number(raw.qty) || 1))
      const variant = String(raw.variant || 'Standard').trim()

      if (!pid || isNaN(pid)) {
        throw createError({ statusCode: 400, message: 'ID produk tidak valid.' })
      }

      const product = await prisma.products.findUnique({
        where: { id: pid },
        include: { jastip_trips: true }
      })

      if (!product || !product.is_active || product.deleted_at) {
        throw createError({ statusCode: 404, message: `Produk tidak ditemukan atau sudah tidak aktif.` })
      }

      if (product.max_qty_per_order && qty > product.max_qty_per_order) {
        throw createError({
          statusCode: 400,
          message: `Maksimal pembelian untuk "${product.name}" adalah ${product.max_qty_per_order} pcs per pesanan.`
        })
      }

      const normVariants = normalizeProductVariants(
        product.variants,
        Number(product.price),
        product.product_type === 'ready' ? (product.stock_quantity ?? 0) : (product.quota ?? 0)
      )
      const matchedCombo = findVariantCombination(normVariants, variant)

      if (product.product_type === 'ready') {
        if (matchedCombo) {
          if (matchedCombo.stock < qty) {
            throw createError({
              statusCode: 400,
              message: `Stok variasi "${matchedCombo.label}" untuk produk "${product.name}" tidak mencukupi (tersedia: ${matchedCombo.stock} unit).`
            })
          }
        } else if (product.stock_status !== 'in_stock' || (product.stock_quantity !== null && product.stock_quantity < qty)) {
          throw createError({
            statusCode: 400,
            message: `Stok produk Ready Stock "${product.name}" tidak mencukupi (tersedia: ${product.stock_quantity ?? 0} unit).`
          })
        }
      } else {
        // Jastip product validation
        if (product.jastip_trips) {
          if (product.jastip_trips.status !== 'open' || new Date(product.jastip_trips.close_date) < now) {
            throw createError({
              statusCode: 400,
              message: `Jadwal Jastip "${product.jastip_trips.title}" untuk produk "${product.name}" sudah ditutup.`
            })
          }
        }
        if (matchedCombo) {
          if (matchedCombo.stock < qty) {
            throw createError({
              statusCode: 400,
              message: `Kuota variasi "${matchedCombo.label}" untuk produk "${product.name}" tidak mencukupi (tersedia: ${matchedCombo.stock} slot).`
            })
          }
        } else if (product.stock_status !== 'in_stock' || (product.quota !== null && product.quota < qty)) {
          throw createError({
            statusCode: 400,
            message: `Kuota titipan untuk produk "${product.name}" tidak mencukupi.`
          })
        }
      }

      const unitPrice = matchedCombo ? Number(matchedCombo.price) : Number(product.price)
      const resolvedVariantLabel = matchedCombo ? matchedCombo.label : variant

      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        variant: resolvedVariantLabel,
        variantKey: matchedCombo?.key || null,
        variantId: matchedCombo?.id || null,
        qty,
        priceAtOrder: unitPrice,
        subtotal: unitPrice * qty,
        productType: product.product_type,
        tripId: product.trip_id || null
      })
    }
  }

  // Group into separate orders:
  // 1) Ready stock items -> 1 order
  // 2) Jastip items -> 1 order per tripId
  const groups = new Map<string, { orderType: 'ready' | 'jastip'; tripId: number | null; items: ResolvedItem[] }>()

  for (const item of resolvedItems) {
    const key = item.productType === 'ready' ? 'ready' : `jastip:${item.tripId ?? 0}`
    const existing = groups.get(key)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.set(key, {
        orderType: item.productType,
        tripId: item.tripId,
        items: [item]
      })
    }
  }

  const createdOrders: any[] = []

  for (const group of groups.values()) {
    const orderCode = await generateOrderCode(group.orderType)
    const subtotal = group.items.reduce((acc, it) => acc + it.subtotal, 0)
    const totalAmount = subtotal

    // DP 50% hanya berlaku untuk order jastip
    const effectivePaymentType: 'full' | 'dp' =
      group.orderType === 'jastip' && requestedPaymentType === 'dp' ? 'dp' : 'full'
    const dpAmount = effectivePaymentType === 'dp' ? Math.ceil(totalAmount / 2) : null

    const created = await prisma.orders.create({
      data: {
        order_code: orderCode,
        user_id: session.userId,
        order_type: group.orderType,
        trip_id: group.tripId,
        subtotal,
        unique_code: 0,
        total_amount: totalAmount,
        payment_type: effectivePaymentType,
        dp_amount: dpAmount,
        paid_amount: 0,
        remaining_amount: totalAmount,
        order_status: 'pending_approval',
        fulfillment_method: fulfillmentMethod,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        shipping_address: shippingAddress,
        shipping_cost: 0,
        customer_note: customerNote,
        order_items: {
          create: group.items.map((it) => ({
            product_id: it.productId,
            product_name_snapshot: it.productName,
            variant_snapshot: it.variant,
            qty: it.qty,
            price_at_order: it.priceAtOrder,
            subtotal: it.subtotal
          }))
        },
        order_status_logs: {
          create: {
            from_status: null,
            to_status: 'pending_approval',
            changed_by: session.userId,
            note: 'Pesanan diajukan. Menunggu persetujuan admin.'
          }
        }
      },
      include: {
        users: { select: { id: true, username: true, phone_number: true } },
        jastip_trips: { select: { id: true, title: true, slug: true } },
        order_items: {
          include: {
            products: { select: { id: true, slug: true, image_url: true } }
          }
        },
        payments: true,
        order_status_logs: {
          include: { users: { select: { id: true, username: true } } }
        }
      }
    })

    // Reserve stock / quota on products (and per-variation inventory if applicable)
    for (const it of group.items) {
      if (it.variantId) {
        try {
          await prisma.$executeRaw`
            UPDATE order_items
            SET variant_id = ${it.variantId}
            WHERE order_id = ${created.id} AND product_id = ${it.productId} AND variant_snapshot = ${it.variant}
          `
        } catch {
          // Non-blocking
        }
      }

      const prod = await prisma.products.findUnique({ where: { id: it.productId } })
      if (!prod) continue

      const normVariants = normalizeProductVariants(
        prod.variants,
        Number(prod.price),
        prod.product_type === 'ready' ? (prod.stock_quantity ?? 0) : (prod.quota ?? 0)
      )

      if (normVariants && normVariants.combinations.length > 0) {
        const combo = findVariantCombination(normVariants, it.variantKey || it.variant)
        if (combo) {
          combo.stock = Math.max(0, combo.stock - it.qty)
        }
        const totalRemaining = normVariants.combinations.reduce((sum, c) => sum + Math.max(0, Number(c.stock) || 0), 0)
        const synced = await syncProductVariantsTable(prod.id, prod.product_type as 'ready' | 'jastip', normVariants)
        await prisma.products.update({
          where: { id: prod.id },
          data: {
            variants: synced as any,
            stock_quantity: prod.product_type === 'ready' ? totalRemaining : prod.stock_quantity,
            quota: prod.product_type === 'jastip' ? totalRemaining : prod.quota,
            stock_status: totalRemaining === 0 ? 'out_of_stock' : 'in_stock'
          }
        })
      } else if (prod.product_type === 'ready' && prod.stock_quantity !== null) {
        const nextStock = Math.max(0, prod.stock_quantity - it.qty)
        await prisma.products.update({
          where: { id: prod.id },
          data: {
            stock_quantity: nextStock,
            stock_status: nextStock === 0 ? 'out_of_stock' : prod.stock_status
          }
        })
      } else if (prod.product_type === 'jastip' && prod.quota !== null) {
        const nextQuota = Math.max(0, prod.quota - it.qty)
        await prisma.products.update({
          where: { id: prod.id },
          data: {
            quota: nextQuota,
            stock_status: nextQuota === 0 ? 'out_of_stock' : prod.stock_status
          }
        })
      }
    }

    // Create in-app notification for customer
    try {
      await prisma.notifications.create({
        data: {
          user_id: session.userId,
          type: 'order_created',
          title: `Pesanan #${orderCode} Diajukan`,
          body: 'Menunggu persetujuan admin.',
          link_url: `/orders/${orderCode}`
        }
      })
    } catch {
      // Non-blocking
    }

    createdOrders.push(await formatOrderResponse(created))
  }

  return {
    success: true,
    orders: createdOrders,
    primaryOrder: createdOrders[0]
  }
})

