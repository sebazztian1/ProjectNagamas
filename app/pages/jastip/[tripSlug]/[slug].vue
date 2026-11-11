<template>
  <div class="jastip-product-detail" v-if="product">
    <div class="page-container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <NuxtLink to="/jastip">Jadwal Jastip</NuxtLink>
        <span>/</span>
        <NuxtLink :to="`/jastip/${tripSlug}`">{{ product.trip?.title || 'Trip' }}</NuxtLink>
        <span>/</span>
        <span class="active">{{ product.name }}</span>
      </div>

      <div class="detail-layout">
        <!-- Image Area -->
        <div class="gallery-col">
          <div class="main-image">
            <img :src="activeImage" :alt="product.name" />
            <span class="badge-jastip-po">
              Open PO Jastip {{ product.trip?.country || '' }}
            </span>
            <template v-if="galleryList.length > 1">
              <button type="button" class="gallery-nav-btn prev" @click="stepGallery(-1)" title="Foto sebelumnya">&lsaquo;</button>
              <button type="button" class="gallery-nav-btn next" @click="stepGallery(1)" title="Foto berikutnya">&rsaquo;</button>
              <span class="gallery-counter-pill">{{ activeGalleryIndex + 1 }} / {{ galleryList.length }}</span>
            </template>
          </div>

          <div v-if="galleryList.length > 1" class="thumbnail-row">
            <div
              v-for="(img, idx) in galleryList"
              :key="idx"
              class="thumb-box"
              :class="{ active: activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="`${product.name} - ${idx + 1}`" />
            </div>
          </div>

          <!-- Trip Reminder Box -->
          <div class="trip-reminder-box" v-if="product.trip">
            <strong>{{ product.trip.title }}</strong>
            <div class="dates-row">
              <span>Negara: <strong>{{ product.trip.country }}</strong></span>
              <span>Status: <strong>{{ product.trip.status === 'open' ? 'Buka PO' : product.trip.status }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Info / Buying Action -->
        <div class="info-col">
          <div class="store-tag" v-if="product.sourceStore">
            <span><strong>{{ product.sourceStore }}</strong></span>
          </div>

          <h1 class="product-name">{{ product.name }}</h1>

          <!-- Price Calculation Transparency Box (Jastip specific) -->
          <div class="jastip-price-breakdown">
            <div class="calc-formula">
              <div class="f-item" v-if="product.originalPrice">
                <span>Harga Asal:</span>
                <strong>{{ product.originalCurrency }} {{ product.originalPrice?.toLocaleString('id-ID') }}</strong>
              </div>
              <div class="f-item highlight">
                <span>Harga Bersih (IDR):</span>
                <strong class="final-price">{{ formatRupiah(currentDisplayPrice) }}</strong>
              </div>
            </div>
            <div v-if="priceRangeHint" class="price-range-sub">
              Rentang harga variasi: {{ priceRangeHint }}
            </div>
          </div>

          <!-- Quota Remaining Alert -->
          <div class="quota-alert" :class="{ out: currentAvailableQuota <= 0 }">
            <span>
              Sisa kuota{{ activeVariantCombo ? ` (${activeVariantCombo.label})` : '' }}:
              <strong>{{ currentAvailableQuota }} slot</strong>
            </span>
          </div>

          <!-- Multi-Tier Variants Selection -->
          <div v-if="variantTiers.length > 0" class="variants-card">
            <div v-for="tier in variantTiers" :key="tier.name" class="variant-group">
              <div class="variant-header-row">
                <label class="variant-label">Pilih {{ tier.name }}</label>
                <span v-if="selectedTierValues[tier.name]" class="variant-picked-val">
                  {{ selectedTierValues[tier.name] }}
                </span>
              </div>
              <div class="variant-options">
                <button
                  v-for="opt in tier.options"
                  :key="opt"
                  type="button"
                  class="variant-btn"
                  :class="{
                    active: selectedTierValues[tier.name] === opt,
                    'is-empty': isOptionOutOfStock(tier.name, opt)
                  }"
                  @click="selectTierOption(tier.name, opt)"
                >
                  <span class="opt-txt">{{ opt }}</span>
                  <span v-if="isOptionOutOfStock(tier.name, opt)" class="opt-out-tag">Habis</span>
                </button>
              </div>
            </div>

            <div v-if="activeVariantCombo" class="variant-summary-bar">
              <div class="vs-left">
                <span class="vs-caption">Kombinasi Dipilih</span>
                <strong class="vs-label">{{ activeVariantCombo.label }}</strong>
              </div>
              <div class="vs-right">
                <span class="vs-stock" :class="{ empty: currentAvailableQuota <= 0 }">
                  {{ currentAvailableQuota > 0 ? `Sisa ${currentAvailableQuota} slot` : 'Kuota Variasi Habis' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="qty-section" v-if="currentAvailableQuota > 0">
            <label class="qty-label">Jumlah Titip (Maks {{ maxOrderableQty }} pcs):</label>
            <div class="qty-ctrl">
              <button type="button" @click="qty > 1 ? qty-- : null" :disabled="qty <= 1">-</button>
              <span class="qty-num">{{ qty }}</span>
              <button type="button" @click="qty < maxOrderableQty ? qty++ : null" :disabled="qty >= maxOrderableQty">+</button>
            </div>
            <span class="subtotal-hint">Total: {{ formatRupiah(currentDisplayPrice * qty) }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="cta-actions">
            <NuxtLink
              v-if="isTripOpen && currentAvailableQuota > 0"
              :to="`/checkout?productId=${product.id}&qty=${qty}&variant=${encodeURIComponent(selectedVariantLabel)}&tripSlug=${tripSlug}`"
              class="btn-po-now"
            >
              Titip Sekarang (Checkout PO)
            </NuxtLink>
            <button v-else disabled class="btn-po-now disabled">
              {{ !isTripOpen ? 'PO Telah Ditutup' : 'Kuota Variasi Ini Habis' }}
            </button>
            <div class="cta-sub-row">
              <button v-if="!isAdmin" type="button" class="btn-chat-admin" @click="handleChatAdmin">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Chat Tanya
              </button>
              <button
                type="button"
                class="btn-wishlist-detail"
                :class="{ active: isWishlisted(product.id) }"
                @click="toggleWishlist(product)"
                :title="isWishlisted(product.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="isWishlisted(product.id) ? '#E53935' : 'none'" :stroke="isWishlisted(product.id) ? '#E53935' : 'currentColor'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{{ isWishlisted(product.id) ? 'Favorit' : 'Wishlist' }}</span>
              </button>
            </div>
          </div>

          <!-- Jastip Guarantees -->
          <div class="guarantee-box">
            <div class="g-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>100% Struk Pembelian Toko Fisik Disertakan</span>
            </div>
            <div class="g-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>Garansi 100% Uang Kembali jika Barang Kosong di Toko Luar Negeri</span>
            </div>
          </div>

          <!-- Description -->
          <div class="desc-section">
            <h3>Catatan & Deskripsi Produk</h3>
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="jastip-product-detail" v-else>
    <div class="page-container" style="text-align: center; padding: 60px 20px;">
      <h2>Produk Tidak Ditemukan</h2>
      <p style="margin: 12px 0 24px; color: #7A6A55;">Produk jastip yang Anda cari tidak tersedia atau sudah dihapus.</p>
      <NuxtLink :to="`/jastip/${tripSlug}`" class="btn-po-now" style="display: inline-block; width: auto; padding: 12px 24px;">Kembali ke Jadwal Trip</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useCustomerChat } from '../../../composables/useCustomerChat'
import { useWishlist } from '../../../composables/useWishlist'

const route = useRoute()
const tripSlug = route.params.tripSlug as string
const slug = route.params.slug as string
const { currentUser } = useAuth()
const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'staff')
const { openChat, openChatWithProduct } = useCustomerChat()
const { isWishlisted, toggleWishlist } = useWishlist()

const { data: product } = await useFetch<any>(`/api/products/${slug}`)

const galleryList = computed<string[]>(() => {
  const g = product.value?.gallery
  if (Array.isArray(g) && g.length > 0) return g
  return product.value?.image ? [product.value.image] : []
})

const activeImage = ref(product.value?.image || '')
watch(product, (p) => {
  if (p) {
    activeImage.value = (Array.isArray(p.gallery) && p.gallery[0]) || p.image || ''
  }
}, { immediate: true })

const activeGalleryIndex = computed(() => {
  const idx = galleryList.value.indexOf(activeImage.value)
  return idx >= 0 ? idx : 0
})

const stepGallery = (delta: number) => {
  const list = galleryList.value
  if (list.length <= 1) return
  const nextIdx = (activeGalleryIndex.value + delta + list.length) % list.length
  activeImage.value = list[nextIdx] || activeImage.value
}

const isTripOpen = computed(() => {
  if (!product.value?.trip) return true
  const trip = product.value.trip
  const isStatusOpen = trip.status === 'open'
  const isNotExpired = !trip.closeDate || new Date(trip.closeDate) > new Date()
  return isStatusOpen && isNotExpired
})

const qty = ref(1)
const selectedTierValues = ref<Record<string, string>>({})

const variantTiers = computed(() => {
  const v = product.value?.variants
  if (!v || typeof v !== 'object') return []
  if (Array.isArray(v.tiers) && v.tiers.length > 0) {
    return v.tiers.filter((t: any) => t && t.name && Array.isArray(t.options) && t.options.length > 0)
  }
  return Object.entries(v)
    .filter(([k, val]) => k !== 'tiers' && k !== 'combinations' && Array.isArray(val) && val.length > 0)
    .map(([name, options]) => ({ name, options }))
})

const variantCombinations = computed(() => {
  const v = product.value?.variants
  if (v && typeof v === 'object' && Array.isArray(v.combinations) && v.combinations.length > 0) {
    return v.combinations
  }
  return []
})

watch(product, (p) => {
  if (!p) return
  const tiers = variantTiers.value
  const combos = variantCombinations.value
  if (tiers.length > 0) {
    const firstInStock = combos.find((c: any) => Number(c.stock) > 0) || combos[0]
    const mapObj = firstInStock?.options || firstInStock?.values || {}
    const initMap: Record<string, string> = {}
    for (const tier of tiers) {
      initMap[tier.name] = mapObj[tier.name] || tier.options?.[0] || ''
    }
    selectedTierValues.value = initMap
  } else {
    selectedTierValues.value = {}
  }
}, { immediate: true })

const findMatchingCombination = (selectionMap: Record<string, string>) => {
  const tiers = variantTiers.value
  const combos = variantCombinations.value
  if (tiers.length === 0 || combos.length === 0) return null

  const keyPipe = tiers.map((t: any) => selectionMap[t.name] || t.options[0] || '').join(' | ').toLowerCase()
  const keyDoublePipe = tiers.map((t: any) => selectionMap[t.name] || t.options[0] || '').join(' || ').toLowerCase()

  return combos.find((c: any) => {
    const ck = String(c.key || '').trim().toLowerCase()
    if (ck === keyPipe || ck === keyDoublePipe) return true
    const mapObj = c.options || c.values
    if (mapObj && typeof mapObj === 'object') {
      return tiers.every(
        (t: any) => String(mapObj[t.name] || '').trim().toLowerCase() === String(selectionMap[t.name] || '').trim().toLowerCase()
      )
    }
    return false
  }) || null
}

const activeVariantCombo = computed(() => {
  return findMatchingCombination(selectedTierValues.value) || variantCombinations.value[0] || null
})

const isOptionOutOfStock = (tierName: string, opt: string) => {
  if (variantCombinations.value.length === 0) return false
  const testSelection = {
    ...selectedTierValues.value,
    [tierName]: opt
  }
  const match = findMatchingCombination(testSelection)
  if (match) {
    return Number(match.stock) <= 0
  }
  return false
}

const selectTierOption = (tierName: string, opt: string) => {
  selectedTierValues.value = {
    ...selectedTierValues.value,
    [tierName]: opt
  }
}

const priceRangeHint = computed(() => {
  const combos = variantCombinations.value
  if (combos.length <= 1) return null
  const prices = combos.map((c: any) => Number(c.price) || 0).filter((p: number) => p > 0)
  if (prices.length <= 1) return null
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  if (minP === maxP) return null
  return `${formatRupiah(minP)} – ${formatRupiah(maxP)}`
})

const currentDisplayPrice = computed(() => {
  if (activeVariantCombo.value && Number(activeVariantCombo.value.price) > 0) {
    return Number(activeVariantCombo.value.price)
  }
  return Number(product.value?.price || 0)
})

const currentAvailableQuota = computed(() => {
  if (activeVariantCombo.value && activeVariantCombo.value.stock !== undefined) {
    return Math.max(0, Number(activeVariantCombo.value.stock) || 0)
  }
  return Math.max(0, Number(product.value?.quota ?? 12))
})

const maxOrderableQty = computed(() => {
  const maxPerOrd = product.value?.maxQtyPerOrder || 5
  return Math.max(1, Math.min(maxPerOrd, currentAvailableQuota.value || 1))
})

watch(maxOrderableQty, (maxQ) => {
  if (qty.value > maxQ) qty.value = maxQ
})

const selectedVariantLabel = computed(() => {
  if (activeVariantCombo.value) return activeVariantCombo.value.label
  const tiers = variantTiers.value
  if (tiers.length > 0) {
    return tiers.map((t: any) => `${t.name}: ${selectedTierValues.value[t.name] || t.options[0]}`).join(', ')
  }
  return 'Standard'
})

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

const handleChatAdmin = () => {
  if (product.value) {
    openChatWithProduct({
      id: String(product.value.id),
      name: product.value.name,
      price: currentDisplayPrice.value,
      image: product.value.image,
      category: product.value.category
    } as any)
  } else {
    openChat()
  }
}
</script>

<style scoped>
.jastip-product-detail {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1140px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 24px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb a:hover {
  color: var(--color-primary, #8C6D3F);
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;
}

.gallery-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-jastip-po {
  position: absolute;
  top: 14px;
  left: 14px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
}

.gallery-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(239, 225, 198, 0.9);
  background: rgba(255, 255, 255, 0.9);
  color: #2B2116;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.15s;
}

.gallery-nav-btn:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.gallery-nav-btn.prev {
  left: 12px;
}

.gallery-nav-btn.next {
  right: 12px;
}

.gallery-counter-pill {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(43, 33, 22, 0.75);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}

.thumbnail-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumb-box {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  border: 2px solid var(--color-secondary, #EFE1C6);
  overflow: hidden;
  cursor: pointer;
  background: #ffffff;
  transition: border-color 0.15s;
}

.thumb-box.active {
  border-color: var(--color-primary, #8C6D3F);
}

.thumb-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-reminder-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 16px;
}

.dates-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  border-top: 1px solid var(--color-secondary, #EFE1C6);
  padding-top: 8px;
  margin-top: 8px;
}

/* Info Col */
.info-col {
  display: flex;
  flex-direction: column;
}

.store-tag {
  font-size: 0.8rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 6px;
}

.product-name {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  line-height: 1.3;
  margin-bottom: 16px;
}

.jastip-price-breakdown {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
}

.calc-formula {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.f-item {
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
}

.f-item strong {
  display: block;
  font-size: 0.95rem;
  color: var(--color-text, #2B2116);
}

.f-item.highlight strong.final-price {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-primary, #8C6D3F);
}

.price-range-sub {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  margin-top: 6px;
}

.quota-alert {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  font-size: 0.82rem;
  padding: 8px 14px;
  border-radius: 8px;
  margin-bottom: 18px;
}

.quota-alert.out {
  background: #FEF2F2;
  color: #DC2626;
}

/* Variants Card */
.variants-card {
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.variant-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variant-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.variant-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2B2116;
  text-transform: capitalize;
}

.variant-picked-val {
  font-size: 0.76rem;
  font-weight: 700;
  color: #8C6D3F;
  background: #F4E8D1;
  padding: 2px 9px;
  border-radius: 999px;
}

.variant-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.variant-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1.5px solid #E2D3B9;
  color: #2B2116;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}

.variant-btn:hover {
  border-color: #8C6D3F;
  background: #FDF9F0;
}

.variant-btn.active {
  border-color: #8C6D3F;
  background: #8C6D3F;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(140, 109, 63, 0.22);
}

.variant-btn.is-empty:not(.active) {
  opacity: 0.6;
  border-style: dashed;
}

.opt-out-tag {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(220, 38, 38, 0.12);
  color: #DC2626;
}

.variant-btn.active .opt-out-tag {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.variant-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed #E2D1B3;
  flex-wrap: wrap;
}

.vs-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vs-caption {
  font-size: 0.7rem;
  color: #7A6A55;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.vs-label {
  font-size: 0.86rem;
  color: #2B2116;
  font-weight: 700;
}

.vs-stock {
  font-size: 0.78rem;
  font-weight: 700;
  color: #047857;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 4px 10px;
  border-radius: 6px;
}

.vs-stock.empty {
  color: #DC2626;
  background: #FEF2F2;
  border-color: #FECACA;
}

.qty-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.qty-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.qty-ctrl {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.qty-ctrl button {
  width: 34px;
  height: 34px;
  background: var(--color-canvas, #FFFBF2);
  border: none;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
}

.qty-ctrl button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-num {
  width: 40px;
  text-align: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.subtotal-hint {
  font-size: 0.85rem;
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.cta-sub-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-po-now {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  text-decoration: none;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 13px;
  border-radius: 8px;
  border: none;
  transition: all 0.15s;
}

.btn-po-now:hover:not(.disabled) {
  background: var(--color-primary-hover, #6F5530);
}

.btn-po-now.disabled {
  background: #D9D2C5;
  color: #7A6A55;
  cursor: not-allowed;
}

.btn-chat-admin {
  background: #ffffff;
  color: var(--color-primary, #8C6D3F);
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  font-weight: 700;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-chat-admin:hover {
  background: var(--color-secondary, #EFE1C6);
}

.btn-wishlist-detail {
  background: #FAF8F4;
  color: #7A6A55;
  border: 1px solid rgba(140, 109, 63, 0.25);
  font-size: 0.88rem;
  font-weight: 600;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-wishlist-detail:hover {
  border-color: #D32F2F;
  color: #D32F2F;
  background: #FFF1F0;
}

.btn-wishlist-detail.active {
  border-color: #D32F2F;
  color: #D32F2F;
  background: #FFF1F0;
  font-weight: 700;
}

.guarantee-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.g-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-text, #2B2116);
  font-weight: 600;
}

.g-item svg {
  color: var(--color-primary, #8C6D3F);
  flex-shrink: 0;
}

.desc-section h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 8px;
}

.desc-section p {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.6;
}

@media (max-width: 800px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
