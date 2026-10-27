<template>
  <div class="wishlist-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Wishlist Favorit Saya</span>
      </div>

      <div class="page-header">
        <div class="title-wrap">
          <h1 class="page-title">Daftar Produk Favorit (Wishlist)</h1>
          <p class="page-subtitle">
            Simpan barang ready stock dan produk jastip incaran Anda sebelum kehabisan stok atau kuota PO tutup.
          </p>
        </div>

        <!-- Guest Warning Banner -->
        <div v-if="!isAuthenticated && displayItems.length > 0" class="guest-banner">
          <div class="gb-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Wishlist ini disimpan sementara di browser Anda. Masuk ke akun Anda agar daftar favorit tersimpan permanen.</span>
          </div>
          <NuxtLink to="/login" class="btn-gb-login">Masuk Akun</NuxtLink>
        </div>

        <!-- Filter Tabs -->
        <div v-if="displayItems.length > 0" class="filter-tabs-row">
          <div class="tabs-group">
            <button 
              class="tab-pill" 
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'"
            >
              Semua ({{ displayItems.length }})
            </button>
            <button 
              class="tab-pill" 
              :class="{ active: activeFilter === 'ready' }"
              @click="activeFilter = 'ready'"
            >
              Ready Stock ({{ readyItemsCount }})
            </button>
            <button 
              class="tab-pill" 
              :class="{ active: activeFilter === 'jastip' }"
              @click="activeFilter = 'jastip'"
            >
              Jastip PO ({{ jastipItemsCount }})
            </button>
          </div>

          <label class="toggle-available-label">
            <input type="checkbox" v-model="onlyAvailable" />
            <span>Hanya yang Dapat Dibeli</span>
          </label>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat daftar wishlist favorit Anda...</p>
      </div>

      <!-- Wishlist Grid -->
      <div v-else-if="filteredItems.length > 0" class="wishlist-grid">
        <div 
          v-for="item in filteredItems" 
          :key="item.productId" 
          class="wish-card"
          :class="{ 'item-unavailable': !item.isAvailable }"
        >
          <div class="wish-image-wrap">
            <img :src="item.image" :alt="item.name" loading="lazy" />
            
            <!-- Type Pill -->
            <span v-if="item.productType === 'ready'" class="pill-ready">
              Ready Stock
            </span>
            <span v-else class="pill-jastip">
              {{ item.trip?.flag || '✈️' }} Jastip {{ item.trip?.country || '' }}
            </span>

            <!-- Availability Status Pill -->
            <span class="pill-availability" :class="{ available: item.isAvailable, closed: !item.isAvailable }">
              {{ item.availabilityReason }}
            </span>

            <!-- Full Heart Button (Click to remove from wishlist) -->
            <button 
              class="btn-remove-circle" 
              @click="handleRemove(item.productId, item.name)" 
              title="Hapus dari wishlist"
              aria-label="Hapus dari wishlist"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#E53935" stroke="#E53935" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <div class="wish-info">
            <span class="cat-text">{{ item.category }}</span>
            <h3 class="prod-title" :title="item.name">
              <NuxtLink :to="getProductDetailLink(item)">
                {{ item.name }}
              </NuxtLink>
            </h3>

            <div class="price-wrap">
              <span class="price-val">{{ formatRupiah(item.price) }}</span>
              <span v-if="item.originalPrice && item.originalPrice > item.price" class="original-price">
                {{ formatRupiah(item.originalPrice) }}
              </span>
            </div>

            <!-- Action Buttons Grid -->
            <div class="action-grid">
              <!-- Primary: Beli Sekarang or Disabled Button -->
              <NuxtLink 
                v-if="item.isAvailable" 
                :to="`/checkout?productId=${item.productId}&qty=1`" 
                class="btn-buy-active"
              >
                Beli Sekarang &rarr;
              </NuxtLink>
              <button 
                v-else 
                disabled 
                class="btn-buy-disabled" 
                :title="item.productType === 'ready' ? 'Stok barang ini sedang habis' : 'Jadwal PO untuk trip jastip ini telah ditutup'"
              >
                {{ item.productType === 'ready' ? 'Stok Habis' : 'PO Ditutup' }}
              </button>

              <!-- Secondary Row: Chat Admin & Detail Link -->
              <div class="action-sub-row">
                <button 
                  class="btn-chat-action" 
                  @click="handleChatWithAdmin(item)" 
                  title="Kirim produk ini ke Live Chat Admin"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Chat Admin</span>
                </button>
                <NuxtLink :to="getProductDetailLink(item)" class="btn-detail-action">
                  Detail
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Empty State (when items exist but filter returns 0) -->
      <div v-else-if="displayItems.length > 0" class="empty-state">
        <p>Tidak ada produk favorit yang cocok dengan filter yang Anda pilih.</p>
        <button class="btn-reset-filter" @click="resetFilters">Reset Filter</button>
      </div>

      <!-- Completely Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon-wrap">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D8B978" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3>Wishlist Anda Masih Kosong</h3>
        <p>Belum ada produk favorit yang Anda simpan. Temukan tas, baju, sepatu, dan aksesoris mewah impian Anda sekarang!</p>
        <div class="empty-cta-row">
          <NuxtLink to="/ready" class="btn-explore-ready">Katalog Ready Stock</NuxtLink>
          <NuxtLink to="/jastip" class="btn-explore-jastip">Jadwal Trip Jastip</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useWishlist, type WishlistItem } from '../composables/useWishlist'
import { useCustomerChat } from '../composables/useCustomerChat'
import { useToast } from '../composables/useToast'
import type { ApiProduct } from '../composables/useProducts'

const { isAuthenticated } = useAuth()
const { wishlistItems, wishlistProductIds, removeWishlist, fetchWishlist } = useWishlist()
const { openChatWithProduct } = useCustomerChat()
const { showToast } = useToast()

const isLoading = ref(true)
const activeFilter = ref<'all' | 'ready' | 'jastip'>('all')
const onlyAvailable = ref(false)

// For guest users, if wishlistItems is empty but wishlistProductIds has IDs, load product details from API
const guestProducts = ref<WishlistItem[]>([])

onMounted(async () => {
  isLoading.value = true
  try {
    await fetchWishlist()

    // If guest and we have saved IDs in localStorage, fetch their product info
    if (!isAuthenticated.value && wishlistProductIds.value.length > 0) {
      const { data: allProds } = await useFetch<ApiProduct[]>('/api/products')
      if (allProds.value) {
        const idSet = new Set(wishlistProductIds.value)
        const matched = allProds.value.filter(p => idSet.has(p.id))
        guestProducts.value = matched.map(p => ({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          productType: p.productType,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice || null,
          stockStatus: p.inStock ? 'in_stock' : 'out_of_stock',
          image: p.image,
          isAvailable: p.productType === 'ready' ? p.inStock : true,
          availabilityReason: p.productType === 'ready' 
            ? (p.inStock ? 'Ready Stock' : 'Stok Habis')
            : (p.trip?.country ? `Jastip PO ${p.trip.country}` : 'Jastip PO'),
          trip: p.trip ? {
            id: p.trip.id,
            title: p.trip.title,
            slug: p.trip.slug,
            country: p.trip.country,
            flag: p.trip.flag || '✈️',
            status: p.trip.status || 'open',
            closeDate: p.trip.closeDate || ''
          } : null
        }))
      }
    }
  } finally {
    isLoading.value = false
  }
})

const displayItems = computed<WishlistItem[]>(() => {
  if (isAuthenticated.value) {
    return wishlistItems.value || []
  }
  return guestProducts.value.filter(item => wishlistProductIds.value.includes(item.productId))
})

const readyItemsCount = computed(() => {
  return displayItems.value.filter(i => i.productType === 'ready').length
})

const jastipItemsCount = computed(() => {
  return displayItems.value.filter(i => i.productType === 'jastip').length
})

const filteredItems = computed(() => {
  return displayItems.value.filter(item => {
    // Filter by type
    if (activeFilter.value === 'ready' && item.productType !== 'ready') return false
    if (activeFilter.value === 'jastip' && item.productType !== 'jastip') return false

    // Filter by availability
    if (onlyAvailable.value && !item.isAvailable) return false

    return true
  })
})

const handleRemove = async (productId: number, name: string) => {
  await removeWishlist(productId)
  guestProducts.value = guestProducts.value.filter(p => p.productId !== productId)
}

const handleChatWithAdmin = (item: WishlistItem) => {
  openChatWithProduct({
    id: String(item.productId),
    name: item.name,
    price: item.price,
    image: item.image,
    category: item.category
  } as any)
}

const getProductDetailLink = (item: WishlistItem) => {
  if (item.productType === 'ready') {
    return `/ready/${item.slug}`
  }
  const tripSlug = item.trip?.slug || 'trip'
  return `/jastip/${tripSlug}/${item.slug}`
}

const resetFilters = () => {
  activeFilter.value = 'all'
  onlyAvailable.value = false
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}
</script>

<style scoped>
.wishlist-page {
  padding: 30px 20px 70px;
  min-height: 80vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 22px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
  transition: color 0.15s;
}

.breadcrumb a:hover {
  color: var(--color-primary, #8C6D3F);
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-header {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
}

/* Guest Warning Banner */
.guest-banner {
  background: #FFFBF0;
  border: 1px solid #FFE082;
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 0.85rem;
  color: #7A5210;
}

.gb-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gb-left svg {
  color: #F59E0B;
  flex-shrink: 0;
}

.btn-gb-login {
  background: #8C6D3F;
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 6px 14px;
  border-radius: 6px;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-gb-login:hover {
  background: #73572E;
}

/* Filter Tabs Row */
.filter-tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 6px;
}

.tabs-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-pill {
  background: #ffffff;
  border: 1px solid rgba(140, 109, 63, 0.2);
  color: #7A6A55;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-pill:hover {
  border-color: #8C6D3F;
  color: #2B2116;
}

.tab-pill.active {
  background: #8C6D3F;
  color: #ffffff;
  border-color: #8C6D3F;
  box-shadow: 0 2px 8px rgba(140, 109, 63, 0.25);
}

.toggle-available-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #2B2116;
  cursor: pointer;
  user-select: none;
}

.toggle-available-label input {
  accent-color: #8C6D3F;
  cursor: pointer;
}

/* Wishlist Grid */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}

.wish-card {
  background: #ffffff;
  border: 1px solid var(--brand-primary, #EFE1C6);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px -2px rgba(140, 109, 63, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.wish-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -4px rgba(140, 109, 63, 0.12);
  border-color: var(--brand-secondary, #D8B978);
}

.wish-card.item-unavailable {
  opacity: 0.88;
}

.wish-image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--brand-neutral, #FFFBF2);
  overflow: hidden;
}

.wish-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.wish-card:hover .wish-image-wrap img {
  transform: scale(1.04);
}

.pill-ready {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #059669;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.pill-jastip {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #8C6D3F;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.pill-availability {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  z-index: 2;
}

.pill-availability.available {
  background: rgba(255, 255, 255, 0.95);
  color: #2E7D32;
  border: 1px solid #A5D6A7;
}

.pill-availability.closed {
  background: #FFEBEE;
  color: #C62828;
  border: 1px solid #FFCDD2;
}

.btn-remove-circle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(229, 57, 53, 0.25);
  color: #E53935;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.btn-remove-circle:hover {
  transform: scale(1.15);
  background: #FFF1F0;
  border-color: #E53935;
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.2);
}

.btn-remove-circle svg {
  transition: transform 0.2s ease;
}

.btn-remove-circle:hover svg {
  transform: scale(0.9);
}

.wish-info {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-text {
  font-size: 0.7rem;
  color: #8C6D3F;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.prod-title {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 10px;
}

.prod-title a {
  text-decoration: none;
  color: #2B2116;
  transition: color 0.15s;
}

.prod-title a:hover {
  color: #8C6D3F;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 14px;
}

.price-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: #8C6D3F;
}

.original-price {
  font-size: 0.8rem;
  color: #9E8E7A;
  text-decoration: line-through;
}

/* Action Buttons Grid */
.action-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-buy-active {
  display: block;
  text-align: center;
  background: #8C6D3F;
  color: #ffffff;
  text-decoration: none;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(140, 109, 63, 0.2);
  transition: all 0.15s;
}

.btn-buy-active:hover {
  background: #73572E;
  transform: translateY(-1px);
}

.btn-buy-disabled {
  display: block;
  width: 100%;
  text-align: center;
  background: #E8E3DA;
  color: #8C8273;
  border: 1px solid #D6CEBE;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: not-allowed;
}

.action-sub-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 8px;
}

.btn-chat-action {
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.25);
  color: #2B2116;
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-chat-action:hover {
  background: #EFE1C6;
  color: #8C6D3F;
}

.btn-detail-action {
  text-align: center;
  text-decoration: none;
  background: #ffffff;
  border: 1px solid rgba(43, 33, 22, 0.18);
  color: #7A6A55;
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.15s;
}

.btn-detail-action:hover {
  background: #FAF8F4;
  color: #2B2116;
}

/* Empty & Loading States */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border: 1px solid rgba(140, 109, 63, 0.15);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(140, 109, 63, 0.2);
  border-top-color: #8C6D3F;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 14px;
}

.empty-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2B2116;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 0.88rem;
  color: #7A6A55;
  max-width: 440px;
  margin: 0 0 20px;
  line-height: 1.5;
}

.empty-cta-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-explore-ready {
  background: #8C6D3F;
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 10px 18px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-explore-ready:hover {
  background: #73572E;
}

.btn-explore-jastip {
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.3);
  color: #8C6D3F;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 10px 18px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-explore-jastip:hover {
  background: #EFE1C6;
}

.btn-reset-filter {
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.3);
  color: #8C6D3F;
  font-weight: 700;
  font-size: 0.84rem;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .guest-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
