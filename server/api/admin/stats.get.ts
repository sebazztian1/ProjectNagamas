import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'
import { getCountryFlag } from '../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const now = new Date()

  // Auto-close past trips
  try {
    await prisma.jastip_trips.updateMany({
      where: {
        status: 'open',
        close_date: { lt: now }
      },
      data: { status: 'closed' }
    })
  } catch (err) {
    // Non-blocking
  }

  const [openTrips, pendingOrdersCount, pendingRequestsCount, allOrders] = await Promise.all([
    prisma.jastip_trips.findMany({
      where: { status: 'open' },
      select: {
        id: true,
        title: true,
        slug: true,
        country: true,
        close_date: true,
        estimated_arrival_date: true,
        quota_total: true,
        orders: {
          select: {
            order_items: { select: { qty: true } }
          }
        }
      },
      orderBy: { close_date: 'asc' }
    }),
    prisma.orders.count({
      where: {
        order_status: { in: ['pending_approval', 'pending_payment', 'payment_uploaded'] }
      }
    }),
    prisma.product_requests.count({
      where: { status: 'pending' }
    }),
    prisma.orders.findMany({
      where: {
        order_status: { notIn: ['rejected', 'cancelled', 'expired'] }
      },
      select: {
        paid_amount: true,
        total_amount: true,
        order_items: { select: { qty: true } }
      }
    })
  ])

  const totalOmzet = allOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
  const totalItemsSold = allOrders.reduce((sum, o) => sum + o.order_items.reduce((s, it) => s + it.qty, 0), 0)

  const mappedOpenTrips = openTrips.map(t => {
    const quotaFilled = t.orders.reduce((sum, ord) => sum + ord.order_items.reduce((s, it) => s + it.qty, 0), 0)
    return {
      id: t.id,
      title: t.title,
      slug: t.slug,
      country: t.country,
      flag: getCountryFlag(t.country),
      closeDate: t.close_date.toISOString().split('T')[0],
      estimatedArrivalDate: t.estimated_arrival_date ? t.estimated_arrival_date.toISOString().split('T')[0] : null,
      quotaTotal: t.quota_total || 50,
      quotaFilled
    }
  })

  return {
    openTripsCount: mappedOpenTrips.length,
    openTrips: mappedOpenTrips,
    pendingOrdersCount,
    pendingRequestsCount,
    totalOmzet,
    totalItemsSold
  }
})
