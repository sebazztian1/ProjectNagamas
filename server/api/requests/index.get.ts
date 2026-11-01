import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'
import { getCountryFlag } from '../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda untuk melihat riwayat request.' })
  }

  const requests = await prisma.product_requests.findMany({
    where: {
      user_id: session.userId
    },
    include: {
      jastip_trips: {
        select: {
          id: true,
          title: true,
          slug: true,
          country: true,
          status: true,
          close_date: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  const now = new Date()

  return requests.map(r => {
    const trip = r.jastip_trips
    const isExpired = r.quote_expires_at ? new Date(r.quote_expires_at) < now : false

    return {
      id: r.id,
      productName: r.product_name,
      description: r.description || '',
      referenceImageUrl: r.reference_image_url || '',
      referenceLink: r.reference_link || '',
      tripId: r.trip_id,
      tripTitle: trip?.title || 'Bebas / Belum Ditentukan',
      targetCountry: trip?.country || 'Internasional',
      flag: trip?.country ? getCountryFlag(trip.country) : '🌐',
      tripSlug: trip?.slug || '',
      status: r.status,
      quotedPrice: r.quoted_price ? Number(r.quoted_price) : null,
      quoteNote: r.quote_note || '',
      quoteExpiresAt: r.quote_expires_at ? r.quote_expires_at.toISOString() : null,
      adminNote: r.admin_note || '',
      isExpired,
      createdAt: r.created_at.toISOString()
    }
  })
})
