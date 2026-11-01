import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const categories = await prisma.categories.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: {
          products: {
            where: {
              deleted_at: null
            }
          }
        }
      }
    }
  })

  return categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products
  }))
})

