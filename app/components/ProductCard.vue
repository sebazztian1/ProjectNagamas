<template>
  <div 
    class="product-card" 
    :class="{ 'out-of-stock': !product.inStock }"
    @click="$emit('quickView', product)"
  >
    <!-- Image -->
    <div class="card-image-wrap">
      <img 
        :src="product.image" 
        :alt="product.name" 
        loading="lazy" 
        class="product-img"
      />
      <span v-if="product.badge" class="product-badge">
        {{ product.badge }}
      </span>
      <span v-if="!product.inStock" class="stock-badge">
        Out of Stock
      </span>
    </div>

    <!-- Details -->
    <div class="card-info">
      <span class="category-name">{{ product.category }}</span>
      <h3 class="product-title" :title="product.name">
        {{ product.name }}
      </h3>
      
      <div class="card-bottom">
        <div class="price-box">
          <span class="price-value">{{ formatPrice(product.price) }}</span>
        </div>

        <!-- Chat via WhatsApp Button -->
        <button 
          class="wa-btn"
          @click.stop="$emit('chatWhatsApp', product)"
          title="Chat Via WhatsApp"
        >
          <svg class="wa-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
          </svg>
          <span class="wa-text">Chat</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '../types/product'

defineProps<{
  product: Product
}>()

defineEmits<{
  (e: 'chatWhatsApp', product: Product): void
  (e: 'quickView', product: Product): void
}>()

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.product-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.product-card.out-of-stock {
  opacity: 0.7;
}

/* Image Container */
.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f8fafc;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-img {
  transform: scale(1.04);
}

.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

/* Info */
.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.category-name {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 4px;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.35;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  gap: 8px;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-value {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.wa-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #25d366;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(37, 211, 102, 0.2);
}

.wa-btn:hover {
  background: #20ba5a;
  transform: scale(1.03);
}

.wa-icon {
  flex-shrink: 0;
}
</style>
