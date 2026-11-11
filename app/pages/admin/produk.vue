<template>
  <div class="admin-products-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Produk</h1>
      </div>
      <div class="head-actions">
        <button class="btn-refresh" @click="refresh()" :disabled="status === 'pending'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': status === 'pending' }">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
        <NuxtLink to="/admin/kategori" class="btn-manage-cat">Kelola Kategori</NuxtLink>
        <button class="btn-add-product" @click="openCreateModal">+ Tambah Produk Baru</button>
      </div>
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
      <p>Memuat produk...</p>
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
                <span v-if="p.galleryImages && p.galleryImages.length > 1" class="thumb-count-badge">
                  {{ p.galleryImages.length }} Foto
                </span>
              </div>
              <div class="prod-info-txt">
                <strong>{{ p.name }}</strong>
                <span>{{ p.categoryName }}</span>
                <div v-if="p.variants?.combinations?.length" class="prod-variant-badges">
                  <span class="variant-count-pill">
                    {{ p.variants.combinations.length }} Variasi ({{ formatVariantTiersSummary(p) }})
                  </span>
                </div>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="p.productType">
                {{ p.productType === 'ready' ? 'Ready Stock' : 'Jastip PO' }}
              </span>
              <span class="country-text">{{ p.sourceStore || (p.tripCountry ? 'Store di ' + p.tripCountry : 'Store Resmi') }}</span>
            </td>
            <td class="col-price">
              <strong>{{ getProductPriceDisplay(p) }}</strong>
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
              <div v-if="p.variants?.combinations?.length" class="variant-stock-mini">
                <span v-for="c in p.variants.combinations.slice(0, 3)" :key="c.key" class="v-stock-chip" :class="{ empty: c.stock <= 0 }">
                  {{ c.label }}: <b>{{ c.stock }}</b>
                </span>
                <span v-if="p.variants.combinations.length > 3" class="v-stock-more">
                  +{{ p.variants.combinations.length - 3 }} lainnya
                </span>
              </div>
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
              <div class="label-with-action">
                <label>Kategori:</label>
                <button 
                  type="button" 
                  class="btn-text-action" 
                  @click="showQuickCategory = !showQuickCategory"
                >
                  {{ showQuickCategory ? 'Tutup' : '+ Kategori Baru' }}
                </button>
              </div>

              <!-- Quick add input box if toggled -->
              <div v-if="showQuickCategory" class="quick-category-box">
                <input 
                  v-model="quickCategoryName" 
                  type="text" 
                  placeholder="Nama kategori baru..."
                  @keydown.enter.prevent="submitQuickCategory"
                />
                <button 
                  type="button" 
                  class="btn-quick-save" 
                  :disabled="isSavingQuickCategory || !quickCategoryName.trim()"
                  @click="submitQuickCategory"
                >
                  {{ isSavingQuickCategory ? '...' : 'Tambah' }}
                </button>
              </div>

              <select v-model="form.categoryId" required>
                <option v-for="c in categories" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="f-group">
              <label>
                Harga Jual Dasar (IDR):
                <span v-if="hasActiveVariants" class="auto-calc-badge">Otomatis dari Variasi Termurah</span>
              </label>
              <input
                v-model.number="form.price"
                type="number"
                placeholder="Contoh: 1250000"
                min="1"
                :readonly="hasActiveVariants"
                :class="{ 'input-readonly': hasActiveVariants }"
                required
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="f-group" v-if="form.productType === 'ready'">
              <label>
                Jumlah Stok Fisik:
                <span v-if="hasActiveVariants" class="auto-calc-badge">Total Stok Variasi</span>
              </label>
              <input
                v-model.number="form.stockQuantity"
                type="number"
                placeholder="10"
                min="0"
                :readonly="hasActiveVariants"
                :class="{ 'input-readonly': hasActiveVariants }"
              />
            </div>
            <div class="f-group" v-else>
              <label>
                Batas Kuota Titip:
                <span v-if="hasActiveVariants" class="auto-calc-badge">Total Kuota Variasi</span>
              </label>
              <input
                v-model.number="form.quota"
                type="number"
                placeholder="25"
                min="0"
                :readonly="hasActiveVariants"
                :class="{ 'input-readonly': hasActiveVariants }"
              />
            </div>
            <div class="f-group">
              <label>Toko Sumber / Asal:</label>
              <input v-model="form.sourceStore" type="text" placeholder="Contoh: Don Quijote Ginza / Store Resmi" />
            </div>
          </div>

          <!-- Multi-Tier Product Variations Section (Optional) -->
          <div class="variants-builder-card">
            <div class="vb-header">
              <div>
                <h4 class="vb-title">Variasi Produk <span class="vb-opt-tag">Opsional • Multi-Tier</span></h4>
                <p class="vb-sub">
                  Tambahkan 1 atau lebih tingkatan variasi (contoh: <b>Warna</b> lalu <b>Ukuran</b>). Setiap kombinasi memiliki harga & stok inventaris masing-masing.
                </p>
              </div>
              <button type="button" class="btn-add-tier" @click="addVariantTier">
                + Tambah Tingkatan Variasi
              </button>
            </div>

            <div v-if="variantTiers.length === 0" class="vb-empty">
              Produk ini menggunakan harga & stok tunggal. Klik <b>"+ Tambah Tingkatan Variasi"</b> jika produk memiliki pilihan variasi.
            </div>

            <div v-else class="vb-tiers-list">
              <div v-for="(tier, tIdx) in variantTiers" :key="tIdx" class="vb-tier-box">
                <div class="vb-tier-top">
                  <div class="vb-tier-name-wrap">
                    <span class="tier-badge">Tier {{ tIdx + 1 }}</span>
                    <input
                      v-model="tier.name"
                      type="text"
                      placeholder="Nama Variasi (cth: Warna, Ukuran, Tipe)"
                      class="tier-name-input"
                      @input="rebuildVariantCombinations"
                    />
                  </div>
                  <button type="button" class="btn-remove-tier" @click="removeVariantTier(tIdx)">
                    Hapus Tier
                  </button>
                </div>

                <div class="vb-tier-options-area">
                  <div class="vb-option-chips" v-if="tier.options.length > 0">
                    <span v-for="(opt, oIdx) in tier.options" :key="oIdx" class="vb-opt-chip">
                      {{ opt }}
                      <button type="button" class="chip-del" @click="removeTierOption(tIdx, oIdx)" title="Hapus opsi">&times;</button>
                    </span>
                  </div>
                  <div class="vb-add-opt-row">
                    <input
                      v-model="tier.draftOption"
                      type="text"
                      placeholder="Opsi (pisah koma), Enter"
                      @keydown.enter.prevent="addTierOption(tIdx)"
                    />
                    <button type="button" class="btn-add-opt" @click="addTierOption(tIdx)">
                      + Tambah Opsi
                    </button>
                  </div>
                </div>
              </div>

              <!-- Combination Matrix Table for Price & Inventory -->
              <div v-if="variantCombinations.length > 0" class="vb-matrix-section">
                <div class="vb-bulk-bar">
                  <span class="bulk-label">Atur Massal ({{ variantCombinations.length }} Kombinasi):</span>
                  <div class="bulk-inputs">
                    <input v-model.number="bulkPrice" type="number" placeholder="Harga (IDR)" min="1" />
                    <input v-model.number="bulkStock" type="number" :placeholder="form.productType === 'ready' ? 'Stok (pcs)' : 'Kuota (slot)'" min="0" />
                    <button type="button" class="btn-apply-bulk" @click="applyBulkToCombinations">
                      Terapkan ke Semua
                    </button>
                  </div>
                </div>

                <div class="vb-table-wrap">
                  <table class="vb-matrix-table">
                    <thead>
                      <tr>
                        <th>Kombinasi Variasi</th>
                        <th>Harga Jual (IDR)</th>
                        <th>{{ form.productType === 'ready' ? 'Stok Inventaris (pcs)' : 'Kuota Titip (slot)' }}</th>
                        <th>SKU / Kode (Opsional)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="comb in variantCombinations" :key="comb.key">
                        <td class="comb-label-cell">
                          <span class="comb-pill">{{ comb.label }}</span>
                        </td>
                        <td>
                          <div class="rupiah-input-box">
                            <span>Rp</span>
                            <input
                              v-model.number="comb.price"
                              type="number"
                              min="1"
                              required
                              @input="syncBaseTotalsFromCombinations"
                            />
                          </div>
                        </td>
                        <td>
                          <input
                            v-model.number="comb.stock"
                            type="number"
                            min="0"
                            class="stock-num-input"
                            required
                            @input="syncBaseTotalsFromCombinations"
                          />
                        </td>
                        <td>
                          <input
                            v-model="comb.sku"
                            type="text"
                            placeholder="SKU-01"
                            class="sku-txt-input"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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

          <!-- Multi-Image Gallery & File Upload -->
          <div class="f-group">
            <div class="gallery-label-row">
              <label>Foto & Galeri Produk (Bisa Banyak Gambar):</label>
              <span class="gallery-count-hint">{{ form.galleryImages.length }} foto ditambahkan</span>
            </div>
            <div class="image-input-wrap">
              <input
                v-model="draftImageUrl"
                type="text"
                placeholder="URL gambar (https://...)"
                @keydown.enter.prevent="addImageUrl"
              />
              <button type="button" class="btn-add-img-url" @click="addImageUrl" :disabled="!draftImageUrl.trim()">
                + Tambah URL
              </button>
              <label class="btn-upload-file" :class="{ disabled: isUploadingImages }">
                <span>{{ isUploadingImages ? 'Mengunggah...' : 'Upload Foto (Multi)' }}</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  :disabled="isUploadingImages"
                  @change="handleFileUpload"
                  style="display:none;"
                />
              </label>
            </div>
            <p class="gallery-help-text">
              Anda dapat memilih beberapa file foto sekaligus saat klik <b>Upload Foto (Multi)</b>. Foto pertama otomatis menjadi <b>Foto Utama</b>.
            </p>

            <div v-if="form.galleryImages.length > 0" class="gallery-preview-grid">
              <div
                v-for="(imgUrl, idx) in form.galleryImages"
                :key="idx"
                class="gallery-preview-card"
                :class="{ 'is-primary': idx === 0 }"
              >
                <div class="gp-img-wrap">
                  <img :src="imgUrl" :alt="`Foto produk ${idx + 1}`" />
                  <span v-if="idx === 0" class="gp-primary-badge">Utama</span>
                  <span v-else class="gp-index-badge">#{{ idx + 1 }}</span>
                  <button
                    type="button"
                    class="gp-remove-btn"
                    title="Hapus foto ini"
                    @click="removeGalleryImage(idx)"
                  >
                    &times;
                  </button>
                </div>
                <div class="gp-card-actions" v-if="idx > 0">
                  <button type="button" class="gp-make-primary-btn" @click="setAsPrimaryImage(idx)">
                    Jadikan Utama
                  </button>
                </div>
              </div>
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
  galleryImages?: string[]
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

const showQuickCategory = ref(false)
const quickCategoryName = ref('')
const isSavingQuickCategory = ref(false)

const submitQuickCategory = async () => {
  const name = quickCategoryName.value.trim()
  if (!name) return

  isSavingQuickCategory.value = true
  try {
    const res = await $fetch<{ success: boolean; category: { id: number; name: string; slug: string } }>('/api/admin/categories', {
      method: 'POST',
      body: { name }
    })
    if (res?.category) {
      if (adminData.value && adminData.value.categories) {
        adminData.value.categories.push(res.category)
      }
      form.value.categoryId = res.category.id
      quickCategoryName.value = ''
      showQuickCategory.value = false
      showToast('Kategori Ditambahkan', `Kategori "${res.category.name}" berhasil dibuat dan dipilih.`, 'success')
    }
  } catch (err: any) {
    showToast('Gagal Tambah Kategori', err?.data?.message || 'Terjadi kesalahan saat membuat kategori.', 'warning')
  } finally {
    isSavingQuickCategory.value = false
  }
}

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
  galleryImages: [] as string[],
  description: ''
})

const draftImageUrl = ref('')
const isUploadingImages = ref(false)

const addImageUrl = () => {
  const url = draftImageUrl.value.trim()
  if (!url) return
  if (!form.value.galleryImages.includes(url)) {
    form.value.galleryImages.push(url)
    form.value.imageUrl = form.value.galleryImages[0] || ''
  }
  draftImageUrl.value = ''
}

const removeGalleryImage = (index: number) => {
  form.value.galleryImages.splice(index, 1)
  form.value.imageUrl = form.value.galleryImages[0] || ''
}

const setAsPrimaryImage = (index: number) => {
  if (index <= 0 || index >= form.value.galleryImages.length) return
  const [picked] = form.value.galleryImages.splice(index, 1)
  if (picked) {
    form.value.galleryImages.unshift(picked)
    form.value.imageUrl = form.value.galleryImages[0] || ''
  }
}

interface EditableTier {
  name: string
  options: string[]
  draftOption: string
}

interface EditableCombination {
  id?: number
  key: string
  label: string
  values: Record<string, string>
  price: number
  stock: number
  sku: string
}

const variantTiers = ref<EditableTier[]>([])
const variantCombinations = ref<EditableCombination[]>([])
const bulkPrice = ref<number | null>(null)
const bulkStock = ref<number | null>(null)

const hasActiveVariants = computed(() => variantCombinations.value.length > 0)

const syncBaseTotalsFromCombinations = () => {
  if (variantCombinations.value.length === 0) return
  const validPrices = variantCombinations.value
    .map(c => Number(c.price) || 0)
    .filter(p => p > 0)
  if (validPrices.length > 0) {
    form.value.price = Math.min(...validPrices)
  }
  const totalStock = variantCombinations.value.reduce((sum, c) => sum + Math.max(0, Number(c.stock) || 0), 0)
  if (form.value.productType === 'ready') {
    form.value.stockQuantity = totalStock
  } else {
    form.value.quota = totalStock
  }
  form.value.stockStatus = totalStock > 0 ? 'in_stock' : 'out_of_stock'
}

const rebuildVariantCombinations = () => {
  const activeTiers = variantTiers.value
    .map((t, idx) => ({
      name: t.name.trim() || `Variasi ${idx + 1}`,
      options: t.options.map(o => o.trim()).filter(Boolean)
    }))
    .filter(t => t.options.length > 0)

  if (activeTiers.length === 0) {
    variantCombinations.value = []
    return
  }

  const prevByKey = new Map<string, EditableCombination>()
  for (const c of variantCombinations.value) {
    prevByKey.set(c.key, c)
    prevByKey.set(c.label.toLowerCase(), c)
  }

  let acc: { opts: string[]; values: Record<string, string> }[] = [{ opts: [], values: {} }]
  for (const tier of activeTiers) {
    const next: { opts: string[]; values: Record<string, string> }[] = []
    for (const prefix of acc) {
      for (const opt of tier.options) {
        next.push({
          opts: [...prefix.opts, opt],
          values: { ...prefix.values, [tier.name]: opt }
        })
      }
    }
    acc = next
  }

  const defaultPrice = Number(form.value.price) > 0 ? Number(form.value.price) : 150000
  const defaultStock = form.value.productType === 'ready'
    ? (Number(form.value.stockQuantity) || 5)
    : (Number(form.value.quota) || 10)

  variantCombinations.value = acc.map((item) => {
    const key = item.opts.join(' | ')
    const label = activeTiers.length === 1
      ? `${activeTiers[0].name}: ${item.opts[0]}`
      : activeTiers.map((t, i) => `${t.name}: ${item.opts[i]}`).join(', ')
    const existing = prevByKey.get(key) || prevByKey.get(item.opts.join(' || ')) || prevByKey.get(label.toLowerCase())
    return {
      id: existing?.id,
      key,
      label,
      values: item.values,
      price: existing ? Number(existing.price) : defaultPrice,
      stock: existing ? Number(existing.stock) : defaultStock,
      sku: existing?.sku || ''
    }
  })

  syncBaseTotalsFromCombinations()
}

const addVariantTier = () => {
  const defaultNames = ['Warna', 'Ukuran', 'Tipe', 'Kapasitas']
  const nextName = defaultNames[variantTiers.value.length] || `Variasi ${variantTiers.value.length + 1}`
  variantTiers.value.push({
    name: nextName,
    options: [],
    draftOption: ''
  })
}

const removeVariantTier = (index: number) => {
  variantTiers.value.splice(index, 1)
  rebuildVariantCombinations()
}

const addTierOption = (tierIndex: number) => {
  const tier = variantTiers.value[tierIndex]
  if (!tier || !tier.draftOption.trim()) return

  const parts = tier.draftOption
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  for (const part of parts) {
    if (!tier.options.includes(part)) {
      tier.options.push(part)
    }
  }
  tier.draftOption = ''
  rebuildVariantCombinations()
}

const removeTierOption = (tierIndex: number, optionIndex: number) => {
  const tier = variantTiers.value[tierIndex]
  if (!tier) return
  tier.options.splice(optionIndex, 1)
  rebuildVariantCombinations()
}

const applyBulkToCombinations = () => {
  for (const comb of variantCombinations.value) {
    if (bulkPrice.value !== null && bulkPrice.value > 0) {
      comb.price = Number(bulkPrice.value)
    }
    if (bulkStock.value !== null && bulkStock.value >= 0) {
      comb.stock = Number(bulkStock.value)
    }
  }
  syncBaseTotalsFromCombinations()
  showToast('Diterapkan', 'Harga & stok massal berhasil diterapkan ke seluruh kombinasi variasi.', 'info')
}

const formatVariantTiersSummary = (p: AdminProduct) => {
  const tiers = p.variants?.tiers
  if (Array.isArray(tiers) && tiers.length > 0) {
    return tiers.map((t: any) => t.name).join(' × ')
  }
  return 'Multi-Tier'
}

const getProductPriceDisplay = (p: AdminProduct) => {
  const combos = p.variants?.combinations
  if (Array.isArray(combos) && combos.length > 0) {
    const prices = combos.map((c: any) => Number(c.price) || 0).filter((v: number) => v > 0)
    if (prices.length > 0) {
      const minP = Math.min(...prices)
      const maxP = Math.max(...prices)
      if (minP !== maxP) {
        return `${formatRupiah(minP)} - ${formatRupiah(maxP)}`
      }
      return formatRupiah(minP)
    }
  }
  return formatRupiah(p.price)
}

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
    galleryImages: [],
    description: ''
  }
  draftImageUrl.value = ''
  variantTiers.value = []
  variantCombinations.value = []
  bulkPrice.value = null
  bulkStock.value = null
  showModal.value = true
}

const editProduct = (p: AdminProduct) => {
  isEditing.value = true
  editingId.value = p.id
  const initialGallery = Array.isArray(p.galleryImages) && p.galleryImages.length > 0
    ? [...p.galleryImages]
    : (p.imageUrl ? [p.imageUrl] : [])
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
    imageUrl: initialGallery[0] || p.imageUrl || '',
    galleryImages: initialGallery,
    description: p.description || ''
  }
  draftImageUrl.value = ''

  if (p.variants && Array.isArray(p.variants.tiers) && p.variants.tiers.length > 0) {
    variantTiers.value = p.variants.tiers.map((t: any) => ({
      name: String(t.name || ''),
      options: Array.isArray(t.options) ? [...t.options] : [],
      draftOption: ''
    }))
    variantCombinations.value = Array.isArray(p.variants.combinations)
      ? p.variants.combinations.map((c: any) => ({
          id: c.id,
          key: String(c.key || ''),
          label: String(c.label || ''),
          values: c.options ? { ...c.options } : (c.values ? { ...c.values } : {}),
          price: Number(c.price) || p.price,
          stock: Number(c.stock) >= 0 ? Number(c.stock) : 0,
          sku: c.sku ? String(c.sku) : ''
        }))
      : []
    if (variantCombinations.value.length === 0) {
      rebuildVariantCombinations()
    }
  } else {
    variantTiers.value = []
    variantCombinations.value = []
  }

  bulkPrice.value = null
  bulkStock.value = null
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
  const files = target.files ? Array.from(target.files) : []
  if (files.length === 0) return

  isUploadingImages.value = true
  let uploadedCount = 0
  try {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'products')

      const res = await $fetch<{ success: boolean; url?: string; fileUrl?: string }>('/api/upload', {
        method: 'POST',
        body: formData
      })
      const url = (res.url || res.fileUrl || '').trim()
      if (url && !form.value.galleryImages.includes(url)) {
        form.value.galleryImages.push(url)
        uploadedCount++
      }
    }
    form.value.imageUrl = form.value.galleryImages[0] || ''
    if (uploadedCount > 0) {
      showToast('Foto Diunggah', `${uploadedCount} foto produk berhasil diupload ke galeri.`, 'success')
    }
  } catch (err: any) {
    showToast('Gagal Upload', err?.data?.message || 'Gagal mengupload gambar', 'warning')
  } finally {
    isUploadingImages.value = false
    target.value = ''
  }
}

const saveProduct = async () => {
  isSaving.value = true
  try {
    // Flush any uncommitted draftImageUrl before saving
    if (draftImageUrl.value.trim()) {
      addImageUrl()
    }
    form.value.imageUrl = form.value.galleryImages[0] || form.value.imageUrl || ''

    // Flush any uncommitted draftOption text in tiers before saving
    for (let i = 0; i < variantTiers.value.length; i++) {
      if (variantTiers.value[i]?.draftOption?.trim()) {
        addTierOption(i)
      }
    }

    const activeTiers = variantTiers.value
      .map((t, idx) => ({
        name: t.name.trim() || `Variasi ${idx + 1}`,
        options: t.options.map(o => o.trim()).filter(Boolean)
      }))
      .filter(t => t.options.length > 0)

    const variantsPayload = activeTiers.length > 0 && variantCombinations.value.length > 0
      ? {
          tiers: activeTiers,
          combinations: variantCombinations.value.map(c => ({
            id: c.id,
            key: c.key,
            label: c.label,
            options: c.values,
            values: c.values,
            price: Number(c.price) || Number(form.value.price) || 0,
            stock: Math.max(0, Number(c.stock) || 0),
            sku: c.sku?.trim() || null
          }))
        }
      : null

    if (variantsPayload) {
      syncBaseTotalsFromCombinations()
    }

    const payload = {
      ...form.value,
      variants: variantsPayload
    }

    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/products/${editingId.value}`, {
        method: 'PUT',
        body: payload
      })
      showToast('Berhasil', 'Perubahan produk & variasi berhasil disimpan.', 'success')
    } else {
      await $fetch('/api/admin/products', {
        method: 'POST',
        body: payload
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
  position: relative;
  width: 48px;
  height: 48px;
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

.thumb-count-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(43, 33, 22, 0.78);
  color: #ffffff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 4px;
  line-height: 1.2;
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
  max-width: 760px;
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

.gallery-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.gallery-count-hint {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  padding: 2px 8px;
  border-radius: 999px;
}

.image-input-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.image-input-wrap input {
  flex: 1;
  min-width: 220px;
}

.btn-add-img-url {
  background: #ffffff;
  color: var(--color-primary, #8C6D3F);
  border: 1px solid var(--color-primary, #8C6D3F);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-add-img-url:hover:not(:disabled) {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.btn-add-img-url:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
  transition: all 0.15s;
}

.btn-upload-file:hover:not(.disabled) {
  background: #E2D1B3;
}

.btn-upload-file.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gallery-help-text {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
}

.gallery-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.gallery-preview-card {
  background: #FFFBF2;
  border: 1.5px solid #E5D7BE;
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gallery-preview-card.is-primary {
  border-color: var(--color-primary, #8C6D3F);
  box-shadow: 0 2px 8px rgba(140, 109, 63, 0.16);
}

.gp-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  background: #F4EBD9;
}

.gp-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gp-primary-badge {
  position: absolute;
  top: 5px;
  left: 5px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.gp-index-badge {
  position: absolute;
  top: 5px;
  left: 5px;
  background: rgba(43, 33, 22, 0.68);
  color: #ffffff;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.gp-remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 38, 38, 0.9);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gp-remove-btn:hover {
  background: #B91C1C;
}

.gp-card-actions {
  display: flex;
}

.gp-make-primary-btn {
  width: 100%;
  background: #ffffff;
  color: var(--color-primary, #8C6D3F);
  border: 1px solid #DECBB0;
  border-radius: 5px;
  padding: 4px 6px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.gp-make-primary-btn:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
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
  padding: 8px 14px;
  font-size: 0.82rem;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-manage-cat {
  background: #ffffff;
  color: var(--color-primary, #8C6D3F);
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s;
}

.btn-manage-cat:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.label-with-action label {
  margin-bottom: 0;
}

.btn-text-action {
  background: none;
  border: none;
  color: var(--color-primary, #8C6D3F);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-text-action:hover {
  color: var(--color-primary-hover, #6F5530);
}

.quick-category-box {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.quick-category-box input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 6px;
  font-size: 0.82rem;
  outline: none;
}

.quick-category-box input:focus {
  border-color: var(--color-primary, #8C6D3F);
}

.btn-quick-save {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-quick-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Multi-tier Variations Builder */
.prod-variant-badges {
  margin-top: 4px;
}

.variant-count-pill {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  background: #FFFBF2;
  color: #8C6D3F;
  border: 1px solid #E5D7BE;
  padding: 2px 8px;
  border-radius: 999px;
}

.variant-stock-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.v-stock-chip {
  font-size: 0.68rem;
  background: #F9F5EC;
  color: #5A4B3B;
  border: 1px solid #EFE1C6;
  padding: 1px 6px;
  border-radius: 4px;
}

.v-stock-chip.empty {
  background: #FEF2F2;
  color: #DC2626;
  border-color: #FECACA;
}

.v-stock-more {
  font-size: 0.68rem;
  color: #7A6A55;
  font-weight: 600;
}

.auto-calc-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: #8C6D3F;
  background: #F7EEDC;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.input-readonly {
  background: #F9F5EC;
  color: #7A6A55;
  cursor: not-allowed;
}

.variants-builder-card {
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.vb-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: #2B2116;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vb-opt-tag {
  font-size: 0.7rem;
  font-weight: 700;
  background: #EFE1C6;
  color: #6F5530;
  padding: 2px 8px;
  border-radius: 999px;
}

.vb-sub {
  font-size: 0.78rem;
  color: #7A6A55;
  margin: 0;
  line-height: 1.4;
}

.btn-add-tier {
  background: #ffffff;
  color: #8C6D3F;
  border: 1px solid #8C6D3F;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-add-tier:hover {
  background: #8C6D3F;
  color: #ffffff;
}

.vb-empty {
  font-size: 0.8rem;
  color: #7A6A55;
  background: #ffffff;
  border: 1px dashed #D6C3A5;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.vb-tiers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vb-tier-box {
  background: #ffffff;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vb-tier-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.vb-tier-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.tier-badge {
  background: #8C6D3F;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 5px;
  white-space: nowrap;
}

.tier-name-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #2B2116;
}

.btn-remove-tier {
  background: #FEE2E2;
  color: #DC2626;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
}

.vb-tier-options-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vb-option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vb-opt-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F7EEDC;
  color: #2B2116;
  border: 1px solid #E2D1B3;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.chip-del {
  background: none;
  border: none;
  color: #8C6D3F;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.chip-del:hover {
  color: #DC2626;
}

.vb-add-opt-row {
  display: flex;
  gap: 8px;
}

.vb-add-opt-row input {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
  font-size: 0.82rem;
}

.btn-add-opt {
  background: #EFE1C6;
  color: #6F5530;
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-add-opt:hover {
  background: #E2D1B3;
}

.vb-matrix-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.vb-bulk-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #F7EEDC;
  padding: 8px 12px;
  border-radius: 8px;
}

.bulk-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #5A4B3B;
}

.bulk-inputs {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.bulk-inputs input {
  width: 130px;
  padding: 5px 8px;
  border: 1px solid #D6C3A5;
  border-radius: 5px;
  font-size: 0.78rem;
  background: #ffffff;
}

.btn-apply-bulk {
  background: #8C6D3F;
  color: #ffffff;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.vb-table-wrap {
  background: #ffffff;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  overflow-x: auto;
}

.vb-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.vb-matrix-table th {
  background: #FAF5EA;
  color: #6F5530;
  font-weight: 700;
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #EFE1C6;
}

.vb-matrix-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #F5ECE0;
  vertical-align: middle;
}

.comb-pill {
  display: inline-block;
  font-weight: 700;
  color: #2B2116;
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  padding: 3px 8px;
  border-radius: 6px;
}

.rupiah-input-box {
  display: flex;
  align-items: center;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
}

.rupiah-input-box span {
  background: #FAF5EA;
  color: #7A6A55;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 8px;
  border-right: 1px solid #EFE1C6;
}

.rupiah-input-box input {
  border: none !important;
  padding: 6px 8px !important;
  width: 100%;
  font-size: 0.82rem;
  outline: none;
}

.stock-num-input {
  width: 90px;
  padding: 6px 8px;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
}

.sku-txt-input {
  width: 110px;
  padding: 6px 8px;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
}
</style>
