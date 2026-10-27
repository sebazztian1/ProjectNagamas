import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getCountryFlag } from '../../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || !body.country || !body.closeDate || !body.estimatedArrivalDate) {
    throw createError({
      statusCode: 400,
      message: 'Judul trip, negara, tanggal tutup PO, dan estimasi tiba wajib diisi.'
    })
  }

  // Get admin user
  const adminUser = await prisma.users.findFirst({
    where: { role: { in: ['admin', 'staff'] } }
  })
  const createdBy = adminUser ? adminUser.id : 1

  // Generate slug
  let baseSlug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  let finalSlug = baseSlug
  let count = 1
  while (await prisma.jastip_trips.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${count}`
    count++
  }

  const openDate = body.openDate ? new Date(body.openDate) : new Date()
  const closeDate = new Date(body.closeDate)
  const departureDate = body.departureDate ? new Date(body.departureDate) : null
  const estimatedArrivalDate = new Date(body.estimatedArrivalDate)

  const trip = await prisma.jastip_trips.create({
    data: {
      title: body.title.trim(),
      slug: finalSlug,
      country: body.country.trim(),
      city_or_area: body.cityOrArea ? body.cityOrArea.trim() : null,
      description: body.description ? body.description.trim() : null,
      terms: body.terms ? body.terms.trim() : 'Pesanan PO jastip yang sudah diverifikasi tidak dapat dibatalkan secara sepihak. Pengembalian dana 100% jika barang kosong di toko luar negeri.',
      cover_image_url: body.coverImageUrl ? body.coverImageUrl.trim() : null,
      currency: (body.currency || 'USD').toUpperCase().slice(0, 3),
      exchange_rate: Number(body.exchangeRate || 16000),
      fee_type: body.feeType === 'percent' ? 'percent' : 'flat',
      fee_value: Number(body.feeValue || 30000),
      open_date: openDate,
      close_date: closeDate,
      departure_date: departureDate,
      estimated_arrival_date: estimatedArrivalDate,
      quota_total: body.quotaTotal ? Number(body.quotaTotal) : 50,
      status: body.status || 'open',
      created_by: createdBy
    }
  })

  return {
    success: true,
    message: 'Jadwal trip jastip berhasil dibuat.',
    trip: {
      id: trip.id,
      title: trip.title,
      slug: trip.slug,
      country: trip.country,
      flag: getCountryFlag(trip.country)
    }
  }
})
