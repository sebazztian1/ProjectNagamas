<template>
  <div class="catalogue-page">
    <main class="main-content">
      <!-- Title Section -->
      <section class="header-section">
        <div class="header-text">
          <h1 class="page-title">Product Catalogue</h1>
          <p class="page-desc">Koleksi pilihan tas, pakaian, jaket, dan aksesoris berkualitas untuk melengkapi gaya harianmu.</p>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs">
          <button
            v-for="cat in mockCategories"
            :key="cat.id"
            class="tab-btn"
            :class="{ active: filters.category === cat.id }"
            @click="filters.category = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </section>

      <!-- Filter Controls Bar -->
      <section class="controls-bar">
        <div class="controls-left">
          <span class="count-info">
            Menampilkan <strong>{{ filteredProducts.length }}</strong> produk
          </span>
          <label class="stock-check">
            <input type="checkbox" v-model="filters.inStockOnly" />
            <span>Tersedia saja (In stock)</span>
          </label>
        </div>

        <div class="controls-right">
          <label for="sort" class="sort-label">Urutkan:</label>
          <select id="sort" v-model="filters.sortBy" class="sort-select">
            <option value="default">Default</option>
            <option value="price-asc">Harga: Terendah ke Tertinggi</option>
            <option value="price-desc">Harga: Tertinggi ke Terendah</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div>
      </section>

      <!-- Products Grid -->
      <section class="products-area">
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <p>Tidak ada produk yang cocok dengan pencarian atau filter ini.</p>
          <button class="reset-btn" @click="resetAllFilters">Reset Filter</button>
        </div>

        <div v-else class="products-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @quickView="openQuickView"
            @chatWhatsApp="openProductWhatsApp"
          />
        </div>
      </section>
    </main>

    <!-- Quick View Modal -->
    <ProductQuickView
      v-if="quickViewProduct"
      :product="quickViewProduct"
      @close="quickViewProduct = null"
      @chatWhatsApp="openProductWhatsApp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Product, FilterState } from '../types/product'
import { mockProducts, mockCategories } from '../data/mockProducts'
import ProductCard from '../components/ProductCard.vue'
import ProductQuickView from '../components/ProductQuickView.vue'
import { useToast } from '../composables/useToast'

useHead({
  title: 'Katalog Produk | Nagamas'
})

const WHATSAPP_PHONE = '6281234567890'
const { showToast } = useToast()

// State
const products = ref<Product[]>(mockProducts)
const quickViewProduct = ref<Product | null>(null)

const filters = reactive<FilterState>({
  search: '',
  category: 'all',
  inStockOnly: false,
  sortBy: 'default'
})

// Computed
const filteredProducts = computed(() => {
  let result = [...products.value]

  // Category filter
  if (filters.category !== 'all') {
    result = result.filter((p) => p.category === filters.category)
  }

  // Search filter
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase().trim()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }

  // Stock filter
  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock)
  }

  // Sort
  switch (filters.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'default':
    default:
      break
  }

  return result
})

// Methods
const resetAllFilters = () => {
  filters.search = ''
  filters.category = 'all'
  filters.inStockOnly = false
  filters.sortBy = 'default'
}

const openQuickView = (product: Product) => {
  quickViewProduct.value = product
}

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const openProductWhatsApp = (product: Product) => {
  const message = `Halo Admin, saya tertarik dan ingin menanyakan informasi / order produk berikut:\n\n*${product.name}*\nHarga: ${formatPrice(product.price)}\n\nApakah stok masih tersedia? Terima kasih.`
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`
  
  showToast('Membuka WhatsApp', `Menghubungi admin untuk produk ${product.name}...`, 'success')
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.catalogue-page {
  width: 100%;
}

.main-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 64px 20px;
}

/* Header & Tabs */
.header-section {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.page-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 20px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tab-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

/* Controls Bar */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 12px;
  flex-wrap: wrap;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.count-info {
  font-size: 0.85rem;
  color: #64748b;
}

.stock-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 0.82rem;
  color: #64748b;
}

.sort-select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 0.82rem;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.reset-btn {
  margin-top: 12px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
