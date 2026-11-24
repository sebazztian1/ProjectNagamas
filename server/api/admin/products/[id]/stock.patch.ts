import { defineEventHandler, getRouterParam, readBody, createError, setResponseHeader } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'
import { recordAuditLog } from '../../../../utils/audit'
import { normalizeProductVariants, syncProductVariantsTable } from '../../../../utils/variants'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

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

  const body = (await readBody(event).catch(() => ({}))) || {}
  const { stockStatus, stockQuantity } = body

  const nextStatus: 'in_stock' | 'out_of_stock' =
    stockStatus === 'in_stock' || stockStatus === 'out_of_stock'
      ? stockStatus
      : existing.stock_status === 'in_stock'
        ? 'out_of_stock'
        : 'in_stock'

  const updateData: any = {
    updated_at: new Date(),
    stock_status: nextStatus
  }

  if (stockQuantity !== undefined && !isNaN(Number(stockQuantity))) {
    updateData.stock_quantity = Math.max(0, Number(stockQuantity))
  }

  if (nextStatus === 'in_stock') {
    const fallbackQty = existing.product_type === 'ready' ? (existing.stock_quantity ?? 0) : (existing.quota ?? 0)
    const normalized = normalizeProductVariants(existing.variants, Number(existing.price), fallbackQty)

    if (normalized && normalized.combinations.length > 0) {
      const allEmpty = normalized.combinations.every((c) => c.stock <= 0)
      if (allEmpty) {
        normalized.combinations.forEach((c) => {
          c.stock = 1
        })
        const synced = await syncProductVariantsTable(id, existing.product_type, normalized)
        if (synced) {
          updateData.variants = synced as any
          if (existing.product_type === 'ready') {
            updateData.stock_quantity = synced.combinations.length
          } else {
            updateData.quota = synced.combinations.length
          }
        }
      }
    } else if (existing.product_type === 'ready') {
      if (stockQuantity === undefined && existing.stock_quantity !== null && existing.stock_quantity <= 0) {
        updateData.stock_quantity = 1
      }
    } else if (existing.quota !== null && existing.quota <= 0) {
      updateData.quota = 1
    }
  }

  const updated = await prisma.products.update({
    where: { id },
    data: updateData
  })

  await recordAuditLog(session, {
    action: 'UPDATE_STOCK',
    entityType: 'product',
    entityId: updated.id,
    detail: {
      name: updated.name,
      previous: { stockStatus: existing.stock_status, stockQuantity: existing.stock_quantity },
      current: { stockStatus: updated.stock_status, stockQuantity: updated.stock_quantity },
      stockStatus: updated.stock_status,
      stockQuantity: updated.stock_quantity
    }
  })

  return {
    success: true,
    message: `Status stok diubah menjadi ${updated.stock_status === 'in_stock' ? 'Tersedia' : 'Habis'}`,
    product: {
      id: updated.id,
      stockStatus: updated.stock_status,
      stockQuantity: updated.stock_quantity ?? 0,
      quota: updated.quota ?? 0,
      variants: normalizeProductVariants(
        updated.variants,
        Number(updated.price),
        updated.product_type === 'ready' ? (updated.stock_quantity ?? 0) : (updated.quota ?? 0)
      )
    }
  }
})
