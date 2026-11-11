import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'
import { recordAuditLog } from '../../../../utils/audit'
import { normalizeProductVariants, syncProductVariantsTable } from '../../../../utils/variants'

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
    where: { id },
    include: {
      product_images: {
        orderBy: { sort_order: 'asc' }
      }
    }
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

  const normalizedVariants = normalizeProductVariants(
    source.variants,
    Number(source.price),
    targetType === 'ready' ? (newStockQty || 5) : (source.quota || 20)
  )

  let duplicated = await prisma.products.create({
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
      variants: normalizedVariants ? (normalizedVariants as any) : null,
      is_active: true
    }
  })

  if (normalizedVariants && normalizedVariants.combinations.length > 0) {
    const synced = await syncProductVariantsTable(duplicated.id, targetType, normalizedVariants)
    duplicated = await prisma.products.update({
      where: { id: duplicated.id },
      data: { variants: synced as any }
    })
  }

  if (source.product_images && source.product_images.length > 0) {
    await prisma.product_images.createMany({
      data: source.product_images.map((img, idx) => ({
        product_id: duplicated.id,
        image_url: img.image_url,
        sort_order: idx + 1
      }))
    })
  }

  await recordAuditLog(session, {
    action: 'DUPLICATE_PRODUCT',
    entityType: 'product',
    entityId: duplicated.id,
    detail: {
      sourceProductId: source.id,
      name: duplicated.name,
      productType: duplicated.product_type
    }
  })

  return {
    success: true,
    message: `Produk berhasil diduplikasi${targetType === 'ready' && source.product_type === 'jastip' ? ' ke Ready Stock' : ''}`,
    product: duplicated
  }
})
