<template>
  <div class="trip-detail-page" v-if="trip">
    <div class="page-container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <NuxtLink to="/jastip">Jadwal Jastip</NuxtLink>
        <span>/</span>
        <span class="active">{{ trip.title }}</span>
      </div>

      <!-- Trip Hero Banner -->
      <div class="trip-hero" :style="{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(${trip.coverImageUrl})` }">
        <div class="hero-top">
          <span class="country-pill">{{ trip.flag }} {{ trip.country }} &bull; {{ trip.cityOrArea }}</span>
          <span v-if="trip.status === 'open'" class="open-pill">Open PO Sedang Buka</span>
          <span v-else class="closed-pill">Tutup PO</span>
        </div>

        <h1 class="hero-title">{{ trip.title }}</h1>
        <p class="hero-desc">{{ trip.description }}</p>

        <!-- Stats Bar -->
        <div class="hero-stats-row">
          <div class="stat-card">
            <span class="s-label">Tutup PO</span>
            <strong class="s-value">{{ formatDate(trip.closeDate) }}</strong>
          </div>
          <div class="stat-card">
            <span class="s-label">Estimasi Tiba di Indo</span>
            <strong class="s-value">{{ formatDate(trip.estimatedArrivalDate) }}</strong>
          </div>
          <div class="stat-card">
            <span class="s-label">Kurs Valuta Asing</span>
            <strong class="s-value">1 {{ trip.currency }} = Rp {{ trip.exchangeRate.toLocaleString('id-ID') }}</strong>
          </div>
          <div class="stat-card">
            <span class="s-label">Sisa Kuota Titip</span>
            <strong class="s-value">{{ trip.quotaTotal - trip.quotaFilled }} slot</strong>
          </div>
        </div>
      </div>

      <!-- Section Title & Request Button -->
      <div class="catalog-section-bar">
        <div>
          <h2 class="sub-title">Katalog Titip Beli dari {{ trip.country }}</h2>
          <p class="sub-desc">Pilih produk resmi luar negeri di bawah ini untuk dititipkan pada trip ini.</p>
        </div>

        <NuxtLink :to="`/request?tripId=${trip.id}`" class="btn-request-trip">
          + Titip Barang Lain dari {{ trip.country }}
        </NuxtLink>
      </div>

      <!-- Products Grid -->
      <div v-if="tripProducts.length > 0" class="products-grid">
        <div 
          v-for="product in tripProducts" 
          :key="product.id"
          class="jastip-prod-card"
        >
          <div class="card-thumb">
            <img :src="product.image" :alt="product.name" />
            <span class="badge-source">{{ product.sourceStore || 'Store Resmi' }}</span>
          </div>

          <div class="card-body">
            <span class="cat-pill">{{ product.category }}</span>
            <NuxtLink :to="`/jastip/${trip.slug}/${product.slug}`" class="title-link">
              <h3 class="prod-title">{{ product.name }}</h3>
            </NuxtLink>

            <div class="currency-info">
              <span>Harga Asli: <strong>{{ product.originalCurrency }} {{ product.originalPrice?.toLocaleString('id-ID') }}</strong></span>
            </div>

            <div class="price-wrap">
              <span class="price-lbl">Estimasi Harga Bersih (IDR):</span>
              <div class="price-val">{{ formatRupiah(product.price) }}</div>
            </div>

            <div class="btn-group">
              <NuxtLink :to="`/jastip/${trip.slug}/${product.slug}`" class="btn-see-detail">
                Lihat Rincian
              </NuxtLink>
              <NuxtLink 
                v-if="trip.status === 'open'" 
                :to="`/checkout?productId=${product.id}&qty=1&tripId=${trip.id}`" 
                class="btn-po"
              >
                Titip Sekarang
              </NuxtLink>
              <span v-else class="btn-disabled">PO Tutup</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-products">
        <p>Belum ada produk katalog khusus yang ditambahkan untuk trip ini.</p>
        <NuxtLink to="/request" class="btn-req">Ajukan Request Titip Pertama</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mockJastipTrips, mockUnifiedProducts } from '../../../data/mockJastipData'

const route = useRoute()
const tripSlug = route.params.tripSlug as string

const trip = computed(() => {
  return mockJastipTrips.find(t => t.slug === tripSlug) || mockJastipTrips[0]
})

const tripProducts = computed(() => {
  return mockUnifiedProducts.filter(p => p.productType === 'jastip' && (p.tripSlug === tripSlug || p.tripId === trip.value.id))
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
.trip-detail-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 16px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.trip-hero {
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  padding: 36px 30px;
  color: #ffffff;
  margin-bottom: 40px;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.country-pill {
  background: rgba(0, 0, 0, 0.45);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
}

.open-pill {
  background: #10B981;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
}

.closed-pill {
  background: #64748B;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.2;
}

.hero-desc {
  font-size: 0.95rem;
  color: #E2E8F0;
  max-width: 800px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.hero-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 12px 16px;
  border-radius: 10px;
}

.s-label {
  display: block;
  font-size: 0.74rem;
  color: #CBD5E1;
  margin-bottom: 2px;
}

.s-value {
  font-size: 0.95rem;
  color: #ffffff;
}

.catalog-section-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.sub-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.sub-desc {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
}

.btn-request-trip {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-request-trip:hover {
  background: var(--color-primary-hover, #384759);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}

.jastip-prod-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.jastip-prod-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(74, 93, 115, 0.12);
}

.card-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f1f5f9;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-source {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.8);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-pill {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.title-link {
  text-decoration: none;
  color: inherit;
}

.prod-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.currency-info {
  font-size: 0.76rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 12px;
}

.price-wrap {
  margin-top: auto;
  margin-bottom: 14px;
}

.price-lbl {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

.price-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
}

.btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-see-detail {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary, #4A5D73);
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px;
  border-radius: 6px;
}

.btn-po {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--color-primary, #4A5D73);
  padding: 8px;
  border-radius: 6px;
}

.btn-disabled {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94A3B8;
  background: #E2E8F0;
  padding: 8px;
  border-radius: 6px;
}

.empty-products {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
}

.btn-req {
  display: inline-block;
  margin-top: 12px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
}
</style>
