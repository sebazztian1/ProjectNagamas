<template>
  <div class="home-page">
    <!-- Active Jastip Trip Banner (Top Hero) - Clean Luxury Card Without Background Image -->
    <section v-if="activeTrip" class="hero-trip-section">
      <div class="trip-banner">
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
          <div class="meta-divider">&bull;</div>
          <div class="meta-item">
            <span class="meta-lbl">Estimasi Barang Tiba:</span>
            <span class="meta-val">{{ formatDate(activeTrip.estimatedArrivalDate) }}</span>
          </div>
        </div>

        <!-- Countdown Timer -->
        <div class="countdown-card">
          <div class="cd-left">
            <span class="cd-label">Sisa Waktu Pemesanan:</span>
            <div class="cd-timers">
              <div class="cd-box"><span class="num">12</span><span class="unit">Hari</span></div>
              <span class="colon">:</span>
              <div class="cd-box"><span class="num">04</span><span class="unit">Jam</span></div>
              <span class="colon">:</span>
              <div class="cd-box"><span class="num">18</span><span class="unit">Menit</span></div>
            </div>
          </div>
          <NuxtLink :to="`/jastip/${activeTrip.slug}`" class="banner-cta-btn">
            Buka Jadwal &amp; Titip Barang
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Carousel Section (Underneath Banner) -->
    <section class="hero-carousel-section">
      <div 
        class="carousel-container" 
        @mouseenter="pauseAutoplay" 
        @mouseleave="startAutoplay"
      >
        <div class="carousel-track-wrapper">
          <div 
            class="carousel-track" 
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div 
              v-for="slide in carouselSlides" 
              :key="slide.id"
              class="carousel-slide"
            >
              <div class="slide-card">
                <div class="slide-content">
                  <div class="slide-badge-row">
                    <span class="slide-tag">{{ slide.tag }}</span>
                    <span class="slide-country">{{ slide.flag }} {{ slide.country }}</span>
                  </div>

                  <h2 class="slide-title">{{ slide.title }}</h2>
                  <p class="slide-subtitle">{{ slide.subtitle }}</p>

                  <div class="slide-meta-row" v-if="slide.badgeText || slide.dates">
                    <span v-if="slide.badgeText" class="meta-pill highlight">{{ slide.badgeText }}</span>
                    <span v-if="slide.dates" class="meta-pill">{{ slide.dates }}</span>
                  </div>

                  <NuxtLink :to="slide.link" class="slide-cta-btn">
                    {{ slide.buttonText }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </NuxtLink>
                </div>

                <div class="slide-media">
                  <img :src="slide.image" :alt="slide.title" loading="lazy" />
                  <div class="slide-media-gradient"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Navigation Controls -->
        <div class="carousel-controls">
          <button class="nav-arrow prev" @click="prevSlide" aria-label="Slide sebelumnya" title="Sebelumnya">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="carousel-dots">
            <button 
              v-for="(_, idx) in carouselSlides" 
              :key="idx"
              class="dot-indicator"
              :class="{ active: currentSlide === idx }"
              @click="goToSlide(idx)"
              :aria-label="`Pindah ke slide ${idx + 1}`"
            ></button>
          </div>

          <button class="nav-arrow next" @click="nextSlide" aria-label="Slide berikutnya" title="Berikutnya">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content: Ready Stock Catalog -->
    <main class="main-catalog-container">
      <div class="section-header">
        <div class="title-wrap">
          <div class="ready-pill">
            <span class="gold-indicator"></span>
            READY STOCK &bull; SIAP KIRIM KE SELURUH INDONESIA
          </div>
          <h2 class="section-title">Katalog Ready Stock</h2>
          <p class="section-desc">
            Seluruh barang di bawah ini tersedia di warehouse dbb_luxe Jakarta. Siap diproses dan langsung dikirim ke alamat Anda tanpa menunggu jadwal trip jastip.
          </p>
        </div>

        <!-- Shortcut to All Jastip Trips -->
        <NuxtLink to="/jastip" class="view-jastip-link">
          <span>Ingin titip barang luar negeri? <strong>Lihat Jadwal Jastip &rarr;</strong></span>
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
          <NuxtLink :to="`/ready/${product.slug}`" class="card-thumb-link">
            <div class="card-thumb">
              <img :src="product.image" :alt="product.name" loading="lazy" />
              <span class="badge-stock-ready">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Ready Stock
              </span>
              <span class="badge-country">{{ product.flag }} {{ product.country }}</span>
            </div>
          </NuxtLink>

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
                Detail
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
          <h3 class="request-heading">Barang yang Anda cari belum ada di katalog?</h3>
          <p class="request-sub">Kirimkan foto atau link produk luar negeri yang Anda inginkan. Admin kami akan mengecek langsung di toko fisik luar negeri dan memberikan penawaran harga terbaik.</p>
        </div>
        <NuxtLink to="/request" class="request-btn">
          Ajukan Request Titip Barang &rarr;
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { mockJastipTrips, mockUnifiedProducts } from '../data/mockJastipData'

const activeTrip = computed(() => {
  return mockJastipTrips.find(t => t.status === 'open') || mockJastipTrips[0]
})

// Carousel Data & State
interface CarouselSlide {
  id: string
  title: string
  subtitle: string
  tag: string
  country: string
  flag: string
  image: string
  link: string
  buttonText: string
  badgeText?: string
  dates?: string
}

const currentSlide = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const carouselSlides = ref<CarouselSlide[]>([
  {
    id: 'slide-1',
    title: 'Japan Autumn Special Trip 2026',
    subtitle: 'Titip snack Tokyo Station, kosmetik drugstore Ginza, anime eksklusif, dan outerwear Uniqlo Japan.',
    tag: 'Sedang Buka (Open PO)',
    country: 'Jepang',
    flag: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    link: '/jastip/japan-autumn-trip',
    buttonText: 'Lihat Katalog Trip Jepang',
    badgeText: 'Close PO 20 Okt 2026',
    dates: 'Estimasi Tiba: 2 Nov 2026'
  },
  {
    id: 'slide-2',
    title: 'Korea K-Beauty & Fashion Trip',
    subtitle: 'Skincare viral Olive Young (Torriden, Anua, Medicube) dan fashion brand lokal Seongsu Seoul.',
    tag: 'Sedang Buka (Open PO)',
    country: 'Korea Selatan',
    flag: '🇰🇷',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80',
    link: '/jastip/korea-k-beauty-trip',
    buttonText: 'Lihat Katalog Trip Korea',
    badgeText: 'Close PO 28 Okt 2026',
    dates: 'Estimasi Tiba: 12 Nov 2026'
  },
  {
    id: 'slide-3',
    title: 'Bangkok Mega Fashion & Big C Snack',
    subtitle: 'Baju santai linen Platinum Fashion Mall, cemilan rumput laut Tao Kae Noi, dan Cha Tra Mue tea.',
    tag: 'Open PO Batch 4',
    country: 'Thailand',
    flag: '🇹🇭',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    link: '/jastip/bangkok-snack-fashion',
    buttonText: 'Lihat Katalog Trip Bangkok',
    badgeText: 'Close PO 15 Nov 2026',
    dates: 'Estimasi Tiba: 25 Nov 2026'
  },
  {
    id: 'slide-4',
    title: 'Punya Barang Impian dari Toko Lain?',
    subtitle: 'Kirim foto atau link produk luar negeri yang Anda inginkan. Admin kami akan cek langsung di toko fisik.',
    tag: 'Konsultasi Gratis',
    country: 'Request Kustom',
    flag: '✨',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    link: '/request',
    buttonText: 'Ajukan Request Titip',
    badgeText: 'Pengecekan Fisik Langsung',
    dates: 'Penawaran Harga Transparan'
  }
])

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + carouselSlides.value.length) % carouselSlides.value.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    nextSlide()
  }, 5000)
}

const pauseAutoplay = () => {
  stopAutoplay()
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
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
  padding-bottom: 80px;
}

/* Hero Section */
.hero-trip-section {
  max-width: 1240px;
  margin: 24px auto 0;
  padding: 0 24px;
}

.trip-banner {
  background: linear-gradient(135deg, #1C140C 0%, #2A1F16 50%, #1A130C 100%);
  border-radius: var(--radius-lg);
  padding: 44px 44px 38px;
  color: #FFFBF2;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(216, 185, 120, 0.35);
  position: relative;
  overflow: hidden;
}

/* Hero Carousel Section */
.hero-carousel-section {
  max-width: 1240px;
  margin: 32px auto 0;
  padding: 0 24px;
}

.carousel-container {
  position: relative;
}

.carousel-track-wrapper {
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--brand-primary);
  background: #FFFFFF;
  box-shadow: var(--shadow-sm);
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
}

.slide-card {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  min-height: 340px;
  background: #FFFFFF;
}

.slide-content {
  padding: 40px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.slide-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.slide-tag {
  background: var(--brand-primary);
  color: var(--brand-accent);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  letter-spacing: 0.05em;
  border: 1px solid rgba(216, 185, 120, 0.4);
}

.slide-country {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.slide-title {
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(1.6rem, 2.5vw, 2.1rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.25;
  margin-bottom: 10px;
}

.slide-subtitle {
  font-size: 0.94rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 520px;
}

.slide-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.meta-pill {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--brand-neutral);
  color: var(--color-text-muted);
  border: 1px solid var(--brand-primary);
}

.meta-pill.highlight {
  background: #FDF3E0;
  color: var(--brand-accent);
  border-color: var(--brand-secondary);
  font-weight: 700;
}

.slide-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--brand-accent);
  color: #FFFBF2;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--brand-secondary);
  transition: all 0.2s ease;
}

.slide-cta-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -2px rgba(140, 109, 63, 0.35);
}

.slide-media {
  position: relative;
  overflow: hidden;
  background: var(--brand-neutral);
}

.slide-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.slide-card:hover .slide-media img {
  transform: scale(1.04);
}

.slide-media-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, transparent 40%);
  pointer-events: none;
}

/* Carousel Controls */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 8px;
}

.nav-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  color: var(--brand-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-subtle);
}

.nav-arrow:hover {
  background: var(--brand-accent);
  color: #FFFBF2;
  border-color: var(--brand-accent);
  transform: scale(1.05);
}

.carousel-dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot-indicator {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: var(--brand-secondary);
  opacity: 0.35;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.dot-indicator:hover {
  opacity: 0.7;
}

.dot-indicator.active {
  width: 26px;
  border-radius: 999px;
  background: var(--brand-accent);
  opacity: 1;
}

@media (max-width: 900px) {
  .slide-card {
    grid-template-columns: 1fr;
  }
  .slide-media {
    height: 220px;
    order: -1;
  }
  .slide-content {
    padding: 28px 24px;
  }
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--brand-secondary);
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(216, 185, 120, 0.3);
}

.trip-status-badge {
  background: rgba(255, 251, 242, 0.15);
  backdrop-filter: blur(8px);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #FFFBF2;
  border: 1px solid rgba(255, 251, 242, 0.25);
}

.trip-country-tag {
  background: rgba(28, 20, 12, 0.55);
  backdrop-filter: blur(6px);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--brand-primary);
  border: 1px solid rgba(216, 185, 120, 0.2);
}

.trip-title {
  font-size: clamp(2.2rem, 3.4vw, 3rem) !important;
  font-weight: 700 !important;
  color: #FFFBF2 !important;
  margin-bottom: 8px;
  line-height: 1.15;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.trip-dest {
  font-size: 1.05rem;
  color: var(--brand-secondary);
  font-weight: 500;
  margin-bottom: 24px;
}

.trip-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.9rem;
  color: #EFE1C6;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.meta-divider {
  color: var(--brand-secondary);
  opacity: 0.6;
}

.meta-val {
  color: #FFFBF2;
  font-weight: 700;
  margin-left: 6px;
}

.countdown-card {
  background: rgba(28, 20, 12, 0.72);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(216, 185, 120, 0.35);
  border-radius: var(--radius-md);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cd-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cd-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--brand-primary);
}

.cd-timers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cd-box {
  background: #FFFBF2;
  color: var(--brand-accent);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.cd-box .num {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.1;
}

.cd-box .unit {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.colon {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--brand-secondary);
}

.banner-cta-btn {
  background: var(--brand-accent);
  color: #FFFBF2;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  border: 1px solid var(--brand-secondary);
}

.banner-cta-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(140, 109, 63, 0.4);
}

/* Main Catalog Area */
.main-catalog-container {
  max-width: 1240px;
  margin: 56px auto 0;
  padding: 0 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  gap: 24px;
  flex-wrap: wrap;
}

.ready-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.74rem;
  font-weight: 700;
  background: var(--brand-primary);
  color: var(--brand-accent);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 10px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(216, 185, 120, 0.4);
}

.gold-indicator {
  width: 6px;
  height: 6px;
  background: var(--brand-secondary);
  border-radius: 50%;
}

.section-title {
  font-size: 2.1rem;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 0.94rem;
  color: var(--color-text-muted);
  max-width: 640px;
  line-height: 1.65;
}

.view-jastip-link {
  text-decoration: none;
  font-size: 0.88rem;
  color: var(--brand-accent);
  padding: 10px 18px;
  border: 1px solid var(--brand-secondary);
  border-radius: var(--radius-full);
  background: #FFFFFF;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-subtle);
}

.view-jastip-link:hover {
  background: var(--brand-primary);
  border-color: var(--brand-accent);
}

/* Controls Bar */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 20px;
  flex-wrap: wrap;
}

.category-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cat-tab {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  color: var(--color-text-muted);
  padding: 9px 18px;
  border-radius: var(--radius-full);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-subtle);
}

.cat-tab:hover {
  border-color: var(--brand-secondary);
  color: var(--brand-accent);
  background: var(--brand-neutral);
}

.cat-tab.active {
  background: var(--brand-accent);
  color: #FFFBF2;
  border-color: var(--brand-accent);
  box-shadow: 0 4px 14px -2px rgba(140, 109, 63, 0.35);
}

.filter-count {
  font-size: 0.88rem;
  color: var(--color-text-muted);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
  gap: 28px;
}

.product-card {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: var(--shadow-sm);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--brand-secondary);
}

.card-thumb-link {
  text-decoration: none;
  display: block;
}

.card-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--brand-neutral);
  overflow: hidden;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .card-thumb img {
  transform: scale(1.05);
}

.badge-stock-ready {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--color-ready-bg);
  color: var(--color-ready);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(59, 110, 72, 0.2);
}

.badge-country {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 251, 242, 0.94);
  backdrop-filter: blur(4px);
  color: var(--color-text);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--brand-primary);
}

.card-info {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-cat {
  font-size: 0.74rem;
  color: var(--brand-accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.card-name-link {
  text-decoration: none;
  color: inherit;
}

.card-title {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.45;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}

.card-name-link:hover .card-title {
  color: var(--brand-accent);
}

.card-stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.stock-qty {
  font-weight: 700;
  color: var(--color-ready);
}

.card-price-row {
  margin-top: auto;
  margin-bottom: 16px;
}

.price-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--brand-accent);
  letter-spacing: -0.01em;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 10px;
}

.btn-detail {
  text-decoration: none;
  text-align: center;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--brand-accent);
  background: var(--brand-neutral);
  border: 1px solid var(--brand-primary);
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.btn-detail:hover {
  background: var(--brand-primary);
  border-color: var(--brand-secondary);
}

.btn-buy {
  text-decoration: none;
  text-align: center;
  font-size: 0.84rem;
  font-weight: 600;
  color: #FFFBF2;
  background: var(--brand-accent);
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  border: 1px solid var(--brand-accent);
}

.btn-buy:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 72px 24px;
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}

.btn-reset {
  margin-top: 16px;
  background: var(--brand-accent);
  color: #FFFBF2;
  border: none;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-reset:hover {
  background: var(--color-primary-hover);
}

/* Request CTA Banner */
.request-cta-banner {
  margin-top: 72px;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #F6ECDA 100%);
  border: 1px solid var(--brand-secondary);
  border-radius: var(--radius-lg);
  padding: 38px 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);
}

.request-content {
  flex: 1;
  min-width: 280px;
}

.request-tag {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--brand-accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: inline-block;
  margin-bottom: 6px;
}

.request-heading {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
  line-height: 1.25;
}

.request-sub {
  font-size: 0.92rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 600px;
}

.request-btn {
  background: var(--brand-accent);
  color: #FFFBF2;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 13px 26px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid var(--brand-secondary);
}

.request-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(140, 109, 63, 0.35);
}

@media (max-width: 768px) {
  .trip-banner {
    padding: 32px 24px;
  }
  .trip-title {
    font-size: 1.8rem !important;
  }
  .countdown-card {
    flex-direction: column;
    align-items: stretch;
  }
  .banner-cta-btn {
    justify-content: center;
  }
  .request-cta-banner {
    padding: 28px 24px;
  }
}
</style>
