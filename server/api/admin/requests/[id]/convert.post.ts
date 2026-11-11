import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'
import { recordAuditLog } from '../../../../utils/audit'

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base}-${Date.now().toString(36)}`
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Halaman khusus admin.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID Request tidak valid.' })
  }

  const req = await prisma.product_requests.findUnique({
    where: { id },
    include: { users: true, jastip_trips: true }
  })

  if (!req) {
    throw createError({ statusCode: 404, message: 'Data request tidak ditemukan.' })
  }

  const body = await readBody(event)
  const tripId = Number(body?.tripId || req.trip_id)
  const categoryId = Number(body?.categoryId)
  const price = Number(body?.price || req.quoted_price || 0)
  const productName = (body?.productName || req.product_name).trim()
  const description = body?.description || req.description || ''

  if (!tripId || isNaN(tripId)) {
    throw createError({ statusCode: 400, message: 'Trip tujuan wajib dipilih.' })
  }
  if (!categoryId || isNaN(categoryId)) {
    throw createError({ statusCode: 400, message: 'Kategori produk wajib dipilih.' })
  }
  if (!price || price <= 0) {
    throw createError({ statusCode: 400, message: 'Harga produk harus lebih dari 0.' })
  }

  const trip = await prisma.jastip_trips.findUnique({
    where: { id: tripId }
  })
  if (!trip) {
    throw createError({ statusCode: 404, message: 'Trip yang dipilih tidak ditemukan.' })
  }

  const category = await prisma.categories.findUnique({
    where: { id: categoryId }
  })
  if (!category) {
    throw createError({ statusCode: 404, message: 'Kategori tidak ditemukan.' })
  }

  const slug = generateSlug(productName)

  // Create product
  const product = await prisma.products.create({
    data: {
      name: productName,
      slug,
      description,
      category_id: categoryId,
      product_type: 'jastip',
      trip_id: tripId,
      price,
      image_url: req.reference_image_url || null,
      stock_status: 'in_stock',
      is_active: true
    }
  })

  // Add primary image if image exists
  if (req.reference_image_url) {
    await prisma.product_images.create({
      data: {
        product_id: product.id,
        image_url: req.reference_image_url,
        sort_order: 1
      }
    })
  }

  // Update request status to 'available'
  await prisma.product_requests.update({
    where: { id },
    data: {
      trip_id: tripId,
      status: 'available',
      admin_note: `Dikonversi menjadi produk trip "${trip.title}" (ID Produk: ${product.id}).`
    }
  })

  // Send notification to customer
  await prisma.notifications.create({
    data: {
      user_id: req.user_id,
      type: 'request',
      title: 'Barang Request Anda Sudah Tersedia!',
      body: `Produk "${productName}" telah dimasukkan ke dalam katalog trip ${trip.title} dan siap Anda pesan!`,
      link_url: `/jastip/${trip.slug}/${product.slug}`
    }
  })

  await recordAuditLog(session, {
    action: 'CONVERT_REQUEST_TO_PRODUCT',
    entityType: 'request',
    entityId: id,
    detail: {
      productName,
      productId: product.id,
      tripId: trip.id,
      tripTitle: trip.title
    }
  })

  return {
    success: true,
    message: `Request berhasil dijadikan produk resmi di trip "${trip.title}"!`,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      tripSlug: trip.slug
    }
  }
})
