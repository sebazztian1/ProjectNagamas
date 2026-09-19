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

            <!-- Chat via WhatsApp Button -->
            <button 
              class="wa-secondary-btn"
              @click="handleChatWhatsApp"
              title="Chat via WhatsApp"
            >
              <svg class="wa-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
              </svg>
              <span>WhatsApp</span>
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

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'chatWhatsApp', product: Product): void
}>()

const { openChatWithProduct } = useCustomerChat()

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
  background: rgba(15, 23, 42, 0.6);
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
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  z-index: 10;
}

.close-btn:hover {
  background: #0f172a;
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
  background: #f8fafc;
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
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  padding: 0;
}

.thumb-btn.active {
  border-color: #0f172a;
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
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.price-tag {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 14px;
}

.modal-desc {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 18px 0;
}

.specs-list {
  background: #f8fafc;
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
  color: #64748b;
}

.spec-value {
  color: #0f172a;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.chat-main-btn {
  flex: 1;
  background: #0f172a;
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
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
  transition: all 0.2s;
}

.chat-main-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.wa-secondary-btn {
  background: #f1f5f9;
  color: #0f172a;
  border: 1px solid #cbd5e1;
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
