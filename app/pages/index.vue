<template>
  <div class="home-page">
    <!-- Hero Carousel Section (Includes Open Jastip Batch, New Arrivals, How to Order, Request Product) -->
    <section class="hero-carousel-section">
      <div
        class="carousel-container"
        @mouseenter="pauseAutoplay"
        @mouseleave="startAutoplay"
        @focusin="pauseAutoplay"
        @focusout="handleCarouselFocusOut"
        @touchstart.passive="pauseAutoplay"
        @touchend.passive="startAutoplay"
      >
        <div class="carousel-track-wrapper">
          <div
            class="carousel-track"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <!-- Slide 1: Open Jastip Batch (Terdekat Waktu) - Announcement Container Inside Carousel -->
            <div v-if="activeTrip" class="carousel-slide">
              <div class="trip-banner carousel-trip-banner">
                <div class="trip-banner-grid">
                  <div class="trip-banner-main">
                    <div class="banner-badge-row">
                      <span class="pulse-dot"></span>
                      <span class="trip-status-badge">Jadwal Jastip Sedang Buka (Open PO)</span>
                      <span class="trip-country-tag">{{ activeTrip.flag }} {{ activeTrip.country }}</span>
                    </div>

                    <h1 class="trip-title">{{ activeTrip.title }}</h1>
                    <p class="trip-dest">{{ activeTrip.cityOrArea || activeTrip.description }}</p>

                    <div class="trip-meta-row">
                      <div class="meta-item">
                        <span class="meta-lbl">Batas Pesanan (Close PO):</span>
                        <span class="meta-val">{{ formatDate(activeTrip.closeDate) }}</span>
                      </div>
                      <template v-if="activeTrip.estimatedArrivalDate">
                        <div class="meta-divider">&bull;</div>
                        <div class="meta-item">
                          <span class="meta-lbl">Estimasi Barang Tiba:</span>
                          <span class="meta-val">{{ formatDate(activeTrip.estimatedArrivalDate) }}</span>
                        </div>
                      </template>
                    </div>

                    <!-- Countdown Timer + Specific CTA -->
                    <div class="countdown-card">
                      <div class="cd-left">
                        <span class="cd-label">Sisa Waktu Pemesanan:</span>
                        <div class="cd-timers">
                          <div class="cd-box"><span class="num">{{ tripCountdown.days }}</span><span class="unit">Hari</span></div>
                          <span class="colon">:</span>
                          <div class="cd-box"><span class="num">{{ tripCountdown.hours }}</span><span class="unit">Jam</span></div>
                          <span class="colon">:</span>
                          <div class="cd-box"><span class="num">{{ tripCountdown.minutes }}</span><span class="unit">Menit</span></div>
                        </div>
                      </div>
                      <NuxtLink :to="`/jastip/${activeTrip.slug}`" class="banner-cta-btn">
                        Lihat Jastip {{ activeTrip.country }}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </NuxtLink>
                    </div>
                  </div>

                  <div class="trip-banner-media">
                    <img
                      :src="activeTrip.coverImageUrl || 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80'"
                      :alt="activeTrip.title"
                      loading="eager"
                      fetchpriority="high"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Slides 2, 3, 4: New Arrivals, How to Order Guide, Request a Product -->
            <div
              v-for="(slide, sIdx) in secondarySlides"
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
                  <img
                    :src="slide.image"
                    :alt="slide.title"
                    :loading="!activeTrip && sIdx === 0 ? 'eager' : 'lazy'"
                    :fetchpriority="!activeTrip && sIdx === 0 ? 'high' : 'auto'"
                    decoding="async"
                  />
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
              v-for="(_, idx) in totalSlidesCount"
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

    <!-- Main Content: Product Catalog by Category Rows (Alphabetical) -->
    <main class="main-catalog-container">
      <div v-if="categoryRows.length > 0" class="category-rows-wrapper">
        <section
          v-for="catRow in categoryRows"
          :key="catRow.name"
          class="category-row-section"
        >
          <div class="category-row-header">
            <h2 class="category-row-title">{{ catRow.name }}</h2>
            <NuxtLink
              :to="`/ready?category=${encodeURIComponent(catRow.name)}`"
              class="category-more-link"
            >
              <span>Lihat produk lainnya</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </NuxtLink>
          </div>

          <div class="category-row-box">
            <div class="products-grid">
              <div
                v-for="product in catRow.products"
                :key="product.id"
                class="product-card"
              >
                <NuxtLink :to="getProductLink(product)" class="card-thumb-link">
                  <div class="card-thumb">
                    <img :src="product.image" :alt="product.name" loading="lazy" />
                    <span v-if="product.productType === 'jastip'" class="badge-jastip">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                      </svg>
                      Jastip
                    </span>
                  </div>
                </NuxtLink>

                <div class="card-info">
                  <div class="card-meta-top">
                    <span class="card-cat">{{ product.category }}</span>
                    <span v-if="product.productType === 'jastip'" class="card-type-tag">Jastip</span>
                  </div>

                  <NuxtLink :to="getProductLink(product)" class="card-name-link">
                    <h3 class="card-title">{{ product.name }}</h3>
                  </NuxtLink>

                  <p v-if="product.productType === 'jastip' && product.trip?.title" class="card-trip-desc">
                    {{ product.trip.title }}
                  </p>

                  <div class="card-price-row">
                    <div class="price-val">{{ formatRupiah(product.price) }}</div>
                  </div>

                  <div class="card-actions">
                    <NuxtLink :to="`/checkout?productId=${product.id}&qty=1`" class="btn-buy">
                      {{ product.productType === 'jastip' ? 'Titip' : 'Beli' }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>Belum ada produk yang tersedia di katalog.</p>
      </div>

      <!-- Bottom Banner: Request Jastip -->
      <section class="request-cta-banner">
        <div class="request-content">
          <h3 class="request-heading">Barang yang dicari belum ada di katalog?</h3>
          <p class="request-sub">Kirimkan foto atau link produk luar negeri yang Anda inginkan untuk dicek langsung oleh admin.</p>
        </div>
        <NuxtLink to="/request" class="request-btn">
          Request Barang &rarr;
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { ApiProduct } from '../composables/useProducts'
import type { ApiTrip } from '../composables/useTrips'

const { data: openTrips } = await useFetch<ApiTrip[]>('/api/trips', {
  query: { status: 'open' }
})

const { data: dbCategories } = await useFetch<any[]>('/api/categories')
const { data: dbAllProducts } = await useFetch<ApiProduct[]>('/api/products')

const allProducts = computed(() => {
  return dbAllProducts.value || []
})

// 1. Open Jastip Batch (Terdekat Waktu)
const activeTrip = computed(() => {
  const list = [...(openTrips.value || [])]
  if (list.length === 0) return null
  list.sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime())
  return list[0] || null
})

const nowTimestamp = ref(Date.now())
let countdownInterval: ReturnType<typeof setInterval> | null = null

const tripCountdown = computed(() => {
  if (!activeTrip.value?.closeDate) {
    return { days: '00', hours: '00', minutes: '00' }
  }
  const diff = Math.max(0, new Date(activeTrip.value.closeDate).getTime() - nowTimestamp.value)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0')
  }
})

// 2. New Arrivals (Otomatis dari Ready Stok Terbaru)
const latestReadyProducts = computed(() => {
  const readyList = allProducts.value.filter(p => p.productType === 'ready' && p.inStock !== false)
  readyList.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (tB !== tA) return tB - tA
    return Number(b.id) - Number(a.id)
  })
  return readyList.slice(0, 3)
})

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

const secondarySlides = computed<CarouselSlide[]>(() => {
  const newestReady = latestReadyProducts.value[0]
  const readyNames = latestReadyProducts.value.map(p => p.name).join(', ')

  const newArrivalsSlide: CarouselSlide = newestReady
    ? {
        id: 'slide-new-arrivals',
        title: `New Arrivals: ${newestReady.name}`,
        subtitle:
          latestReadyProducts.value.length > 1
            ? `Koleksi ready stock terbaru siap kirim hari ini: ${readyNames}.`
            : newestReady.description || 'Koleksi ready stock terbaru siap langsung dikirim ke alamat Anda tanpa menunggu jadwal trip.',
        tag: 'New Arrivals • Ready Stock',
        country: newestReady.category || 'Siap Kirim',
        flag: '🛍️',
        image: newestReady.image,
        link: `/ready/${newestReady.slug}`,
        buttonText: 'Lihat Ready Stock Terbaru',
        badgeText: formatRupiah(newestReady.price),
        dates: `Tersedia ${latestReadyProducts.value.length}+ Produk Baru`
      }
    : {
        id: 'slide-new-arrivals',
        title: 'Koleksi Ready Stock Terbaru Siap Kirim',
        subtitle: 'Produk pilihan autentik yang sudah tersedia di gudang kami dan siap dikirim langsung tanpa menunggu jadwal trip.',
        tag: 'New Arrivals • Ready Stock',
        country: 'Siap Kirim',
        flag: '🛍️',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        link: '/ready',
        buttonText: 'Lihat Katalog Ready Stock',
        badgeText: 'Pengiriman Cepat',
        dates: '100% Original'
      }

  const howToOrderSlide: CarouselSlide = {
    id: 'slide-how-to-order',
    title: 'Panduan Mudah Cara Order Jastip & Ready Stock',
    subtitle: 'Pelajari langkah pemesanan transparan mulai dari pilih produk, verifikasi ketersediaan oleh admin (ACC), hingga pembayaran aman.',
    tag: 'How to Order Guide',
    country: 'Panduan Belanja',
    flag: '📖',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
    link: '/cara-order',
    buttonText: 'Baca Panduan Cara Order',
    badgeText: '1. Pilih Produk & Checkout',
    dates: '2. Verifikasi Admin → 3. Bayar & Kirim'
  }

  const requestProductSlide: CarouselSlide = {
    id: 'slide-request-product',
    title: 'Punya Barang Impian yang Belum Ada di Katalog?',
    subtitle: 'Kirimkan foto atau link produk luar negeri yang Anda cari. Tim kami akan mengecek ketersediaan dan harga langsung di toko fisik.',
    tag: 'Request a Product',
    country: 'Request Kustom',
    flag: '✨',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    link: '/request',
    buttonText: 'Ajukan Request Produk',
    badgeText: 'Pengecekan Fisik Langsung',
    dates: 'Penawaran Harga Transparan'
  }

  return [newArrivalsSlide, howToOrderSlide, requestProductSlide]
})

const totalSlidesCount = computed(() => {
  return (activeTrip.value ? 1 : 0) + secondarySlides.value.length
})

const currentSlide = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const nextSlide = () => {
  if (totalSlidesCount.value <= 0) return
  currentSlide.value = (currentSlide.value + 1) % totalSlidesCount.value
}

const prevSlide = () => {
  if (totalSlidesCount.value <= 0) return
  currentSlide.value = (currentSlide.value - 1 + totalSlidesCount.value) % totalSlidesCount.value
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

// Slow autoplay (7 seconds, within 6-8s requirement)
const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    nextSlide()
  }, 7000)
}

const pauseAutoplay = () => {
  stopAutoplay()
}

const handleCarouselFocusOut = (e: FocusEvent) => {
  const currentTarget = e.currentTarget as HTMLElement | null
  const relatedTarget = e.relatedTarget as Node | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }
  startAutoplay()
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => {
  startAutoplay()
  countdownInterval = setInterval(() => {
    nowTimestamp.value = Date.now()
  }, 30000)
})

onBeforeUnmount(() => {
  stopAutoplay()
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
})

const categoryRows = computed(() => {
  const catSet = new Set<string>()
  if (dbCategories.value && dbCategories.value.length > 0) {
    dbCategories.value.forEach(c => {
      if (c.name) catSet.add(c.name)
    })
  }
  allProducts.value.forEach(p => {
    if (p.category) catSet.add(p.category)
  })

  const sortedCategories = Array.from(catSet).sort((a, b) => {
    const isALainnya = a.trim().toLowerCase() === 'lainnya'
    const isBLainnya = b.trim().toLowerCase() === 'lainnya'
    if (isALainnya && !isBLainnya) return 1
    if (!isALainnya && isBLainnya) return -1
    return a.localeCompare(b, 'id')
  })

  return sortedCategories
    .map(name => ({
      name,
      products: allProducts.value.filter(p => p.category === name)
    }))
    .filter(row => row.products.length > 0)
})

const getProductLink = (product: ApiProduct) => {
  if (product.productType === 'jastip' && product.trip?.slug) {
    return `/jastip/${product.trip.slug}/${product.slug}`
  }
  return `/ready/${product.slug}`
}

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

/* Hero Carousel Section */
.hero-carousel-section {
  max-width: 1240px;
  margin: 24px auto 0;
  padding: 0 24px;
}

.trip-banner {
  background: linear-gradient(135deg, #1C140C 0%, #2A1F16 50%, #1A130C 100%);
  color: #FFFBF2;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 390px;
  flex: 1;
}

.carousel-trip-banner {
  border-radius: 0;
  border: none;
  padding: 0;
}

.trip-banner-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  height: 100%;
  width: 100%;
  flex: 1;
}

.trip-banner-main {
  padding: 32px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.trip-banner-media {
  position: relative;
  overflow: hidden;
  height: 100%;
}

.trip-banner-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.trip-banner-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #241A12 0%, rgba(36, 26, 18, 0.25) 45%, transparent 100%);
  pointer-events: none;
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
  align-items: stretch;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 390px;
  display: flex;
  flex-direction: column;
}

.slide-card {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  width: 100%;
  height: 100%;
  flex: 1;
  background: #FFFFFF;
}

.slide-content {
  padding: 32px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
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
  height: 100%;
  background: var(--brand-neutral);
}

.slide-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  .carousel-slide,
  .trip-banner {
    height: 490px;
  }
  .slide-card,
  .trip-banner-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }
  .slide-media,
  .trip-banner-media {
    height: 200px;
    order: -1;
  }
  .slide-content,
  .trip-banner-main {
    padding: 20px 24px;
  }
}

.banner-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
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
  font-size: clamp(1.6rem, 2.5vw, 2.2rem) !important;
  font-weight: 700 !important;
  color: #FFFBF2 !important;
  margin-bottom: 6px;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.trip-dest {
  font-size: 0.96rem;
  color: var(--brand-secondary);
  font-weight: 500;
  margin-bottom: 14px;
}

.trip-meta-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.86rem;
  color: #EFE1C6;
  margin-bottom: 18px;
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
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  max-width: 1440px;
  margin: 48px auto 0;
  padding: 0 24px;
}

.category-rows-wrapper {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.category-row-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 4px;
}

.category-row-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.category-more-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--brand-accent);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--brand-primary);
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.category-more-link:hover {
  background: var(--brand-primary);
  border-color: var(--brand-secondary);
  transform: translateX(2px);
}

.category-row-box {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-subtle);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
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

.badge-jastip {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--brand-accent);
  color: #FFFBF2;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(28, 20, 12, 0.22);
}

.card-info {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.card-cat {
  font-size: 0.66rem;
  color: var(--brand-accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-type-tag {
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--brand-accent);
  background: var(--color-jastip-bg, #F5EBD8);
  border: 1px solid rgba(216, 185, 120, 0.5);
  padding: 1px 6px;
  border-radius: 4px;
}

.card-name-link {
  text-decoration: none;
  color: inherit;
}

.card-title {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.35;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}

.card-name-link:hover .card-title {
  color: var(--brand-accent);
}

.card-trip-desc {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  margin: 0 0 8px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-price-row {
  margin-top: auto;
  margin-bottom: 10px;
}

.price-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--brand-accent);
  letter-spacing: -0.01em;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-detail {
  text-decoration: none;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--brand-accent);
  background: var(--brand-neutral);
  border: 1px solid var(--brand-primary);
  padding: 6px 10px;
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
  font-size: 0.78rem;
  font-weight: 700;
  color: #FFFBF2;
  background: var(--brand-accent);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  border: 1px solid var(--brand-accent);
}

.btn-buy:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }
}

@media (max-width: 1100px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
}

@media (max-width: 860px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
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
