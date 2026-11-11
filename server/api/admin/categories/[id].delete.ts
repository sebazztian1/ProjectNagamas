import { defineEventHandler, getRouterParam, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { recordAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID kategori tidak valid' })
  }

  const existing = await prisma.categories.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: {
            where: { deleted_at: null }
          }
        }
      }
    }
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Kategori tidak ditemukan' })
  }

  if (existing._count.products > 0) {
    throw createError({
      statusCode: 400,
      message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${existing._count.products} produk aktif.`
    })
  }

  await prisma.categories.delete({ where: { id } })

  await recordAuditLog(session, {
    action: 'DELETE_CATEGORY',
    entityType: 'category',
    entityId: id,
    detail: {
      name: existing.name,
      slug: existing.slug
    }
  })

  return {
    success: true,
    message: 'Kategori berhasil dihapus'
  }
})

