<template>
  <div class="drawer-overlay" @click.self="$emit('close')">
    <div class="cart-drawer" role="dialog" aria-modal="true">
      <!-- Header -->
      <div class="drawer-header">
        <div>
          <h3 class="drawer-title">Shopping Cart</h3>
          <span class="drawer-subtitle">{{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="drawer-body">
        <div v-if="items.length === 0" class="empty-state">
          <p>Your cart is empty.</p>
          <button class="continue-btn" @click="$emit('close')">
            Continue Shopping
          </button>
        </div>

        <div v-else class="items-list">
          <div v-for="item in items" :key="item.product.id" class="cart-item">
            <img :src="item.product.image" :alt="item.product.name" class="item-img" />
            <div class="item-info">
              <div class="item-top">
                <h4 class="item-name">{{ item.product.name }}</h4>
                <button 
                  class="remove-btn" 
                  @click="$emit('remove', item.product.id)"
                  title="Remove"
                >
                  &times;
                </button>
              </div>
              <div class="item-price">{{ formatPrice(item.product.price) }}</div>

              <div class="qty-control">
                <button @click="$emit('updateQty', { productId: item.product.id, delta: -1 })">-</button>
                <span>{{ item.quantity }}</span>
                <button 
                  :disabled="item.quantity >= item.product.stockCount"
                  @click="$emit('updateQty', { productId: item.product.id, delta: 1 })"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="items.length > 0" class="drawer-footer">
        <div class="total-row">
          <span>Total:</span>
          <span class="total-price">{{ formatPrice(subtotal) }}</span>
        </div>
        <button class="checkout-btn" @click="$emit('checkout')">
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CartItem } from '../types/product'

const props = defineProps<{
  items: CartItem[]
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'remove', productId: string): void
  (e: 'updateQty', payload: { productId: string; delta: number }): void
  (e: 'checkout'): void
}>()

const totalItems = computed(() => {
  return props.items.reduce((acc, item) => acc + item.quantity, 0)
})

const subtotal = computed(() => {
  return props.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
})

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(43, 33, 22, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  background: #ffffff;
  width: 100%;
  max-width: 380px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  padding: 18px 20px;
  border-bottom: 1px solid #EFE1C6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  margin: 0;
  font-size: 1.05rem;
  color: #2B2116;
}

.drawer-subtitle {
  font-size: 0.75rem;
  color: #7A6A55;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #7A6A55;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 10px;
  color: #7A6A55;
  font-size: 0.9rem;
}

.continue-btn {
  margin-top: 14px;
  background: #2B2116;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #F7EEDC;
}

.item-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  background: #FFFBF2;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2B2116;
  line-height: 1.25;
}

.remove-btn {
  background: none;
  border: none;
  color: #A8957A;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
}

.remove-btn:hover {
  color: #ef4444;
}

.item-price {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2B2116;
  margin: 4px 0 8px 0;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
  width: fit-content;
}

.qty-control button {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.qty-control span {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0 6px;
}

.drawer-footer {
  padding: 18px 20px;
  border-top: 1px solid #EFE1C6;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 700;
  color: #2B2116;
  margin-bottom: 12px;
}

.checkout-btn {
  width: 100%;
  background: #2B2116;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.checkout-btn:hover {
  opacity: 0.9;
}
</style>
