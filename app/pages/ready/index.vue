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
              Stok Tersedia di Toko Jakarta
            </div>
            <h1 class="page-title">Katalog Barang Ready Stock</h1>
            <p class="page-desc">
              Barang-barang impor dan sisa kuota trip sebelumnya yang sudah siap kirim atau bisa diambil langsung di toko fisik hari ini.
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
            <span class="badge-stock">Tersedia {{ product.stockQuantity }} pcs</span>
            <span class="badge-origin">{{ product.flag }} {{ product.country }}</span>
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
import { mockUnifiedProducts } from '../../data/mockJastipData'

const searchQuery = ref('')
const selectedCat = ref('Semua')
const sortBy = ref('default')

const categories = ['Semua', 'Skincare & Kecantikan', 'Makanan & Snack', 'Fashion & Pakaian', 'Tas & Aksesoris']

const readyProducts = computed(() => {
  return mockUnifiedProducts.filter(p => p.productType === 'ready')
})

const filteredProducts = computed(() => {
  let list = [...readyProducts.value]

  if (selectedCat.value !== 'Semua') {
    list = list.filter(p => p.category === selectedCat.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }

  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price)
  }

  return list
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
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 12px;
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

.ready-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-ready-bg, #DCFCE7);
  color: var(--color-ready, #059669);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.ready-badge .dot {
  width: 6px;
  height: 6px;
  background: var(--color-ready, #059669);
  border-radius: 50%;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.page-desc {
  font-size: 0.92rem;
  color: var(--color-text-muted, #64748B);
  max-width: 700px;
}

.filter-bar {
  margin: 30px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid var(--color-secondary, #E4E7EB);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px 12px;
  border-radius: 8px;
  min-width: 240px;
}

.search-box input {
  border: none;
  background: none;
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
  outline: none;
  width: 100%;
}

.category-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.pill.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
}

.sort-box select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.82rem;
  color: var(--color-text, #1E293B);
  outline: none;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}

.ready-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ready-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(74, 93, 115, 0.12);
}

.card-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f1f5f9;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-stock {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--color-ready, #059669);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.badge-origin {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-label {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.prod-title-link {
  text-decoration: none;
  color: inherit;
}

.prod-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prod-desc {
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.4;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  margin-top: auto;
  margin-bottom: 14px;
}

.price-val {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
}

.card-btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-detail {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary, #4A5D73);
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px;
  border-radius: 6px;
}

.btn-checkout {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--color-primary, #4A5D73);
  padding: 8px;
  border-radius: 6px;
}

.empty-box {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
}

.btn-clear {
  margin-top: 10px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
