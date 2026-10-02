<template>
  <div class="home-page">
    <!-- Active Jastip Trip Banner (Top Hero) -->
    <section v-if="activeTrip" class="hero-trip-section">
      <div class="trip-banner" :style="{ backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.65), rgba(30, 41, 59, 0.75)), url(${activeTrip.coverImageUrl})` }">
        <div class="banner-badge-row">
          <span class="pulse-dot"></span>
          <span class="trip-status-badge">Jadwal Jastip Sedang Buka (Open PO)</span>
          <span class="trip-country-tag">{{ activeTrip.flag }} {{ activeTrip.country }}</span>
        </div>

        <h1 class="trip-title">{{ activeTrip.title }}</h1>
        <p class="trip-dest">{{ activeTrip.cityOrArea }}</p>

        <div class="trip-meta-row">
          <div class="meta-item">
            <span class="meta-lbl">Batas Pesanan (Close PO):</span>
            <span class="meta-val">{{ formatDate(activeTrip.closeDate) }}</span>
          </div>
          <div class="meta-divider">|</div>
          <div class="meta-item">
            <span class="meta-lbl">Estimasi Barang Tiba:</span>
            <span class="meta-val">{{ formatDate(activeTrip.estimatedArrivalDate) }}</span>
          </div>
        </div>

        <!-- Countdown Timer -->
        <div class="countdown-card">
          <span class="cd-label">Sisa Waktu Pemesanan:</span>
          <div class="cd-timers">
            <div class="cd-box"><span class="num">12</span><span class="unit">Hari</span></div>
            <span class="colon">:</span>
            <div class="cd-box"><span class="num">04</span><span class="unit">Jam</span></div>
            <span class="colon">:</span>
            <div class="cd-box"><span class="num">18</span><span class="unit">Menit</span></div>
          </div>
          <NuxtLink :to="`/jastip/${activeTrip.slug}`" class="banner-cta-btn">
            Buka Jadwal & Titip Barang
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Main Content: Ready Stock Catalog -->
    <main class="main-catalog-container">
      <div class="section-header">
        <div class="title-wrap">
          <div class="ready-pill">
            <span class="green-indicator"></span>
            SIAP KIRIM / AMBIL LANGSUNG
          </div>
          <h2 class="section-title">Katalog Ready Stock</h2>
          <p class="section-desc">
            Seluruh barang di bawah ini memiliki stok fisik di toko dbb_luxe Jakarta. Bisa langsung dibeli dan diambil hari ini tanpa menunggu jadwal trip jastip.
          </p>
        </div>

        <!-- Shortcut to All Jastip Trips -->
        <NuxtLink to="/jastip" class="view-jastip-link">
          <span>Ingin titip barang luar negeri? <strong>Lihat Semua Jadwal Jastip &rarr;</strong></span>
        </NuxtLink>
      </div>

      <!-- Categories & Controls -->
      <div class="controls-bar">
        <div class="category-tabs">
          <button 
            v-for="cat in categories" 
            :key="cat"
            class="cat-tab"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="filter-count">
          Menampilkan <strong>{{ filteredProducts.length }}</strong> barang ready
        </div>
      </div>

      <!-- Ready Stock Products Grid -->
      <div v-if="filteredProducts.length > 0" class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card"
        >
          <div class="card-thumb">
            <img :src="product.image" :alt="product.name" loading="lazy" />
            <span class="badge-stock-ready">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Ready Stock
            </span>
            <span class="badge-country">{{ product.flag }} {{ product.country }}</span>
          </div>

          <div class="card-info">
            <span class="card-cat">{{ product.category }}</span>
            <NuxtLink :to="`/ready/${product.slug}`" class="card-name-link">
              <h3 class="card-title">{{ product.name }}</h3>
            </NuxtLink>

            <div class="card-stock-row">
              <span class="stock-label">Stok Tersedia:</span>
              <span class="stock-qty">{{ product.stockQuantity }} pcs</span>
            </div>

            <div class="card-price-row">
              <div class="price-val">{{ formatRupiah(product.price) }}</div>
            </div>

            <div class="card-actions">
              <NuxtLink :to="`/ready/${product.slug}`" class="btn-detail">
                Lihat Detail
              </NuxtLink>
              <NuxtLink :to="`/checkout?productId=${product.id}&qty=1`" class="btn-buy">
                Beli Langsung
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>Belum ada produk ready pada kategori ini.</p>
        <button class="btn-reset" @click="selectedCategory = 'Semua'">Lihat Semua Produk</button>
      </div>

      <!-- Bottom Banner: Request Jastip -->
      <section class="request-cta-banner">
        <div class="request-content">
          <span class="request-tag">Punya Barang Impian?</span>
          <h3>Barang yang Anda cari belum ada di katalog?</h3>
          <p>Kirimkan foto atau link produk luar negeri yang Anda inginkan. Admin kami akan mengecek di toko fisik dan memberikan penawaran harga terbaik.</p>
        </div>
        <NuxtLink to="/request" class="request-btn">
          Ajukan Request Titip Barang
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockJastipTrips, mockUnifiedProducts } from '../data/mockJastipData'

const activeTrip = computed(() => {
  return mockJastipTrips.find(t => t.status === 'open') || mockJastipTrips[0]
})

const categories = ['Semua', 'Skincare & Kecantikan', 'Makanan & Snack', 'Fashion & Pakaian', 'Tas & Aksesoris']
const selectedCategory = ref('Semua')

const readyProducts = computed(() => {
  return mockUnifiedProducts.filter(p => p.productType === 'ready')
})

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'Semua') {
    return readyProducts.value
  }
  return readyProducts.value.filter(p => p.category === selectedCategory.value)
})

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

/* Hero Section */
.hero-trip-section {
  max-width: 1240px;
  margin: 20px auto 0;
  padding: 0 20px;
}

.trip-banner {
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  padding: 36px 32px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}

.trip-status-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.trip-country-tag {
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.76rem;
  font-weight: 600;
}

.trip-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
  line-height: 1.2;
}

.trip-dest {
  font-size: 0.95rem;
  color: #E2E8F0;
  margin-bottom: 20px;
}

.trip-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #CBD5E1;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.meta-val {
  color: #ffffff;
  font-weight: 700;
  margin-left: 4px;
}

.countdown-card {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cd-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #E2E8F0;
}

.cd-timers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cd-box {
  background: #ffffff;
  color: var(--color-primary, #4A5D73);
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}

.cd-box .num {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.1;
}

.cd-box .unit {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  text-transform: uppercase;
}

.colon {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}

.banner-cta-btn {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.banner-cta-btn:hover {
  background: var(--color-primary-hover, #384759);
  transform: translateY(-1px);
}

/* Main Catalog Area */
.main-catalog-container {
  max-width: 1240px;
  margin: 40px auto 0;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  gap: 20px;
  flex-wrap: wrap;
}

.ready-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  background: var(--color-ready-bg, #DCFCE7);
  color: var(--color-ready, #059669);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.green-indicator {
  width: 6px;
  height: 6px;
  background: var(--color-ready, #059669);
  border-radius: 50%;
}

.section-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.section-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted, #64748B);
  max-width: 650px;
  line-height: 1.5;
}

.view-jastip-link {
  text-decoration: none;
  font-size: 0.88rem;
  color: var(--color-primary, #4A5D73);
  padding: 8px 14px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.15s;
}

.view-jastip-link:hover {
  background: var(--color-secondary, #E4E7EB);
}

/* Controls Bar */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cat-tab {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.cat-tab:hover {
  border-color: var(--color-primary, #4A5D73);
  color: var(--color-primary, #4A5D73);
}

.cat-tab.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.filter-count {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 22px;
}

.product-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(74, 93, 115, 0.12);
  border-color: var(--color-secondary-dark, #CBD2D9);
}

.card-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f1f5f9;
  overflow: hidden;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .card-thumb img {
  transform: scale(1.04);
}

.badge-stock-ready {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--color-ready, #059669);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-country {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text, #1E293B);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 6px;
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-cat {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.card-name-link {
  text-decoration: none;
  color: inherit;
}

.card-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-name-link:hover .card-title {
  color: var(--color-primary, #4A5D73);
}

.card-stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 8px;
}

.stock-qty {
  font-weight: 700;
  color: var(--color-ready, #059669);
}

.card-price-row {
  margin-top: auto;
  margin-bottom: 14px;
}

.price-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-detail {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary, #4A5D73);
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-detail:hover {
  background: var(--color-secondary, #E4E7EB);
}

.btn-buy {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--color-primary, #4A5D73);
  padding: 8px;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-buy:hover {
  background: var(--color-primary-hover, #384759);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  color: var(--color-text-muted, #64748B);
}

.btn-reset {
  margin-top: 12px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* Request CTA Banner */
.request-cta-banner {
  margin-top: 50px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-left: 4px solid var(--color-primary, #4A5D73);
  border-radius: 12px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.request-content {
  flex: 1;
  min-width: 280px;
}

.request-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.request-content h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin: 4px 0 6px;
}

.request-content p {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.5;
}

.request-btn {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 8px;
  white-space: nowrap;
  transition: all 0.15s;
}

.request-btn:hover {
  background: var(--color-primary-hover, #384759);
}

@media (max-width: 768px) {
  .trip-title {
    font-size: 1.5rem;
  }
  .countdown-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
