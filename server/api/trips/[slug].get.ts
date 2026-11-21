import { defineEventHandler, createError, setResponseHeader } from 'h3'
import { prisma } from '../../utils/prisma'
import { getCountryFlag } from '../../utils/countryFlags'
import { normalizeProductVariants } from '../../utils/variants'
import { resolvePublicMediaUrl } from '../../utils/r2'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug trip diperlukan' })
  }

  const trip = await prisma.jastip_trips.findUnique({
    where: { slug },
    include: {
      products: {
        where: { is_active: true },
        include: {
          categories: true,
          product_images: {
            orderBy: { sort_order: 'asc' }
          }
        }
      },
      orders: {
        where: {
          order_status: {
            notIn: ['rejected', 'cancelled', 'expired']
          }
        },
        include: {
          order_items: {
            select: { qty: true }
          }
        }
      }
    }
  })

  if (!trip) {
    throw createError({ statusCode: 404, message: 'Jadwal trip jastip tidak ditemukan' })
  }

  const quotaFilled = trip.orders.reduce((acc, ord) => {
    return acc + ord.order_items.reduce((sum, item) => sum + item.qty, 0)
  }, 0)

  const flag = getCountryFlag(trip.country)

  const products = trip.products.map(p => {
    const resolvedPrimary = resolvePublicMediaUrl(p.image_url)
    const primaryImgUrl = resolvePublicMediaUrl(p.product_images[0]?.image_url)
    const gallery = Array.from(
      new Set([
        ...(resolvedPrimary ? [resolvedPrimary] : []),
        ...p.product_images.map((img) => resolvePublicMediaUrl(img.image_url)).filter((u): u is string => Boolean(u))
      ])
    )
    const isOutOfStock = p.stock_status !== 'in_stock'
    const rawVariants = normalizeProductVariants(p.variants, Number(p.price), p.quota ?? 20)
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
        : (p.quota === null || p.quota > 0)

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.categories?.name || 'Lainnya',
      categorySlug: p.categories?.slug || 'lainnya',
      productType: p.product_type,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : null,
      originalCurrency: p.original_currency || trip.currency,
      sourceStore: p.source_store || '',
      image: gallery[0] || primaryImgUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      gallery,
      stockStatus: p.stock_status,
      inStock,
      quota: isOutOfStock ? 0 : p.quota,
      maxQtyPerOrder: p.max_qty_per_order || 5,
      variants: effectiveVariants,
      description: p.description || ''
    }
  })

  return {
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    country: trip.country,
    flag,
    cityOrArea: trip.city_or_area || '',
    description: trip.description || '',
    terms: trip.terms || '',
    coverImageUrl: resolvePublicMediaUrl(trip.cover_image_url) || null,
    currency: trip.currency,
    exchangeRate: Number(trip.exchange_rate),
    feeType: trip.fee_type,
    feeValue: Number(trip.fee_value),
    openDate: trip.open_date.toISOString(),
    closeDate: trip.close_date.toISOString(),
    departureDate: trip.departure_date ? trip.departure_date.toISOString() : null,
    estimatedArrivalDate: trip.estimated_arrival_date ? trip.estimated_arrival_date.toISOString() : null,
    quotaTotal: trip.quota_total || 50,
    quotaFilled: quotaFilled,
    quotaRemaining: Math.max(0, (trip.quota_total || 50) - quotaFilled),
    status: trip.status,
    products
  }
})
