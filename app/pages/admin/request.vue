<template>
  <div class="admin-requests-page">
    <div class="page-head">
      <h1 class="page-title">Request Produk</h1>

      <!-- Quick Action / Refresh -->
      <button class="btn-refresh" @click="refreshRequests" :disabled="pending">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filters-card">
      <div class="status-pills">
        <button 
          v-for="tab in statusTabs" 
          :key="tab.value" 
          class="pill-btn" 
          :class="{ active: currentStatus === tab.value }"
          @click="currentStatus = tab.value"
        >
          <span>{{ tab.label }}</span>
          <span v-if="getCountByStatus(tab.value) !== null" class="pill-count">
            {{ getCountByStatus(tab.value) }}
          </span>
        </button>
      </div>

      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari nama barang, customer, nomor WA..." 
        />
        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">&times;</button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <div v-if="pending" class="loading-container">
        <div class="spinner"></div>
        <span>Memuat data permintaan titip...</span>
      </div>

      <div v-else-if="filteredRequests.length === 0" class="empty-state">
        <h3>Tidak Ada Permintaan</h3>
        <p>Belum ada permintaan yang sesuai.</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Barang Request</th>
            <th>Customer & Kontak</th>
            <th>Trip / Negara Asal</th>
            <th>Status</th>
            <th>Harga Penawaran</th>
            <th class="th-actions">Aksi & Kelola</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredRequests" :key="r.id">
            <!-- Product Item & Reference -->
            <td class="col-item">
              <div 
                class="thumb" 
                :class="{ 'has-img': !!r.referenceImageUrl }"
                @click="r.referenceImageUrl && openImageModal(r.referenceImageUrl)"
              >
                <img v-if="r.referenceImageUrl" :src="r.referenceImageUrl" :alt="r.productName" />
                <div v-else class="no-thumb">📦</div>
                <span v-if="r.referenceImageUrl" class="thumb-zoom-tag">Zoom</span>
              </div>
              <div class="info">
                <strong class="item-title">{{ r.productName }}</strong>
                <p v-if="r.description" class="desc">{{ r.description }}</p>
                <div class="meta-row">
                  <a 
                    v-if="r.referenceLink" 
                    :href="r.referenceLink" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="ref-link"
                  >
                    🔗 Link Asal &rarr;
                  </a>
                  <span class="created-date">{{ formatDate(r.createdAt) }}</span>
                </div>
              </div>
            </td>

            <!-- Customer & Quick Contacts -->
            <td class="col-customer">
              <strong class="customer-name">{{ r.userName }}</strong>
              <div class="contact-links">
                <span v-if="r.customerPhone" class="phone-txt">{{ r.customerPhone }}</span>
                <span v-else class="sub-txt">No. Telp (-)</span>

                <div class="quick-chat-btns">
                  <!-- WhatsApp Link Shortcut -->
                  <a 
                    v-if="r.customerPhone" 
                    :href="getWhatsAppUrl(r.customerPhone, r.productName, r.quotedPrice)" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="btn-wa-shortcut" 
                    title="Chat Customer di WhatsApp"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-1.12-.075-.407-.132-.931-.322-1.614-.622-1.428-.627-2.355-2.072-2.427-2.167-.071-.096-.583-.775-.583-1.479 0-.705.367-1.053.498-1.196.131-.143.287-.179.382-.179s.191.006.274.012c.089.006.208-.034.324.246.12.288.409 1.002.445 1.074.036.072.06.155.012.251-.048.096-.072.155-.144.239-.072.084-.151.187-.216.251-.072.072-.147.151-.063.295.084.144.373.616.802.998.552.492 1.017.644 1.161.716.144.072.228.06.312-.036.084-.096.36-419.456-.563.096-.144.192-.12.324-.072.132.048.837.395.981.467.144.072.24.108.276.168.036.06.036.347-.108.752z"></path>
                    </svg>
                    <span>WA</span>
                  </a>

                  <!-- Live Chat Shortcut -->
                  <NuxtLink :to="`/admin/chat?userId=${r.userId}`" class="btn-livechat-shortcut" title="Buka Live Chat Admin">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Chat</span>
                  </NuxtLink>
                </div>
              </div>
            </td>

            <!-- Trip & Country -->
            <td>
              <div class="trip-info-cell">
                <span class="country-badge">
                  <span class="flag-icon">{{ r.flag }}</span>
                  {{ r.targetCountry }}
                </span>
                <span class="trip-sub-title">{{ r.tripTitle }}</span>
              </div>
            </td>

            <!-- Status -->
            <td>
              <span class="status-badge" :class="r.status">
                {{ formatStatus(r.status) }}
              </span>
            </td>

            <!-- Quote Value & Expiry -->
            <td>
              <div v-if="r.quotedPrice" class="quote-cell">
                <strong class="quote-val">{{ formatRupiah(r.quotedPrice) }}</strong>
                <span v-if="r.quoteExpiresAt" class="quote-exp-date">
                  Exp: {{ r.quoteExpiresAt }}
                </span>
              </div>
              <span v-else class="sub-txt">Belum Ada Penawaran</span>
            </td>

            <!-- Actions -->
            <td class="td-actions">
              <div class="action-btn-group">
                <!-- Quote Modal Trigger -->
                <button 
                  class="btn-action-quote" 
                  :class="{ 'btn-quote-edit': r.status === 'quoted' || r.status === 'accepted' }"
                  @click="openQuoteModal(r)"
                >
                  {{ r.quotedPrice ? 'Ubah Penawaran' : 'Beri Penawaran' }}
                </button>

                <!-- Convert to Product Modal Trigger -->
                <button 
                  v-if="r.status !== 'available'" 
                  class="btn-action-convert" 
                  @click="openConvertModal(r)"
                  title="Jadikan produk resmi di trip"
                >
                  + Jadikan Produk
                </button>
                <span v-else class="tag-catalog-done">
                  ✓ Sudah di Katalog
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal 1: Form Input / Update Quote -->
    <div v-if="selectedRequest && showQuoteModal" class="modal-backdrop" @click.self="closeQuoteModal">
      <div class="modal-box quote-modal-box">
        <div class="modal-head">
          <div>
            <h3>Penawaran Harga Resmi (Quote)</h3>
            <p class="modal-subhead">{{ selectedRequest.productName }} &bull; Customer: {{ selectedRequest.userName }}</p>
          </div>
          <button class="close-x" @click="closeQuoteModal">&times;</button>
        </div>

        <form @submit.prevent="submitQuote" class="modal-form">
          <!-- Request Context Summary -->
          <div class="request-summary-snippet">
            <img v-if="selectedRequest.referenceImageUrl" :src="selectedRequest.referenceImageUrl" class="snippet-thumb" />
            <div class="snippet-text">
              <span class="snippet-trip">Trip: {{ selectedRequest.flag }} {{ selectedRequest.tripTitle }} ({{ selectedRequest.targetCountry }})</span>
              <p v-if="selectedRequest.description" class="snippet-desc">"{{ selectedRequest.description }}"</p>
              <a v-if="selectedRequest.referenceLink" :href="selectedRequest.referenceLink" target="_blank" class="snippet-link">Lihat Link Referensi &rarr;</a>
            </div>
          </div>

          <div class="f-group">
            <label>Total Harga Penawaran Bersih (IDR) <span class="required">*</span></label>
            <input 
              v-model.number="quoteForm.price" 
              type="number" 
              placeholder="Contoh: 450000" 
              required 
              min="1000"
            />
            <span class="calc-hint">*Sudah mencakup harga barang di toko luar negeri + estimasi pajak + jasa titip (fee).</span>
          </div>

          <div class="grid-2">
            <div class="f-group">
              <label>Status Permintaan:</label>
              <select v-model="quoteForm.status">
                <option value="quoted">Quoted (Penawaran Siap untuk Customer)</option>
                <option value="reviewed">Reviewed (Sedang Dicek di Toko)</option>
                <option value="pending">Pending (Menunggu Review)</option>
                <option value="rejected">Rejected (Tolak Permintaan)</option>
              </select>
            </div>

            <div class="f-group">
              <label>Batas Masa Berlaku Penawaran:</label>
              <input 
                v-model="quoteForm.expiresAt" 
                type="date" 
              />
              <span class="calc-hint">Kosongkan jika tidak ada batas waktu khusus.</span>
            </div>
          </div>

          <div class="f-group">
            <label>Catatan Penawaran untuk Customer:</label>
            <textarea 
              v-model="quoteForm.note" 
              rows="3" 
              placeholder="Contoh: Stok tersedia di store Tokyo Station. Harga sudah termasuk proteksi bubble wrap tebal."
            ></textarea>
          </div>

          <div class="f-group">
            <label>Catatan Internal Admin (Hanya terlihat oleh tim admin):</label>
            <input 
              v-model="quoteForm.adminNote" 
              type="text" 
              placeholder="Contoh: Titip ke koper kedua, beli sebelum tanggal 15."
            />
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeQuoteModal">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSavingQuote">
              <span v-if="isSavingQuote">Menyimpan & Mengirim...</span>
              <span v-else>Simpan & Kirim Penawaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Convert to Official Trip Product -->
    <div v-if="selectedRequest && showConvertModal" class="modal-backdrop" @click.self="closeConvertModal">
      <div class="modal-box convert-modal-box">
        <div class="modal-head">
          <div>
            <h3>Jadikan Produk Resmi di Trip</h3>
            <p class="modal-subhead">Produk ini akan otomatis diterbitkan ke katalog jastip sehingga dapat dipesan oleh customer lain.</p>
          </div>
          <button class="close-x" @click="closeConvertModal">&times;</button>
        </div>

        <form @submit.prevent="submitConvert" class="modal-form">
          <div class="grid-2">
            <div class="f-group">
              <label>Pilih Trip Tujuan <span class="required">*</span></label>
              <select v-model="convertForm.tripId" required>
                <option :value="null" disabled>-- Pilih Trip Aktif --</option>
                <option v-for="t in allTrips" :key="t.id" :value="t.id">
                  {{ t.flag }} {{ t.title }} ({{ t.country }})
                </option>
              </select>
            </div>

            <div class="f-group">
              <label>Kategori Produk <span class="required">*</span></label>
              <select v-model="convertForm.categoryId" required>
                <option :value="null" disabled>-- Pilih Kategori --</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="f-group">
            <label>Nama Produk Katalog <span class="required">*</span></label>
            <input 
              v-model="convertForm.productName" 
              type="text" 
              required 
            />
          </div>

          <div class="f-group">
            <label>Harga Jual Katalog (IDR) <span class="required">*</span></label>
            <input 
              v-model.number="convertForm.price" 
              type="number" 
              required 
              min="1000"
            />
          </div>

          <div class="f-group">
            <label>Deskripsi Produk Katalog:</label>
            <textarea 
              v-model="convertForm.description" 
              rows="3"
            ></textarea>
          </div>

          <div v-if="selectedRequest.referenceImageUrl" class="preview-upload-box">
            <label>Foto Produk yang Digunakan:</label>
            <div class="preview-img-row">
              <img :src="selectedRequest.referenceImageUrl" class="convert-preview-thumb" />
              <span class="preview-img-hint">Foto referensi request akan otomatis dijadikan foto utama produk ini.</span>
            </div>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeConvertModal">Batal</button>
            <button type="submit" class="btn-save-gold" :disabled="isConverting">
              <span v-if="isConverting">Menerbitkan Produk...</span>
              <span v-else>Terbitkan ke Katalog Trip</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 3: Fullscreen Image Preview -->
    <div v-if="activeModalImage" class="modal-backdrop" @click="activeModalImage = null">
      <div class="img-preview-box" @click.stop>
        <button class="close-img-btn" @click="activeModalImage = null">&times;</button>
        <img :src="activeModalImage" alt="Preview Gambar Referensi" class="full-img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../../composables/useToast'
import { useAdminStats } from '../../composables/useAdminStats'

definePageMeta({
  middleware: 'admin'
})

const { showToast } = useToast()
const { fetchAdminStats } = useAdminStats()

interface AdminRequestItem {
  id: number
  productName: string
  description: string
  referenceImageUrl: string
  referenceLink: string
  userId: number
  userName: string
  customerPhone: string
  tripId: number | null
  tripTitle: string
  targetCountry: string
  flag: string
  tripStatus: string | null
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'available' | 'rejected'
  quotedPrice: number | null
  quoteNote: string
  quoteExpiresAt: string | null
  adminNote: string
  createdAt: string
}

interface TripOption {
  id: number
  title: string
  country: string
  flag: string
  slug: string
}

interface CategoryOption {
  id: number
  name: string
  slug: string
}

const statusTabs = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Menunggu Review', value: 'pending' },
  { label: 'Sedang Dicek', value: 'reviewed' },
  { label: 'Penawaran Siap', value: 'quoted' },
  { label: 'Disetujui', value: 'accepted' },
  { label: 'Sudah di Katalog', value: 'available' },
  { label: 'Ditolak', value: 'rejected' }
]

const currentStatus = ref('all')
const searchQuery = ref('')

// Fetch requests from DB
const { data: requestsData, pending, refresh: fetchRequests } = await useFetch<AdminRequestItem[]>('/api/admin/requests', {
  query: {
    status: currentStatus,
    search: searchQuery
  }
})

const refreshRequests = async () => {
  await Promise.all([fetchRequests(), fetchAdminStats(true)])
}

onMounted(() => {
  refreshRequests()
})

const rawRequests = computed<AdminRequestItem[]>(() => requestsData.value || [])

// Filtered list client-side fallback if needed
const filteredRequests = computed<AdminRequestItem[]>(() => {
  return rawRequests.value
})

const getCountByStatus = (statusVal: string) => {
  if (statusVal === 'all') return rawRequests.value.length
  return null
}

// Fetch trips for Convert Modal
const { data: rawTrips } = await useFetch<any[]>('/api/trips')
const allTrips = computed<TripOption[]>(() => {
  if (!rawTrips.value) return []
  return rawTrips.value.map(t => ({
    id: t.id,
    title: t.title,
    country: t.country,
    flag: t.flag || '✈️',
    slug: t.slug
  }))
})

// Fetch categories for Convert Modal
const { data: rawCategories } = await useFetch<any[]>('/api/categories')
const categories = computed<CategoryOption[]>(() => {
  if (!rawCategories.value) return []
  return rawCategories.value.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug
  }))
})

// Modals state
const selectedRequest = ref<AdminRequestItem | null>(null)
const showQuoteModal = ref(false)
const showConvertModal = ref(false)
const activeModalImage = ref<string | null>(null)

const isSavingQuote = ref(false)
const isConverting = ref(false)

// Form states
const quoteForm = ref({
  price: 0,
  status: 'quoted' as 'pending' | 'reviewed' | 'quoted' | 'rejected',
  expiresAt: '',
  note: '',
  adminNote: ''
})

const convertForm = ref({
  tripId: null as number | null,
  categoryId: null as number | null,
  productName: '',
  price: 0,
  description: ''
})

const openQuoteModal = (r: AdminRequestItem) => {
  selectedRequest.value = r
  quoteForm.value = {
    price: r.quotedPrice || 150000,
    status: (['quoted', 'reviewed', 'pending', 'rejected'].includes(r.status) ? (r.status as any) : 'quoted'),
    expiresAt: r.quoteExpiresAt ? r.quoteExpiresAt.split('T')[0] : '',
    note: r.quoteNote || 'Barang tersedia di store resmi. Harga sudah termasuk proteksi & fee titip.',
    adminNote: r.adminNote || ''
  }
  showQuoteModal.value = true
}

const closeQuoteModal = () => {
  showQuoteModal.value = false
  selectedRequest.value = null
}

const submitQuote = async () => {
  if (!selectedRequest.value) return
  if (!quoteForm.value.price || quoteForm.value.price <= 0) {
    showToast('Harga Tidak Valid', 'Harga penawaran harus lebih dari 0.', 'warning')
    return
  }

  isSavingQuote.value = true
  try {
    await $fetch(`/api/admin/requests/${selectedRequest.value.id}/quote`, {
      method: 'PATCH',
      body: {
        quotedPrice: quoteForm.value.price,
        quoteNote: quoteForm.value.note,
        quoteExpiresAt: quoteForm.value.expiresAt || null,
        adminNote: quoteForm.value.adminNote,
        status: quoteForm.value.status
      }
    })

    showToast(
      'Penawaran Berhasil Disimpan!',
      `Penawaran ${formatRupiah(quoteForm.value.price)} telah dikirim ke customer.`,
      'success'
    )

    closeQuoteModal()
    await refreshRequests()
  } catch (err: any) {
    showToast('Gagal Menyimpan', err.data?.message || 'Terjadi kesalahan saat menyimpan penawaran.', 'error')
  } finally {
    isSavingQuote.value = false
  }
}

const openConvertModal = (r: AdminRequestItem) => {
  selectedRequest.value = r
  convertForm.value = {
    tripId: r.tripId || (allTrips.value[0]?.id || null),
    categoryId: categories.value[0]?.id || null,
    productName: r.productName,
    price: r.quotedPrice || 250000,
    description: r.description || `Produk titip request khusus dari ${r.targetCountry}.`
  }
  showConvertModal.value = true
}

const closeConvertModal = () => {
  showConvertModal.value = false
  selectedRequest.value = null
}

const submitConvert = async () => {
  if (!selectedRequest.value) return
  if (!convertForm.value.tripId) {
    showToast('Pilih Trip', 'Mohon pilih trip tujuan untuk produk ini.', 'warning')
    return
  }
  if (!convertForm.value.categoryId) {
    showToast('Pilih Kategori', 'Mohon pilih kategori produk.', 'warning')
    return
  }
  if (!convertForm.value.price || convertForm.value.price <= 0) {
    showToast('Harga Tidak Valid', 'Harga jual harus lebih dari 0.', 'warning')
    return
  }

  isConverting.value = true
  try {
    const res = await $fetch<{ success: boolean; product: any }>(`/api/admin/requests/${selectedRequest.value.id}/convert`, {
      method: 'POST',
      body: {
        tripId: convertForm.value.tripId,
        categoryId: convertForm.value.categoryId,
        productName: convertForm.value.productName,
        price: convertForm.value.price,
        description: convertForm.value.description
      }
    })

    showToast(
      'Produk Diterbitkan ke Katalog!',
      `"${convertForm.value.productName}" kini aktif sebagai produk trip resmi.`,
      'success'
    )

    closeConvertModal()
    await refreshRequests()
  } catch (err: any) {
    showToast('Gagal Menjadikan Produk', err.data?.message || 'Terjadi kesalahan saat memproses produk.', 'error')
  } finally {
    isConverting.value = false
  }
}

const openImageModal = (url: string) => {
  activeModalImage.value = url
}

const getWhatsAppUrl = (phone: string, productName: string, price: number | null) => {
  let cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1)
  }
  const text = `Halo, kami dari dbb_luxe terkait request titip produk "${productName}"${price ? ` dengan penawaran ${formatRupiah(price)}` : ''}.`
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending: 'Menunggu Review',
    reviewed: 'Sedang Dicek',
    quoted: 'Penawaran Terkirim',
    accepted: 'Disetujui Customer',
    available: 'Sudah di Katalog',
    rejected: 'Ditolak'
  }
  return map[st] || st
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.admin-requests-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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
  max-width: 800px;
  line-height: 1.45;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 600;
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

/* Filters & Search */
.filters-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 12px 16px;
}

.status-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pill-btn {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.pill-btn:hover {
  background: #FDF7EC;
  color: var(--color-primary, #8C6D3F);
}

.pill-btn.active {
  background: var(--color-primary, #8C6D3F);
  border-color: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.pill-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 7px 12px;
  min-width: 280px;
}

.search-icon {
  color: var(--color-text-muted, #7A6A55);
  flex-shrink: 0;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.82rem;
  color: var(--color-text, #2B2116);
  width: 100%;
}

.clear-search {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

/* Table Card */
.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow-x: auto;
  box-shadow: 0 4px 16px -2px rgba(140, 109, 63, 0.04);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 70px 20px;
  color: var(--color-text-muted, #7A6A55);
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-secondary, #EFE1C6);
  border-top-color: var(--color-primary, #8C6D3F);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-muted, #7A6A55);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.empty-state p {
  font-size: 0.85rem;
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.45;
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
  white-space: nowrap;
}

.th-actions {
  text-align: right;
  padding-right: 20px;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
  vertical-align: middle;
}

/* Col Item */
.col-item {
  display: flex;
  gap: 12px;
  max-width: 340px;
}

.thumb {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  overflow: hidden;
  background: #F7EEDC;
  flex-shrink: 0;
  position: relative;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.thumb.has-img {
  cursor: pointer;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
}

.thumb-zoom-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(43, 33, 22, 0.75);
  color: #ffffff;
  font-size: 0.55rem;
  text-align: center;
  padding: 1px 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  line-height: 1.35;
}

.desc {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.ref-link {
  font-size: 0.72rem;
  color: var(--color-primary, #8C6D3F);
  text-decoration: none;
  font-weight: 700;
}

.ref-link:hover {
  text-decoration: underline;
}

.created-date {
  font-size: 0.7rem;
  color: var(--color-text-muted, #7A6A55);
}

/* Col Customer */
.col-customer {
  min-width: 150px;
}

.customer-name {
  display: block;
  font-size: 0.86rem;
  margin-bottom: 2px;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.phone-txt {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
}

.quick-chat-btns {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.btn-wa-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #25D366;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.btn-wa-shortcut:hover {
  opacity: 0.9;
}

.btn-livechat-shortcut {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  text-decoration: none;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-livechat-shortcut:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

/* Trip Cell */
.trip-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 200px;
}

.country-badge {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
}

.flag-icon {
  font-size: 0.95rem;
}

.trip-sub-title {
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Badges */
.status-badge {
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  display: inline-block;
  white-space: nowrap;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.reviewed {
  background: #E0F2FE;
  color: #0369A1;
}

.status-badge.quoted {
  background: #DCFCE7;
  color: #166534;
}

.status-badge.accepted {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.available {
  background: #EDE9FE;
  color: #6D28D9;
}

.status-badge.rejected {
  background: #FEE2E2;
  color: #991B1B;
}

/* Quote Cell */
.quote-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quote-val {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--color-primary, #8C6D3F);
}

.quote-exp-date {
  font-size: 0.68rem;
  color: var(--color-text-muted, #7A6A55);
}

.sub-txt {
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
}

/* Actions */
.td-actions {
  text-align: right;
  padding-right: 20px;
}

.action-btn-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-action-quote {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-action-quote:hover {
  background: #73572E;
}

.btn-action-quote.btn-quote-edit {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
}

.btn-action-quote.btn-quote-edit:hover {
  background: var(--color-canvas, #FFFBF2);
}

.btn-action-convert {
  background: #ffffff;
  border: 1px solid #C4B5FD;
  color: #6D28D9;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-action-convert:hover {
  background: #F5F3FF;
}

.tag-catalog-done {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6D28D9;
  background: #EDE9FE;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Modals Common */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 10, 5, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.quote-modal-box {
  max-width: 580px;
}

.convert-modal-box {
  max-width: 620px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.modal-head h3 {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 2px;
}

.modal-subhead {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
}

.close-x {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
  line-height: 1;
}

.modal-form {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-summary-snippet {
  display: flex;
  gap: 12px;
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 12px;
}

.snippet-thumb {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.snippet-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.snippet-trip {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
}

.snippet-desc {
  font-size: 0.76rem;
  color: var(--color-text, #2B2116);
  line-height: 1.35;
}

.snippet-link {
  font-size: 0.72rem;
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
  text-decoration: none;
}

.snippet-link:hover {
  text-decoration: underline;
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

.required {
  color: #DC2626;
}

.f-group input, .f-group select, .f-group textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
  outline: none;
  font-family: inherit;
  background: #ffffff;
}

.f-group input:focus, .f-group select:focus, .f-group textarea:focus {
  border-color: var(--color-primary, #8C6D3F);
  box-shadow: 0 0 0 3px rgba(140, 109, 63, 0.15);
}

.calc-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.preview-upload-box {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-upload-box label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.preview-img-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.convert-preview-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.preview-img-hint {
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
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
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

.btn-save {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #73572E;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save-gold {
  background: #6D28D9;
  color: #ffffff;
  border: none;
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-gold:hover:not(:disabled) {
  background: #5B21B6;
}

.btn-save-gold:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Image Fullscreen Preview */
.img-preview-box {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.full-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.close-img-btn {
  position: absolute;
  top: -40px;
  right: -10px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 2rem;
  cursor: pointer;
}

@media (max-width: 900px) {
  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    width: 100%;
  }
}
</style>
