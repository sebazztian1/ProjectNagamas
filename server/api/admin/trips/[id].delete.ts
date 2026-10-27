import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const idStr = event.context.params?.id
  const id = Number(idStr)
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID trip tidak valid' })
  }

  const existing = await prisma.jastip_trips.findUnique({
    where: { id },
    include: {
      orders: { select: { id: true } },
      products: { select: { id: true } }
    }
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Jadwal trip tidak ditemukan' })
  }

  if (existing.orders.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Tidak dapat menghapus trip ini karena sudah terdapat ${existing.orders.length} pesanan customer terkait. Silakan ubah status menjadi "cancelled" atau "closed".`
    })
  }

  // If products are linked to this trip, unlink or delete them
  if (existing.products.length > 0) {
    await prisma.products.updateMany({
      where: { trip_id: id },
      data: { trip_id: null }
    })
  }

  await prisma.jastip_trips.delete({ where: { id } })

  return {
    success: true,
    message: 'Jadwal trip berhasil dihapus.'
  }
})
