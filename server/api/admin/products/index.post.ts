import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { normalizeProductVariants, syncProductVariantsTable } from '../../../utils/variants'

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

  const basePriceInput = Number(price) || 0
  const baseStockInput = productType === 'ready' ? (Number(stockQuantity) || 0) : (Number(quota) || 20)
  const normalizedVariants = normalizeProductVariants(variants, basePriceInput > 0 ? basePriceInput : 0, baseStockInput)

  const hasVariants = !!(normalizedVariants && normalizedVariants.combinations.length > 0)
  const effectivePrice = hasVariants
    ? Math.min(...normalizedVariants!.combinations.map(c => Number(c.price) || 0).filter(p => p > 0))
    : basePriceInput

  if (!effectivePrice || isNaN(effectivePrice) || effectivePrice <= 0) {
    throw createError({ statusCode: 400, message: 'Harga produk (atau harga variasi) harus berupa angka positif' })
  }

  const totalVariantStock = hasVariants
    ? normalizedVariants!.combinations.reduce((sum, c) => sum + Math.max(0, Number(c.stock) || 0), 0)
    : baseStockInput

  const effectiveStockStatus = hasVariants
    ? (totalVariantStock > 0 ? 'in_stock' : 'out_of_stock')
    : (stockStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock')

  // Generate unique slug
  let baseSlug = generateSlug(name)
  let uniqueSlug = baseSlug
  let counter = 1
  while (await prisma.products.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter}`
    counter++
  }

  let createdProduct = await prisma.products.create({
    data: {
      name: name.trim(),
      slug: uniqueSlug,
      description: description?.trim() || null,
      category_id: Number(categoryId),
      product_type: productType,
      trip_id: productType === 'jastip' && tripId ? Number(tripId) : null,
      price: effectivePrice,
      original_price: originalPrice ? Number(originalPrice) : null,
      original_currency: originalCurrency || null,
      source_store: sourceStore?.trim() || null,
      image_url: imageUrl?.trim() || null,
      stock_status: effectiveStockStatus,
      stock_quantity: productType === 'ready' ? totalVariantStock : null,
      quota: productType === 'jastip' ? totalVariantStock : null,
      max_qty_per_order: maxQtyPerOrder ? Number(maxQtyPerOrder) : 5,
      variants: hasVariants ? (normalizedVariants as any) : null,
      is_active: true
    }
  })

  if (hasVariants && normalizedVariants) {
    const syncedVariants = await syncProductVariantsTable(createdProduct.id, productType, normalizedVariants)
    createdProduct = await prisma.products.update({
      where: { id: createdProduct.id },
      data: { variants: syncedVariants as any }
    })
  }

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
