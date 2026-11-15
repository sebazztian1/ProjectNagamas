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
    where: { id }
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Kategori tidak ditemukan' })
  }

  // 1. Cek produk aktif
  const activeProductsCount = await prisma.products.count({
    where: {
      category_id: id,
      deleted_at: null
    }
  })

  if (activeProductsCount > 0) {
    throw createError({
      statusCode: 400,
      message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${activeProductsCount} produk aktif.`
    })
  }

  // 2. Cek apakah ada produk (misal yang soft-deleted) yang masih mereferensikan kategori ini
  const remainingProductsCount = await prisma.products.count({
    where: { category_id: id }
  })

  if (remainingProductsCount > 0) {
    // Cari kategori cadangan (fallback) untuk menampung referensi produk soft-deleted
    let fallbackCategory = await prisma.categories.findFirst({
      where: {
        id: { not: id },
        slug: 'lainnya'
      }
    })

    if (!fallbackCategory) {
      fallbackCategory = await prisma.categories.findFirst({
        where: {
          id: { not: id },
          name: { contains: 'Lainnya' }
        }
      })
    }

    if (!fallbackCategory) {
      fallbackCategory = await prisma.categories.findFirst({
        where: {
          id: { not: id }
        }
      })
    }

    if (!fallbackCategory) {
      fallbackCategory = await prisma.categories.create({
        data: {
          name: 'Lainnya',
          slug: 'lainnya'
        }
      })
    }

    // Pindahkan referensi produk ke fallbackCategory lalu hapus kategori dalam transaksi
    await prisma.$transaction([
      prisma.products.updateMany({
        where: { category_id: id },
        data: { category_id: fallbackCategory.id }
      }),
      prisma.categories.delete({
        where: { id }
      })
    ])
  } else {
    await prisma.categories.delete({ where: { id } })
  }

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
