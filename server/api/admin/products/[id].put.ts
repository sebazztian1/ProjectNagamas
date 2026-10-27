import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID produk tidak valid' })
  }

  const existing = await prisma.products.findUnique({
    where: { id }
  })

  if (!existing || existing.deleted_at) {
    throw createError({ statusCode: 404, message: 'Produk tidak ditemukan' })
  }

  const body = await readBody(event)
  const {
    name,
    description,
    categoryId,
    productType,
    tripId,
    price,
    originalPrice,
    originalCurrency,
    sourceStore,
    imageUrl,
    stockStatus,
    stockQuantity,
    quota,
    maxQtyPerOrder,
    variants,
    isActive
  } = body

  const updateData: any = {
    updated_at: new Date()
  }

  if (name && typeof name === 'string') updateData.name = name.trim()
  if (description !== undefined) updateData.description = description?.trim() || null
  if (categoryId) updateData.category_id = Number(categoryId)
  if (productType === 'ready' || productType === 'jastip') {
    updateData.product_type = productType
    if (productType === 'jastip') {
      updateData.trip_id = tripId ? Number(tripId) : null
    } else {
      updateData.trip_id = null
    }
  }
  if (price !== undefined && !isNaN(Number(price))) updateData.price = Number(price)
  if (originalPrice !== undefined) updateData.original_price = originalPrice ? Number(originalPrice) : null
  if (originalCurrency !== undefined) updateData.original_currency = originalCurrency || null
  if (sourceStore !== undefined) updateData.source_store = sourceStore?.trim() || null
  if (imageUrl !== undefined) updateData.image_url = imageUrl?.trim() || null
  if (stockStatus) updateData.stock_status = stockStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock'
  if (stockQuantity !== undefined) updateData.stock_quantity = Number(stockQuantity) || 0
  if (quota !== undefined) updateData.quota = quota ? Number(quota) : null
  if (maxQtyPerOrder !== undefined) updateData.max_qty_per_order = Number(maxQtyPerOrder) || 5
  if (variants !== undefined) updateData.variants = variants
  if (typeof isActive === 'boolean') updateData.is_active = isActive

  const updated = await prisma.products.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    message: 'Produk berhasil diperbarui',
    product: updated
  }
})
