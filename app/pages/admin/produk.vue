<template>
  <div class="admin-products-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Manajemen Produk (Ready Stock & Jastip)</h1>
        <p class="page-subtitle">Kelola inventaris barang ready di toko Jakarta serta katalog titip beli luar negeri per jadwal trip.</p>
      </div>
      <button class="btn-add-product" @click="showModal = true">+ Tambah Produk Baru</button>
    </div>

    <!-- Filter Tabs (Ready vs Jastip) -->
    <div class="type-filter-bar">
      <div class="tabs">
        <button class="t-btn" :class="{ active: typeFilter === 'all' }" @click="typeFilter = 'all'">Semua ({{ products.length }})</button>
        <button class="t-btn" :class="{ active: typeFilter === 'ready' }" @click="typeFilter = 'ready'">Ready Stock</button>
        <button class="t-btn" :class="{ active: typeFilter === 'jastip' }" @click="typeFilter = 'jastip'">Jastip (Pre-Order)</button>
      </div>

      <div class="search-input-box">
        <input v-model="searchQuery" type="text" placeholder="Cari nama produk..." />
      </div>
    </div>

    <!-- Products Table -->
    <div class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Tipe & Asal</th>
            <th>Harga Jual (IDR)</th>
            <th>Stok / Kuota</th>
            <th>Trip Terkait</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredProducts" :key="p.id">
            <td class="col-product">
              <div class="prod-thumb">
                <img :src="p.image" :alt="p.name" />
              </div>
              <div class="prod-info-txt">
                <strong>{{ p.name }}</strong>
                <span>{{ p.category }}</span>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="p.productType">
                {{ p.productType === 'ready' ? 'Ready Stock' : 'Jastip Luar Negeri' }}
              </span>
              <span class="country-text">{{ p.flag }} {{ p.country }}</span>
            </td>
            <td class="col-price">
              <strong>{{ formatRupiah(p.price) }}</strong>
              <span v-if="p.originalPrice" class="calc-hint">{{ p.originalCurrency }} {{ p.originalPrice }}</span>
            </td>
            <td>
              <span v-if="p.productType === 'ready'" class="stock-status in-stock">
                {{ p.stockQuantity }} pcs
              </span>
              <span v-else class="quota-status">
                {{ p.quotaRemaining }}/{{ p.quota }} slot
              </span>
            </td>
            <td>
              <span class="trip-tag">{{ p.tripTitle || '-' }}</span>
            </td>
            <td class="col-actions">
              <button class="btn-action edit" @click="editProduct(p)">Edit</button>
              <button class="btn-action delete" @click="deleteProduct(p.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form Add/Edit Product -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Tambah Produk Baru</h3>
          <button class="close-x" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-row-2">
            <div class="f-group">
              <label>Tipe Produk:</label>
              <select v-model="form.productType">
                <option value="ready">Ready Stock (Toko Jakarta)</option>
                <option value="jastip">Jastip Pre-Order (Luar Negeri)</option>
              </select>
            </div>
            <div class="f-group" v-if="form.productType === 'jastip'">
              <label>Tautkan ke Jadwal Trip:</label>
              <select v-model="form.tripId">
                <option value="trip-jpn-01">🇯🇵 Japan Autumn Special Trip</option>
                <option value="trip-kor-02">🇰🇷 Korea K-Beauty Trip</option>
              </select>
            </div>
          </div>

          <div class="f-group">
            <label>Nama Produk:</label>
            <input v-model="form.name" type="text" placeholder="Contoh: Rohto Melano CC Essence" required />
          </div>

          <div class="form-row-2">
            <div class="f-group">
              <label>Kategori:</label>
              <select v-model="form.category">
                <option>Skincare & Kecantikan</option>
                <option>Makanan & Snack</option>
                <option>Fashion & Pakaian</option>
                <option>Tas & Aksesoris</option>
              </select>
            </div>
            <div class="f-group">
              <label>Harga Jual Akhir (IDR):</label>
              <input v-model.number="form.price" type="number" placeholder="Contoh: 165000" required />
            </div>
          </div>

          <div class="form-row-2">
            <div class="f-group" v-if="form.productType === 'ready'">
              <label>Jumlah Stok Fisik:</label>
              <input v-model.number="form.stockQuantity" type="number" placeholder="10" />
            </div>
            <div class="f-group" v-else>
              <label>Batas Kuota Titip:</label>
              <input v-model.number="form.quota" type="number" placeholder="25" />
            </div>
            <div class="f-group">
              <label>Negara / Toko Asal:</label>
              <input v-model="form.country" type="text" placeholder="Jepang / Don Quijote" />
            </div>
          </div>

          <div class="f-group">
            <label>Deskripsi Singkat:</label>
            <textarea v-model="form.description" rows="2" placeholder="Keterangan produk..."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-save">Simpan Produk</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUnifiedProducts, type UnifiedProduct } from '../../data/mockJastipData'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()
const products = ref<UnifiedProduct[]>([...mockUnifiedProducts])
const typeFilter = ref<'all' | 'ready' | 'jastip'>('all')
const searchQuery = ref('')
const showModal = ref(false)

const form = ref({
  name: '',
  category: 'Skincare & Kecantikan',
  productType: 'ready',
  tripId: 'trip-jpn-01',
  price: 250000,
  stockQuantity: 10,
  quota: 20,
  country: 'Jepang',
  description: ''
})

const filteredProducts = computed(() => {
  let list = [...products.value]
  if (typeFilter.value !== 'all') {
    list = list.filter(p => p.productType === typeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q))
  }
  return list
})

const deleteProduct = (id: string) => {
  products.value = products.value.filter(p => p.id !== id)
  showToast({
    title: 'Produk Dihapus (Soft Delete)',
    message: 'Data riwayat order lama tetap aman.',
    type: 'info'
  })
}

const editProduct = (p: UnifiedProduct) => {
  showToast({
    title: 'Edit Produk',
    message: `Mode edit untuk ${p.name}`,
    type: 'info'
  })
}

const saveProduct = () => {
  const newP: UnifiedProduct = {
    id: 'prod-' + Date.now(),
    name: form.value.name,
    slug: form.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: form.value.description,
    category: form.value.category,
    productType: form.value.productType as 'ready' | 'jastip',
    country: form.value.country,
    flag: form.value.country.includes('Jepang') ? '🇯🇵' : '🇰🇷',
    price: form.value.price,
    stockStatus: 'in_stock',
    stockQuantity: form.value.stockQuantity,
    quota: form.value.quota,
    quotaRemaining: form.value.quota,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
  }
  products.value.unshift(newP)
  showModal.value = false
  showToast({
    title: 'Sukses',
    message: 'Produk baru berhasil ditambahkan.',
    type: 'success'
  })
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.admin-products-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
}

.btn-add-product {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-add-product:hover {
  background: var(--color-primary-hover, #384759);
}

.type-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 8px;
}

.t-btn {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.t-btn.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.search-input-box input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  width: 220px;
  outline: none;
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  background: var(--color-canvas, #F4F6F8);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
  vertical-align: middle;
}

.col-product {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prod-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
}

.prod-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prod-info-txt strong {
  display: block;
  font-size: 0.88rem;
}

.prod-info-txt span {
  font-size: 0.74rem;
  color: var(--color-text-muted, #64748B);
}

.type-badge {
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 2px;
}

.type-badge.ready {
  background: var(--color-ready-bg, #DCFCE7);
  color: var(--color-ready, #059669);
}

.type-badge.jastip {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
}

.country-text {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.col-price strong {
  display: block;
  color: var(--color-primary, #4A5D73);
}

.calc-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

.stock-status {
  font-weight: 700;
  color: var(--color-ready, #059669);
}

.quota-status {
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
}

.trip-tag {
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
}

.col-actions {
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-right: 6px;
}

.btn-action.edit:hover {
  background: var(--color-secondary, #E4E7EB);
}

.btn-action.delete {
  color: #DC2626;
}

.btn-action.delete:hover {
  background: #FEE2E2;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 580px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.close-x {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--color-text-muted, #64748B);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.f-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.f-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.f-group input, .f-group select, .f-group textarea {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  outline: none;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
}

.btn-cancel {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-save {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
