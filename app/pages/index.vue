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

    <!-- 1. Trust Bar -->
    <section class="trust-bar-section" aria-label="Jaminan layanan dbb_luxe">
      <div class="trust-bar">
        <div v-for="item in trustItems" :key="item.title" class="trust-item">
          <span class="trust-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, i) in item.paths" :key="i" :d="d" />
            </svg>
          </span>
          <div class="trust-text">
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Category Chips -->
    <section v-if="categoryRows.length > 0" class="category-chips-section" aria-label="Jelajahi kategori">
      <div class="section-head-inline">
        <h2 class="section-title-sm">Jelajahi Kategori</h2>
      </div>
      <div class="category-chips">
        <NuxtLink
          v-for="cat in categoryRows"
          :key="cat.name"
          :to="`/ready?category=${encodeURIComponent(cat.name)}`"
          class="category-chip"
        >
          <span class="chip-initial" aria-hidden="true">{{ cat.name.charAt(0).toUpperCase() }}</span>
          <span class="chip-name">{{ cat.name }}</span>
          <span class="chip-count">{{ cat.products.length }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 3. Open Jastip Schedules -->
    <section v-if="sortedOpenTrips.length > 0" class="open-trips-section" aria-label="Jadwal Jastip terbuka">
      <div class="section-head-row">
        <div>
          <h2 class="section-title-sm">Jadwal Jastip Terbuka</h2>
          <p class="section-sub">Titip belanja dari luar negeri sebelum PO ditutup.</p>
        </div>
        <NuxtLink to="/jastip" class="section-link">
          Lihat semua jadwal &rarr;
        </NuxtLink>
      </div>

      <div class="open-trips-grid">
        <NuxtLink
          v-for="trip in sortedOpenTrips"
          :key="trip.id"
          :to="`/jastip/${trip.slug}`"
          class="open-trip-card"
        >
          <div class="ot-media">
            <img
              :src="trip.coverImageUrl || 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80'"
              :alt="trip.title"
              loading="lazy"
            />
            <span class="ot-country">{{ trip.flag }} {{ trip.country }}</span>
            <span class="ot-days" :class="{ urgent: daysLeft(trip.closeDate) <= 3 }">
              {{ daysLeftLabel(trip.closeDate) }}
            </span>
          </div>
          <div class="ot-body">
            <h3 class="ot-title">{{ trip.title }}</h3>
            <p class="ot-area">{{ trip.cityOrArea || 'Open PO Jastip' }}</p>

            <div class="ot-dates">
              <div>
                <span>Tutup PO</span>
                <strong>{{ formatDate(trip.closeDate) }}</strong>
              </div>
              <div v-if="trip.estimatedArrivalDate">
                <span>Estimasi Tiba</span>
                <strong>{{ formatDate(trip.estimatedArrivalDate) }}</strong>
              </div>
            </div>

            <div class="ot-quota">
              <div class="ot-quota-label">
                <span>Kuota terisi</span>
                <strong>{{ trip.quotaFilled }} / {{ trip.quotaTotal }}</strong>
              </div>
              <div class="ot-progress" role="progressbar" :aria-valuenow="quotaPercent(trip)" aria-valuemin="0" aria-valuemax="100">
                <span class="ot-progress-fill" :style="{ width: quotaPercent(trip) + '%' }"></span>
              </div>
              <span class="ot-quota-remaining">Sisa {{ trip.quotaRemaining }} slot</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 5. Request Product CTA Banner -->
    <section class="request-feature-section">
      <div class="request-feature-card">
        <div class="rf-content">
          <span class="rf-eyebrow">Titip Barang Impian</span>
          <h2 class="rf-title">Barang yang kamu cari tidak ada di katalog?</h2>
          <p class="rf-desc">
            Kirim foto atau link produk dari toko luar negeri. Admin akan mengecek ketersediaan dan memberikan
            penawaran harga langsung ke akun kamu.
          </p>
          <div class="rf-actions">
            <NuxtLink to="/request" class="rf-btn-primary">Request Produk Sekarang</NuxtLink>
            <NuxtLink to="/cara-order" class="rf-btn-ghost">Pelajari Caranya</NuxtLink>
          </div>
        </div>
        <ul class="rf-points">
          <li><span>1</span> Kirim foto / link produk</li>
          <li><span>2</span> Admin kirim penawaran harga</li>
          <li><span>3</span> Setujui &amp; lakukan pembayaran</li>
        </ul>
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

      <!-- 6. How to Order Steps -->
      <section class="how-order-section" aria-label="Cara order">
        <div class="section-head-row">
          <div>
            <h2 class="section-title-sm">Cara Order di dbb_luxe</h2>
            <p class="section-sub">Proses mudah dalam 5 langkah.</p>
          </div>
          <NuxtLink to="/cara-order" class="section-link">Selengkapnya &rarr;</NuxtLink>
        </div>

        <ol class="how-order-steps">
          <li v-for="(step, idx) in orderSteps" :key="step.title" class="how-step">
            <span class="how-step-num">{{ idx + 1 }}</span>
            <div class="how-step-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(d, i) in step.paths" :key="i" :d="d" />
              </svg>
            </div>
            <strong>{{ step.title }}</strong>
            <span>{{ step.desc }}</span>
          </li>
        </ol>
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

// 1. Trust bar items
const trustItems = [
  {
    title: 'Struk Pembelian Asli',
    desc: 'Bukti belanja toko fisik disertakan',
    paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 13h6', 'M9 17h6']
  },
  {
    title: 'Garansi Uang Kembali',
    desc: 'Jika barang kosong di toko asal',
    paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4']
  },
  {
    title: 'Dikemas Aman',
    desc: 'Dikirim langsung ke alamat Anda',
    paths: ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M3.3 7 12 12l8.7-5', 'M12 22V12']
  },
  {
    title: 'Admin Responsif',
    desc: 'Tanya langsung lewat live chat',
    paths: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z']
  }
]

// 3. All open trips (soonest close date first)
const sortedOpenTrips = computed(() => {
  return [...(openTrips.value || [])].sort(
    (a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime()
  )
})

const daysLeft = (closeDate: string) => {
  const diff = new Date(closeDate).getTime() - nowTimestamp.value
  return Math.max(0, Math.ceil(diff / 86400000))
}

const daysLeftLabel = (closeDate: string) => {
  const d = daysLeft(closeDate)
  if (d <= 0) return 'Hari ini terakhir'
  return `${d} hari lagi`
}

const quotaPercent = (trip: ApiTrip) => {
  if (!trip.quotaTotal) return 0
  return Math.min(100, Math.round((trip.quotaFilled / trip.quotaTotal) * 100))
}

// 6. How to order steps
const orderSteps = [
  {
    title: 'Pilih Produk',
    desc: 'Ready Stock atau Jastip dari jadwal trip yang buka',
    paths: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0']
  },
  {
    title: 'Checkout',
    desc: 'Isi alamat dan ajukan pesanan',
    paths: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11']
  },
  {
    title: 'ACC Admin',
    desc: 'Admin cek stok/kuota dan konfirmasi ongkir',
    paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4']
  },
  {
    title: 'Bayar',
    desc: 'Transfer dalam 24 jam, bisa DP 50% untuk Jastip',
    paths: ['M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z', 'M2 10h20']
  },
  {
    title: 'Barang Dikirim',
    desc: 'Pesanan dikemas dan dikirim ke alamat Anda',
    paths: ['M1 3h15v13H1z', 'M16 8h4l3 3v5h-7z', 'M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z']
  }
]

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

/* ===== Shared section helpers ===== */
.trust-bar-section,
.category-chips-section,
.open-trips-section,
.request-feature-section {
  max-width: 1240px;
  margin: 36px auto 0;
  padding: 0 24px;
}

.section-title-sm {
  font-size: 1.45rem !important;
  margin: 0 !important;
}

.section-sub {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.section-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.section-head-inline {
  margin-bottom: 14px;
}

.section-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--brand-accent);
  text-decoration: none;
}

.section-link:hover {
  text-decoration: underline;
}

/* ===== 1. Trust bar ===== */
.trust-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-subtle);
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-right: 1px solid var(--color-border);
}

.trust-item:last-child {
  border-right: none;
}

.trust-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--brand-primary);
  color: var(--brand-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.trust-text {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.trust-text strong {
  font-size: 0.88rem;
  color: var(--color-text);
}

.trust-text span {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

/* ===== 2. Category chips ===== */
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 8px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 600;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.category-chip:hover {
  border-color: var(--brand-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.chip-initial {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--brand-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
}

.chip-count {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--brand-accent);
  background: var(--brand-primary);
  padding: 2px 8px;
  border-radius: 999px;
}

/* ===== 3. Open trips ===== */
.open-trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.open-trip-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.open-trip-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--brand-secondary);
}

.ot-media {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--brand-primary);
}

.ot-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ot-country,
.ot-days {
  position: absolute;
  top: 12px;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 999px;
}

.ot-country {
  left: 12px;
  background: rgba(28, 20, 12, 0.78);
  color: #fff;
}

.ot-days {
  right: 12px;
  background: #fff;
  color: var(--brand-accent);
}

.ot-days.urgent {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.ot-body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ot-title {
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ot-area {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: -4px;
}

.ot-dates {
  display: flex;
  gap: 18px;
  padding: 10px 0;
  border-top: 1px dashed var(--color-border);
  border-bottom: 1px dashed var(--color-border);
}

.ot-dates div {
  display: flex;
  flex-direction: column;
}

.ot-dates span {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-light);
}

.ot-dates strong {
  font-size: 0.84rem;
}

.ot-quota {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ot-quota-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.ot-quota-label strong {
  color: var(--color-text);
}

.ot-progress {
  height: 7px;
  border-radius: 999px;
  background: var(--brand-primary);
  overflow: hidden;
}

.ot-progress-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand-secondary), var(--brand-accent));
}

.ot-quota-remaining {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--brand-accent);
}

/* ===== 5. Request feature banner ===== */
.request-feature-card {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
  align-items: center;
  padding: 36px 40px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #1C140C 0%, #2A1F16 55%, #3A2B1A 100%);
  color: #FFFBF2;
  box-shadow: var(--shadow-md);
}

.rf-eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brand-secondary);
  margin-bottom: 10px;
}

.rf-title {
  font-size: clamp(1.5rem, 2.4vw, 2rem) !important;
  color: #FFFBF2 !important;
  margin-bottom: 10px !important;
}

.rf-desc {
  font-size: 0.92rem;
  line-height: 1.65;
  color: rgba(255, 251, 242, 0.78);
  max-width: 520px;
}

.rf-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.rf-btn-primary,
.rf-btn-ghost {
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 11px 22px;
  border-radius: 999px;
  transition: transform 0.2s, background 0.2s;
}

.rf-btn-primary {
  background: var(--brand-secondary);
  color: #1C140C;
}

.rf-btn-primary:hover {
  transform: translateY(-1px);
  background: #E3C98E;
}

.rf-btn-ghost {
  border: 1px solid rgba(255, 251, 242, 0.35);
  color: #FFFBF2;
}

.rf-btn-ghost:hover {
  background: rgba(255, 251, 242, 0.1);
}

.rf-points {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rf-points li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 251, 242, 0.07);
  border: 1px solid rgba(255, 251, 242, 0.12);
  font-size: 0.88rem;
}

.rf-points li span {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--brand-secondary);
  color: #1C140C;
  font-weight: 700;
  font-size: 0.82rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ===== 6. How to order ===== */
.how-order-section {
  margin-top: 56px;
}

.how-order-steps {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.how-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 20px 18px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.how-step-num {
  position: absolute;
  top: 14px;
  right: 16px;
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--brand-primary);
}

.how-step-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--brand-primary);
  color: var(--brand-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.how-step strong {
  font-size: 0.95rem;
}

.how-step > span:last-child {
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}

@media (max-width: 1000px) {
  .trust-bar {
    grid-template-columns: repeat(2, 1fr);
  }
  .trust-item:nth-child(2) {
    border-right: none;
  }
  .trust-item:nth-child(-n + 2) {
    border-bottom: 1px solid var(--color-border);
  }
  .how-order-steps {
    grid-template-columns: repeat(2, 1fr);
  }
  .request-feature-card {
    grid-template-columns: 1fr;
    padding: 28px 24px;
  }
}

@media (max-width: 560px) {
  .trust-bar-section,
  .category-chips-section,
  .open-trips-section,
  .request-feature-section {
    padding: 0 16px;
  }
  .trust-bar {
    grid-template-columns: 1fr;
  }
  .trust-item {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  .trust-item:last-child {
    border-bottom: none;
  }
  .how-order-steps {
    grid-template-columns: 1fr;
  }
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
