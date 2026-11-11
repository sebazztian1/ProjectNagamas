<template>
  <div class="admin-trip-detail-page" v-if="trip">
    <!-- Breadcrumb & Header -->
    <div class="breadcrumb">
      <NuxtLink to="/admin">Admin</NuxtLink>
      <span>/</span>
      <NuxtLink to="/admin/trip">Jadwal Jastip</NuxtLink>
      <span>/</span>
      <span class="active">{{ trip.title }}</span>
    </div>

    <div class="trip-head-bar">
      <div>
        <div class="country-pill">{{ trip.flag }} {{ trip.country }} &bull; {{ trip.cityOrArea }}</div>
        <h1 class="trip-title">{{ trip.title }}</h1>
        <p class="trip-sub">Tutup PO: {{ trip.closeDate }} &bull; Estimasi Tiba: {{ trip.estimatedArrivalDate }}</p>
      </div>

      <div class="head-actions">
        <button class="btn-refresh" @click="refresh()" :disabled="pending">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
        <button class="btn-export-csv" @click="exportCSV">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </button>
        <button class="btn-add-product" @click="openCreateProductModal">
          + Tambah Produk ke Trip
        </button>
      </div>
    </div>

    <!-- Sub Navigation Tabs (Daftar Belanja vs Produk vs Order) -->
    <div class="trip-subtabs">
      <button class="subtab-btn" :class="{ active: currentTab === 'shopping' }" @click="currentTab = 'shopping'">
        Daftar Belanja ({{ shoppingList.length }})
      </button>
      <button class="subtab-btn" :class="{ active: currentTab === 'products' }" @click="currentTab = 'products'">
        Produk Trip ({{ tripProducts.length }})
      </button>
      <button class="subtab-btn" :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">
        Pesanan Masuk ({{ tripOrders.length }})
      </button>
    </div>

    <!-- TAB 1: SHOPPING LIST (REKAP BELANJA DI TOKO LUAR NEGERI) -->
    <div v-if="currentTab === 'shopping'" class="shopping-list-section">
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="40">Status</th>
              <th>Nama Barang</th>
              <th>Toko Sumber</th>
              <th>Harga Asal</th>
              <th>Total Qty</th>
              <th>Estimasi Modal</th>
              <th>Aksi Beli</th>
            </tr>
          </thead>
          <tbody v-if="shoppingList.length > 0">
            <tr v-for="item in shoppingList" :key="item.id" :class="{ 'row-bought': item.bought }">
              <td>
                <input type="checkbox" v-model="item.bought" />
              </td>
              <td>
                <strong>{{ item.name }}</strong>
                <span class="variant-text">{{ item.variant }}</span>
              </td>
              <td>
                <span class="store-tag">{{ item.store }}</span>
              </td>
              <td>{{ item.currency }} {{ item.originalPrice.toLocaleString('id-ID') }}</td>
              <td>
                <span class="qty-badge">{{ item.totalQty }} pcs</span>
              </td>
              <td><strong>{{ item.currency }} {{ (item.originalPrice * item.totalQty).toLocaleString('id-ID') }}</strong></td>
              <td>
                <button 
                  class="btn-toggle-buy" 
                  :class="{ bought: item.bought }"
                  @click="item.bought = !item.bought"
                >
                  {{ item.bought ? '✓ Sudah Dibeli' : 'Tandai Dibeli' }}
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="empty-cell">
                Belum ada rekap barang belanjaan. Item belanja akan otomatis muncul saat customer membuat pesanan di trip ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: PRODUCTS IN TRIP -->
    <div v-else-if="currentTab === 'products'" class="products-in-trip">
      <div class="section-toolbar">
        <div class="tb-left">
          <h3 class="tb-title">Katalog Produk Khusus Trip Ini</h3>
          <span class="tb-badge">{{ tripProducts.length }} produk terdaftar</span>
        </div>
        <button class="btn-add-product" @click="openCreateProductModal">
          + Tambah Produk Baru
        </button>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Toko / Asal</th>
              <th>Harga Jual (IDR)</th>
              <th>Kuota Slot</th>
              <th>Status</th>
              <th class="col-actions-head">Aksi</th>
            </tr>
          </thead>
          <tbody v-if="tripProducts.length > 0">
            <tr v-for="p in tripProducts" :key="p.id">
              <td class="col-product">
                <div class="prod-thumb">
                  <img :src="p.image || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80'" :alt="p.name" />
                </div>
                <div class="prod-info-txt">
                  <strong>{{ p.name }}</strong>
                  <span class="category-txt">{{ p.categoryName }}</span>
                </div>
              </td>
              <td>
                <span class="store-tag">{{ p.sourceStore || trip.cityOrArea || trip.country }}</span>
              </td>
              <td class="col-price">
                <strong>{{ formatRupiah(p.price) }}</strong>
                <span v-if="p.originalPrice" class="calc-hint">
                  {{ trip.currency }} {{ p.originalPrice.toLocaleString('id-ID') }}
                </span>
              </td>
              <td>
                <span class="quota-pill">{{ p.quota }} slot</span>
              </td>
              <td>
                <span class="stock-pill" :class="p.stockStatus">
                  {{ p.stockStatus === 'in_stock' ? 'Tersedia' : 'Habis' }}
                </span>
              </td>
              <td class="col-actions">
                <a :href="`/jastip/${trip.slug}/${p.slug}`" target="_blank" class="btn-action view" title="Lihat tampilan produk di katalog publik">
                  Lihat
                </a>
                <button class="btn-action delete" @click="deleteProduct(p)" title="Hapus produk dari trip ini">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="empty-cell-cta">
                <p>Belum ada produk untuk trip ini.</p>
                <button class="btn-add-product" @click="openCreateProductModal">
                  + Tambah Produk Pertama
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: ORDERS IN TRIP -->
    <div v-else class="orders-in-trip">
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode Order</th>
              <th>Customer</th>
              <th>Item Pesanan</th>
              <th>Total Tagihan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody v-if="tripOrders.length > 0">
            <tr v-for="ord in tripOrders" :key="ord.id">
              <td><strong>{{ ord.orderCode }}</strong></td>
              <td>
                <span>{{ ord.customerName }}</span>
                <span class="variant-text">{{ ord.customerPhone }}</span>
              </td>
              <td>{{ ord.itemsCount }} item</td>
              <td><strong>{{ formatRupiah(ord.totalAmount) }}</strong></td>
              <td>
                <span class="status-pill verified">{{ ord.status }}</span>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5" class="empty-cell">
                Belum ada pesanan yang masuk untuk trip ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah Produk Langsung ke Trip -->
    <div v-if="showProductModal" class="modal-backdrop" @click.self="showProductModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <div>
            <h3>Tambah Produk ke Trip</h3>
            <span class="modal-subhead">{{ trip.title }} ({{ trip.country }})</span>
          </div>
          <button class="close-x" @click="showProductModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="f-group">
            <label>Nama Produk:</label>
            <input v-model="form.name" type="text" placeholder="Contoh: Gentle Monster Sunglasses Her 01" required />
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
              <label>Toko Sumber / Lokasi Belanja:</label>
              <input v-model="form.sourceStore" type="text" :placeholder="`Contoh: Store Resmi di ${trip.country}`" />
            </div>
          </div>

          <!-- Currency Conversion Assistance Box -->
          <div class="calc-assist-card">
            <div class="ca-head">
              <span class="ca-title">Bantuan Konversi Kurs Trip</span>
              <span class="ca-rate">1 {{ trip.currency }} = Rp {{ trip.exchangeRate.toLocaleString('id-ID') }}</span>
            </div>
            <div class="ca-inputs-row">
              <div class="ca-field">
                <label>Harga Asli Asing ({{ trip.currency }}):</label>
                <input
                  v-model.number="form.originalPrice"
                  type="number"
                  placeholder="Contoh: 1500"
                  min="0"
                  @input="autoCalculateSellingPrice"
                />
              </div>
              <div class="ca-field">
                <label>
                  Harga Jual Akhir (IDR):
                  <span v-if="hasActiveVariants" class="auto-calc-badge">Otomatis dari Variasi</span>
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  placeholder="Contoh: 250000"
                  min="1"
                  :readonly="hasActiveVariants"
                  :class="{ 'input-readonly': hasActiveVariants }"
                  required
                />
              </div>
            </div>
            <div class="ca-fee-hint" v-if="form.originalPrice">
              <span>Estimasi pokok + fee titip:</span>
              <strong>{{ formatRupiah(suggestedPrice) }}</strong>
              <button
                type="button"
                class="btn-apply-calc"
                v-if="!hasActiveVariants"
                @click="form.price = suggestedPrice"
              >
                Gunakan Angka Ini
              </button>
            </div>
          </div>

          <div class="form-row-2">
            <div class="f-group">
              <label>
                Batas Kuota Slot Titip:
                <span v-if="hasActiveVariants" class="auto-calc-badge">Total Kuota Variasi</span>
              </label>
              <input
                v-model.number="form.quota"
                type="number"
                placeholder="15"
                min="0"
                :readonly="hasActiveVariants"
                :class="{ 'input-readonly': hasActiveVariants }"
                required
              />
            </div>
            <div class="f-group">
              <label>Status Stok:</label>
              <select v-model="form.stockStatus">
                <option value="in_stock">Buka / Tersedia</option>
                <option value="out_of_stock">Habis (Full Booked)</option>
              </select>
            </div>
          </div>

          <!-- Multi-Tier Variations Builder (Optional) -->
          <div class="variants-builder-card">
            <div class="vb-header">
              <div>
                <h4 class="vb-title">Variasi Produk <span class="vb-opt-tag">Opsional</span></h4>
                <p class="vb-sub">Beri pilihan variasi (mis. Warna, Ukuran) dengan harga & kuota masing-masing.</p>
              </div>
              <button type="button" class="btn-add-tier" @click="addVariantTier">
                + Tambah Variasi
              </button>
            </div>

            <div v-if="variantTiers.length === 0" class="vb-empty">
              Produk ini tanpa variasi (harga tunggal). Klik tombol di atas jika produk memiliki pilihan varian.
            </div>

            <div v-else class="vb-tiers-list">
              <div v-for="(tier, tIdx) in variantTiers" :key="tIdx" class="vb-tier-box">
                <div class="vb-tier-top">
                  <div class="vb-tier-name-wrap">
                    <span class="tier-badge">Tier {{ tIdx + 1 }}</span>
                    <input
                      v-model="tier.name"
                      type="text"
                      placeholder="Nama Variasi (cth: Warna, Ukuran)"
                      class="tier-name-input"
                      @input="rebuildVariantCombinations"
                    />
                  </div>
                  <button type="button" class="btn-remove-tier" @click="removeVariantTier(tIdx)">
                    Hapus
                  </button>
                </div>

                <div class="vb-tier-options-area">
                  <div class="vb-option-chips" v-if="tier.options.length > 0">
                    <span v-for="(opt, oIdx) in tier.options" :key="oIdx" class="vb-opt-chip">
                      {{ opt }}
                      <button type="button" class="chip-del" @click="removeTierOption(tIdx, oIdx)">&times;</button>
                    </span>
                  </div>
                  <div class="vb-add-opt-row">
                    <input
                      v-model="tier.draftOption"
                      type="text"
                      placeholder="Ketik opsi (cth: Hitam, Putih) lalu tekan Enter..."
                      @keydown.enter.prevent="addTierOption(tIdx)"
                    />
                    <button type="button" class="btn-add-opt" @click="addTierOption(tIdx)">
                      + Tambah
                    </button>
                  </div>
                </div>
              </div>

              <!-- Matrix Combinations -->
              <div v-if="variantCombinations.length > 0" class="vb-matrix-section">
                <div class="vb-table-wrap">
                  <table class="vb-matrix-table">
                    <thead>
                      <tr>
                        <th>Kombinasi</th>
                        <th>Harga Jual (IDR)</th>
                        <th>Kuota Slot</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="comb in variantCombinations" :key="comb.key">
                        <td><span class="comb-pill">{{ comb.label }}</span></td>
                        <td>
                          <div class="rupiah-input-box">
                            <span>Rp</span>
                            <input v-model.number="comb.price" type="number" min="1" required @input="syncBaseTotalsFromCombinations" />
                          </div>
                        </td>
                        <td>
                          <input v-model.number="comb.stock" type="number" min="0" class="stock-num-input" required @input="syncBaseTotalsFromCombinations" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Multi-Image Gallery -->
          <div class="f-group">
            <div class="gallery-label-row">
              <label>Foto & Galeri Produk:</label>
              <span class="gallery-count-hint">{{ form.galleryImages.length }} foto</span>
            </div>
            <div class="image-input-wrap">
              <input
                v-model="draftImageUrl"
                type="text"
                placeholder="Tempel URL gambar (https://...) lalu tekan Enter atau Upload Foto"
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
                  <button type="button" class="gp-remove-btn" @click="removeGalleryImage(idx)" title="Hapus foto">&times;</button>
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
            <textarea v-model="form.description" rows="3" placeholder="Keterangan barang titipan, estimasi pembelian, spesifikasi..."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="showProductModal = false">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSavingProduct">
              {{ isSavingProduct ? 'Menyimpan...' : 'Tambahkan ke Trip' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from '../../../composables/useToast'

definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const { showToast } = useToast()
const tripId = route.params.id as string

const currentTab = ref<'shopping' | 'products' | 'orders'>('shopping')

const { data: opData, pending, refresh } = await useFetch<any>(`/api/admin/trips/${tripId}/operations`)
const { data: categoriesData } = await useFetch<any>('/api/categories')

const categories = computed(() => categoriesData.value || [])
const trip = computed(() => opData.value?.trip)
const tripProducts = computed(() => opData.value?.products || [])
const tripOrders = computed(() => opData.value?.orders || [])

const shoppingList = ref<any[]>([])

watch(() => opData.value?.shoppingList, (val) => {
  if (val) {
    shoppingList.value = val.map((i: any) => ({ ...i, bought: false }))
  }
}, { immediate: true })

/* Product Creation Modal State */
const showProductModal = ref(false)
const isSavingProduct = ref(false)
const draftImageUrl = ref('')
const isUploadingImages = ref(false)

const form = ref({
  name: '',
  categoryId: 1,
  sourceStore: '',
  originalPrice: null as number | null,
  price: 250000,
  quota: 15,
  stockStatus: 'in_stock' as 'in_stock' | 'out_of_stock',
  imageUrl: '',
  galleryImages: [] as string[],
  description: ''
})

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
const hasActiveVariants = computed(() => variantCombinations.value.length > 0)

const suggestedPrice = computed(() => {
  if (!trip.value || !form.value.originalPrice) return 0
  const rate = Number(trip.value.exchangeRate) || 1
  const rawIdr = Number(form.value.originalPrice) * rate
  let fee = 0
  if (trip.value.feeType === 'percent') {
    fee = rawIdr * (Number(trip.value.feeValue) / 100)
  } else {
    fee = Number(trip.value.feeValue) || 30000
  }
  return Math.ceil((rawIdr + fee) / 1000) * 1000
})

const autoCalculateSellingPrice = () => {
  if (suggestedPrice.value > 0 && !hasActiveVariants.value) {
    form.value.price = suggestedPrice.value
  }
}

const openCreateProductModal = () => {
  const defaultCatId = categories.value[0]?.id || 1
  form.value = {
    name: '',
    categoryId: defaultCatId,
    sourceStore: trip.value?.cityOrArea || (trip.value?.country ? `Store Resmi di ${trip.value.country}` : ''),
    originalPrice: null,
    price: 200000,
    quota: 15,
    stockStatus: 'in_stock',
    imageUrl: '',
    galleryImages: [],
    description: ''
  }
  draftImageUrl.value = ''
  variantTiers.value = []
  variantCombinations.value = []
  showProductModal.value = true
}

onMounted(() => {
  if (route.query.add === '1' || route.query.action === 'add-product') {
    currentTab.value = 'products'
    openCreateProductModal()
  }
})

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
      showToast('Foto Diunggah', `${uploadedCount} foto berhasil ditambahkan.`, 'success')
    }
  } catch (err: any) {
    showToast('Gagal Upload', err?.data?.message || 'Gagal mengupload gambar', 'warning')
  } finally {
    isUploadingImages.value = false
    target.value = ''
  }
}

/* Variations builder logic */
const syncBaseTotalsFromCombinations = () => {
  if (variantCombinations.value.length === 0) return
  const validPrices = variantCombinations.value.map(c => Number(c.price) || 0).filter(p => p > 0)
  if (validPrices.length > 0) {
    form.value.price = Math.min(...validPrices)
  }
  const totalStock = variantCombinations.value.reduce((sum, c) => sum + Math.max(0, Number(c.stock) || 0), 0)
  form.value.quota = totalStock
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

  const defaultPrice = Number(form.value.price) > 0 ? Number(form.value.price) : 250000
  const defaultStock = Number(form.value.quota) || 10

  variantCombinations.value = acc.map((item) => {
    const key = item.opts.join(' | ')
    const label = activeTiers.length === 1
      ? `${activeTiers[0].name}: ${item.opts[0]}`
      : activeTiers.map((t, i) => `${t.name}: ${item.opts[i]}`).join(', ')
    return {
      key,
      label,
      values: item.values,
      price: defaultPrice,
      stock: defaultStock,
      sku: ''
    }
  })

  syncBaseTotalsFromCombinations()
}

const addVariantTier = () => {
  const defaultNames = ['Warna', 'Ukuran', 'Tipe']
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
  const parts = tier.draftOption.split(',').map(s => s.trim()).filter(Boolean)
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

const saveProduct = async () => {
  if (!form.value.name.trim()) {
    showToast('Validasi', 'Nama produk wajib diisi.', 'warning')
    return
  }

  isSavingProduct.value = true
  try {
    if (draftImageUrl.value.trim()) {
      addImageUrl()
    }
    form.value.imageUrl = form.value.galleryImages[0] || form.value.imageUrl || ''

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

    const payload = {
      name: form.value.name.trim(),
      categoryId: form.value.categoryId,
      productType: 'jastip',
      tripId: Number(tripId),
      price: Number(form.value.price),
      originalPrice: form.value.originalPrice ? Number(form.value.originalPrice) : null,
      originalCurrency: trip.value?.currency || 'USD',
      sourceStore: form.value.sourceStore || trip.value?.cityOrArea || '',
      quota: Number(form.value.quota) || 15,
      stockStatus: form.value.stockStatus,
      imageUrl: form.value.imageUrl,
      galleryImages: form.value.galleryImages,
      description: form.value.description,
      variants: variantsPayload
    }

    await $fetch('/api/admin/products', {
      method: 'POST',
      body: payload
    })

    showToast('Produk Ditambahkan', `"${payload.name}" berhasil didaftarkan ke trip ${trip.value.title}.`, 'success')
    showProductModal.value = false
    currentTab.value = 'products'
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menambah Produk', err?.data?.message || 'Terjadi kesalahan saat menambahkan produk.', 'warning')
  } finally {
    isSavingProduct.value = false
  }
}

const deleteProduct = async (p: any) => {
  const confirmed = confirm(`Hapus produk "${p.name}" dari katalog trip ini?`)
  if (!confirmed) return

  try {
    await $fetch(`/api/admin/products/${p.id}`, {
      method: 'DELETE'
    })
    showToast('Produk Dihapus', `Produk "${p.name}" telah dihapus.`, 'info')
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menghapus', err?.data?.message || 'Gagal menghapus produk.', 'warning')
  }
}

const exportCSV = () => {
  if (!trip.value) return
  const headers = 'Nama Barang,Varian,Toko Sumber,Qty,Harga Asli,Status\n'
  const rows = shoppingList.value.map(i => `"${i.name}","${i.variant}","${i.store}",${i.totalQty},"${i.currency} ${i.originalPrice}",${i.bought ? 'Sudah Dibeli' : 'Belum'}`).join('\n')
  
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daftar_belanja_${trip.value.slug || tripId}.csv`
  a.click()

  showToast('CSV Berhasil Diekspor', 'File daftar belanja trip telah diunduh.', 'success')
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}
</script>

<style scoped>
.admin-trip-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.trip-head-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.country-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
}

.trip-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 4px 0 2px;
}

.trip-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted, #7A6A55);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 9px 14px;
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

.btn-export-csv {
  background: #10B981;
  color: #ffffff;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-export-csv:hover {
  opacity: 0.9;
}

.btn-add-product {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-add-product:hover {
  background: var(--color-primary-hover, #6F5530);
}

.trip-subtabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  padding-bottom: 10px;
}

.subtab-btn {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted, #7A6A55);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.subtab-btn.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.tb-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tb-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0;
}

.tb-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: #FFFBF2;
  color: var(--color-primary, #8C6D3F);
  border: 1px solid #E5D7BE;
  padding: 2px 8px;
  border-radius: 999px;
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-canvas, #FFFBF2);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #7A6A55);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.data-table td {
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

.category-txt {
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
}

.row-bought {
  background: #F0FDF4;
}

.variant-text {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
}

.store-tag {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.74rem;
}

.qty-badge {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.8rem;
}

.quota-pill {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.stock-pill {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 700;
  display: inline-block;
}

.stock-pill.in_stock {
  background: #DCFCE7;
  color: #166534;
}

.stock-pill.out_of_stock {
  background: #FEE2E2;
  color: #991B1B;
}

.col-actions-head {
  text-align: center;
}

.col-actions {
  text-align: center;
  white-space: nowrap;
}

.btn-action {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  margin: 0 3px;
  text-decoration: none;
  display: inline-block;
  color: var(--color-text, #2B2116);
  transition: all 0.15s;
}

.btn-action.view:hover {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
}

.btn-action.delete {
  color: #DC2626;
}

.btn-action.delete:hover {
  background: #FEE2E2;
  border-color: #FECACA;
}

.btn-toggle-buy {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-toggle-buy.bought {
  background: #DCFCE7;
  color: #166534;
  border-color: #BBF7D0;
}

.status-pill.verified {
  background: #DCFCE7;
  color: #166534;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.74rem;
  font-weight: 700;
}

.calc-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
  display: block;
}

.empty-cell {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted, #7A6A55);
}

.empty-cell-cta {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted, #7A6A55);
}

.empty-cell-cta p {
  margin: 0 0 14px 0;
  font-size: 0.9rem;
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
  max-width: 720px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.modal-head h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 4px 0;
}

.modal-subhead {
  font-size: 0.78rem;
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
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

/* Calc assist card */
.calc-assist-card {
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ca-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
}

.ca-title {
  font-weight: 700;
  color: #2B2116;
}

.ca-rate {
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  background: #FAF5EA;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #E5D7BE;
}

.ca-inputs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ca-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ca-field label {
  font-size: 0.76rem;
  font-weight: 700;
  color: #2B2116;
}

.ca-field input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  background: #ffffff;
}

.ca-fee-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  border-top: 1px dashed #E5D7BE;
  padding-top: 8px;
  flex-wrap: wrap;
}

.ca-fee-hint strong {
  color: var(--color-primary, #8C6D3F);
}

.btn-apply-calc {
  background: #FAF5EA;
  border: 1px solid var(--color-primary, #8C6D3F);
  color: var(--color-primary, #8C6D3F);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-apply-calc:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
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

/* Gallery & upload */
.gallery-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gallery-count-hint {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
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

.btn-upload-file.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gallery-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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
  top: 4px;
  left: 4px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 3px;
}

.gp-index-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(43, 33, 22, 0.68);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 3px;
}

.gp-remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 38, 38, 0.9);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gp-card-actions {
  display: flex;
}

.gp-make-primary-btn {
  width: 100%;
  background: #ffffff;
  color: var(--color-primary, #8C6D3F);
  border: 1px solid #DECBB0;
  border-radius: 4px;
  padding: 3px 4px;
  font-size: 0.66rem;
  font-weight: 700;
  cursor: pointer;
}

/* Variations builder card */
.variants-builder-card {
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.vb-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #2B2116;
  margin: 0 0 2px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vb-opt-tag {
  font-size: 0.66rem;
  font-weight: 700;
  background: #EFE1C6;
  color: #6F5530;
  padding: 1px 6px;
  border-radius: 999px;
}

.vb-sub {
  font-size: 0.74rem;
  color: #7A6A55;
  margin: 0;
}

.btn-add-tier {
  background: #ffffff;
  color: #8C6D3F;
  border: 1px solid #8C6D3F;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
}

.vb-empty {
  font-size: 0.76rem;
  color: #7A6A55;
  background: #ffffff;
  border: 1px dashed #D6C3A5;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}

.vb-tiers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vb-tier-box {
  background: #ffffff;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vb-tier-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.vb-tier-name-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.tier-badge {
  background: #8C6D3F;
  color: #ffffff;
  font-size: 0.66rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.tier-name-input {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #EFE1C6;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 700;
}

.btn-remove-tier {
  background: #FEE2E2;
  color: #DC2626;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.vb-tier-options-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vb-option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.vb-opt-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #F7EEDC;
  color: #2B2116;
  border: 1px solid #E2D1B3;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
}

.chip-del {
  background: none;
  border: none;
  color: #8C6D3F;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.vb-add-opt-row {
  display: flex;
  gap: 6px;
}

.vb-add-opt-row input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #EFE1C6;
  border-radius: 5px;
  font-size: 0.78rem;
}

.btn-add-opt {
  background: #EFE1C6;
  color: #6F5530;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
}

.vb-table-wrap {
  background: #ffffff;
  border: 1px solid #EFE1C6;
  border-radius: 6px;
  overflow-x: auto;
}

.vb-matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.76rem;
}

.vb-matrix-table th {
  background: #FAF5EA;
  color: #6F5530;
  font-weight: 700;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #EFE1C6;
}

.vb-matrix-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #F5ECE0;
  vertical-align: middle;
}

.comb-pill {
  font-weight: 700;
  color: #2B2116;
  background: #FFFBF2;
  border: 1px solid #E5D7BE;
  padding: 2px 6px;
  border-radius: 4px;
}

.rupiah-input-box {
  display: flex;
  align-items: center;
  border: 1px solid #EFE1C6;
  border-radius: 4px;
  overflow: hidden;
  background: #ffffff;
}

.rupiah-input-box span {
  background: #FAF5EA;
  color: #7A6A55;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 6px;
  border-right: 1px solid #EFE1C6;
}

.rupiah-input-box input {
  border: none !important;
  padding: 4px 6px !important;
  font-size: 0.78rem;
  outline: none;
  width: 100%;
}

.stock-num-input {
  width: 70px;
  padding: 5px 6px;
  border: 1px solid #EFE1C6;
  border-radius: 4px;
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
  font-size: 0.84rem;
  cursor: pointer;
}

.btn-save {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
