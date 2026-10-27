import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'

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
  const { stockStatus, stockQuantity } = body

  const updateData: any = {
    updated_at: new Date()
  }

  if (stockStatus === 'in_stock' || stockStatus === 'out_of_stock') {
    updateData.stock_status = stockStatus
  } else {
    // Toggle current status if not provided
    updateData.stock_status = existing.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock'
  }

  if (stockQuantity !== undefined && !isNaN(Number(stockQuantity))) {
    updateData.stock_quantity = Math.max(0, Number(stockQuantity))
  }

  const updated = await prisma.products.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    message: `Status stok diubah menjadi ${updated.stock_status === 'in_stock' ? 'Tersedia' : 'Habis'}`,
    product: {
      id: updated.id,
      stockStatus: updated.stock_status,
      stockQuantity: updated.stock_quantity
    }
  }
})
