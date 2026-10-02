<template>
  <div class="product-detail-page">
    <div class="page-container" v-if="product">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <NuxtLink to="/ready">Ready Stock</NuxtLink>
        <span>/</span>
        <span class="active">{{ product.name }}</span>
      </div>

      <div class="detail-layout">
        <!-- Image Gallery -->
        <div class="gallery-col">
          <div class="main-image">
            <img :src="activeImage" :alt="product.name" />
            <span class="badge-ready">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Ready Stock - Siap Kirim
            </span>
          </div>

          <div v-if="product.gallery && product.gallery.length > 1" class="thumbnail-row">
            <div 
              v-for="(img, idx) in product.gallery" 
              :key="idx"
              class="thumb-box"
              :class="{ active: activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="product.name" />
            </div>
          </div>
        </div>

        <!-- Info / Buying Action -->
        <div class="info-col">
          <div class="origin-tag">
            <span>{{ product.flag }} Produk Impor Asli ({{ product.country }})</span>
          </div>

          <h1 class="product-name">{{ product.name }}</h1>

          <div class="rating-stock-row">
            <div class="rating-pill">
              ⭐ <strong>{{ product.rating || 4.9 }}</strong> ({{ product.reviewsCount || 20 }} ulasan)
            </div>
            <div class="stock-pill">
              Stok Gudang: <strong>{{ product.stockQuantity }} pcs</strong>
            </div>
          </div>

          <div class="price-box">
            <span class="price-label">Harga Barang Ready:</span>
            <div class="price-amount">{{ formatRupiah(product.price) }}</div>
            <span class="tax-note">*Harga pas di toko (tanpa tambahan kurs/fee jastip).</span>
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
            <label class="qty-label">Jumlah Pembelian:</label>
            <div class="qty-ctrl">
              <button @click="qty > 1 ? qty-- : null" :disabled="qty <= 1">-</button>
              <span class="qty-num">{{ qty }}</span>
              <button @click="qty < (product.stockQuantity || 10) ? qty++ : null" :disabled="qty >= (product.stockQuantity || 10)">+</button>
            </div>
            <span class="subtotal-hint">Total: {{ formatRupiah(product.price * qty) }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="cta-actions">
            <NuxtLink :to="`/checkout?productId=${product.id}&qty=${qty}&variant=${selectedVariant || ''}`" class="btn-buy-now">
              Beli Sekarang (Checkout)
            </NuxtLink>
            <button class="btn-chat-admin" @click="handleChatAdmin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chat Tanya Produk
            </button>
          </div>

          <!-- Trust Guarantees -->
          <div class="trust-cards">
            <div class="t-card">
              <strong>Pickup di Toko Fisik</strong>
              <span>Bisa langsung ambil hari ini di dbb_luxe Store Jakarta.</span>
            </div>
            <div class="t-card">
              <strong>100% Produk Original</strong>
              <span>Jaminan keaslian barang resmi tanpa barang tiruan.</span>
            </div>
          </div>

          <!-- Description -->
          <div class="desc-section">
            <h3>Deskripsi Produk</h3>
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="not-found-box">
      <h2>Produk tidak ditemukan</h2>
      <NuxtLink to="/ready" class="btn-back">Kembali ke Katalog Ready</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUnifiedProducts } from '../../data/mockJastipData'
import { useCustomerChat } from '../../composables/useCustomerChat'

const route = useRoute()
const router = useRouter()
const { openChat } = useCustomerChat()

const slug = route.params.slug as string
const product = computed(() => {
  return mockUnifiedProducts.find(p => p.slug === slug && p.productType === 'ready') || mockUnifiedProducts[0]
})

const activeImage = ref(product.value ? product.value.image : '')
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
.product-detail-page {
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
  gap: 14px;
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

.badge-ready {
  position: absolute;
  top: 14px;
  left: 14px;
  background: var(--color-ready, #059669);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.thumbnail-row {
  display: flex;
  gap: 10px;
}

.thumb-box {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  border: 2px solid var(--color-secondary, #E4E7EB);
  overflow: hidden;
  cursor: pointer;
}

.thumb-box.active {
  border-color: var(--color-primary, #4A5D73);
}

.thumb-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Info Col */
.info-col {
  display: flex;
  flex-direction: column;
}

.origin-tag {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 6px;
}

.product-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  line-height: 1.3;
  margin-bottom: 12px;
}

.rating-stock-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.rating-pill, .stock-pill {
  font-size: 0.82rem;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--color-text-muted, #64748B);
}

.price-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 24px;
}

.price-label {
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748B);
}

.price-amount {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
  margin: 4px 0 2px;
}

.tax-note {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.variants-area {
  margin-bottom: 20px;
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

.btn-buy-now {
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

.btn-buy-now:hover {
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
  transition: all 0.15s;
}

.btn-chat-admin:hover {
  background: var(--color-secondary, #E4E7EB);
}

.trust-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  margin-bottom: 24px;
}

.t-card strong {
  display: block;
  font-size: 0.82rem;
  color: var(--color-text, #1E293B);
  margin-bottom: 2px;
}

.t-card span {
  font-size: 0.74rem;
  color: var(--color-text-muted, #64748B);
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

.not-found-box {
  text-align: center;
  padding: 80px 20px;
}

.btn-back {
  display: inline-block;
  margin-top: 12px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
}

@media (max-width: 800px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
