<template>
  <div class="admin-categories-page">
    <div class="page-head">
      <div>
        <div class="breadcrumbs">
          <NuxtLink to="/admin">Admin</NuxtLink>
          <span>/</span>
          <span class="current">Kategori Produk</span>
        </div>
        <h1 class="page-title">Kelola Kategori Produk</h1>
      </div>
      <div class="head-actions">
        <button class="btn-refresh" @click="fetchCategories" :disabled="pending">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
        <button class="btn-add-category" @click="openCreateModal">+ Tambah Kategori</button>
      </div>
    </div>

    <!-- Search bar -->
    <div class="filter-bar">
      <div class="search-input-box">
        <input v-model="searchQuery" type="text" placeholder="Cari kategori..." />
      </div>
      <div class="count-tag">
        Total: {{ categories.length }} Kategori
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat kategori...</p>
    </div>

    <!-- Categories Table -->
    <div v-else class="table-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 70px;">ID</th>
            <th>Nama Kategori</th>
            <th>Slug</th>
            <th style="width: 140px;">Jumlah Produk</th>
            <th style="width: 160px; text-align: right;">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="filteredCategories.length > 0">
          <tr v-for="cat in filteredCategories" :key="cat.id">
            <td class="col-id">#{{ cat.id }}</td>
            <td class="col-name">
              <strong>{{ cat.name }}</strong>
            </td>
            <td class="col-slug">
              <code>{{ cat.slug }}</code>
            </td>
            <td>
              <span class="count-badge">{{ cat.productCount || 0 }} produk</span>
            </td>
            <td class="col-actions">
              <button class="btn-action edit" @click="openEditModal(cat)" title="Edit Kategori">Edit</button>
              <button 
                class="btn-action delete" 
                :disabled="cat.productCount > 0"
                :title="cat.productCount > 0 ? 'Tidak dapat dihapus karena masih ada produk terkait' : 'Hapus Kategori'"
                @click="confirmDelete(cat)"
              >
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="empty-state">
              Tidak ada kategori yang sesuai pencarian.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form (Create / Edit) -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="saveCategory" class="modal-form">
          <div class="form-group">
            <label>Nama Kategori <span class="required">*</span></label>
            <input 
              v-model="formName" 
              type="text" 
              placeholder="Contoh: Jam Tangan, Perawatan Kulit" 
              required 
              autofocus 
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Kategori') }}
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

useHead({
  title: 'Kelola Kategori Produk | Admin'
})

interface CategoryItem {
  id: number
  name: string
  slug: string
  productCount: number
}

const { showToast } = useToast()

const categories = ref<CategoryItem[]>([])
const pending = ref(true)
const searchQuery = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formName = ref('')
const isSaving = ref(false)

const fetchCategories = async () => {
  pending.value = true
  try {
    const data = await $fetch<CategoryItem[]>('/api/admin/categories')
    categories.value = data || []
  } catch (err: any) {
    showToast('Gagal Memuat', err?.data?.message || 'Gagal memuat kategori', 'warning')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchCategories()
})

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return categories.value
  return categories.value.filter(c => 
    c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  )
})

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formName.value = ''
  showModal.value = true
}

const openEditModal = (cat: CategoryItem) => {
  isEditing.value = true
  editingId.value = cat.id
  formName.value = cat.name
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formName.value = ''
  editingId.value = null
}

const saveCategory = async () => {
  if (!formName.value.trim()) return

  isSaving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/categories/${editingId.value}`, {
        method: 'PUT',
        body: { name: formName.value.trim() }
      })
      showToast('Berhasil', 'Kategori berhasil diperbarui', 'success')
    } else {
      await $fetch('/api/admin/categories', {
        method: 'POST',
        body: { name: formName.value.trim() }
      })
      showToast('Berhasil', 'Kategori baru berhasil ditambahkan', 'success')
    }
    closeModal()
    await fetchCategories()
  } catch (err: any) {
    showToast('Gagal Menyimpan', err?.data?.message || 'Terjadi kesalahan saat menyimpan kategori', 'warning')
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async (cat: CategoryItem) => {
  if (cat.productCount > 0) {
    showToast('Peringatan', `Kategori tidak dapat dihapus karena masih memiliki ${cat.productCount} produk.`, 'warning')
    return
  }

  const ok = confirm(`Hapus kategori "${cat.name}"?`)
  if (!ok) return

  try {
    await $fetch(`/api/admin/categories/${cat.id}`, {
      method: 'DELETE'
    })
    showToast('Berhasil', 'Kategori berhasil dihapus', 'success')
    await fetchCategories()
  } catch (err: any) {
    showToast('Gagal Menghapus', err?.data?.message || 'Gagal menghapus kategori', 'warning')
  }
}
</script>

<style scoped>
.admin-categories-page {
  padding: 30px 24px 60px;
  max-width: 1080px;
  margin: 0 auto;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 8px;
}

.breadcrumbs a {
  text-decoration: none;
  color: inherit;
}

.breadcrumbs .current {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 6px 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
}

.btn-add-category {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add-category:hover {
  background: var(--color-primary-hover, #6F5530);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: var(--color-canvas, #FFFBF2);
  border-color: var(--color-primary, #8C6D3F);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 0.8s linear infinite;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input-box input {
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  min-width: 260px;
  outline: none;
}

.search-input-box input:focus {
  border-color: var(--color-primary, #8C6D3F);
}

.count-tag {
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 600;
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.admin-table th {
  background: #FAF7F0;
  padding: 12px 16px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted, #7A6A55);
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #F5ECE0;
  vertical-align: middle;
}

.col-id {
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.8rem;
  font-family: monospace;
}

.col-name strong {
  color: var(--color-text, #2B2116);
  font-weight: 700;
}

.col-slug code {
  background: #F7EFE3;
  color: #7A5C2E;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.count-badge {
  display: inline-block;
  background: #FAF3E5;
  color: #8C6D3F;
  border: 1px solid #EFE1C6;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.76rem;
  font-weight: 600;
}

.col-actions {
  text-align: right;
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 6px;
  transition: all 0.15s;
}

.btn-action.edit {
  color: var(--color-primary, #8C6D3F);
}

.btn-action.edit:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.btn-action.delete {
  color: #C0392B;
}

.btn-action.delete:hover:not(:disabled) {
  background: #C0392B;
  color: #ffffff;
  border-color: #C0392B;
}

.btn-action:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: var(--color-text-muted, #7A6A55);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted, #7A6A55);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EFE1C6;
  border-top-color: var(--color-primary, #8C6D3F);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  background: #FAF7F0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-text, #2B2116);
  font-weight: 800;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--color-text, #2B2116);
}

.required {
  color: #C0392B;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  font-size: 0.88rem;
  box-sizing: border-box;
  outline: none;
}

.form-group input:focus {
  border-color: var(--color-primary, #8C6D3F);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text-muted, #7A6A55);
}

.btn-save {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover:not(:disabled) {
  background: var(--color-primary-hover, #6F5530);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

