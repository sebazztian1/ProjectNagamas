<template>
  <div class="request-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Request</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Request Produk</h1>
      </div>

      <!-- Layout: Form + Requests History -->
      <div class="request-layout">
        <!-- Left: Request Form -->
        <div class="form-card">
          <div class="card-head">
            <h3>Form Pengajuan</h3>
          </div>

          <form @submit.prevent="submitRequest" class="req-form">
            <div class="form-group">
              <label>Nama Produk <span class="required">*</span></label>
              <input 
                v-model="form.productName" 
                type="text" 
                placeholder="Contoh: Starbucks Japan Sakura Tumbler 2026" 
                required 
              />
            </div>

            <div class="form-group">
              <label>Trip Tujuan</label>
              <select v-model="form.tripId">
                <option :value="null">Bebas / Belum Tentu</option>
                <option v-for="trip in openTrips" :key="trip.id" :value="trip.id">
                  {{ trip.flag }} {{ trip.title }} ({{ trip.country }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Link Referensi (Opsional)</label>
              <input 
                v-model="form.referenceLink" 
                type="url" 
                placeholder="https://..." 
              />
            </div>

            <div class="form-group">
              <label>Foto Barang (Opsional)</label>
              <input 
                ref="fileInputRef" 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                class="hidden-file-input" 
                @change="handleFileUpload" 
              />

              <!-- Upload Box / Preview -->
              <div v-if="!form.referenceImageUrl" class="upload-box" @click="triggerFileInput">
                <div v-if="isUploading" class="upload-loading">
                  <div class="spinner"></div>
                  <span>Mengunggah foto...</span>
                </div>
                <div v-else class="upload-content">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  <span>Klik untuk unggah foto referensi barang</span>
                  <span class="upload-hint">Format JPG, PNG, atau WebP (Maksimal 5MB)</span>
                </div>
              </div>

              <!-- Uploaded Preview -->
              <div v-else class="uploaded-preview">
                <img :src="form.referenceImageUrl" alt="Preview referensi" class="preview-img" @click="openImageModal(form.referenceImageUrl)" />
                <div class="preview-actions">
                  <span class="preview-label">Foto referensi siap dikirim</span>
                  <div class="btn-group-preview">
                    <button type="button" class="btn-preview-view" @click="openImageModal(form.referenceImageUrl)">Lihat Ukuran Penuh</button>
                    <button type="button" class="btn-preview-remove" @click="removeUploadedImage">Ganti Foto</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Catatan (Varian, Ukuran, Warna)</label>
              <textarea 
                v-model="form.description" 
                rows="3" 
                placeholder="Varian, ukuran, warna..."
              ></textarea>
            </div>

            <button type="submit" class="btn-submit-req" :disabled="isSubmitting || isUploading">
              <span v-if="isSubmitting">Mengirim...</span>
              <span v-else>Kirim Request</span>
            </button>
          </form>
        </div>

        <!-- Right: My Requests History -->
        <div class="history-card">
          <div class="card-head">
            <h3>Riwayat Request</h3>
            <span class="count-tag">{{ requestsList.length }}</span>
          </div>

          <!-- Loading State -->
          <div v-if="pending" class="loading-state">
            <div class="spinner"></div>
            <span>Memuat...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="requestsList.length === 0" class="empty-req">
            <h4>Belum Ada Request</h4>
            <p>Ajukan produk yang Anda cari melalui form di samping.</p>
          </div>

          <!-- List of Requests -->
          <div v-else class="req-list">
            <div v-for="req in requestsList" :key="req.id" class="req-item">
              <div class="req-item-top">
                <span class="req-country">
                  <span class="country-flag">{{ req.flag }}</span>
                  {{ req.tripTitle }}
                </span>
                <span class="status-tag" :class="req.status">
                  {{ formatStatus(req.status) }}
                </span>
              </div>

              <div class="req-content">
                <div v-if="req.referenceImageUrl" class="req-thumb" @click="openImageModal(req.referenceImageUrl)">
                  <img :src="req.referenceImageUrl" :alt="req.productName" />
                  <span class="zoom-indicator">Perbesar</span>
                </div>

                <div class="req-details">
                  <h4 class="req-prod-name">{{ req.productName }}</h4>
                  <p v-if="req.description" class="req-desc-text">{{ req.description }}</p>
                  
                  <div class="req-meta-links">
                    <a v-if="req.referenceLink" :href="req.referenceLink" target="_blank" rel="noopener noreferrer" class="link-ref">
                      🔗 Lihat Link Referensi Toko Asal &rarr;
                    </a>
                    <span class="req-date">Diajukan: {{ formatDate(req.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Quote Offered Section -->
              <div v-if="req.status === 'quoted'" class="quote-box">
                <div class="quote-header">
                  <div class="quote-title-group">
                    <span class="quote-badge-gold">PENAWARAN RESMI ADMIN</span>
                    <span class="quote-lbl">Total Harga Bersih:</span>
                  </div>
                  <strong class="quote-price">{{ formatRupiah(req.quotedPrice || 0) }}</strong>
                </div>

                <p v-if="req.quoteNote" class="quote-notes">
                  <strong>Catatan Admin:</strong> {{ req.quoteNote }}
                </p>

                <div v-if="req.quoteExpiresAt" class="quote-expiry" :class="{ 'is-expired': req.isExpired }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>
                    {{ req.isExpired ? 'Penawaran ini telah kedaluwarsa pada ' : 'Batas persetujuan: ' }}
                    {{ formatDate(req.quoteExpiresAt) }}
                  </span>
                </div>

                <!-- Actions if not expired -->
                <div v-if="!req.isExpired" class="quote-actions">
                  <button 
                    class="btn-accept-quote" 
                    :disabled="actionLoading === req.id"
                    @click="acceptQuote(req)"
                  >
                    Setujui & Buat Pesanan
                  </button>
                  <button 
                    class="btn-reject-quote" 
                    :disabled="actionLoading === req.id"
                    @click="rejectQuote(req.id)"
                  >
                    Tolak
                  </button>
                </div>
                <div v-else class="quote-expired-notice">
                  <span>Hubungi admin melalui Live Chat jika ingin memperpanjang penawaran.</span>
                </div>
              </div>

              <!-- Status Accepted Banner -->
              <div v-else-if="req.status === 'accepted'" class="accepted-banner">
                <div class="accepted-text">
                  <span class="check-icon">✓</span>
                  <div>
                    <strong>Penawaran Disetujui</strong>
                    <p>Pesanan telah dikonfirmasi dan masuk antrean pembelian trip.</p>
                  </div>
                </div>
                <strong class="accepted-price">{{ formatRupiah(req.quotedPrice || 0) }}</strong>
              </div>

              <!-- Status Available Banner (Converted to Catalog) -->
              <div v-else-if="req.status === 'available'" class="available-banner">
                <span class="sparkle-icon">✨</span>
                <div>
                  <strong>Produk Telah Ditambahkan ke Katalog Trip!</strong>
                  <p>Slot titip sudah dibuka. Produk bisa langsung dipesan.</p>
                </div>
              </div>

              <!-- Status Rejected Banner -->
              <div v-else-if="req.status === 'rejected'" class="rejected-banner">
                <span>Penawaran ditolak. Anda bisa membuat request baru.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="activeModalImage" class="image-modal-backdrop" @click="activeModalImage = null">
      <div class="image-modal-box" @click.stop>
        <button class="image-modal-close" @click="activeModalImage = null">&times;</button>
        <img :src="activeModalImage" alt="Preview Foto Referensi" class="image-modal-img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { useAuth } from '../composables/useAuth'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { showToast } = useToast()
const { token } = useAuth()

interface RequestItem {
  id: number
  productName: string
  description: string
  referenceImageUrl: string
  referenceLink: string
  tripId: number | null
  tripTitle: string
  targetCountry: string
  flag: string
  tripSlug: string
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'available' | 'rejected'
  quotedPrice: number | null
  quoteNote: string
  quoteExpiresAt: string | null
  adminNote: string
  isExpired: boolean
  createdAt: string
}

interface OpenTrip {
  id: number
  title: string
  country: string
  flag: string
  slug: string
}

// Fetch open trips from DB for selection
const { data: rawTrips } = await useFetch<any[]>('/api/trips?status=open')

const openTrips = computed<OpenTrip[]>(() => {
  if (!rawTrips.value) return []
  return rawTrips.value.map(t => ({
    id: t.id,
    title: t.title,
    country: t.country,
    flag: t.flag || '✈️',
    slug: t.slug
  }))
})

// Fetch requests from DB
const { data: requestsData, pending, refresh } = await useFetch<RequestItem[]>('/api/requests', {
  headers: computed(() => token.value ? { Authorization: `Bearer ${token.value}` } : {})
})

const requestsList = computed<RequestItem[]>(() => requestsData.value || [])

// Form state
const form = ref({
  productName: '',
  tripId: null as number | null,
  referenceLink: '',
  referenceImageUrl: '',
  description: ''
})

const isUploading = ref(false)
const isSubmitting = ref(false)
const actionLoading = ref<number | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const activeModalImage = ref<string | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran File Terlalu Besar', 'Maksimal ukuran foto adalah 5MB.', 'error')
    return
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'requests')

    const res = await $fetch<{ success: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (res.success && res.url) {
      form.value.referenceImageUrl = res.url
      showToast('Foto Terunggah', 'Foto tersimpan.', 'success')
    }
  } catch (err: any) {
    showToast('Gagal Mengunggah', err.data?.message || 'Gagal mengunggah foto.', 'error')
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const removeUploadedImage = () => {
  form.value.referenceImageUrl = ''
}

const submitRequest = async () => {
  if (!form.value.productName.trim()) {
    showToast('Nama Produk Wajib', 'Isi nama produk yang ingin dititip.', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    await $fetch('/api/requests', {
      method: 'POST',
      body: {
        productName: form.value.productName,
        tripId: form.value.tripId,
        referenceLink: form.value.referenceLink,
        referenceImageUrl: form.value.referenceImageUrl,
        description: form.value.description
      }
    })

    showToast('Request Berhasil Dikirim', 'Admin akan mengirim penawaran harga.', 'success')
    
    // Reset form
    form.value.productName = ''
    form.value.tripId = null
    form.value.referenceLink = ''
    form.value.referenceImageUrl = ''
    form.value.description = ''

    await refresh()
  } catch (err: any) {
    showToast('Gagal Mengirim Request', err.data?.message || 'Gagal mengirim request.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const acceptQuote = async (req: RequestItem) => {
  actionLoading.value = req.id
  try {
    await $fetch(`/api/requests/${req.id}/status`, {
      method: 'PATCH',
      body: { status: 'accepted' }
    })

    showToast('Penawaran Diterima!', 'Menuju checkout...', 'success')
    await refresh()

    // Redirect to checkout with quote details
    router.push({
      path: '/checkout',
      query: {
        quoteId: String(req.id),
        productName: req.productName,
        price: String(req.quotedPrice || 0),
        image: req.referenceImageUrl || ''
      }
    })
  } catch (err: any) {
    showToast('Gagal Menyetujui', err.data?.message || 'Gagal memproses persetujuan penawaran.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const rejectQuote = async (id: number) => {
  if (!confirm('Apakah Anda yakin ingin menolak penawaran harga ini?')) {
    return
  }

  actionLoading.value = id
  try {
    await $fetch(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: { status: 'rejected' }
    })

    showToast('Penawaran Ditolak', 'Penawaran ditolak.', 'info')
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menolak', err.data?.message || 'Gagal memproses penolakan.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const openImageModal = (url: string) => {
  activeModalImage.value = url
}

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending: 'Menunggu Review Admin',
    reviewed: 'Sedang Dicek Toko Asal',
    quoted: 'Penawaran Harga Siap!',
    accepted: 'Penawaran Disetujui',
    available: 'Tersedia di Katalog',
    rejected: 'Penawaran Ditolak'
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.request-page {
  padding: 30px 20px 80px;
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
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: var(--color-primary, #8C6D3F);
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--font-display, Georgia, serif);
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-muted, #7A6A55);
  max-width: 800px;
  line-height: 1.55;
}

.request-layout {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 32px;
  align-items: start;
}

.form-card, .history-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 4px 18px -3px rgba(140, 109, 63, 0.06);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.card-head h3 {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.28rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
}

.badge-free {
  font-size: 0.72rem;
  background: var(--color-canvas, #FFFBF2);
  color: var(--color-primary, #8C6D3F);
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid var(--color-secondary, #EFE1C6);
  white-space: nowrap;
}

.count-tag {
  font-size: 0.75rem;
  background: var(--color-canvas, #FFFBF2);
  color: var(--color-primary, #8C6D3F);
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid var(--color-secondary, #EFE1C6);
  white-space: nowrap;
}

.req-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--color-text, #2B2116);
}

.required {
  color: #DC2626;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  outline: none;
  font-family: inherit;
  background: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--color-primary, #8C6D3F);
  box-shadow: 0 0 0 3px rgba(140, 109, 63, 0.15);
}

.field-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.hidden-file-input {
  display: none;
}

.upload-box {
  border: 2px dashed var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 24px;
  background: var(--color-canvas, #FFFBF2);
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.upload-box:hover {
  background: #FDF7EC;
  border-color: var(--color-primary, #8C6D3F);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-hint {
  font-size: 0.72rem;
  color: var(--color-primary, #8C6D3F);
  opacity: 0.85;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--color-primary, #8C6D3F);
}

.uploaded-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  background: var(--color-canvas, #FFFBF2);
}

.preview-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.preview-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #166534;
}

.btn-group-preview {
  display: flex;
  gap: 8px;
}

.btn-preview-view {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.74rem;
  color: var(--color-primary, #8C6D3F);
  cursor: pointer;
}

.btn-preview-remove {
  background: #ffffff;
  border: 1px solid #FECACA;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 0.74rem;
  color: #DC2626;
  cursor: pointer;
}

.btn-submit-req {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 13px 24px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s;
  box-shadow: 0 4px 14px -2px rgba(140, 109, 63, 0.3);
}

.btn-submit-req:hover:not(:disabled) {
  background: #73572E;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px -2px rgba(140, 109, 63, 0.4);
}

.btn-submit-req:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* History List */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--color-text-muted, #7A6A55);
}

.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid var(--color-secondary, #EFE1C6);
  border-top-color: var(--color-primary, #8C6D3F);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-req {
  text-align: center;
  padding: 50px 20px;
  color: var(--color-text-muted, #7A6A55);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.empty-req h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.empty-req p {
  font-size: 0.84rem;
  line-height: 1.5;
  max-width: 380px;
  margin: 0 auto;
}

.req-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.req-item {
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 18px;
  background: var(--color-canvas, #FFFBF2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.req-item:hover {
  box-shadow: 0 4px 14px -2px rgba(140, 109, 63, 0.08);
}

.req-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.req-country {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-tag {
  font-size: 0.72rem;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-tag.pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-tag.reviewed {
  background: #E0F2FE;
  color: #0369A1;
}

.status-tag.quoted {
  background: #DCFCE7;
  color: #166534;
}

.status-tag.accepted {
  background: #D1FAE5;
  color: #065F46;
}

.status-tag.available {
  background: #EDE9FE;
  color: #6D28D9;
}

.status-tag.rejected {
  background: #FEE2E2;
  color: #991B1B;
}

.req-content {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}

.req-thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: #ffffff;
}

.req-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.zoom-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(43, 33, 22, 0.75);
  color: #ffffff;
  font-size: 0.58rem;
  text-align: center;
  padding: 2px 0;
}

.req-details {
  flex: 1;
}

.req-prod-name {
  font-size: 0.96rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.req-desc-text {
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.45;
  margin-bottom: 8px;
}

.req-meta-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.link-ref {
  font-size: 0.75rem;
  color: var(--color-primary, #8C6D3F);
  text-decoration: none;
  font-weight: 600;
}

.link-ref:hover {
  text-decoration: underline;
}

.req-date {
  font-size: 0.7rem;
  color: var(--color-text-muted, #7A6A55);
}

/* Quote Box */
.quote-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-left: 4px solid var(--color-primary, #8C6D3F);
  border-radius: 10px;
  padding: 14px 16px;
  margin-top: 8px;
  box-shadow: 0 2px 8px -1px rgba(140, 109, 63, 0.08);
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.quote-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quote-badge-gold {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-primary, #8C6D3F);
  letter-spacing: 0.05em;
}

.quote-lbl {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
}

.quote-price {
  font-size: 1.25rem;
  color: var(--color-primary, #8C6D3F);
  font-weight: 800;
}

.quote-notes {
  font-size: 0.8rem;
  color: var(--color-text, #2B2116);
  margin-bottom: 8px;
  line-height: 1.45;
  background: var(--color-canvas, #FFFBF2);
  padding: 8px 12px;
  border-radius: 6px;
}

.quote-expiry {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 12px;
}

.quote-expiry.is-expired {
  color: #DC2626;
  font-weight: 700;
}

.quote-actions {
  display: flex;
  gap: 10px;
}

.btn-accept-quote {
  flex: 1;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px -1px rgba(140, 109, 63, 0.3);
}

.btn-accept-quote:hover:not(:disabled) {
  background: #73572E;
  transform: translateY(-1px);
}

.btn-accept-quote:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reject-quote {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reject-quote:hover:not(:disabled) {
  background: #FEE2E2;
  border-color: #FECACA;
  color: #DC2626;
}

.btn-reject-quote:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quote-expired-notice {
  font-size: 0.76rem;
  color: #DC2626;
  padding: 6px 10px;
  background: #FEE2E2;
  border-radius: 6px;
}

/* Accepted Banner */
.accepted-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 8px;
  padding: 10px 14px;
}

.accepted-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #166534;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
}

.accepted-text strong {
  display: block;
  font-size: 0.82rem;
  color: #166534;
}

.accepted-text p {
  font-size: 0.72rem;
  color: #15803D;
}

.accepted-price {
  font-size: 1.05rem;
  color: #166534;
}

/* Available Banner */
.available-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F5F3FF;
  border: 1px solid #DDD6FE;
  border-radius: 8px;
  padding: 10px 14px;
}

.sparkle-icon {
  font-size: 1.3rem;
}

.available-banner strong {
  display: block;
  font-size: 0.82rem;
  color: #5B21B6;
}

.available-banner p {
  font-size: 0.72rem;
  color: #6D28D9;
  line-height: 1.4;
}

/* Rejected Banner */
.rejected-banner {
  font-size: 0.76rem;
  color: #991B1B;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 6px;
  padding: 8px 12px;
}

/* Lightbox Modal */
.image-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 10, 5, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.image-modal-box {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.image-modal-close {
  position: absolute;
  top: -40px;
  right: -10px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

@media (max-width: 860px) {
  .request-layout {
    grid-template-columns: 1fr;
  }
}
</style>
