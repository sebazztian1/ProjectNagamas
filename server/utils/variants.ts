import { prisma } from './prisma'

export interface VariantTier {
  name: string
  options: string[]
}

export interface VariantCombination {
  id?: number
  key: string
  label: string
  options: Record<string, string>
  price: number
  stock: number
  sku?: string
}

export interface NormalizedProductVariants {
  tiers: VariantTier[]
  combinations: VariantCombination[]
}

export function buildCombinationKey(tierNames: string[], optionsMap: Record<string, string>): string {
  return tierNames.map(t => (optionsMap[t] || '').trim()).join(' | ')
}

export function buildCombinationLabel(tierNames: string[], optionsMap: Record<string, string>): string {
  if (tierNames.length === 1) {
    const t = tierNames[0]
    return `${t}: ${optionsMap[t] || ''}`
  }
  return tierNames.map(t => `${t}: ${optionsMap[t] || ''}`).join(', ')
}

export function generateCartesianCombinations(tiers: VariantTier[]): Record<string, string>[] {
  const validTiers = tiers.filter(t => t.name.trim() && Array.isArray(t.options) && t.options.length > 0)
  if (validTiers.length === 0) return []

  let results: Record<string, string>[] = [{}]
  for (const tier of validTiers) {
    const next: Record<string, string>[] = []
    for (const prefix of results) {
      for (const opt of tier.options) {
        const cleanOpt = String(opt || '').trim()
        if (!cleanOpt) continue
        next.push({
          ...prefix,
          [tier.name.trim()]: cleanOpt
        })
      }
    }
    results = next
  }
  return results
}

/**
 * Normalize raw `variants` JSON (either new `{ tiers, combinations }` or legacy `Record<string, string[]>`)
 */
export function normalizeProductVariants(
  rawVariants: any,
  fallbackPrice = 0,
  fallbackStock = 0
): NormalizedProductVariants | null {
  if (!rawVariants || typeof rawVariants !== 'object') {
    return null
  }

  // Case 1: Already in `{ tiers, combinations }` format
  if (Array.isArray(rawVariants.tiers)) {
    const tiers: VariantTier[] = rawVariants.tiers
      .map((t: any) => ({
        name: String(t?.name || '').trim(),
        options: Array.isArray(t?.options)
          ? Array.from(new Set(t.options.map((o: any) => String(o || '').trim()).filter(Boolean)))
          : []
      }))
      .filter((t: VariantTier) => t.name && t.options.length > 0)

    if (tiers.length === 0) return null

    const tierNames = tiers.map(t => t.name)
    const cartesian = generateCartesianCombinations(tiers)
    const rawCombos: any[] = Array.isArray(rawVariants.combinations) ? rawVariants.combinations : []

    const combinations: VariantCombination[] = cartesian.map(optMap => {
      const key = buildCombinationKey(tierNames, optMap)
      const label = buildCombinationLabel(tierNames, optMap)

      const existing = rawCombos.find((c: any) => {
        if (c?.key) {
          const normKey = String(c.key).replace(/\s*\|\|\s*/g, ' | ').trim().toLowerCase()
          if (normKey === key.toLowerCase()) return true
        }
        if (c?.label && String(c.label).trim().toLowerCase() === label.toLowerCase()) return true
        const mapObj = c?.options || c?.values
        if (mapObj && typeof mapObj === 'object') {
          return tierNames.every(
            tName => String(mapObj[tName] || '').trim().toLowerCase() === String(optMap[tName] || '').trim().toLowerCase()
          )
        }
        return false
      })

      const resolvedPrice =
        existing && existing.price !== undefined && !isNaN(Number(existing.price)) && Number(existing.price) > 0
          ? Number(existing.price)
          : Number(fallbackPrice) || 0

      const resolvedStock =
        existing && existing.stock !== undefined && !isNaN(Number(existing.stock)) && Number(existing.stock) >= 0
          ? Math.floor(Number(existing.stock))
          : Math.max(0, Math.floor(Number(fallbackStock) || 0))

      return {
        ...(existing?.id ? { id: Number(existing.id) } : {}),
        key,
        label,
        options: optMap,
        price: resolvedPrice,
        stock: resolvedStock,
        ...(existing?.sku ? { sku: String(existing.sku).trim() } : {})
      }
    })

    if (combinations.length === 0) return null
    return { tiers, combinations }
  }

  // Case 2: Legacy `Record<string, string[]>` format (e.g. `{ Warna: ['Hitam', 'Putih'], Ukuran: ['S', 'M'] }`)
  const entries = Object.entries(rawVariants).filter(
    ([k, v]) => k && k !== 'tiers' && k !== 'combinations' && Array.isArray(v) && v.length > 0
  )
  if (entries.length === 0) return null

  const tiers: VariantTier[] = entries
    .map(([name, opts]) => ({
      name: String(name).trim(),
      options: Array.from(new Set((opts as any[]).map(o => String(o || '').trim()).filter(Boolean)))
    }))
    .filter(t => t.name && t.options.length > 0)

  if (tiers.length === 0) return null

  const tierNames = tiers.map(t => t.name)
  const cartesian = generateCartesianCombinations(tiers)
  const perComboStock =
    cartesian.length > 0 ? Math.max(1, Math.floor((Number(fallbackStock) || 10) / cartesian.length)) : 0

  const combinations: VariantCombination[] = cartesian.map(optMap => ({
    key: buildCombinationKey(tierNames, optMap),
    label: buildCombinationLabel(tierNames, optMap),
    options: optMap,
    price: Number(fallbackPrice) || 0,
    stock: perComboStock
  }))

  return { tiers, combinations }
}

/**
 * Find a matching combination from normalized variants by key, label, or single option value
 */
export function findVariantCombination(
  normalized: NormalizedProductVariants | null,
  variantInput?: string | null
): VariantCombination | null {
  if (!normalized || normalized.combinations.length === 0) return null
  const q = String(variantInput || '').trim().toLowerCase()
  if (!q || q === 'standard' || q === 'standar') {
    return normalized.combinations.find(c => c.stock > 0) || normalized.combinations[0]
  }

  // Exact match on key or label
  const exact = normalized.combinations.find(
    c => c.key.toLowerCase() === q || c.label.toLowerCase() === q
  )
  if (exact) return exact

  // Match if single-tier option name was passed directly (e.g. "Hitam" instead of "Warna: Hitam")
  const bySingleValue = normalized.combinations.find(c => {
    const vals = Object.values(c.options).map(v => v.toLowerCase())
    return vals.join(' | ') === q || vals.join(' - ') === q || vals.join(', ') === q || vals.includes(q)
  })
  if (bySingleValue) return bySingleValue

  return null
}

/**
 * Sync normalized variant combinations into the `product_variants` relational table
 * and return the updated NormalizedProductVariants with database `id`s attached.
 */
export async function syncProductVariantsTable(
  productId: number,
  productType: 'ready' | 'jastip',
  normalized: NormalizedProductVariants | null
): Promise<NormalizedProductVariants | null> {
  try {
    await prisma.$executeRaw`DELETE FROM product_variants WHERE product_id = ${productId}`

    if (!normalized || normalized.combinations.length === 0) {
      return null
    }

    for (const comb of normalized.combinations) {
      const stockVal = Math.max(0, Math.floor(Number(comb.stock) || 0))
      const quotaVal = productType === 'jastip' ? stockVal : null
      const tierJson = JSON.stringify(comb.options || {})
      const skuVal = comb.sku || null

      await prisma.$executeRaw`
        INSERT INTO product_variants (product_id, variant_key, variant_label, tier_values, price, stock_quantity, quota, sku, is_active, created_at)
        VALUES (${productId}, ${comb.key}, ${comb.label}, ${tierJson}, ${comb.price}, ${stockVal}, ${quotaVal}, ${skuVal}, 1, NOW())
      `
    }

    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, variant_key FROM product_variants WHERE product_id = ${productId} ORDER BY id ASC
    `

    if (Array.isArray(rows)) {
      for (const comb of normalized.combinations) {
        const matched = rows.find(r => String(r.variant_key) === comb.key)
        if (matched) {
          comb.id = Number(matched.id)
        }
      }
    }

    return normalized
  } catch (err) {
    console.error('[variants] Error syncing product_variants table:', err)
    return normalized
  }
}

