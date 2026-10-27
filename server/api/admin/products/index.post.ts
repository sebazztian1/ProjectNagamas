import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 180)
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const body = await readBody(event)
  const {
    name,
    description,
    categoryId,
    productType,
    tripId,
    price,
    originalPrice,
    originalCurrency,
    sourceStore,
    imageUrl,
    stockStatus,
    stockQuantity,
    quota,
    maxQtyPerOrder,
    variants,
    galleryImages
  } = body

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, message: 'Nama produk wajib diisi' })
  }

  if (!categoryId || isNaN(Number(categoryId))) {
    throw createError({ statusCode: 400, message: 'Kategori produk wajib dipilih' })
  }

  if (productType !== 'ready' && productType !== 'jastip') {
    throw createError({ statusCode: 400, message: 'Tipe produk harus "ready" atau "jastip"' })
  }

  if (!price || isNaN(Number(price)) || Number(price) <= 0) {
    throw createError({ statusCode: 400, message: 'Harga produk harus berupa angka positif' })
  }

  // Generate unique slug
  let baseSlug = generateSlug(name)
  let uniqueSlug = baseSlug
  let counter = 1
  while (await prisma.products.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  const createdProduct = await prisma.products.create({
    data: {
      name: name.trim(),
      slug: uniqueSlug,
      description: description?.trim() || null,
      category_id: Number(categoryId),
      product_type: productType,
      trip_id: productType === 'jastip' && tripId ? Number(tripId) : null,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      original_currency: originalCurrency || null,
      source_store: sourceStore?.trim() || null,
      image_url: imageUrl?.trim() || null,
      stock_status: stockStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
      stock_quantity: productType === 'ready' ? (Number(stockQuantity) || 0) : null,
      quota: productType === 'jastip' ? (Number(quota) || 20) : null,
      max_qty_per_order: maxQtyPerOrder ? Number(maxQtyPerOrder) : 5,
      variants: variants && typeof variants === 'object' ? variants : null,
      is_active: true
    }
  })

  // If gallery images provided, create product_images entries
  if (Array.isArray(galleryImages) && galleryImages.length > 0) {
    await prisma.product_images.createMany({
      data: galleryImages.map((url: string, idx: number) => ({
        product_id: createdProduct.id,
        image_url: url,
        sort_order: idx + 1
      }))
    })
  }

  return {
    success: true,
    message: 'Produk berhasil ditambahkan',
    product: createdProduct
  }
})
