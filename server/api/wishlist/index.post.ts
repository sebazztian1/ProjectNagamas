import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'
import { getSessionFromEvent } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Silakan masuk ke akun Anda untuk menyimpan produk ke Wishlist.'
    })
  }

  const body = await readBody(event)
  const productId = Number(body?.productId)

  if (!productId || isNaN(productId)) {
    throw createError({
      statusCode: 400,
      message: 'ID Produk tidak valid.'
    })
  }

  // Verify product exists
  const product = await prisma.products.findUnique({
    where: { id: productId }
  })

  if (!product) {
    throw createError({
      statusCode: 404,
      message: 'Produk tidak ditemukan.'
    })
  }

  // Check if already in wishlist
  const existing = await prisma.wishlists.findUnique({
    where: {
      user_id_product_id: {
        user_id: session.userId,
        product_id: productId
      }
    }
  })

  if (!existing) {
    await prisma.wishlists.create({
      data: {
        user_id: session.userId,
        product_id: productId
      }
    })
  }

  const allUserWishlists = await prisma.wishlists.findMany({
    where: { user_id: session.userId },
    select: { product_id: true }
  })

  const productIds = allUserWishlists.map(w => w.product_id)

  return {
    success: true,
    isWishlisted: true,
    message: 'Produk berhasil ditambahkan ke Wishlist Anda.',
    wishlistCount: productIds.length,
    productIds
  }
})
