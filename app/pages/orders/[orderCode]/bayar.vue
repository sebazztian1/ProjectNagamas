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
        <h1 class="page-title">Instruksi &amp; Konfirmasi Pembayaran</h1>
      </div>

      <!-- Lockout: If Order is Pending Approval -->
      <div v-if="order && order.orderStatus === 'pending_approval'" class="lockout-card">
        <h2>🔒 Menunggu Persetujuan (ACC) Admin</h2>
        <p>
          Rekening dan instruksi pembayaran untuk pesanan #<strong>{{ orderCode }}</strong> masih ditahan hingga ketersediaan barang disetujui oleh Admin dbb_luxe.
        </p>
        <div class="lockout-actions">
          <NuxtLink :to="`/orders/${orderCode}`" class="btn-back-detail">Detail Pesanan</NuxtLink>
          <NuxtLink to="/chat" class="btn-chat-admin">Chat Admin</NuxtLink>
        </div>
      </div>

      <!-- Lockout: If Order is Rejected / Cancelled / Expired -->
      <div v-else-if="order && ['rejected', 'cancelled', 'expired'].includes(order.orderStatus)" class="lockout-card error">
        <h2>Pesanan Tidak Dapat Dibayar ({{ order.orderStatus.toUpperCase() }})</h2>
        <p>
          <strong>Alasan:</strong> {{ order.rejectionReason || 'Batas waktu pembayaran telah berakhir atau pesanan dibatalkan.' }}
        </p>
        <div class="lockout-actions">
          <NuxtLink to="/orders" class="btn-back-detail">Kembali ke Pesanan Saya</NuxtLink>
        </div>
      </div>

      <!-- Payment Form (Active when Approved) -->
      <div v-else-if="order" class="payment-grid">
        <!-- Left: Bank Accounts, QRIS, Order Summary & Shipping Address -->
        <div class="instruction-col">
          <!-- Total Amount Box + 24h Countdown -->
          <div class="total-tagihan-card">
            <div class="deadline-bar" v-if="deadlineCountdown">
              <span>⏳ Batas Waktu Pembayaran (24 Jam):</span>
              <strong>{{ deadlineCountdown }}</strong>
            </div>

            <span class="tagihan-label">
              Total yang Harus Ditransfer Sekarang
              <template v-if="order.paymentType === 'dp' && order.paidAmount === 0">(DP 50%)</template>
              <template v-else-if="order.paidAmount > 0 && order.remainingAmount > 0">(Pelunasan Sisa)</template>:
            </span>
            <div class="tagihan-amount-row">
              <strong class="tagihan-num">{{ formatRupiah(expectedTransferAmount) }}</strong>
              <button type="button" class="btn-copy" @click="copyText(expectedTransferAmount.toString())">
                Salin Nominal
              </button>
            </div>
            <div v-if="order.shippingCost > 0" class="kode-unik-alert">
              ℹ️ Total tagihan pesanan (<strong>{{ formatRupiah(order.totalAmount) }}</strong>) sudah termasuk
              Ongkos Kirim (<strong>{{ formatRupiah(order.shippingCost) }}</strong>).
              Mohon transfer sesuai nominal di atas agar verifikasi mutasi cepat.
            </div>
          </div>

          <!-- Bank Accounts & QRIS Selection -->
          <div class="bank-list-card">
            <h3 class="card-head-title">Rekening Resmi &amp; QRIS dbb_luxe</h3>

            <div class="bank-items">
              <div
                v-for="bank in bankAccounts"
                :key="bank.id"
                class="bank-item-box"
                :class="{ selected: form.bankAccountId === bank.id }"
                @click="form.bankAccountId = bank.id"
              >
                <div class="bank-info-top">
                  <span class="bank-name">{{ bank.bankName }}</span>
                  <span class="bank-holder">a.n. {{ bank.accountHolder }}</span>
                </div>
                <div class="bank-acc-row">
                  <strong class="acc-num">{{ bank.accountNumber }}</strong>
                  <button type="button" class="btn-copy-sm" @click.stop="copyText(bank.accountNumber)">
                    Salin No. Rek
                  </button>
                </div>
                <div v-if="bank.qrisImageUrl" class="qris-preview">
                  <span>Atau Scan QRIS Resmi:</span>
                  <img :src="bank.qrisImageUrl" alt="QRIS dbb_luxe" class="qris-img" />
                </div>
              </div>
            </div>
          </div>

          <!-- Ringkasan Barang & Alamat Tujuan -->
          <div class="bank-list-card" style="margin-top: 20px">
            <h3 class="card-head-title">Ringkasan Barang &amp; Alamat Tujuan</h3>
            <div class="mini-item-list">
              <div v-for="it in order.items" :key="it.id" class="mini-item-row">
                <span>{{ it.productName }} ({{ it.quantity }}x &bull; {{ it.variant }})</span>
                <strong>{{ formatRupiah(it.subtotal) }}</strong>
              </div>
            </div>
            <div class="address-summary-box">
              <strong>Dikirim ke: {{ order.recipientName }} ({{ order.recipientPhone }})</strong>
              <p>{{ order.shippingAddress }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Upload Form -->
        <div class="upload-col">
          <div class="upload-card">
            <h3 class="card-head-title">Form Upload Bukti Transfer</h3>

            <form @submit.prevent="submitReceipt" class="upload-form">
              <div class="form-group">
                <label>Rekening Tujuan yang Dipilih:</label>
                <select v-model="form.bankAccountId" class="form-select" required>
                  <option v-for="b in bankAccounts" :key="b.id" :value="b.id">
                    {{ b.bankName }} - {{ b.accountNumber }} ({{ b.accountHolder }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Nama Bank / E-Wallet Pengirim (Bank Anda) *</label>
                <input v-model="form.senderBank" type="text" placeholder="Contoh: BCA / Mandiri / BNI / QRIS" required />
              </div>

              <div class="form-group">
                <label>Nama Pemilik Rekening Pengirim *</label>
                <input v-model="form.senderName" type="text" placeholder="Nama sesuai rekening / bukti transfer" required />
              </div>

              <div class="form-group">
                <label>Nominal yang Ditransfer (Rp) *</label>
                <input v-model.number="form.amount" type="number" required />
                <span v-if="form.amount && Math.round(form.amount) !== Math.round(expectedTransferAmount)" class="mismatch-warning">
                  ⚠️ Nominal harus persis {{ formatRupiah(expectedTransferAmount) }}.
                </span>
              </div>

              <div class="form-group">
                <label>Upload Foto / Screenshot Struk Transfer *</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style="display: none"
                  @change="handleFileSelect"
                />
                <div class="dropzone-box" :class="{ 'is-uploading': isUploadingFile }" @click="!isUploadingFile && fileInput?.click()">
                  <div v-if="isUploadingFile" class="uploading-overlay">
                    <div class="spinner"></div>
                    <span class="uploading-text">Mengunggah bukti transfer…</span>
                    <span class="uploading-sub">Mohon tunggu sebentar</span>
                  </div>
                  <template v-else>
                    <img v-if="previewImageUrl" :src="previewImageUrl" alt="Preview Bukti Transfer" class="receipt-preview-img" />
                    <template v-else>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                      <span>Klik untuk pilih gambar struk transfer</span>
                    </template>
                    <strong v-if="uploadedFileName" class="file-chosen">
                      {{ uploadedFileName }} (Terunggah)
                    </strong>
                    <span class="file-hint">Format JPG/PNG/WEBP, maksimal 5MB</span>
                  </template>
                </div>
              </div>

              <button
                type="submit"
                class="btn-submit-payment"
                :disabled="isSubmitting || isUploadingFile || !form.receiptUrl"
              >
                {{ isSubmitting ? 'Mengirim Konfirmasi...' : 'Konfirmasi & Kirim Bukti Transfer' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '../../../composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const orderCode = route.params.orderCode as string

const { data: order } = await useFetch<any>(`/api/orders/${orderCode}`)
const { data: bankAccountsData } = await useFetch<any[]>('/api/bank-accounts')

const bankAccounts = computed(() => bankAccountsData.value || [])

const expectedTransferAmount = computed(() => {
  if (!order.value) return 0
  if (order.value.paidAmount > 0 && order.value.remainingAmount > 0) {
    return order.value.remainingAmount
  }
  if (order.value.paymentType === 'dp' && order.value.paidAmount === 0) {
    return order.value.dpAmount || Math.ceil(order.value.totalAmount / 2)
  }
  return order.value.totalAmount
})

const fileInput = ref<HTMLInputElement | null>(null)
const uploadedFileName = ref('')
const previewImageUrl = ref('')
const isUploadingFile = ref(false)
const isSubmitting = ref(false)

const form = ref({
  bankAccountId: 0,
  senderBank: '',
  senderName: '',
  amount: 0,
  receiptUrl: ''
})

watch(
  [order, bankAccounts],
  () => {
    if (order.value && !form.value.amount) {
      form.value.amount = expectedTransferAmount.value
    }
    if (order.value && !form.value.senderName) {
      form.value.senderName = order.value.recipientName || ''
    }
    if (bankAccounts.value.length > 0 && !form.value.bankAccountId) {
      form.value.bankAccountId = bankAccounts.value[0].id
    }
  },
  { immediate: true }
)

const nowTs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    nowTs.value = Date.now()
  }, 15000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const deadlineCountdown = computed(() => {
  if (!order.value?.paymentDeadline) return ''
  const diff = Math.max(0, new Date(order.value.paymentDeadline).getTime() - nowTs.value)
  if (diff <= 0) return 'Waktu habis'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours} jam ${mins} menit`
})

const copyText = (txt: string) => {
  navigator.clipboard.writeText(txt)
  showToast('Tersalin', `Teks "${txt}" berhasil disalin ke clipboard.`, 'success')
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadedFileName.value = file.name
  previewImageUrl.value = URL.createObjectURL(file)
  isUploadingFile.value = true

  try {
    const fd = new FormData()
    fd.append('folder', 'receipts')
    fd.append('file', file)

    const uploaded = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: fd
    })

    if (uploaded?.url) {
      form.value.receiptUrl = uploaded.url
      showToast('Struk Terunggah', 'Foto bukti transfer berhasil diunggah ke Cloud.', 'success')
    }
  } catch (err: any) {
    uploadedFileName.value = ''
    previewImageUrl.value = ''
    showToast('Gagal Upload Struk', err?.data?.message || 'Gagal mengunggah gambar struk.', 'warning')
  } finally {
    isUploadingFile.value = false
  }
}

const submitReceipt = async () => {
  if (!form.value.receiptUrl) {
    showToast('Bukti Wajib Diunggah', 'Mohon unggah foto atau screenshot bukti transfer terlebih dahulu.', 'warning')
    return
  }

  isSubmitting.value = true
  try {
    await $fetch(`/api/orders/${orderCode}/pay`, {
      method: 'POST',
      body: {
        bankAccountId: form.value.bankAccountId,
        senderBank: form.value.senderBank,
        senderName: form.value.senderName,
        amount: form.value.amount,
        receiptUrl: form.value.receiptUrl
      }
    })

    showToast(
      'Bukti Transfer Terkirim!',
      'Status pesanan berubah menjadi Menunggu Verifikasi Admin.',
      'success'
    )
    await router.push(`/orders/${orderCode}`)
  } catch (err: any) {
    showToast(
      'Gagal Mengirim Bukti',
      err?.data?.message || 'Periksa kembali nominal dan data bukti transfer Anda.',
      'warning'
    )
  } finally {
    isSubmitting.value = false
  }
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
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
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.lockout-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  padding: 32px;
  text-align: center;
}

.lockout-card.error {
  border-color: #FCA5A5;
  background: #FEF2F2;
}

.lockout-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-back-detail,
.btn-chat-admin {
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
}

.btn-back-detail {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.btn-chat-admin {
  background: #FFFBF2;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text, #2B2116);
}

.payment-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.total-tagihan-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 20px;
}

.deadline-bar {
  background: #FEF3C7;
  color: #92400E;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.tagihan-label {
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
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
  color: var(--color-primary, #8C6D3F);
}

.btn-copy {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
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
  line-height: 1.45;
}

.bank-list-card,
.upload-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
}

.card-head-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 16px;
}

.bank-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-item-box {
  padding: 14px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  cursor: pointer;
}

.bank-item-box.selected {
  border-color: var(--color-primary, #8C6D3F);
  background: #FFFBF2;
}

.bank-info-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  margin-bottom: 6px;
}

.bank-name {
  font-weight: 800;
  color: var(--color-text, #2B2116);
}

.bank-holder {
  color: var(--color-text-muted, #7A6A55);
}

.bank-acc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.acc-num {
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  color: var(--color-primary, #8C6D3F);
}

.btn-copy-sm {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.qris-preview {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-secondary, #EFE1C6);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.76rem;
}

.qris-img {
  max-width: 160px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.mini-item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  margin-bottom: 12px;
  font-size: 0.82rem;
}

.mini-item-row {
  display: flex;
  justify-content: space-between;
}

.address-summary-box {
  font-size: 0.82rem;
  line-height: 1.45;
}

.address-summary-box p {
  margin: 4px 0 0;
  color: var(--color-text-muted, #7A6A55);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.form-group input,
.form-select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.86rem;
  outline: none;
}

.mismatch-warning {
  font-size: 0.75rem;
  color: #B91C1C;
  font-weight: 600;
}

.dropzone-box {
  border: 2px dashed var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: #FFFDF8;
  position: relative;
  min-height: 140px;
  justify-content: center;
  transition: all 0.2s ease;
}

.dropzone-box.is-uploading {
  cursor: wait;
  border-color: var(--color-primary, #8C6D3F);
  background: #FFFBF2;
}

.uploading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(140, 109, 63, 0.2);
  border-top-color: var(--color-primary, #8C6D3F);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.uploading-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
}

.uploading-sub {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
}

.receipt-preview-img {
  max-height: 180px;
  border-radius: 8px;
  object-fit: contain;
}

.file-chosen {
  font-size: 0.82rem;
  color: #166534;
}

.file-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.btn-submit-payment {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-submit-payment:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 860px) {
  .payment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
