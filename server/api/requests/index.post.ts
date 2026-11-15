import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent, clearSessionCookie } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda untuk mengajukan request titip barang.' })
  }

  const customer = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, is_active: true, can_request: true, restriction_reason: true }
  })

  if (!customer || !customer.is_active) {
    clearSessionCookie(event)
    throw createError({ statusCode: 403, message: 'Akun Anda telah dinonaktifkan.' })
  }

  if (!customer.can_request) {
    const reasonText = customer.restriction_reason ? ` Alasan: ${customer.restriction_reason}` : ''
    throw createError({
      statusCode: 403,
      message: `Fitur request produk pada akun Anda sedang dinonaktifkan oleh admin.${reasonText}`
    })
  }

  const body = await readBody(event)
  const productName = body?.productName?.trim()

  if (!productName) {
    throw createError({ statusCode: 400, message: 'Nama produk / barang wajib diisi.' })
  }

  let tripId: number | null = null
  if (body.tripId && !isNaN(Number(body.tripId))) {
    const trip = await prisma.jastip_trips.findUnique({
      where: { id: Number(body.tripId) }
    })
    if (trip) {
      tripId = trip.id
    }
  }

  const created = await prisma.product_requests.create({
    data: {
      user_id: session.userId,
      product_name: productName,
      description: body.description?.trim() || null,
      reference_image_url: body.referenceImageUrl?.trim() || null,
      reference_link: body.referenceLink?.trim() || null,
      trip_id: tripId,
      status: 'pending'
    },
    include: {
      jastip_trips: {
        select: {
          id: true,
          title: true,
          slug: true,
          country: true
        }
      }
    }
  })

  return {
    success: true,
    message: 'Request titip barang berhasil diajukan! Admin akan memeriksa ketersediaan produk dan mengirimkan penawaran harga.',
    data: {
      id: created.id,
      productName: created.product_name,
      status: created.status,
      createdAt: created.created_at.toISOString()
    }
  }
})
