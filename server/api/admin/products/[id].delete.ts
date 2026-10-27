import { defineEventHandler, getRouterParam, createError } from 'h3'
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

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Produk tidak ditemukan' })
  }

  // Soft delete: set is_active = false, deleted_at = new Date()
  await prisma.products.update({
    where: { id },
    data: {
      is_active: false,
      deleted_at: new Date()
    }
  })

  return {
    success: true,
    message: 'Produk berhasil dihapus (soft delete)'
  }
})
