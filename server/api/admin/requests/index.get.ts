import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { getCountryFlag } from '../../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Halaman khusus admin.' })
  }

  const query = getQuery(event)
  const statusFilter = (query.status as string) || 'all'
  const search = ((query.search as string) || '').trim()

  const whereClause: any = {}

  if (statusFilter !== 'all' && ['pending', 'reviewed', 'quoted', 'accepted', 'available', 'rejected'].includes(statusFilter)) {
    whereClause.status = statusFilter
  }

  if (search) {
    whereClause.OR = [
      { product_name: { contains: search } },
      { description: { contains: search } },
      { users: { username: { contains: search } } },
      { users: { phone_number: { contains: search } } }
    ]
  }

  const requests = await prisma.product_requests.findMany({
    where: whereClause,
    include: {
      users: {
        select: {
          id: true,
          username: true,
          phone_number: true
        }
      },
      jastip_trips: {
        select: {
          id: true,
          title: true,
          slug: true,
          country: true,
          status: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return requests.map(r => {
    const trip = r.jastip_trips
    return {
      id: r.id,
      productName: r.product_name,
      description: r.description || '',
      referenceImageUrl: r.reference_image_url || '',
      referenceLink: r.reference_link || '',
      userId: r.user_id,
      userName: r.users?.username || 'Customer',
      customerPhone: r.users?.phone_number || '',
      tripId: r.trip_id,
      tripTitle: trip?.title || 'Bebas / Belum Ditentukan',
      targetCountry: trip?.country || 'Internasional',
      flag: trip?.country ? getCountryFlag(trip.country) : '🌐',
      tripStatus: trip?.status || null,
      status: r.status,
      quotedPrice: r.quoted_price ? Number(r.quoted_price) : null,
      quoteNote: r.quote_note || '',
      quoteExpiresAt: r.quote_expires_at ? r.quote_expires_at.toISOString().split('T')[0] : null,
      adminNote: r.admin_note || '',
      createdAt: r.created_at.toISOString()
    }
  })
})
