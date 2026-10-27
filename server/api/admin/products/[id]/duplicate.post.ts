import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 180)
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID produk tidak valid' })
  }

  const source = await prisma.products.findUnique({
    where: { id }
  })

  if (!source || source.deleted_at) {
    throw createError({ statusCode: 404, message: 'Produk sumber tidak ditemukan' })
  }

  const body = (await readBody(event).catch(() => ({}))) || {}
  const targetType = body.targetType || source.product_type
  const targetTripId = targetType === 'jastip' ? (body.targetTripId ? Number(body.targetTripId) : source.trip_id) : null
  const newStockQty = body.stockQuantity !== undefined ? Number(body.stockQuantity) : source.stock_quantity

  // Generate unique slug
  let baseSlug = generateSlug(`${source.name} copy`)
  let uniqueSlug = baseSlug
  let counter = 1
  while (await prisma.products.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  const duplicated = await prisma.products.create({
    data: {
      name: `${source.name} (Salinan)`,
      slug: uniqueSlug,
      description: source.description,
      category_id: source.category_id,
      product_type: targetType,
      trip_id: targetTripId,
      price: source.price,
      original_price: source.original_price,
      original_currency: source.original_currency,
      source_store: source.source_store,
      image_url: source.image_url,
      stock_status: 'in_stock',
      stock_quantity: targetType === 'ready' ? (newStockQty || 5) : null,
      quota: targetType === 'jastip' ? (source.quota || 20) : null,
      max_qty_per_order: source.max_qty_per_order,
      variants: source.variants ? JSON.parse(JSON.stringify(source.variants)) : null,
      is_active: true
    }
  })

  return {
    success: true,
    message: `Produk berhasil diduplikasi${targetType === 'ready' && source.product_type === 'jastip' ? ' ke Ready Stock' : ''}`,
    product: duplicated
  }
})
