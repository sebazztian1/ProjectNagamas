import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'
import { getCountryFlag } from '../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)

  if (!session) {
    return {
      success: true,
      authenticated: false,
      wishlistCount: 0,
      productIds: [],
      items: []
    }
  }

  const wishlists = await prisma.wishlists.findMany({
    where: {
      user_id: session.userId
    },
    include: {
      products: {
        include: {
          categories: true,
          product_images: {
            orderBy: { sort_order: 'asc' },
            take: 1
          },
          jastip_trips: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  const now = new Date()

  const items = wishlists.map(w => {
    const p = w.products
    const isReady = p.product_type === 'ready'
    const isJastip = p.product_type === 'jastip'
    const trip = p.jastip_trips

    let isAvailable = false
    let availabilityReason = ''

    if (isReady) {
      isAvailable = p.stock_status === 'in_stock' && p.is_active
      availabilityReason = isAvailable ? 'Ready Stock' : 'Stok Habis'
    } else if (isJastip && trip) {
      const isTripOpen = trip.status === 'open'
      const isBeforeClose = new Date(trip.close_date) > now
      isAvailable = isTripOpen && isBeforeClose && p.is_active
      if (!isTripOpen || !isBeforeClose) {
        availabilityReason = 'PO Telah Ditutup'
      } else {
        availabilityReason = `Open PO s/d ${new Date(trip.close_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
      }
    }

    const firstImage = p.product_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'

    return {
      wishlistId: w.id,
      productId: p.id,
      name: p.name,
      slug: p.slug,
      productType: p.product_type,
      category: p.categories?.name || 'Lainnya',
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      stockStatus: p.stock_status,
      image: firstImage,
      isAvailable,
      availabilityReason,
      trip: trip ? {
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        country: trip.country,
        flag: getCountryFlag(trip.country),
        status: trip.status,
        closeDate: trip.close_date.toISOString().split('T')[0]
      } : null,
      addedAt: w.created_at.toISOString()
    }
  })

  return {
    success: true,
    authenticated: true,
    wishlistCount: items.length,
    productIds: items.map(i => i.productId),
    items
  }
})
