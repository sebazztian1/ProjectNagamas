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
      <span v-if="product.badge && product.badge !== 'Ready Stock'" class="product-badge">
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
  border-radius: var(--radius-md, 14px);
  border: 1px solid var(--brand-primary, #EFE1C6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: var(--shadow-sm, 0 4px 16px -2px rgba(140, 109, 63, 0.06));
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md, 0 10px 30px -6px rgba(140, 109, 63, 0.10));
  border-color: var(--brand-secondary, #D8B978);
}

.product-card.out-of-stock {
  opacity: 0.65;
}

/* Image Container */
.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--brand-neutral, #FFFBF2);
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--brand-primary, #EFE1C6);
  color: var(--brand-accent, #8C6D3F);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid rgba(216, 185, 120, 0.4);
}

.stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--color-danger, #A33A2A);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

/* Info */
.card-info {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.category-name {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--brand-accent, #8C6D3F);
  font-weight: 700;
  margin-bottom: 4px;
}

.product-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text, #2B2116);
  line-height: 1.35;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}

.product-card:hover .product-title {
  color: var(--brand-accent, #8C6D3F);
}

.card-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--brand-primary, #EFE1C6);
  gap: 8px;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--brand-accent, #8C6D3F);
  letter-spacing: -0.01em;
}

.wa-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--brand-neutral, #FFFBF2);
  color: var(--brand-accent, #8C6D3F);
  border: 1px solid var(--brand-secondary, #D8B978);
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.wa-btn:hover {
  background: var(--brand-accent, #8C6D3F);
  color: #FFFBF2;
  border-color: var(--brand-accent, #8C6D3F);
}

.wa-icon {
  flex-shrink: 0;
}
</style>
