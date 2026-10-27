import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getCountryFlag } from '../../../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const idStr = event.context.params?.id
  const id = Number(idStr)
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID trip tidak valid' })
  }

  const trip = await prisma.jastip_trips.findUnique({
    where: { id },
    include: {
      products: {
        where: { is_active: true },
        include: {
          categories: true,
          product_images: {
            orderBy: { sort_order: 'asc' },
            take: 1
          }
        }
      },
      orders: {
        where: {
          order_status: {
            notIn: ['rejected', 'cancelled', 'expired']
          }
        },
        include: {
          users: {
            select: { id: true, username: true, phone_number: true }
          },
          order_items: {
            include: {
              products: true
            }
          },
          payments: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        },
        orderBy: { created_at: 'desc' }
      }
    }
  })

  if (!trip) {
    throw createError({ statusCode: 404, message: 'Jadwal trip tidak ditemukan' })
  }

  // Aggregate Shopping List from orders
  const shoppingMap = new Map<string, {
    key: string
    productId: number
    name: string
    variant: string
    store: string
    originalPrice: number
    currency: string
    totalQty: number
    image: string
  }>()

  for (const ord of trip.orders) {
    for (const item of ord.order_items) {
      const key = `${item.product_id}_${item.variant_snapshot || ''}`
      const existing = shoppingMap.get(key)
      const origPrice = item.products?.original_price ? Number(item.products.original_price) : 0
      const store = item.products?.source_store || trip.city_or_area || 'Toko Resmi'

      if (existing) {
        existing.totalQty += item.qty
      } else {
        shoppingMap.set(key, {
          key,
          productId: item.product_id,
          name: item.product_name_snapshot,
          variant: item.variant_snapshot || '-',
          store,
          originalPrice: origPrice,
          currency: item.products?.original_currency || trip.currency,
          totalQty: item.qty,
          image: item.products?.images ? (item.products as any).images[0] : ''
        })
      }
    }
  }

  const shoppingList = Array.from(shoppingMap.values())

  const flag = getCountryFlag(trip.country)

  return {
    trip: {
      id: trip.id,
      title: trip.title,
      slug: trip.slug,
      country: trip.country,
      flag,
      cityOrArea: trip.city_or_area || '',
      description: trip.description || '',
      terms: trip.terms || '',
      coverImageUrl: trip.cover_image_url || '',
      currency: trip.currency,
      exchangeRate: Number(trip.exchange_rate),
      feeType: trip.fee_type,
      feeValue: Number(trip.fee_value),
      openDate: trip.open_date.toISOString().split('T')[0],
      closeDate: trip.close_date.toISOString().split('T')[0],
      departureDate: trip.departure_date ? trip.departure_date.toISOString().split('T')[0] : null,
      estimatedArrivalDate: trip.estimated_arrival_date ? trip.estimated_arrival_date.toISOString().split('T')[0] : null,
      quotaTotal: trip.quota_total || 50,
      status: trip.status
    },
    shoppingList,
    orders: trip.orders.map(o => ({
      id: o.id,
      orderCode: o.order_code,
      customerName: o.users?.username || o.recipient_name || 'Customer',
      customerPhone: o.users?.phone_number || o.recipient_phone || '-',
      status: o.order_status,
      paymentStatus: o.payments[0]?.status || 'pending',
      paymentType: o.payment_type,
      totalAmount: Number(o.total_amount),
      paidAmount: Number(o.paid_amount),
      remainingAmount: Number(o.remaining_amount),
      itemsCount: o.order_items.reduce((sum, it) => sum + it.qty, 0),
      createdAt: o.created_at.toISOString()
    })),
    products: trip.products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryName: p.categories?.name || 'Lainnya',
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      sourceStore: p.source_store || '',
      stockStatus: p.stock_status,
      quota: p.quota,
      image: p.product_images[0]?.image_url || ''
    }))
  }
})
