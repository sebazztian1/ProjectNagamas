import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { getCountryFlag } from '../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const statusFilter = (query.status as string) || 'all'

  const where: any = {}
  const now = new Date()

  // Auto-close open trips whose close_date has passed
  try {
    await prisma.jastip_trips.updateMany({
      where: {
        status: 'open',
        close_date: {
          lt: now
        }
      },
      data: {
        status: 'closed'
      }
    })
  } catch (err) {
    console.error('Error auto-closing past trips:', err)
  }

  if (statusFilter === 'open') {
    where.status = 'open'
  } else if (statusFilter === 'closed') {
    where.status = {
      in: ['closed', 'purchasing', 'arrived', 'completed']
    }
  } else if (statusFilter !== 'all') {
    where.status = statusFilter
  }

  const trips = await prisma.jastip_trips.findMany({
    where,
    include: {
      products: {
        where: { is_active: true },
        select: { id: true }
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
    },
    orderBy: [
      { status: 'asc' },
      { close_date: 'asc' }
    ]
  })

  return trips.map(t => {
    // Calculate total quota filled from verified/active orders
    const quotaFilled = t.orders.reduce((acc, ord) => {
      const itemsQty = ord.order_items.reduce((sum, item) => sum + item.qty, 0)
      return acc + itemsQty
    }, 0)

    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      country: t.country,
      flag: getCountryFlag(t.country),
      cityOrArea: t.city_or_area || '',
      description: t.description || '',
      terms: t.terms || '',
      coverImageUrl: t.cover_image_url || null,
      currency: t.currency,
      exchangeRate: Number(t.exchange_rate),
      feeType: t.fee_type,
      feeValue: Number(t.fee_value),
      openDate: t.open_date.toISOString(),
      closeDate: t.close_date.toISOString(),
      departureDate: t.departure_date ? t.departure_date.toISOString() : null,
      estimatedArrivalDate: t.estimated_arrival_date ? t.estimated_arrival_date.toISOString() : null,
      quotaTotal: t.quota_total || 50,
      quotaFilled: quotaFilled,
      quotaRemaining: Math.max(0, (t.quota_total || 50) - quotaFilled),
      status: t.status,
      productsCount: t.products.length,
      createdAt: t.created_at.toISOString()
    }
  })
})
