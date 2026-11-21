import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3'
import { prisma } from '../../utils/prisma'
import { normalizeProductVariants } from '../../utils/variants'
import { resolvePublicMediaUrl } from '../../utils/r2'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug produk diperlukan' })
  }

  const p = await prisma.products.findFirst({
    where: {
      slug,
      is_active: true,
      deleted_at: null
    },
    include: {
      categories: {
        select: { id: true, name: true, slug: true }
      },
      jastip_trips: {
        select: {
          id: true,
          title: true,
          slug: true,
          country: true,
          city_or_area: true,
          description: true,
          terms: true,
          status: true,
          close_date: true,
          departure_date: true,
          estimated_arrival_date: true
        }
      },
      product_images: {
        orderBy: { sort_order: 'asc' },
        select: { id: true, image_url: true }
      }
    }
  })

  if (!p) {
    throw createError({ statusCode: 404, message: 'Produk tidak ditemukan' })
  }

  const resolvedPrimary = resolvePublicMediaUrl(p.image_url)
  const gallery = Array.from(
    new Set([
      ...(resolvedPrimary ? [resolvedPrimary] : []),
      ...p.product_images.map((img) => resolvePublicMediaUrl(img.image_url)).filter((u): u is string => Boolean(u))
    ])
  )

  const isOutOfStock = p.stock_status !== 'in_stock'
  const rawVariants = normalizeProductVariants(
    p.variants,
    Number(p.price),
    p.product_type === 'ready' ? (p.stock_quantity ?? 10) : (p.quota ?? 20)
  )
  const effectiveVariants =
    isOutOfStock && rawVariants
      ? {
          ...rawVariants,
          combinations: rawVariants.combinations.map((c) => ({ ...c, stock: 0 }))
        }
      : rawVariants
  const hasAvailableVariant =
    rawVariants && rawVariants.combinations.length > 0
      ? rawVariants.combinations.some((c) => c.stock > 0)
      : null
  const inStock = isOutOfStock
    ? false
    : hasAvailableVariant !== null
      ? hasAvailableVariant
      : p.product_type === 'ready'
        ? (p.stock_quantity === null || p.stock_quantity > 0)
        : (p.quota === null || p.quota > 0)

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    category: p.categories?.name || 'Lainnya',
    categorySlug: p.categories?.slug || 'lainnya',
    categoryId: p.category_id,
    productType: p.product_type,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    originalCurrency: p.original_currency || null,
    sourceStore: p.source_store || null,
    image: gallery[0] || resolvedPrimary || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    gallery,
    stockStatus: p.stock_status,
    stockQuantity: isOutOfStock ? 0 : (p.stock_quantity ?? 10),
    inStock,
    quota: isOutOfStock ? 0 : (p.quota || null),
    maxQtyPerOrder: p.max_qty_per_order || 5,
    variants: effectiveVariants,
    trip: p.jastip_trips
      ? {
          id: p.jastip_trips.id,
          title: p.jastip_trips.title,
          slug: p.jastip_trips.slug,
          country: p.jastip_trips.country,
          cityOrArea: p.jastip_trips.city_or_area,
          description: p.jastip_trips.description,
          terms: p.jastip_trips.terms,
          status: p.jastip_trips.status,
          closeDate: p.jastip_trips.close_date,
          departureDate: p.jastip_trips.departure_date,
          estimatedArrivalDate: p.jastip_trips.estimated_arrival_date
        }
      : null,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  }
})
