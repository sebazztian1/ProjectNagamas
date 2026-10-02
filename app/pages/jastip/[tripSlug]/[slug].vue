<template>
  <div class="jastip-product-detail" v-if="product">
    <div class="page-container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <NuxtLink to="/jastip">Jadwal Jastip</NuxtLink>
        <span>/</span>
        <NuxtLink :to="`/jastip/${tripSlug}`">{{ product.tripTitle || 'Trip' }}</NuxtLink>
        <span>/</span>
        <span class="active">{{ product.name }}</span>
      </div>

      <div class="detail-layout">
        <!-- Image Area -->
        <div class="gallery-col">
          <div class="main-image">
            <img :src="product.image" :alt="product.name" />
            <span class="badge-jastip-po">
              {{ product.flag }} Open PO Jastip {{ product.country }}
            </span>
          </div>

          <!-- Trip Reminder Box -->
          <div class="trip-reminder-box">
            <div class="trip-rem-head">
              <span class="plane-icon">✈️</span>
              <strong>Jadwal Pembelian Trip Ini:</strong>
            </div>
            <p>{{ product.tripTitle }}</p>
            <div class="dates-row">
              <span>Batas PO: <strong>20 Okt 2026</strong></span>
              <span>Estimasi Tiba: <strong>02 Nov 2026</strong></span>
            </div>
          </div>
        </div>

        <!-- Info / Buying Action -->
        <div class="info-col">
          <div class="store-tag">
            <span>Dibelikan di toko: <strong>{{ product.sourceStore || 'Store Resmi Luar Negeri' }}</strong></span>
          </div>

          <h1 class="product-name">{{ product.name }}</h1>

          <!-- Price Calculation Transparency Box (Jastip specific) -->
          <div class="jastip-price-breakdown">
            <span class="calc-label">Rincian Perhitungan Harga Titip:</span>
            <div class="calc-formula">
              <div class="f-item">
                <span>Harga Toko Asal:</span>
                <strong>{{ product.originalCurrency }} {{ product.originalPrice?.toLocaleString('id-ID') }}</strong>
              </div>
              <span class="math-op">&times; Kurs + Fee =</span>
              <div class="f-item highlight">
                <span>Total Harga Bersih (IDR):</span>
                <strong class="final-price">{{ formatRupiah(product.price) }}</strong>
              </div>
            </div>
            <span class="calc-note">*Sudah termasuk biaya titip bagasi & pajak. Tanpa biaya tersembunyi.</span>
          </div>

          <!-- Quota Remaining Alert -->
          <div class="quota-alert">
            <span>Sisa kuota slot titip untuk produk ini: <strong>{{ product.quotaRemaining || 12 }} pcs lagi</strong></span>
          </div>

          <!-- Variants selection if any -->
          <div v-if="product.variants" class="variants-area">
            <div v-for="(options, name) in product.variants" :key="name" class="variant-group">
              <label class="variant-label">Pilih {{ name }}:</label>
              <div class="variant-options">
                <button 
                  v-for="opt in options" 
                  :key="opt"
                  class="variant-btn"
                  :class="{ active: selectedVariant === opt }"
                  @click="selectedVariant = opt"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="qty-section">
            <label class="qty-label">Jumlah Titip (Maks {{ product.maxQtyPerOrder || 5 }} pcs):</label>
            <div class="qty-ctrl">
              <button @click="qty > 1 ? qty-- : null" :disabled="qty <= 1">-</button>
              <span class="qty-num">{{ qty }}</span>
              <button @click="qty < (product.maxQtyPerOrder || 5) ? qty++ : null" :disabled="qty >= (product.maxQtyPerOrder || 5)">+</button>
            </div>
            <span class="subtotal-hint">Total: {{ formatRupiah(product.price * qty) }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="cta-actions">
            <NuxtLink :to="`/checkout?productId=${product.id}&qty=${qty}&variant=${selectedVariant || ''}&tripSlug=${tripSlug}`" class="btn-po-now">
              Titip Sekarang (Checkout PO)
            </NuxtLink>
            <button class="btn-chat-admin" @click="handleChatAdmin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chat Tanya Produk
            </button>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUnifiedProducts } from '../../../data/mockJastipData'
import { useCustomerChat } from '../../../composables/useCustomerChat'

const route = useRoute()
const tripSlug = route.params.tripSlug as string
const slug = route.params.slug as string
const { openChat } = useCustomerChat()

const product = computed(() => {
  return mockUnifiedProducts.find(p => p.slug === slug && p.productType === 'jastip') || mockUnifiedProducts[5]
})

const qty = ref(1)
const selectedVariant = ref(
  product.value?.variants ? Object.values(product.value.variants)[0][0] : ''
)

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}

const handleChatAdmin = () => {
  openChat()
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
  color: var(--color-text-muted, #64748B);
  margin-bottom: 24px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb a:hover {
  color: var(--color-primary, #4A5D73);
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
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
  border: 1px solid var(--color-secondary, #E4E7EB);
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
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
}

.trip-reminder-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  padding: 16px;
}

.trip-rem-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 4px;
}

.trip-reminder-box p {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  margin-bottom: 8px;
}

.dates-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  padding-top: 8px;
}

/* Info Col */
.info-col {
  display: flex;
  flex-direction: column;
}

.store-tag {
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 6px;
}

.product-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  line-height: 1.3;
  margin-bottom: 16px;
}

.jastip-price-breakdown {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 16px;
}

.calc-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  text-transform: uppercase;
  margin-bottom: 10px;
}

.calc-formula {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.f-item {
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
}

.f-item strong {
  display: block;
  font-size: 0.95rem;
  color: var(--color-text, #1E293B);
}

.math-op {
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 700;
}

.f-item.highlight strong.final-price {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
}

.calc-note {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

.quota-alert {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  font-size: 0.8rem;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 18px;
}

.variants-area {
  margin-bottom: 18px;
}

.variant-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.variant-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.variant-btn {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text, #1E293B);
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.variant-btn.active {
  border-color: var(--color-primary, #4A5D73);
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
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
  color: var(--color-text, #1E293B);
}

.qty-ctrl {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-secondary, #E4E7EB);
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.qty-ctrl button {
  width: 34px;
  height: 34px;
  background: var(--color-canvas, #F4F6F8);
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
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.cta-actions {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-po-now {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 13px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-po-now:hover {
  background: var(--color-primary-hover, #384759);
}

.btn-chat-admin {
  background: #ffffff;
  color: var(--color-primary, #4A5D73);
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  font-weight: 700;
  padding: 13px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.guarantee-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
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
  color: var(--color-text, #1E293B);
  font-weight: 600;
}

.g-item svg {
  color: var(--color-primary, #4A5D73);
  flex-shrink: 0;
}

.desc-section h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 8px;
}

.desc-section p {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.6;
}

@media (max-width: 800px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
