<template>
  <div class="admin-products-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Manajemen Produk (Ready Stock & Jastip)</h1>
        <p class="page-subtitle">Kelola inventaris barang ready di toko serta katalog titip beli luar negeri per jadwal trip langsung dari database.</p>
      </div>
      <button class="btn-add-product" @click="openCreateModal">+ Tambah Produk Baru</button>
    </div>

    <!-- Filter Tabs (Ready vs Jastip) & Search -->
    <div class="type-filter-bar">
      <div class="tabs">
        <button class="t-btn" :class="{ active: typeFilter === 'all' }" @click="typeFilter = 'all'">Semua ({{ products.length }})</button>
        <button class="t-btn" :class="{ active: typeFilter === 'ready' }" @click="typeFilter = 'ready'">Ready Stock ({{ readyCount }})</button>
        <button class="t-btn" :class="{ active: typeFilter === 'jastip' }" @click="typeFilter = 'jastip'">Jastip PO ({{ jastipCount }})</button>
      </div>

      <div class="search-input-box">
        <input v-model="searchQuery" type="text" placeholder="Cari nama produk..." />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data produk dari database...</p>
    </div>

    <!-- Products Table -->
    <div v-else class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Tipe & Asal</th>
            <th>Harga Jual (IDR)</th>
            <th>Stok / Status</th>
            <th>Trip Terkait</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody v-if="filteredProducts.length > 0">
          <tr v-for="p in filteredProducts" :key="p.id">
            <td class="col-product">
              <div class="prod-thumb">
                <img :src="p.imageUrl || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'" :alt="p.name" />
              </div>
              <div class="prod-info-txt">
                <strong>{{ p.name }}</strong>
                <span>{{ p.categoryName }} &bull; slug: {{ p.slug }}</span>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="p.productType">
                {{ p.productType === 'ready' ? 'Ready Stock' : 'Jastip PO' }}
              </span>
              <span class="country-text">{{ p.sourceStore || (p.tripCountry ? 'Store di ' + p.tripCountry : 'Store Resmi') }}</span>
            </td>
            <td class="col-price">
              <strong>{{ formatRupiah(p.price) }}</strong>
              <span v-if="p.originalPrice" class="calc-hint">{{ p.originalCurrency }} {{ p.originalPrice }}</span>
            </td>
            <td>
              <button 
                class="stock-toggle-btn"
                :class="p.stockStatus"
                @click="toggleStockStatus(p)"
                :title="p.stockStatus === 'in_stock' ? 'Klik untuk ubah jadi Habis' : 'Klik untuk ubah jadi Tersedia'"
              >
                {{ p.stockStatus === 'in_stock' ? (p.productType === 'ready' ? `Tersedia (${p.stockQuantity} pcs)` : `Buka (${p.quota} slot)`) : 'Habis (Out of Stock)' }}
              </button>
            </td>
            <td>
              <span class="trip-tag">{{ p.tripTitle || '-' }}</span>
            </td>
            <td class="col-actions">
              <button class="btn-action edit" @click="editProduct(p)" title="Edit rincian produk">Edit</button>
              <button class="btn-action duplicate" @click="duplicateProduct(p)" title="Duplikasi produk">Salin</button>
              <button class="btn-action delete" @click="deleteProduct(p)" title="Hapus produk (soft delete)">Hapus</button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" class="empty-cell">
              Tidak ada produk yang cocok dengan filter atau pencarian.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form Add/Edit Product -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>{{ isEditing ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
          <button class="close-x" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-row-2">
            <div class="f-group">
              <label>Tipe Produk:</label>
              <select v-model="form.productType">
                <option value="ready">Ready Stock</option>
                <option value="jastip">Jastip Pre-Order (Luar Negeri)</option>
              </select>
            </div>
            <div class="f-group" v-if="form.productType === 'jastip'">
              <label>Tautkan ke Jadwal Trip:</label>
              <select v-model="form.tripId">
                <option :value="null">-- Pilih Trip --</option>
                <option v-for="t in trips" :key="t.id" :value="t.id">
                  {{ t.country }} - {{ t.title }}
                </option>
              </select>
            </div>
            <div class="f-group" v-else>
              <label>Status Stok:</label>
              <select v-model="form.stockStatus">
                <option value="in_stock">Tersedia (In Stock)</option>
                <option value="out_of_stock">Habis (Out of Stock)</option>
              </select>
            </div>
          </div>

          <div class="f-group">
            <label>Nama Produk:</label>
            <input v-model="form.name" type="text" placeholder="Contoh: Aethel Minimalist Leather Tote Bag" required />
          </div>

          <div class="form-row-2">
            <div class="f-group">
              <label>Kategori:</label>
              <select v-model="form.categoryId" required>
                <option v-for="c in categories" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="f-group">
              <label>Harga Jual Akhir (IDR):</label>
              <input v-model.number="form.price" type="number" placeholder="Contoh: 1250000" min="1" required />
            </div>
          </div>

          <div class="form-row-2">
            <div class="f-group" v-if="form.productType === 'ready'">
              <label>Jumlah Stok Fisik:</label>
              <input v-model.number="form.stockQuantity" type="number" placeholder="10" min="0" />
            </div>
            <div class="f-group" v-else>
              <label>Batas Kuota Titip:</label>
              <input v-model.number="form.quota" type="number" placeholder="25" min="1" />
            </div>
            <div class="f-group">
              <label>Toko Sumber / Asal:</label>
              <input v-model="form.sourceStore" type="text" placeholder="Contoh: Don Quijote Ginza / Store Resmi" />
            </div>
          </div>

          <!-- Jastip Price Converter Assistance -->
          <div v-if="form.productType === 'jastip'" class="form-row-2 jastip-calc-row">
            <div class="f-group">
              <label>Harga Asli Asing (Mata Uang Asal):</label>
              <input v-model.number="form.originalPrice" type="number" placeholder="1500" />
            </div>
            <div class="f-group">
              <label>Mata Uang:</label>
              <input v-model="form.originalCurrency" type="text" placeholder="JPY / KRW / THB" maxlength="3" />
            </div>
          </div>

          <!-- Image URL and File Upload -->
          <div class="f-group">
            <label>URL Gambar Utama:</label>
            <div class="image-input-wrap">
              <input v-model="form.imageUrl" type="text" placeholder="https://images.unsplash.com/... atau upload" />
              <label class="btn-upload-file">
                <span>Upload Foto</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleFileUpload" style="display:none;" />
              </label>
            </div>
            <div v-if="form.imageUrl" class="image-preview">
              <img :src="form.imageUrl" alt="Preview Gambar" />
            </div>
          </div>

          <div class="f-group">
            <label>Deskripsi Singkat:</label>
            <textarea v-model="form.description" rows="3" placeholder="Keterangan lengkap produk, bahan, spesifikasi..."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambahkan Produk') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '../../composables/useToast'

definePageMeta({
  middleware: 'admin'
})

const { showToast } = useToast()

interface AdminProduct {
  id: number
  name: string
  slug: string
  description: string
  categoryId: number
  categoryName: string
  productType: 'ready' | 'jastip'
  tripId: number | null
  tripTitle: string | null
  tripCountry: string | null
  price: number
  originalPrice: number | null
  originalCurrency: string | null
  sourceStore: string | null
  imageUrl: string
  stockStatus: 'in_stock' | 'out_of_stock'
  stockQuantity: number
  quota: number
  maxQtyPerOrder: number
  variants: any
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

const { data: adminData, status, refresh } = await useFetch<{
  products: AdminProduct[]
  categories: { id: number; name: string; slug: string }[]
  trips: { id: number; title: string; slug: string; country: string; status: string }[]
}>('/api/admin/products')

const products = computed(() => adminData.value?.products || [])
const categories = computed(() => adminData.value?.categories || [])
const trips = computed(() => adminData.value?.trips || [])

const readyCount = computed(() => products.value.filter(p => p.productType === 'ready').length)
const jastipCount = computed(() => products.value.filter(p => p.productType === 'jastip').length)

const typeFilter = ref<'all' | 'ready' | 'jastip'>('all')
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const isSaving = ref(false)

const form = ref({
  name: '',
  categoryId: 1,
  productType: 'ready' as 'ready' | 'jastip',
  tripId: null as number | null,
  price: 250000,
  stockStatus: 'in_stock' as 'in_stock' | 'out_of_stock',
  stockQuantity: 10,
  quota: 20,
  originalPrice: null as number | null,
  originalCurrency: '',
  sourceStore: '',
  imageUrl: '',
  description: ''
})

const filteredProducts = computed(() => {
  let list = [...products.value]
  if (typeFilter.value !== 'all') {
    list = list.filter(p => p.productType === typeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  return list
})

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    name: '',
    categoryId: categories.value[0]?.id || 1,
    productType: 'ready',
    tripId: trips.value[0]?.id || null,
    price: 150000,
    stockStatus: 'in_stock',
    stockQuantity: 10,
    quota: 20,
    originalPrice: null,
    originalCurrency: '',
    sourceStore: '',
    imageUrl: '',
    description: ''
  }
  showModal.value = true
}

const editProduct = (p: AdminProduct) => {
  isEditing.value = true
  editingId.value = p.id
  form.value = {
    name: p.name,
    categoryId: p.categoryId,
    productType: p.productType,
    tripId: p.tripId,
    price: p.price,
    stockStatus: p.stockStatus,
    stockQuantity: p.stockQuantity,
    quota: p.quota,
    originalPrice: p.originalPrice,
    originalCurrency: p.originalCurrency || '',
    sourceStore: p.sourceStore || '',
    imageUrl: p.imageUrl || '',
    description: p.description || ''
  }
  showModal.value = true
}

const toggleStockStatus = async (p: AdminProduct) => {
  try {
    const res = await $fetch<{ success: boolean; message: string; product: any }>(`/api/admin/products/${p.id}/stock`, {
      method: 'PATCH',
      body: {}
    })
    showToast('Stok Diperbarui', res.message, 'success')
    await refresh()
  } catch (err: any) {
    showToast('Gagal', err?.data?.message || 'Gagal mengubah status stok', 'warning')
  }
}

const duplicateProduct = async (p: AdminProduct) => {
  const confirmDuplicate = confirm(`Duplikasi produk "${p.name}"?`)
  if (!confirmDuplicate) return

  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/products/${p.id}/duplicate`, {
      method: 'POST',
      body: {}
    })
    showToast('Sukses', res.message, 'success')
    await refresh()
  } catch (err: any) {
    showToast('Gagal', err?.data?.message || 'Gagal menduplikasi produk', 'warning')
  }
}

const deleteProduct = async (p: AdminProduct) => {
  const confirmDelete = confirm(`Hapus produk "${p.name}"? (Data riwayat pesanan lama tetap aman).`)
  if (!confirmDelete) return

  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/products/${p.id}`, {
      method: 'DELETE'
    })
    showToast('Produk Dihapus', res.message, 'info')
    await refresh()
  } catch (err: any) {
    showToast('Gagal', err?.data?.message || 'Gagal menghapus produk', 'warning')
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'products')

  try {
    const res = await $fetch<{ success: boolean; url?: string; fileUrl?: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })
    form.value.imageUrl = res.url || res.fileUrl || ''
    showToast('Foto Diunggah', 'Gambar produk berhasil diupload ke server.', 'success')
  } catch (err: any) {
    showToast('Gagal Upload', err?.data?.message || 'Gagal mengupload gambar', 'warning')
  } finally {
    target.value = ''
  }
}

const saveProduct = async () => {
  isSaving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/products/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
      showToast('Berhasil', 'Perubahan produk berhasil disimpan.', 'success')
    } else {
      await $fetch('/api/admin/products', {
        method: 'POST',
        body: form.value
      })
      showToast('Berhasil', 'Produk baru berhasil ditambahkan ke database.', 'success')
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menyimpan', err?.data?.message || 'Terjadi kesalahan saat menyimpan produk', 'warning')
  } finally {
    isSaving.value = false
  }
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
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
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
}

.btn-add-product {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-product:hover {
  background: var(--color-primary-hover, #6F5530);
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
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.t-btn.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.search-input-box input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  width: 240px;
  outline: none;
}

.loading-state {
  text-align: center;
  padding: 48px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  color: var(--color-text-muted, #7A6A55);
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  background: var(--color-canvas, #FFFBF2);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #7A6A55);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
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
  background: #F7EEDC;
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
  color: var(--color-text-muted, #7A6A55);
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
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
}

.country-text {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.col-price strong {
  display: block;
  color: var(--color-primary, #8C6D3F);
}

.calc-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.stock-toggle-btn {
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.stock-toggle-btn.in_stock {
  background: #DCFCE7;
  color: #059669;
}

.stock-toggle-btn.out_of_stock {
  background: #FEE2E2;
  color: #DC2626;
}

.trip-tag {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
}

.col-actions {
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-right: 6px;
  transition: all 0.15s;
}

.btn-action.edit:hover {
  background: var(--color-secondary, #EFE1C6);
}

.btn-action.duplicate:hover {
  background: #E0E7FF;
  border-color: #C7D2FE;
  color: #3730A3;
}

.btn-action.delete {
  color: #DC2626;
}

.btn-action.delete:hover {
  background: #FEE2E2;
  border-color: #FECACA;
}

.empty-cell {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted, #7A6A55);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(43, 33, 22, 0.5);
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
  max-width: 600px;
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
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.close-x {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--color-text-muted, #7A6A55);
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
  color: var(--color-text, #2B2116);
}

.f-group input, .f-group select, .f-group textarea {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  outline: none;
}

.image-input-wrap {
  display: flex;
  gap: 8px;
}

.image-input-wrap input {
  flex: 1;
}

.btn-upload-file {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.image-preview {
  margin-top: 6px;
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--color-secondary, #EFE1C6);
}

.btn-cancel {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-save {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
