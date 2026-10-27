import { defineEventHandler, createError } from 'h3'
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

  const productId = Number(event.context.params?.productId)

  if (!productId || isNaN(productId)) {
    throw createError({
      statusCode: 400,
      message: 'ID Produk tidak valid.'
    })
  }

  // Delete from user's wishlist
  await prisma.wishlists.deleteMany({
    where: {
      user_id: session.userId,
      product_id: productId
    }
  })

  const allUserWishlists = await prisma.wishlists.findMany({
    where: { user_id: session.userId },
    select: { product_id: true }
  })

  const productIds = allUserWishlists.map(w => w.product_id)

  return {
    success: true,
    isWishlisted: false,
    message: 'Produk berhasil dihapus dari Wishlist.',
    wishlistCount: productIds.length,
    productIds
  }
})
