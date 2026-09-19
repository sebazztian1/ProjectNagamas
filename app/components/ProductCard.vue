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

        <!-- Chat dengan Admin Button -->
        <button 
          class="wa-btn"
          @click.stop="handleChatClick(product)"
          title="Chat Admin seputar produk ini"
        >
          <svg class="wa-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="wa-text">Chat</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '../types/product'
import { useCustomerChat } from '../composables/useCustomerChat'

const props = defineProps<{
  product: Product
}>()

defineEmits<{
  (e: 'chatWhatsApp', product: Product): void
  (e: 'quickView', product: Product): void
}>()

const { openChatWithProduct } = useCustomerChat()

const handleChatClick = (product: Product) => {
  openChatWithProduct(product)
}

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
