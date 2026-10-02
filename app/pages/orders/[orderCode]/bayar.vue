<template>
  <div class="payment-upload-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <NuxtLink to="/orders">Pesanan Saya</NuxtLink>
        <span>/</span>
        <NuxtLink :to="`/orders/${orderCode}`">{{ orderCode }}</NuxtLink>
        <span>/</span>
        <span class="active">Konfirmasi Pembayaran</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Instruksi & Konfirmasi Transfer Bank</h1>
        <p class="page-subtitle">Selesaikan transfer manual sebelum batas waktu berakhir dan unggah foto/screenshot bukti pembayaran Anda.</p>
      </div>

      <!-- Lockout: If Order is Pending Approval -->
      <div v-if="order && order.orderStatus === 'pending_approval'" class="lockout-card">
        <div class="lockout-icon">⏳</div>
        <h2>Pesanan Belum Disetujui (Menunggu ACC Admin)</h2>
        <p>Pesanan #<strong>{{ orderCode }}</strong> saat ini masih dalam proses peninjauan ketersediaan stok fisik & kuota bagasi oleh Admin dbb_luxe.</p>
        <p class="lockout-hint">Pembayaran transfer manual baru dapat dilakukan <strong>setelah pesanan di-ACC oleh admin</strong>. Anda akan menerima notifikasi otomatis begitu pesanan disetujui.</p>
        <div class="lockout-actions">
          <NuxtLink :to="`/orders/${orderCode}`" class="btn-back-detail">Kembali ke Detail Pesanan</NuxtLink>
          <NuxtLink to="/chat" class="btn-chat-admin">Tanya Admin via Live Chat</NuxtLink>
        </div>
      </div>

      <!-- Lockout: If Order is Rejected -->
      <div v-else-if="order && order.orderStatus === 'rejected'" class="lockout-card error">
        <div class="lockout-icon">❌</div>
        <h2>Pesanan Ditolak oleh Admin</h2>
        <p><strong>Alasan:</strong> {{ order.rejectionReason || 'Stok tidak tersedia atau kuota bagasi penuh.' }}</p>
        <p class="lockout-hint">Pembayaran tidak dapat diproses untuk pesanan yang telah ditolak.</p>
        <div class="lockout-actions">
          <NuxtLink to="/orders" class="btn-back-detail">Kembali ke Riwayat Pesanan</NuxtLink>
        </div>
      </div>

      <!-- Payment Form (Active if Pending Payment) -->
      <div v-else class="payment-grid">
        <!-- Left: Bank Accounts & Amount to Transfer -->
        <div class="instruction-col">
          <!-- Total Amount Box -->
          <div class="total-tagihan-card">
            <span class="tagihan-label">Total yang Harus Ditransfer (Persis):</span>
            <div class="tagihan-amount-row">
              <strong class="tagihan-num">{{ formatRupiah(totalTransfer) }}</strong>
              <button class="btn-copy" @click="copyText(totalTransfer.toString())">Salin Nominal</button>
            </div>
            <div class="kode-unik-alert">
              ⚠️ Termasuk <strong>Kode Unik 3 Digit ({{ uniqueCode }})</strong>. Jangan bulatkan nominal transfer agar pembayaran diverifikasi secara otomatis.
            </div>
          </div>

          <!-- Bank Accounts Selection -->
          <div class="bank-list-card">
            <h3 class="card-head-title">Pilih Rekening Tujuan Toko</h3>

            <div class="bank-items">
              <div v-for="bank in mockBankAccounts" :key="bank.id" class="bank-item-box">
                <div class="bank-info-top">
                  <span class="bank-name">{{ bank.bankName }}</span>
                  <span class="bank-holder">{{ bank.accountHolder }}</span>
                </div>
                <div class="bank-acc-row">
                  <strong class="acc-num">{{ bank.accountNumber }}</strong>
                  <button class="btn-copy-sm" @click="copyText(bank.accountNumber)">Salin No. Rek</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Upload Form -->
        <div class="upload-col">
          <div class="upload-card">
            <h3 class="card-head-title">Form Bukti Transfer Bank</h3>

            <form @submit.prevent="submitReceipt" class="upload-form">
              <div class="form-group">
                <label>Nama Bank Pengirim (Bank Anda):</label>
                <input v-model="form.senderBank" type="text" placeholder="Contoh: BCA / Mandiri / BNI / GoPay" required />
              </div>

              <div class="form-group">
                <label>Nama Pemilik Rekening Pengirim:</label>
                <input v-model="form.senderName" type="text" placeholder="Nama sesuai buku tabungan / e-wallet" required />
              </div>

              <div class="form-group">
                <label>Nominal yang Anda Transfer:</label>
                <input v-model.number="form.amount" type="number" placeholder="Contoh: 430147" required />
                <span v-if="form.amount && form.amount !== totalTransfer" class="mismatch-warning">
                  ⚠️ Nominal berbeda dari tagihan ({{ formatRupiah(totalTransfer) }}). Mohon cek kembali.
                </span>
              </div>

              <div class="form-group">
                <label>Upload Foto / Screenshot Struk Transfer:</label>
                <div class="dropzone-box" @click="triggerUpload">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  <span v-if="!uploadedFileName">Klik untuk pilih gambar bukti transfer</span>
                  <strong v-else class="file-chosen">{{ uploadedFileName }} (Siap dikirim)</strong>
                  <span class="file-hint">Format JPG/PNG/WEBP, maksimal 5MB</span>
                </div>
              </div>

              <button type="submit" class="btn-submit-payment" :disabled="isSubmitting">
                {{ isSubmitting ? 'Mengunggah...' : 'Konfirmasi & Kirim Bukti Transfer' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockBankAccounts, mockOrders } from '../../../data/mockJastipData'
import { useToast } from '../../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const orderCode = route.params.orderCode as string
const order = computed(() => {
  return mockOrders.find(o => o.orderCode === orderCode)
})

const uniqueCode = computed(() => order.value?.uniqueCode || 147)
const totalTransfer = computed(() => order.value?.totalAmount || 430147)

const uploadedFileName = ref('')
const isSubmitting = ref(false)

const form = ref({
  senderBank: '',
  senderName: '',
  amount: 430147
})

// Auto-fill amount from order when available
if (order.value) {
  form.value.amount = order.value.totalAmount
}

const copyText = (txt: string) => {
  navigator.clipboard.writeText(txt)
  showToast({
    title: 'Tersalin',
    message: `Teks "${txt}" berhasil disalin ke clipboard.`,
    type: 'success'
  })
}

const triggerUpload = () => {
  uploadedFileName.value = 'bukti_transfer_bca_sitirahma.jpg'
  showToast({
    title: 'File Terpilih',
    message: 'File bukti_transfer_bca_sitirahma.jpg siap diunggah.',
    type: 'info'
  })
}

const submitReceipt = () => {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    if (order.value) {
      order.value.orderStatus = 'payment_uploaded'
      order.value.receiptUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
      order.value.logs.push({
        id: 'log-' + Date.now(),
        fromStatus: 'pending_payment',
        toStatus: 'payment_uploaded',
        title: 'Bukti Transfer Diunggah',
        note: `Customer mengunggah bukti transfer ${form.value.senderBank || 'BCA'} ${formatRupiah(form.value.amount)}. Menunggu verifikasi admin.`,
        createdAt: 'Baru saja'
      })
    }
    showToast({
      title: 'Bukti Transfer Terkirim!',
      message: 'Admin dbb_luxe akan memverifikasi mutasi bank dalam 15-30 menit.',
      type: 'success'
    })
    router.push(`/orders/${orderCode}`)
  }, 1000)
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.payment-upload-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1040px;
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
  margin-bottom: 28px;
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

.payment-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.total-tagihan-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 20px;
}

.tagihan-label {
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 600;
}

.tagihan-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 14px;
}

.tagihan-num {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
}

.btn-copy {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.kode-unik-alert {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  line-height: 1.4;
}

.bank-list-card, .upload-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px;
}

.card-head-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.bank-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-item-box {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  padding: 14px;
}

.bank-info-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bank-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.bank-holder {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.bank-acc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.acc-num {
  font-size: 1.1rem;
  color: var(--color-primary, #4A5D73);
  letter-spacing: 0.5px;
}

.btn-copy-sm {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

/* Upload Form */
.upload-form {
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

.form-group input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  outline: none;
}

.mismatch-warning {
  font-size: 0.75rem;
  color: #DC2626;
  margin-top: 2px;
}

.dropzone-box {
  border: 2px dashed var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--color-canvas, #F4F6F8);
  color: var(--color-text-muted, #64748B);
  font-size: 0.84rem;
  cursor: pointer;
  text-align: center;
}

.file-chosen {
  color: #166534;
  font-size: 0.88rem;
}

.file-hint {
  font-size: 0.72rem;
  color: #94A3B8;
}

.btn-submit-payment {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 13px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.15s;
}

.btn-submit-payment:hover {
  background: var(--color-primary-hover, #384759);
}

@media (max-width: 800px) {
  .payment-grid {
    grid-template-columns: 1fr;
  }
}

/* Lockout Card Styles */
.lockout-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 14px;
  padding: 40px 30px;
  text-align: center;
  max-width: 680px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.lockout-card.error {
  border-color: #FECACA;
  background: #FFF5F5;
}

.lockout-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.lockout-card h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 10px;
}

.lockout-card p {
  color: var(--color-text-muted, #64748B);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 8px;
}

.lockout-hint {
  font-size: 0.88rem !important;
  color: #4A5D73 !important;
  background: #F1F5F9;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px 0 24px !important;
}

.lockout-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-back-detail {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  transition: background 0.15s;
}

.btn-back-detail:hover {
  background: var(--color-primary-hover, #384759);
}

.btn-chat-admin {
  background: #ffffff;
  color: var(--color-primary, #4A5D73);
  border: 1px solid var(--color-primary, #4A5D73);
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.15s;
}

.btn-chat-admin:hover {
  background: #F8FAFC;
}
</style>
