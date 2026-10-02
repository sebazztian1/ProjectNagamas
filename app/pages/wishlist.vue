<template>
  <div class="wishlist-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Wishlist Favorit Saya</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Daftar Produk Favorit (Wishlist)</h1>
        <p class="page-subtitle">Simpan barang ready stock dan produk jastip incaran Anda sebelum kehabisan stok atau kuota PO tutup.</p>
      </div>

      <div v-if="wishlistItems.length > 0" class="wishlist-grid">
        <div v-for="item in wishlistItems" :key="item.id" class="wish-card">
          <div class="wish-image">
            <img :src="item.image" :alt="item.name" />
            <button class="btn-remove" @click="removeItem(item.id)" title="Hapus dari wishlist">
              &times;
            </button>
            <span v-if="item.productType === 'ready'" class="pill-ready">Ready Stock</span>
            <span v-else class="pill-jastip">Jastip PO {{ item.country }}</span>
          </div>

          <div class="wish-info">
            <span class="cat-text">{{ item.category }}</span>
            <h3 class="prod-title">{{ item.name }}</h3>

            <div class="price-val">{{ formatRupiah(item.price) }}</div>

            <div class="action-row">
              <NuxtLink 
                :to="item.productType === 'ready' ? `/ready/${item.slug}` : `/jastip/${item.tripSlug}/${item.slug}`" 
                class="btn-view"
              >
                Lihat Detail
              </NuxtLink>
              <NuxtLink :to="`/checkout?productId=${item.id}&qty=1`" class="btn-buy">
                Beli Sekarang
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Wishlist Anda masih kosong.</p>
        <NuxtLink to="/" class="btn-explore">Eksplorasi Katalog</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockUnifiedProducts } from '../data/mockJastipData'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const wishlistItems = ref([...mockUnifiedProducts.slice(0, 3)])

const removeItem = (id: string) => {
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== id)
  showToast({
    title: 'Dihapus',
    message: 'Barang berhasil dihapus dari Wishlist.',
    type: 'info'
  })
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.wishlist-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1140px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #64748B);
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}

.wish-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wish-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f1f5f9;
}

.wish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  color: #ffffff;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #DC2626;
}

.pill-ready {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--color-ready, #059669);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.pill-jastip {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.wish-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cat-text {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 4px;
}

.prod-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  line-height: 1.4;
  margin-bottom: 12px;
}

.price-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
  margin-top: auto;
  margin-bottom: 14px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-view {
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

.btn-buy {
  text-decoration: none;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--color-primary, #4A5D73);
  padding: 8px;
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  padding: 70px 20px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  color: var(--color-text-muted, #64748B);
}

.btn-explore {
  display: inline-block;
  margin-top: 12px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
}
</style>
