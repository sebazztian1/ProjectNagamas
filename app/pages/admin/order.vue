<template>
  <div class="admin-orders-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Pesanan & Verifikasi Pembayaran</h1>
        <p class="page-subtitle">Cocokkan mutasi bank manual menggunakan kode unik transfer 3 digit dan verifikasi bukti transfer customer.</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-row">
      <div class="tabs">
        <button 
          v-for="st in statusFilters" 
          :key="st.key"
          class="t-btn"
          :class="{ active: currentFilter === st.key, 'has-count': st.count > 0 }"
          @click="currentFilter = st.key"
        >
          {{ st.label }}
          <span v-if="st.count !== undefined" class="tab-badge" :class="st.key">{{ st.count }}</span>
        </button>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Kode & Waktu</th>
            <th>Customer</th>
            <th>Tipe Order</th>
            <th>Tagihan (+Kode Unik)</th>
            <th>Status Order</th>
            <th>Bukti Transfer</th>
            <th>Aksi & Manajemen Alur</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ord in filteredOrders" :key="ord.id">
            <td>
              <strong>{{ ord.orderCode }}</strong>
              <span class="sub-txt">{{ ord.createdAt }}</span>
            </td>
            <td>
              <strong>{{ ord.customerName }}</strong>
              <span class="sub-txt">{{ ord.customerPhone }}</span>
            </td>
            <td>
              <span class="type-pill" :class="ord.orderType">
                {{ ord.orderType === 'ready' ? 'Ready Stock' : 'Jastip PO' }}
              </span>
            </td>
            <td>
              <strong>{{ formatRupiah(ord.totalAmount) }}</strong>
              <span class="unique-badge">Unik: +{{ ord.uniqueCode }}</span>
            </td>
            <td>
              <span class="status-pill" :class="ord.orderStatus">
                {{ formatStatus(ord.orderStatus) }}
              </span>
            </td>
            <td>
              <button v-if="ord.receiptUrl" class="btn-view-receipt" @click="openProofModal(ord)">
                📷 Lihat Bukti
              </button>
              <span v-else-if="ord.orderStatus === 'pending_approval'" class="no-proof-muted">Menunggu ACC</span>
              <span v-else class="no-proof">Belum diunggah</span>
            </td>
            <td>
              <div class="action-btn-group">
                <!-- Stage 1: ACC Pesanan Baru -->
                <template v-if="ord.orderStatus === 'pending_approval'">
                  <button class="btn-acc" @click="accOrder(ord)" title="Setujui pesanan & buka batas bayar 24 jam">
                    ✓ ACC Pesanan
                  </button>
                  <button class="btn-reject" @click="openRejectModal(ord)" title="Tolak pesanan (kuota/stok habis)">
                    ✕ Tolak
                  </button>
                </template>

                <!-- Stage 2: Menunggu Pembayaran Transfer -->
                <template v-else-if="ord.orderStatus === 'pending_payment'">
                  <span class="waiting-tag">⏳ Menunggu Transfer (24j)</span>
                  <button class="btn-reject-sm" @click="openRejectModal(ord)">Batalkan</button>
                </template>

                <!-- Stage 3: Bukti Diunggah, Verifikasi Pembayaran -->
                <template v-else-if="ord.orderStatus === 'payment_uploaded'">
                  <button class="btn-verify" @click="openProofModal(ord)">
                    ✓ Cek & Verifikasi
                  </button>
                  <button class="btn-reject" @click="rejectOrder(ord)">Tolak Bukti</button>
                </template>

                <!-- Subsequent Operational Stages -->
                <template v-else-if="ord.orderStatus === 'verified'">
                  <button class="btn-step" @click="advanceOrder(ord)">
                    {{ ord.orderType === 'ready' ? 'Siapkan di Meja Kasir' : 'Mulai Dibelikan' }} &rarr;
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'purchasing'">
                  <button class="btn-step" @click="advanceOrder(ord)">
                    Tandai Tiba di Jakarta &rarr;
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'arrived'">
                  <button class="btn-step" @click="advanceOrder(ord)">
                    Siap Diambil di Pasar Baru &rarr;
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'ready_pickup'">
                  <button class="btn-step green" @click="advanceOrder(ord)">
                    ✓ Serahkan ke Customer
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'completed'">
                  <span class="done-label">✓ Transaksi Selesai</span>
                </template>

                <template v-else-if="ord.orderStatus === 'rejected'">
                  <span class="rejected-label" :title="ord.rejectionReason">✕ Ditolak</span>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Proof Viewer & Verification -->
    <div v-if="selectedOrderForProof" class="modal-backdrop" @click.self="selectedOrderForProof = null">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Verifikasi Bukti Transfer - {{ selectedOrderForProof.orderCode }}</h3>
          <button class="close-btn" @click="selectedOrderForProof = null">&times;</button>
        </div>

        <div class="modal-body-grid">
          <div class="proof-image-side">
            <img :src="selectedOrderForProof.receiptUrl" alt="Struk Transfer" />
          </div>

          <div class="proof-details-side">
            <div class="box-stat">
              <span>Customer:</span>
              <strong>{{ selectedOrderForProof.customerName }}</strong>
            </div>
            <div class="box-stat">
              <span>Total Tagihan Sistem:</span>
              <strong class="highlight-price">{{ formatRupiah(selectedOrderForProof.totalAmount) }}</strong>
            </div>
            <div class="box-stat">
              <span>Kode Unik 3 Digit:</span>
              <strong>+{{ selectedOrderForProof.uniqueCode }}</strong>
            </div>

            <div class="audit-hint">
              Pastikan nominal di mutasi bank internet banking BCA/Mandiri persis sama dengan angka di atas sebelum memverifikasi.
            </div>

            <div class="modal-actions-col">
              <button class="btn-approve-big" @click="confirmModalVerify">
                ✓ Verifikasi & Tandai Lunas
              </button>
              <button class="btn-reject-big" @click="rejectProofModal">
                Tolak Bukti (Minta Upload Ulang)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Reject Order (Penolakan Saat Review Awal) -->
    <div v-if="selectedOrderForReject" class="modal-backdrop" @click.self="selectedOrderForReject = null">
      <div class="modal-card modal-reject-card">
        <div class="modal-head">
          <h3>Tolak Pesanan - {{ selectedOrderForReject.orderCode }}</h3>
          <button class="close-btn" @click="selectedOrderForReject = null">&times;</button>
        </div>

        <div class="modal-reject-body">
          <p class="modal-desc">
            Pilih atau tuliskan alasan penolakan. Alasan ini akan langsung tampil di halaman tracking pesanan customer.
          </p>

          <div class="modal-form-group">
            <label>Alasan Penolakan:</label>
            <select v-model="rejectReasonPreset" class="form-select">
              <option value="Kuota koper bagasi trip Tokyo sudah penuh untuk kategori ini">Kuota koper bagasi trip sudah penuh untuk kategori ini</option>
              <option value="Stok fisik barang di toko Pasar Baru telah habis terjual">Stok fisik barang di toko Pasar Baru telah habis terjual</option>
              <option value="Barang titipan dilarang masuk oleh regulasi kepabeanan bandara">Barang titipan dilarang masuk oleh regulasi kepabeanan bandara</option>
              <option value="Toko fisik resmi di negara asal telah tutup / produk discontinued">Toko fisik resmi di negara asal telah tutup / produk discontinued</option>
              <option value="Lainnya">Lainnya (Tulis catatan khusus)</option>
            </select>
          </div>

          <div class="modal-form-group" v-if="rejectReasonPreset === 'Lainnya'">
            <label>Catatan Alasan Spesifik:</label>
            <textarea v-model="customRejectReason" rows="3" class="form-textarea" placeholder="Tuliskan alasan penolakan secara jelas kepada customer..."></textarea>
          </div>

          <div class="modal-actions-row">
            <button class="btn-cancel" @click="selectedOrderForReject = null">Batal</button>
            <button class="btn-confirm-reject" @click="confirmRejectOrder">Konfirmasi Tolak Pesanan</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockOrders, type Order } from '../../data/mockJastipData'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()
const orders = ref<Order[]>([...mockOrders])
const currentFilter = ref('all')
const selectedOrderForProof = ref<Order | null>(null)
const selectedOrderForReject = ref<Order | null>(null)
const rejectReasonPreset = ref('Kuota koper bagasi trip Tokyo sudah penuh untuk kategori ini')
const customRejectReason = ref('')

const statusFilters = computed(() => [
  { key: 'all', label: 'Semua Pesanan', count: orders.value.length },
  { key: 'pending_approval', label: 'Perlu ACC', count: orders.value.filter(o => o.orderStatus === 'pending_approval').length },
  { key: 'payment_uploaded', label: 'Cek Pembayaran', count: orders.value.filter(o => o.orderStatus === 'payment_uploaded').length },
  { key: 'pending_payment', label: 'Menunggu Bayar', count: orders.value.filter(o => o.orderStatus === 'pending_payment').length },
  { key: 'purchasing', label: 'Sedang Dibelikan', count: orders.value.filter(o => o.orderStatus === 'purchasing').length },
  { key: 'ready_pickup', label: 'Siap Diambil', count: orders.value.filter(o => o.orderStatus === 'ready_pickup').length },
  { key: 'completed', label: 'Selesai', count: orders.value.filter(o => o.orderStatus === 'completed').length },
  { key: 'rejected', label: 'Ditolak', count: orders.value.filter(o => o.orderStatus === 'rejected').length }
])

const filteredOrders = computed(() => {
  if (currentFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.orderStatus === currentFilter.value)
})

// Stage 1: ACC Order
const accOrder = (ord: Order) => {
  ord.orderStatus = 'pending_payment'
  ord.approvedAt = new Date().toISOString()
  ord.paymentDeadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  ord.logs.push({
    id: 'log-' + Date.now(),
    fromStatus: 'pending_approval',
    toStatus: 'pending_payment',
    title: 'Pesanan Disetujui Admin (ACC)',
    note: 'Admin dbb_luxe telah menyetujui pesanan. Batas waktu pembayaran 24 jam telah dibuka.',
    createdAt: 'Baru saja'
  })
  showToast({
    title: 'Pesanan Berhasil di-ACC!',
    message: `Pesanan #${ord.orderCode} disetujui. Customer mendapatkan notifikasi untuk melakukan pembayaran.`,
    type: 'success'
  })
}

// Stage 1: Reject Order Modal
const openRejectModal = (ord: Order) => {
  selectedOrderForReject.value = ord
  rejectReasonPreset.value = ord.orderType === 'ready' 
    ? 'Stok fisik barang di toko Pasar Baru telah habis terjual' 
    : 'Kuota koper bagasi trip Tokyo sudah penuh untuk kategori ini'
  customRejectReason.value = ''
}

const confirmRejectOrder = () => {
  if (selectedOrderForReject.value) {
    const reason = rejectReasonPreset.value === 'Lainnya' 
      ? (customRejectReason.value.trim() || 'Pesanan dibatalkan oleh admin.') 
      : rejectReasonPreset.value

    selectedOrderForReject.value.orderStatus = 'rejected'
    selectedOrderForReject.value.rejectionReason = reason
    selectedOrderForReject.value.logs.push({
      id: 'log-' + Date.now(),
      fromStatus: 'pending_approval',
      toStatus: 'rejected',
      title: 'Pesanan Ditolak Admin',
      note: `Alasan: ${reason}`,
      createdAt: 'Baru saja'
    })

    showToast({
      title: 'Pesanan Ditolak',
      message: `Pesanan #${selectedOrderForReject.value.orderCode} ditolak. Customer menerima notifikasi.`,
      type: 'warning'
    })
    selectedOrderForReject.value = null
  }
}

// Stage 3: Proof Modal & Verification
const openProofModal = (ord: Order) => {
  selectedOrderForProof.value = ord
}

const confirmModalVerify = () => {
  if (selectedOrderForProof.value) {
    selectedOrderForProof.value.orderStatus = 'verified'
    selectedOrderForProof.value.logs.push({
      id: 'log-' + Date.now(),
      fromStatus: 'payment_uploaded',
      toStatus: 'verified',
      title: 'Pembayaran Terverifikasi',
      note: 'Diverifikasi oleh Admin dbb_luxe. Mutasi bank cocok.',
      createdAt: 'Baru saja'
    })
    showToast({
      title: 'Pembayaran Dikonfirmasi!',
      message: `Pesanan #${selectedOrderForProof.value.orderCode} berhasil diverifikasi Lunas.`,
      type: 'success'
    })
    selectedOrderForProof.value = null
  }
}

const rejectProofModal = () => {
  if (selectedOrderForProof.value) {
    selectedOrderForProof.value.orderStatus = 'pending_payment'
    showToast({
      title: 'Bukti Ditolak',
      message: `Bukti transfer ditolak. Customer diminta mengunggah struk yang valid.`,
      type: 'warning'
    })
    selectedOrderForProof.value = null
  }
}

const rejectOrder = (ord: Order) => {
  ord.orderStatus = 'pending_payment'
  showToast({
    title: 'Bukti Ditolak',
    message: `Bukti transfer ${ord.orderCode} ditolak. Customer diminta mengunggah ulang.`,
    type: 'warning'
  })
}

// Advance Operations
const advanceOrder = (ord: Order) => {
  if (ord.orderStatus === 'verified') {
    ord.orderStatus = ord.orderType === 'ready' ? 'ready_pickup' : 'purchasing'
    ord.logs.push({
      id: 'log-' + Date.now(),
      fromStatus: 'verified',
      toStatus: ord.orderStatus,
      title: ord.orderType === 'ready' ? 'Siap Diambil di Pasar Baru' : 'Sedang Dibelikan di LN',
      createdAt: 'Baru saja'
    })
    showToast({
      title: 'Status Diperbarui',
      message: `Pesanan #${ord.orderCode} kini berstatus ${formatStatus(ord.orderStatus)}.`,
      type: 'info'
    })
  } else if (ord.orderStatus === 'purchasing') {
    ord.orderStatus = 'arrived'
    ord.logs.push({
      id: 'log-' + Date.now(),
      fromStatus: 'purchasing',
      toStatus: 'arrived',
      title: 'Barang Tiba di Indonesia',
      createdAt: 'Baru saja'
    })
    showToast({ title: 'Barang Tiba', message: `Barang trip telah mendarat di Jakarta.`, type: 'info' })
  } else if (ord.orderStatus === 'arrived') {
    ord.orderStatus = 'ready_pickup'
    ord.logs.push({
      id: 'log-' + Date.now(),
      fromStatus: 'arrived',
      toStatus: 'ready_pickup',
      title: 'Siap Diambil di Toko Fisik',
      createdAt: 'Baru saja'
    })
    showToast({ title: 'Siap Diambil', message: `Customer dapat mengambil pesanan di Pasar Baru.`, type: 'success' })
  } else if (ord.orderStatus === 'ready_pickup') {
    ord.orderStatus = 'completed'
    ord.logs.push({
      id: 'log-' + Date.now(),
      fromStatus: 'ready_pickup',
      toStatus: 'completed',
      title: 'Pesanan Selesai',
      createdAt: 'Baru saja'
    })
    showToast({ title: 'Pesanan Selesai', message: `Transaksi selesai.`, type: 'success' })
  }
}

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending_approval: 'Menunggu ACC',
    pending_payment: 'Menunggu Bayar',
    payment_uploaded: 'Bukti Diupload',
    verified: 'Terverifikasi Lunas',
    purchasing: 'Sedang Dibelikan',
    arrived: 'Barang Tiba',
    ready_pickup: 'Siap Diambil',
    completed: 'Selesai',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa'
  }
  return map[st] || st
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.admin-orders-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  margin-bottom: 4px;
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

.filter-row {
  display: flex;
  gap: 8px;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-canvas, #F4F6F8);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
  vertical-align: middle;
}

.sub-txt {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted, #64748B);
}

.type-pill {
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 700;
}

.type-pill.ready {
  background: var(--color-ready-bg, #DCFCE7);
  color: var(--color-ready, #059669);
}

.type-pill.jastip {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
}

.unique-badge {
  display: block;
  font-size: 0.72rem;
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.status-pill {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 700;
}

.status-pill.pending_approval {
  background: #FEF9C3;
  color: #854D0E;
  border: 1px dashed #CA8A04;
}

.status-pill.pending_payment {
  background: #FEF3C7;
  color: #92400E;
}

.status-pill.payment_uploaded {
  background: #DBEAFE;
  color: #1D4ED8;
}

.status-pill.purchasing {
  background: #E0E7FF;
  color: #4338CA;
}

.status-pill.arrived {
  background: #EDE9FE;
  color: #6D28D9;
}

.status-pill.ready_pickup, .status-pill.verified {
  background: #DCFCE7;
  color: #166534;
}

.status-pill.completed {
  background: #F1F5F9;
  color: #475569;
}

.status-pill.rejected {
  background: #FEE2E2;
  color: #B91C1C;
}

.tab-badge {
  font-size: 0.7rem;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

.t-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.tab-badge.pending_approval {
  background: #FEF08A;
  color: #854D0E;
}

.tab-badge.payment_uploaded {
  background: #BFDBFE;
  color: #1D4ED8;
}

.btn-view-receipt {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  cursor: pointer;
}

.no-proof {
  font-size: 0.75rem;
  color: #94A3B8;
}

.no-proof-muted {
  font-size: 0.74rem;
  color: #CA8A04;
  font-style: italic;
}

.action-btn-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-acc {
  background: #16A34A;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-acc:hover {
  background: #15803D;
}

.btn-verify {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-step {
  background: #F1F5F9;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.btn-step.green {
  background: #DCFCE7;
  color: #166534;
  border-color: #BBF7D0;
}

.btn-reject {
  background: none;
  border: 1px solid #DC2626;
  color: #DC2626;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-reject-sm {
  background: none;
  border: 1px solid #CBD5E1;
  color: #64748B;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
}

.waiting-tag {
  font-size: 0.72rem;
  color: #92400E;
  background: #FEF3C7;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.done-label {
  font-size: 0.76rem;
  color: #166534;
  font-weight: 700;
}

.rejected-label {
  font-size: 0.76rem;
  color: #DC2626;
  font-weight: 700;
}

/* Modal Reject Styles */
.modal-reject-card {
  max-width: 520px !important;
}

.modal-desc {
  font-size: 0.86rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 16px;
  line-height: 1.45;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.modal-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.form-select, .form-textarea {
  width: 100%;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  padding: 10px;
  font-size: 0.86rem;
  color: var(--color-text, #1E293B);
  font-family: inherit;
}

.form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #4A5D73);
}

.modal-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm-reject {
  background: #DC2626;
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 720px;
  padding: 24px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}

.modal-body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.proof-image-side {
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  overflow: hidden;
  max-height: 380px;
}

.proof-image-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.proof-details-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.box-stat {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
}

.box-stat strong {
  display: block;
  font-size: 1rem;
  color: var(--color-text, #1E293B);
  margin-top: 2px;
}

.highlight-price {
  color: var(--color-primary, #4A5D73) !important;
  font-size: 1.4rem !important;
}

.audit-hint {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.4;
}

.modal-actions-col {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-approve-big {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-reject-big {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: #DC2626;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
