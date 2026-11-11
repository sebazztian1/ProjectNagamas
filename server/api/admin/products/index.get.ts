import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { normalizeProductVariants } from '../../../utils/variants'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Memerlukan hak akses admin.' })
  }

  const query = getQuery(event)
  const type = query.type as string
  const categoryId = query.categoryId ? Number(query.categoryId) : undefined
  const search = query.search as string

  const where: any = {
    deleted_at: null
  }

  if (type === 'ready' || type === 'jastip') {
    where.product_type = type
  }

  if (categoryId && !isNaN(categoryId)) {
    where.category_id = categoryId
  }

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim() } },
      { description: { contains: search.trim() } }
    ]
  }

  const products = await prisma.products.findMany({
    where,
    orderBy: { id: 'desc' },
    include: {
      categories: {
        select: { id: true, name: true, slug: true }
      },
      jastip_trips: {
        select: { id: true, title: true, slug: true, country: true, status: true }
      },
      product_images: {
        orderBy: { sort_order: 'asc' },
        select: { id: true, image_url: true }
      }
    }
  })

  // Also fetch list of categories & trips for admin dropdown forms
  const categories = await prisma.categories.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  })

  const trips = await prisma.jastip_trips.findMany({
    where: { status: { in: ['draft', 'open'] } },
    orderBy: { created_at: 'desc' },
    select: { id: true, title: true, slug: true, country: true, status: true, exchange_rate: true, fee_value: true }
  })

  const formattedProducts = products.map((p) => {
    const galleryImages = Array.from(
      new Set([
        ...(p.image_url ? [p.image_url] : []),
        ...p.product_images.map((img) => img.image_url).filter(Boolean)
      ])
    )
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      categoryId: p.category_id,
      categoryName: p.categories?.name || 'Lainnya',
      productType: p.product_type,
      tripId: p.trip_id,
      tripTitle: p.jastip_trips?.title || null,
      tripCountry: p.jastip_trips?.country || null,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      originalCurrency: p.original_currency || null,
      sourceStore: p.source_store || null,
      imageUrl: galleryImages[0] || p.image_url || '',
      galleryImages,
      stockStatus: p.stock_status,
      stockQuantity: p.stock_quantity ?? 0,
      quota: p.quota ?? 0,
      maxQtyPerOrder: p.max_qty_per_order ?? 5,
      variants: normalizeProductVariants(
        p.variants,
        Number(p.price),
        p.product_type === 'ready' ? (p.stock_quantity ?? 0) : (p.quota ?? 0)
      ),
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }
  })

  return {
    products: formattedProducts,
    categories,
    trips
  }
})
