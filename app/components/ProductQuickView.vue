<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-container" role="dialog" aria-modal="true">
      <button class="close-btn" @click="$emit('close')" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal-content-grid">
        <!-- Image & Gallery -->
        <div class="modal-gallery">
          <div class="main-img-box">
            <img :src="activeImage" :alt="product.name" class="main-img" />
          </div>
          <div v-if="galleryImages.length > 1" class="thumb-row">
            <button
              v-for="(img, idx) in galleryImages"
              :key="idx"
              class="thumb-btn"
              :class="{ active: activeImage === img }"
              @click="activeImage = img"
            >
              <img :src="img" :alt="`thumb ${idx}`" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="modal-info">
          <span class="category-tag">{{ product.category.toUpperCase() }}</span>
          <h2 class="modal-title">{{ product.name }}</h2>

          <div class="price-tag">
            {{ formatPrice(product.price) }}
          </div>

          <p class="modal-desc">{{ product.description }}</p>

          <div class="specs-list" v-if="Object.keys(product.specifications).length > 0">
            <div v-for="(val, key) in product.specifications" :key="key" class="spec-item">
              <span class="spec-name">{{ key }}</span>
              <span class="spec-value">{{ val }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <!-- Buy Now & Wishlist row -->
            <div class="primary-action-row">
              <NuxtLink 
                v-if="product.inStock" 
                :to="`/checkout?productId=${product.id}&qty=1`" 
                class="btn-quick-buy"
                @click="$emit('close')"
              >
                Beli Sekarang (Checkout)
              </NuxtLink>
              <button v-else disabled class="btn-quick-buy disabled">
                Stok Habis
              </button>

              <button 
                class="quickview-wishlist-btn"
                :class="{ active: isWishlisted(product.id) }"
                @click="toggleWishlist(product)"
                :title="isWishlisted(product.id) ? 'Hapus dari Wishlist' : 'Simpan ke Wishlist'"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" :fill="isWishlisted(product.id) ? '#E53935' : 'none'" :stroke="isWishlisted(product.id) ? '#E53935' : 'currentColor'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{{ isWishlisted(product.id) ? 'Tersimpan' : 'Wishlist' }}</span>
              </button>
            </div>

            <!-- Chat via Live Chat Button -->
            <button 
              class="chat-main-btn"
              @click="handleChatLive"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Chat Langsung dengan Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '../types/product'
import { useCustomerChat } from '../composables/useCustomerChat'
import { useWishlist } from '../composables/useWishlist'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'chatWhatsApp', product: Product): void
}>()

const { openChatWithProduct } = useCustomerChat()
const { isWishlisted, toggleWishlist } = useWishlist()

const activeImage = ref(props.product.image)

watch(
  () => props.product,
  (newVal) => {
    activeImage.value = newVal.image
  }
)

const galleryImages = computed(() => {
  if (props.product.gallery && props.product.gallery.length > 0) {
    return props.product.gallery
  }
  return [props.product.image]
})

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const handleChatLive = () => {
  openChatWithProduct(props.product)
  emit('close')
}

const handleChatWhatsApp = () => {
  emit('chatWhatsApp', props.product)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(43, 33, 22, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  background: #ffffff;
  border-radius: 16px;
  max-width: 780px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F7EEDC;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #7A6A55;
  z-index: 10;
}

.close-btn:hover {
  background: #2B2116;
  color: #ffffff;
}

.modal-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  padding: 28px;
}

.modal-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-img-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #FFFBF2;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-row {
  display: flex;
  gap: 8px;
}

.thumb-btn {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #EFE1C6;
  background: #FFFBF2;
  cursor: pointer;
  padding: 0;
}

.thumb-btn.active {
  border-color: #2B2116;
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info {
  display: flex;
  flex-direction: column;
}

.category-tag {
  font-size: 0.72rem;
  color: #A8957A;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #2B2116;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.price-tag {
  font-size: 1.4rem;
  font-weight: 800;
  color: #2B2116;
  margin-bottom: 14px;
}

.modal-desc {
  font-size: 0.88rem;
  color: #5C4B36;
  line-height: 1.5;
  margin: 0 0 18px 0;
}

.specs-list {
  background: #FFFBF2;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.spec-name {
  color: #7A6A55;
}

.spec-value {
  color: #2B2116;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.primary-action-row {
  display: flex;
  gap: 10px;
}

.btn-quick-buy {
  flex: 1;
  background: var(--brand-accent, #8C6D3F);
  color: #ffffff;
  border-radius: 10px;
  height: 46px;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: none;
  box-shadow: 0 4px 14px rgba(140, 109, 63, 0.25);
  transition: all 0.2s;
}

.btn-quick-buy:hover:not(.disabled) {
  background: #73572E;
  transform: translateY(-1px);
}

.btn-quick-buy.disabled {
  background: #D9D2C5;
  color: #7A6A55;
  cursor: not-allowed;
  box-shadow: none;
}

.quickview-wishlist-btn {
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.3);
  color: #7A6A55;
  border-radius: 10px;
  height: 46px;
  padding: 0 16px;
  font-weight: 600;
  font-size: 0.84rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quickview-wishlist-btn:hover {
  border-color: #D32F2F;
  color: #D32F2F;
  background: #FFF1F0;
}

.quickview-wishlist-btn.active {
  border-color: #D32F2F;
  color: #D32F2F;
  background: #FFF1F0;
  font-weight: 700;
}

.chat-main-btn {
  flex: 1;
  background: #2B2116;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  height: 46px;
  font-weight: 700;
  font-size: 0.86rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(43, 33, 22, 0.2);
  transition: all 0.2s;
}

.chat-main-btn:hover {
  background: #2B2116;
  transform: translateY(-1px);
}

.wa-secondary-btn {
  background: #F7EEDC;
  color: #2B2116;
  border: 1px solid #E3D2AE;
  border-radius: 10px;
  height: 46px;
  padding: 0 16px;
  font-weight: 600;
  font-size: 0.84rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.wa-secondary-btn:hover {
  background: #25d366;
  color: #ffffff;
  border-color: #25d366;
}

@media (max-width: 640px) {
  .modal-content-grid {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
</style>
