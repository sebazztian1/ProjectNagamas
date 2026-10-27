import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Silakan masuk ke akun Anda.'
    })
  }

  const body = await readBody(event)
  const productIds = Array.isArray(body?.productIds) ? body.productIds.map(Number).filter((id: number) => !isNaN(id) && id > 0) : []

  if (productIds.length > 0) {
    // Find valid existing active products
    const validProducts = await prisma.products.findMany({
      where: {
        id: { in: productIds },
        is_active: true
      },
      select: { id: true }
    })

    const validIds = validProducts.map(p => p.id)

    // Existing wishlist for this user
    const existing = await prisma.wishlists.findMany({
      where: { user_id: session.userId },
      select: { product_id: true }
    })
    const existingSet = new Set(existing.map(e => e.product_id))

    // Prepare inserts for new ones
    const toInsert = validIds
      .filter(id => !existingSet.has(id))
      .map(id => ({
        user_id: session.userId,
        product_id: id
      }))

    if (toInsert.length > 0) {
      await prisma.wishlists.createMany({
        data: toInsert,
        skipDuplicates: true
      })
    }
  }

  const allUserWishlists = await prisma.wishlists.findMany({
    where: { user_id: session.userId },
    select: { product_id: true }
  })

  const mergedIds = allUserWishlists.map(w => w.product_id)

  return {
    success: true,
    message: 'Wishlist berhasil disinkronkan.',
    wishlistCount: mergedIds.length,
    productIds: mergedIds
  }
})
