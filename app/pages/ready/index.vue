<template>
  <div class="ready-catalog-page">
    <div class="page-container">
      <!-- Breadcrumb & Header -->
      <div class="page-header">
        <div class="breadcrumb">
          <NuxtLink to="/">Beranda</NuxtLink>
          <span>/</span>
          <span class="active">Ready Stock</span>
        </div>
        <div class="header-main">
          <div>
            <div class="ready-badge">
              <span class="dot"></span>
              Stok Tersedia di Warehouse Jakarta
            </div>
            <h1 class="page-title">Katalog Barang Ready Stock</h1>
            <p class="page-desc">
              Barang-barang impor dan sisa kuota trip sebelumnya yang sudah siap dikemas dan langsung dikirim ke alamat Anda.
            </p>
          </div>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-bar">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari barang ready..." 
          />
        </div>

        <div class="category-pills">
          <button 
            v-for="cat in categories" 
            :key="cat"
            class="pill" 
            :class="{ active: selectedCat === cat }"
            @click="selectedCat = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="sort-box">
          <label>Urutkan:</label>
          <select v-model="sortBy">
            <option value="default">Terbaru</option>
            <option value="price-asc">Harga: Terendah</option>
            <option value="price-desc">Harga: Tertinggi</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="ready-card"
        >
          <div class="card-image">
            <img :src="product.image" :alt="product.name" />
          </div>

          <div class="card-body">
            <span class="cat-label">{{ product.category }}</span>
            <NuxtLink :to="`/ready/${product.slug}`" class="prod-title-link">
              <h3 class="prod-title">{{ product.name }}</h3>
            </NuxtLink>

            <p class="prod-desc">{{ product.description }}</p>

            <div class="price-row">
              <div class="price-val">{{ formatRupiah(product.price) }}</div>
            </div>

            <div class="card-btn-group">
              <NuxtLink :to="`/ready/${product.slug}`" class="btn-detail">
                Lihat Detail
              </NuxtLink>
              <NuxtLink :to="`/checkout?productId=${product.id}&qty=1`" class="btn-checkout">
                Beli Sekarang
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-box">
        <p>Tidak ada produk ready stock yang cocok dengan pencarian Anda.</p>
        <button class="btn-clear" @click="resetFilter">Reset Filter</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApiProduct } from '../../composables/useProducts'

const searchQuery = ref('')
const selectedCat = ref('Semua')
const sortBy = ref('default')
const categories = ['Semua', 'Tas', 'Baju', 'Sepatu', 'Aksesoris', 'Lainnya']

const { data: productsData, status } = await useFetch<ApiProduct[]>('/api/products', {
  query: computed(() => ({
    type: 'ready',
    category: selectedCat.value !== 'Semua' ? selectedCat.value : undefined,
    search: searchQuery.value.trim() || undefined,
    sort: sortBy.value !== 'default' ? sortBy.value : undefined
  }))
})

const filteredProducts = computed(() => {
  return productsData.value || []
})

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}

const resetFilter = () => {
  searchQuery.value = ''
  selectedCat.value = 'Semua'
  sortBy.value = 'default'
}
</script>

<style scoped>
.ready-catalog-page {
  padding: 32px 24px 80px;
}

.page-container {
  max-width: 1440px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: var(--color-text-muted);
  transition: color 0.15s ease;
}

.breadcrumb a:hover {
  color: var(--brand-accent);
}

.breadcrumb .active {
  color: var(--brand-accent);
  font-weight: 700;
}

.ready-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--brand-primary);
  color: var(--brand-accent);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 12px;
  border: 1px solid rgba(216, 185, 120, 0.4);
  letter-spacing: 0.05em;
}

.ready-badge .dot {
  width: 6px;
  height: 6px;
  background: var(--brand-secondary);
  border-radius: 50%;
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  max-width: 720px;
  line-height: 1.65;
}

.filter-bar {
  margin: 36px 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  background: #FFFFFF;
  padding: 16px 22px;
  border-radius: var(--radius-md);
  border: 1px solid var(--brand-primary);
  box-shadow: var(--shadow-sm);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--brand-neutral);
  border: 1px solid var(--brand-primary);
  padding: 9px 14px;
  border-radius: var(--radius-full);
  min-width: 250px;
  color: var(--color-text-muted);
}

.search-box input {
  border: none;
  background: none;
  font-size: 0.88rem;
  color: var(--color-text);
  outline: none;
  width: 100%;
}

.category-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  background: var(--brand-neutral);
  border: 1px solid var(--brand-primary);
  color: var(--color-text-muted);
  padding: 7px 16px;
  border-radius: var(--radius-full);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill:hover {
  border-color: var(--brand-secondary);
  color: var(--brand-accent);
}

.pill.active {
  background: var(--brand-accent);
  color: #FFFBF2;
  border-color: var(--brand-accent);
  box-shadow: 0 4px 12px -2px rgba(140, 109, 63, 0.35);
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--color-text-muted);
}

.sort-box select {
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--brand-primary);
  background: var(--brand-neutral);
  font-size: 0.84rem;
  color: var(--color-text);
  outline: none;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.ready-card {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: var(--shadow-sm);
}

.ready-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--brand-secondary);
}

.card-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--brand-neutral);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.ready-card:hover .card-image img {
  transform: scale(1.05);
}

.badge-stock {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--color-ready-bg);
  color: var(--color-ready);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(59, 110, 72, 0.2);
}

.badge-origin {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 251, 242, 0.94);
  backdrop-filter: blur(4px);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--brand-primary);
  color: var(--color-text);
}

.card-body {
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-label {
  font-size: 0.68rem;
  color: var(--brand-accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.prod-title-link {
  text-decoration: none;
  color: inherit;
}

.prod-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}

.prod-title-link:hover .prod-title {
  color: var(--brand-accent);
}

.prod-desc {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  margin-top: auto;
  margin-bottom: 10px;
}

.price-val {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--brand-accent);
  letter-spacing: -0.01em;
}

.card-btn-group {
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

.btn-checkout {
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

.btn-checkout:hover {
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

.empty-box {
  text-align: center;
  padding: 72px 24px;
  background: #FFFFFF;
  border-radius: var(--radius-md);
  border: 1px solid var(--brand-primary);
  color: var(--color-text-muted);
}

.btn-clear {
  margin-top: 14px;
  background: var(--brand-accent);
  color: #FFFBF2;
  border: none;
  padding: 10px 22px;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-clear:hover {
  background: var(--color-primary-hover);
}
</style>
