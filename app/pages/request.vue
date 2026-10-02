<template>
  <div class="request-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Request Titip Produk</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Request Titip Barang Luar Negeri</h1>
        <p class="page-subtitle">Punya barang yang dicari dari Jepang, Korea, atau Bangkok tapi belum ada di katalog? Kirimkan detailnya, admin kami akan mengecek ketersediaannya dan memberikan penawaran harga.</p>
      </div>

      <!-- Layout: Form + Requests History -->
      <div class="request-layout">
        <!-- Left: Request Form -->
        <div class="form-card">
          <div class="card-head">
            <h3>Form Pengajuan Titip</h3>
            <span class="badge-free">Gratis Konsultasi</span>
          </div>

          <form @submit.prevent="submitRequest" class="req-form">
            <div class="form-group">
              <label>Nama Barang / Produk:</label>
              <input v-model="form.productName" type="text" placeholder="Contoh: Starbucks Japan Sakura Tumbler 2026" required />
            </div>

            <div class="form-group">
              <label>Pilih Trip / Negara Asal:</label>
              <select v-model="form.targetTrip">
                <option value="Jepang">🇯🇵 Jepang (Don Quijote, Tokyo Station)</option>
                <option value="Korea Selatan">🇰🇷 Korea Selatan (Olive Young, Hongdae)</option>
                <option value="Thailand">🇹🇭 Thailand (Big C, Platinum Mall)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Link Referensi Produk (Opsional):</label>
              <input v-model="form.referenceLink" type="url" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label>Foto / Screenshot Barang:</label>
              <div class="mock-upload-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
                <span>Klik untuk unggah foto referensi barang</span>
                <span class="upload-hint">Format PNG/JPG, maksimal 5MB</span>
              </div>
            </div>

            <div class="form-group">
              <label>Catatan Tambahan (Varian/Ukuran/Rasa):</label>
              <textarea v-model="form.description" rows="3" placeholder="Contoh: Warna pink pastel ukuran 473ml, tolong yang kondisinya mulus tanpa goresan ya kak."></textarea>
            </div>

            <button type="submit" class="btn-submit-req">
              Kirim Request Titip Barang
            </button>
          </form>
        </div>

        <!-- Right: My Requests History -->
        <div class="history-card">
          <div class="card-head">
            <h3>Riwayat Request Saya</h3>
            <span class="count-tag">{{ requests.length }} Request</span>
          </div>

          <div v-if="requests.length > 0" class="req-list">
            <div v-for="req in requests" :key="req.id" class="req-item">
              <div class="req-item-top">
                <span class="req-country">{{ req.targetCountry }}</span>
                <span class="status-tag" :class="req.status">
                  {{ formatStatus(req.status) }}
                </span>
              </div>

              <h4 class="req-prod-name">{{ req.productName }}</h4>
              <p class="req-desc-text">{{ req.description }}</p>

              <!-- Quote Offered Section -->
              <div v-if="req.status === 'quoted'" class="quote-box">
                <div class="quote-header">
                  <span class="quote-lbl">Penawaran Harga dari Admin:</span>
                  <strong class="quote-price">{{ formatRupiah(req.quotedPrice || 0) }}</strong>
                </div>
                <p class="quote-notes">{{ req.quoteNote }}</p>
                <div class="quote-actions">
                  <NuxtLink :to="`/checkout?quoteId=${req.id}&productName=${encodeURIComponent(req.productName)}&price=${req.quotedPrice}`" class="btn-accept-quote">
                    Setujui & Buat Order
                  </NuxtLink>
                  <button class="btn-reject-quote" @click="rejectQuote(req.id)">
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-req">
            <p>Anda belum pernah mengajukan request titip barang.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockProductRequests, type ProductRequest } from '../data/mockJastipData'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const requests = ref<ProductRequest[]>([...mockProductRequests])

const form = ref({
  productName: '',
  targetTrip: 'Jepang',
  referenceLink: '',
  description: ''
})

const submitRequest = () => {
  const newReq: ProductRequest = {
    id: 'req-' + Date.now(),
    userId: 'user-01',
    userName: 'Saya',
    productName: form.value.productName,
    description: form.value.description || 'Request barang titip dari ' + form.value.targetTrip,
    targetCountry: form.value.targetTrip,
    referenceImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    status: 'pending',
    createdAt: 'Baru saja'
  }

  requests.value.unshift(newReq)
  form.value.productName = ''
  form.value.description = ''
  form.value.referenceLink = ''

  showToast({
    title: 'Request Berhasil Dikirim',
    message: 'Admin akan memeriksa produk dan memberikan penawaran harga.',
    type: 'success'
  })
}

const rejectQuote = (id: string) => {
  const target = requests.value.find(r => r.id === id)
  if (target) {
    target.status = 'rejected'
    showToast({
      title: 'Penawaran Ditolak',
      message: 'Anda telah menolak penawaran harga ini.',
      type: 'info'
    })
  }
}

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending: 'Menunggu Review Admin',
    reviewed: 'Sedang Dicek Toko Asal',
    quoted: 'Penawaran Harga Siap!',
    accepted: 'Disetujui',
    rejected: 'Ditolak'
  }
  return map[st] || st
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.request-page {
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
  max-width: 760px;
  line-height: 1.5;
}

.request-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.form-card, .history-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 24px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.card-head h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
}

.badge-free {
  font-size: 0.72rem;
  background: var(--color-ready-bg, #DCFCE7);
  color: var(--color-ready, #059669);
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 700;
}

.count-tag {
  font-size: 0.75rem;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.req-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.form-group input, .form-group select, .form-group textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  outline: none;
  font-family: inherit;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--color-primary, #4A5D73);
}

.mock-upload-box {
  border: 2px dashed var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--color-canvas, #F4F6F8);
  color: var(--color-text-muted, #64748B);
  font-size: 0.82rem;
  cursor: pointer;
}

.upload-hint {
  font-size: 0.72rem;
  color: #94A3B8;
}

.btn-submit-req {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.15s;
}

.btn-submit-req:hover {
  background: var(--color-primary-hover, #384759);
}

/* History List */
.req-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.req-item {
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  padding: 16px;
  background: var(--color-canvas, #F4F6F8);
}

.req-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.req-country {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
}

.status-tag {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 700;
}

.status-tag.pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-tag.quoted {
  background: #DCFCE7;
  color: #166534;
}

.status-tag.rejected {
  background: #FEE2E2;
  color: #991B1B;
}

.req-prod-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.req-desc-text {
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.4;
  margin-bottom: 12px;
}

.quote-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-left: 3px solid var(--color-primary, #4A5D73);
  border-radius: 8px;
  padding: 12px;
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.quote-lbl {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.quote-price {
  font-size: 1.1rem;
  color: var(--color-primary, #4A5D73);
}

.quote-notes {
  font-size: 0.78rem;
  color: var(--color-text, #1E293B);
  margin-bottom: 10px;
  line-height: 1.4;
}

.quote-actions {
  display: flex;
  gap: 8px;
}

.btn-accept-quote {
  flex: 1;
  text-decoration: none;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 8px;
  border-radius: 6px;
}

.btn-reject-quote {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  font-size: 0.78rem;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.empty-req {
  text-align: center;
  padding: 50px 20px;
  color: var(--color-text-muted, #64748B);
}

@media (max-width: 800px) {
  .request-layout {
    grid-template-columns: 1fr;
  }
}
</style>
