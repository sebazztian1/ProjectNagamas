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
          <h1 class="page-title">Ready Stock</h1>
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

        <div class="filter-dropdowns">
          <div class="sort-box">
            <label>Kategori:</label>
            <select v-model="selectedCat">
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
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
      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="ready-card"
        >
          <NuxtLink :to="`/ready/${product.slug}`" class="card-image">
            <img :src="product.image" :alt="product.name" loading="lazy" />
          </NuxtLink>

          <div class="card-body">
            <span class="cat-label">{{ product.category }}</span>
            <NuxtLink :to="`/ready/${product.slug}`" class="prod-title-link">
              <h3 class="prod-title">{{ product.name }}</h3>
            </NuxtLink>

            <div class="price-val">{{ formatRupiah(product.price) }}</div>

            <NuxtLink :to="`/checkout?productId=${product.id}&qty=1`" class="btn-checkout">
              Beli
            </NuxtLink>
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
import { ref, computed, watch } from 'vue'
import type { ApiProduct } from '../../composables/useProducts'

const route = useRoute()
const searchQuery = ref('')
const selectedCat = ref((route.query.category as string) || 'Semua')
const sortBy = ref('default')

watch(() => route.query.category, (newCat) => {
  if (typeof newCat === 'string' && newCat.trim()) {
    selectedCat.value = newCat
  } else {
    selectedCat.value = 'Semua'
  }
})

const { data: dbCategories } = await useFetch<any[]>('/api/categories')
const categories = computed(() => {
  const names: string[] = []
  if (dbCategories.value && dbCategories.value.length > 0) {
    dbCategories.value.forEach(c => {
      if (c.name && !names.includes(c.name)) names.push(c.name)
    })
  } else {
    names.push('Tas', 'Baju', 'Sepatu', 'Aksesoris', 'Lainnya')
  }
  names.sort((a, b) => {
    const isALainnya = a.trim().toLowerCase() === 'lainnya'
    const isBLainnya = b.trim().toLowerCase() === 'lainnya'
    if (isALainnya && !isBLainnya) return 1
    if (!isALainnya && isBLainnya) return -1
    return a.localeCompare(b, 'id')
  })
  return ['Semua', ...names]
})

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

.page-title {
  font-size: 1.9rem;
  margin: 0;
}

.filter-bar {
  margin: 20px 0 24px;
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

.filter-dropdowns {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}

.ready-card {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.ready-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--brand-secondary);
}

.card-image {
  display: block;
  aspect-ratio: 1 / 1;
  background: var(--brand-neutral);
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.ready-card:hover .card-image img {
  transform: scale(1.04);
}

.card-body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-label {
  font-size: 0.62rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
}

.prod-title-link {
  text-decoration: none;
  color: inherit;
}

.prod-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px;
  line-height: 1.35;
  min-height: 2.7em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.15s ease;
}

.prod-title-link:hover .prod-title {
  color: var(--brand-accent);
}

.price-val {
  margin-top: auto;
  margin-bottom: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--brand-accent);
  letter-spacing: -0.01em;
}

.btn-checkout {
  text-decoration: none;
  text-align: center;
  font-size: 0.76rem;
  font-weight: 600;
  color: #FFFBF2;
  background: var(--brand-accent);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--brand-accent);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-checkout:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
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
