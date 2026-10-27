import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getCountryFlag } from '../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug trip diperlukan' })
  }

  const trip = await prisma.jastip_trips.findUnique({
    where: { slug },
    include: {
      products: {
        where: { is_active: true },
        include: {
          categories: true,
          product_images: {
            orderBy: { sort_order: 'asc' }
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
          order_items: {
            select: { qty: true }
          }
        }
      }
    }
  })

  if (!trip) {
    throw createError({ statusCode: 404, message: 'Jadwal trip jastip tidak ditemukan' })
  }

  const quotaFilled = trip.orders.reduce((acc, ord) => {
    return acc + ord.order_items.reduce((sum, item) => sum + item.qty, 0)
  }, 0)

  const flag = getCountryFlag(trip.country)

  const products = trip.products.map(p => {
    const primaryImg = p.product_images[0]
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.categories?.name || 'Lainnya',
      categorySlug: p.categories?.slug || 'lainnya',
      productType: p.product_type,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      originalCurrency: p.original_currency || trip.currency,
      sourceStore: p.source_store || '',
      image: primaryImg?.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      stockStatus: p.stock_status,
      quota: p.quota,
      maxQtyPerOrder: p.max_qty_per_order || 5,
      variants: p.variants,
      description: p.description || ''
    }
  })

  return {
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    country: trip.country,
    flag,
    cityOrArea: trip.city_or_area || '',
    description: trip.description || '',
    terms: trip.terms || '',
    coverImageUrl: trip.cover_image_url || null,
    currency: trip.currency,
    exchangeRate: Number(trip.exchange_rate),
    feeType: trip.fee_type,
    feeValue: Number(trip.fee_value),
    openDate: trip.open_date.toISOString(),
    closeDate: trip.close_date.toISOString(),
    departureDate: trip.departure_date ? trip.departure_date.toISOString() : null,
    estimatedArrivalDate: trip.estimated_arrival_date ? trip.estimated_arrival_date.toISOString() : null,
    quotaTotal: trip.quota_total || 50,
    quotaFilled: quotaFilled,
    quotaRemaining: Math.max(0, (trip.quota_total || 50) - quotaFilled),
    status: trip.status,
    products
  }
})
