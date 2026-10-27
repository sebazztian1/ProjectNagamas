import { defineEventHandler } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getCountryFlag } from '../../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const trips = await prisma.jastip_trips.findMany({
    include: {
      products: {
        where: { is_active: true },
        select: { id: true, name: true, price: true }
      },
      orders: {
        where: {
          order_status: {
            notIn: ['rejected', 'cancelled', 'expired']
          }
        },
        include: {
          order_items: true,
          users: {
            select: { id: true, username: true, phone_number: true }
          }
        }
      }
    },
    orderBy: [
      { created_at: 'desc' }
    ]
  })

  return trips.map(t => {
    const quotaFilled = t.orders.reduce((acc, ord) => {
      return acc + ord.order_items.reduce((sum, item) => sum + item.qty, 0)
    }, 0)

    const totalOrdersAmount = t.orders.reduce((acc, ord) => acc + Number(ord.total_amount), 0)

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
      openDate: t.open_date.toISOString().split('T')[0],
      closeDate: t.close_date.toISOString().split('T')[0],
      departureDate: t.departure_date ? t.departure_date.toISOString().split('T')[0] : null,
      estimatedArrivalDate: t.estimated_arrival_date ? t.estimated_arrival_date.toISOString().split('T')[0] : null,
      quotaTotal: t.quota_total || 50,
      quotaFilled: quotaFilled,
      quotaRemaining: Math.max(0, (t.quota_total || 50) - quotaFilled),
      status: t.status,
      productsCount: t.products.length,
      ordersCount: t.orders.length,
      totalOrdersAmount,
      createdAt: t.created_at.toISOString()
    }
  })
})
