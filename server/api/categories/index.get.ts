import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.categories.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: {
          products: {
            where: {
              is_active: true,
              deleted_at: null
            }
          }
        }
      }
    }
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products
  }))
})
