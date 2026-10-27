import { defineEventHandler, getRouterParam, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
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

  const gallery = [
    ...(p.image_url ? [p.image_url] : []),
    ...p.product_images.map((img) => img.image_url).filter((u) => u !== p.image_url)
  ]

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
    image: p.image_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    gallery,
    stockStatus: p.stock_status,
    stockQuantity: p.stock_quantity ?? (p.stock_status === 'in_stock' ? 10 : 0),
    inStock: p.stock_status === 'in_stock' && (p.stock_quantity === null || p.stock_quantity > 0),
    quota: p.quota || null,
    maxQtyPerOrder: p.max_qty_per_order || 5,
    variants: p.variants as Record<string, string[]> | null,
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
