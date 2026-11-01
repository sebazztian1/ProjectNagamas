<template>
  <div class="admin-orders-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Manajemen Pesanan &amp; Pembayaran Manual</h1>
        <p class="page-sub">
          Tinjau pengajuan pesanan (ACC + Ongkir), verifikasi bukti mutasi bank, input resi pengiriman, atau proses refund manual.
        </p>
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
            <th>Kode &amp; Waktu</th>
            <th>Customer &amp; Alamat</th>
            <th>Tipe &amp; Barang</th>
            <th>Total Tagihan</th>
            <th>Status Order</th>
            <th>Bukti Transfer</th>
            <th>Aksi &amp; Manajemen Alur</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending">
            <td colspan="7" style="text-align: center; padding: 28px">Memuat daftar pesanan...</td>
          </tr>
          <tr v-else-if="filteredOrders.length === 0">
            <td colspan="7" style="text-align: center; padding: 28px">Tidak ada pesanan pada filter ini.</td>
          </tr>
          <tr v-else v-for="ord in filteredOrders" :key="ord.id">
            <td>
              <strong>{{ ord.orderCode }}</strong>
              <span class="sub-txt">{{ ord.createdAt }}</span>
            </td>
            <td>
              <strong>{{ ord.customerName }}</strong>
              <span class="sub-txt">{{ ord.customerPhone }}</span>
              <span class="sub-txt addr-clip" :title="ord.shippingAddress">{{ ord.shippingAddress }}</span>
            </td>
            <td>
              <span class="type-pill" :class="ord.orderType">
                {{ ord.orderType === 'ready' ? 'Ready Stock' : `Jastip PO${ord.tripTitle ? ' • ' + ord.tripTitle : ''}` }}
              </span>
              <div class="items-mini">
                <div v-for="it in ord.items" :key="it.id" class="sub-txt">
                  {{ it.quantity }}x {{ it.productName }} ({{ it.variant }})
                </div>
              </div>
            </td>
            <td>
              <strong>{{ formatRupiah(ord.totalAmount) }}</strong>
              <span v-if="ord.shippingCost > 0" class="sub-txt">Ongkir: {{ formatRupiah(ord.shippingCost) }}</span>
              <span v-if="ord.paymentType === 'dp'" class="sub-txt">DP 50%: {{ formatRupiah(ord.dpAmount) }}</span>
            </td>
            <td>
              <span class="status-pill" :class="ord.orderStatus">
                {{ formatStatus(ord.orderStatus) }}
              </span>
              <span v-if="ord.adminNote" class="sub-txt note-clip" :title="ord.adminNote">
                📝 {{ ord.adminNote }}
              </span>
            </td>
            <td>
              <button v-if="ord.receiptUrl" class="btn-view-receipt" @click="openProofModal(ord)">
                Lihat Bukti
              </button>
              <span v-else-if="ord.orderStatus === 'pending_approval'" class="no-proof-muted">Menunggu ACC</span>
              <span v-else class="no-proof">Belum diunggah</span>
            </td>
            <td>
              <div class="action-btn-group">
                <!-- Stage 1: ACC Pesanan Baru -->
                <template v-if="ord.orderStatus === 'pending_approval'">
                  <button class="btn-acc" @click="openAccModal(ord)" title="Setujui pesanan, isi ongkir & buka batas bayar 24 jam">
                    ✓ ACC
                  </button>
                  <button class="btn-reject" @click="openRejectModal(ord)" title="Tolak pesanan (kuota/stok habis)">
                    ✕ Tolak
                  </button>
                </template>

                <!-- Stage 2: Menunggu Pembayaran Transfer -->
                <template v-else-if="ord.orderStatus === 'pending_payment'">
                  <span class="waiting-tag">Menunggu Transfer</span>
                  <button class="btn-reject-sm" @click="openRejectModal(ord)">Tolak / Batal</button>
                </template>

                <!-- Stage 3: Bukti Diunggah, Verifikasi Pembayaran -->
                <template v-else-if="ord.orderStatus === 'payment_uploaded'">
                  <button class="btn-verify" @click="openProofModal(ord)">
                    Cek &amp; Verifikasi
                  </button>
                </template>

                <!-- Subsequent Operational Stages -->
                <template v-else-if="ord.orderStatus === 'verified'">
                  <button class="btn-step" @click="openAdvanceModal(ord)">
                    {{ ord.orderType === 'ready' ? 'Kirim & Input Resi' : 'Mulai Dibelikan' }} &rarr;
                  </button>
                  <button v-if="ord.orderType === 'jastip'" class="btn-reject-sm" @click="openRefundModal(ord)">
                    Refund 100%
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'purchasing'">
                  <button class="btn-step" @click="openAdvanceModal(ord)">
                    Tiba di Indo / Upload Struk &rarr;
                  </button>
                  <button class="btn-reject-sm" @click="openRefundModal(ord)">
                    Refund 100%
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'arrived'">
                  <button class="btn-step" @click="openAdvanceModal(ord)">
                    Kirim &amp; Input Resi &rarr;
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'ready_handover' || ord.orderStatus === 'ready_pickup'">
                  <button class="btn-step green" @click="openAdvanceModal(ord)">
                    Tandai Selesai ✓
                  </button>
                </template>

                <template v-else-if="ord.orderStatus === 'completed'">
                  <span class="done-label">✓ Transaksi Selesai</span>
                </template>

                <template v-else-if="['rejected', 'cancelled', 'expired'].includes(ord.orderStatus)">
                  <span class="rejected-label" :title="ord.rejectionReason || ''">
                    ✕ {{ formatStatus(ord.orderStatus) }}
                  </span>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 1. Modal ACC Pesanan + Input Ongkir (9.2) -->
    <div v-if="selectedOrderForAcc" class="modal-backdrop" @click.self="selectedOrderForAcc = null">
      <div class="modal-card modal-reject-card">
        <div class="modal-head">
          <h3>Setujui Pesanan (ACC) - {{ selectedOrderForAcc.orderCode }}</h3>
          <button class="close-btn" @click="selectedOrderForAcc = null">&times;</button>
        </div>

        <div class="modal-reject-body">
          <div class="box-stat">
            <span>Penerima:</span>
            <strong>{{ selectedOrderForAcc.recipientName }} ({{ selectedOrderForAcc.recipientPhone }})</strong>
          </div>
          <div class="box-stat">
            <span>Alamat Tujuan:</span>
            <strong>{{ selectedOrderForAcc.shippingAddress }}</strong>
          </div>
          <div class="box-stat">
            <span>Subtotal Barang:</span>
            <strong>{{ formatRupiah(selectedOrderForAcc.subtotal) }}</strong>
          </div>

          <div class="modal-form-group" style="margin-top: 12px">
            <label>Perkiraan Ongkos Kirim ke Alamat Customer (Rp - Opsional):</label>
            <input v-model.number="accShippingCost" type="number" min="0" class="form-select" placeholder="Contoh: 25000" />
          </div>

          <div class="modal-form-group">
            <label>Catatan Admin untuk Customer (Opsional):</label>
            <input v-model="accAdminNote" type="text" class="form-select" placeholder="Contoh: Stok ready tersedia, dikirim via JNE Reguler" />
          </div>

          <div class="box-stat" style="background: #FFFBF2; padding: 10px 12px; border-radius: 8px; margin-bottom: 14px">
            <span>Total Tagihan Akhir:</span>
            <strong class="highlight-price">
              {{ formatRupiah(selectedOrderForAcc.subtotal + (Number(accShippingCost) || 0)) }}
            </strong>
          </div>

          <div class="modal-actions-row">
            <button class="btn-cancel" @click="selectedOrderForAcc = null">Batal</button>
            <button class="btn-acc" style="padding: 10px 18px" :disabled="isProcessing" @click="confirmAccOrder">
              ✓ Setujui &amp; Buka Pembayaran 24 Jam
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Modal Proof Viewer & Verification (9.5) -->
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
            <div v-if="selectedOrderForProof.latestPayment" class="box-stat">
              <span>Pengirim Mutasi:</span>
              <strong>{{ selectedOrderForProof.latestPayment.senderBank }} - {{ selectedOrderForProof.latestPayment.senderName }}</strong>
            </div>
            <div v-if="selectedOrderForProof.latestPayment" class="box-stat">
              <span>Nominal Ditransfer:</span>
              <strong class="highlight-price">{{ formatRupiah(selectedOrderForProof.latestPayment.amount) }}</strong>
            </div>
            <div class="box-stat">
              <span>Total Tagihan Sistem:</span>
              <strong>{{ formatRupiah(selectedOrderForProof.totalAmount) }}</strong>
            </div>

            <div class="audit-hint">
              Pastikan nominal di mutasi internet banking BCA/Mandiri persis sama dengan angka di atas sebelum memverifikasi.
            </div>

            <div class="modal-actions-col" v-if="selectedOrderForProof.orderStatus === 'payment_uploaded'">
              <button class="btn-approve-big" :disabled="isProcessing" @click="confirmModalVerify">
                ✓ Verifikasi &amp; Tandai Lunas
              </button>
              <button class="btn-reject-big" :disabled="isProcessing" @click="rejectProofModal">
                Tolak Bukti (Minta Upload Ulang)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Modal Reject Order (9.2) -->
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
              <option value="Kuota koper bagasi trip sudah penuh untuk kategori ini">Kuota koper bagasi trip sudah penuh untuk kategori ini</option>
              <option value="Stok ready barang telah habis terjual">Stok ready barang telah habis terjual</option>
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
            <button class="btn-confirm-reject" :disabled="isProcessing" @click="confirmRejectOrder">
              Konfirmasi Tolak Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Modal Advance Order / Input Resi / Upload Bukti Pembelian (9.7) -->
    <div v-if="selectedOrderForAdvance" class="modal-backdrop" @click.self="selectedOrderForAdvance = null">
      <div class="modal-card modal-reject-card">
        <div class="modal-head">
          <h3>Update Progres Pesanan - {{ selectedOrderForAdvance.orderCode }}</h3>
          <button class="close-btn" @click="selectedOrderForAdvance = null">&times;</button>
        </div>

        <div class="modal-reject-body">
          <div class="modal-form-group">
            <label>Catatan Kurir / Nomor Resi Pengiriman (`admin_note`):</label>
            <input
              v-model="advanceAdminNote"
              type="text"
              class="form-select"
              placeholder="Contoh: JNE Reguler - Resi JP1928371928"
            />
          </div>

          <div class="modal-form-group">
            <label>Catatan Progres (Tampil di Timeline Customer):</label>
            <textarea
              v-model="advanceLogNote"
              rows="2"
              class="form-textarea"
              placeholder="Contoh: Paket telah diserahkan ke gerai kurir menuju alamat tujuan."
            ></textarea>
          </div>

          <div class="modal-form-group">
            <label>Upload Foto Struk Pembelian Luar Negeri / Bukti Resi (Opsional):</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleUploadPurchaseProof"
            />
            <span v-if="isUploadingProof" class="sub-txt">Mengunggah bukti ke Cloud...</span>
            <span v-else-if="advanceProofUrl" class="sub-txt" style="color: #166534">✓ Foto bukti siap dilampirkan</span>
          </div>

          <div class="modal-actions-row">
            <button class="btn-cancel" @click="selectedOrderForAdvance = null">Batal</button>
            <button class="btn-acc" style="padding: 10px 18px" :disabled="isProcessing || isUploadingProof" @click="confirmAdvanceOrder">
              Simpan &amp; Lanjutkan Status &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Modal Refund Manual 100% (9.6) -->
    <div v-if="selectedOrderForRefund" class="modal-backdrop" @click.self="selectedOrderForRefund = null">
      <div class="modal-card modal-reject-card">
        <div class="modal-head">
          <h3>Refund Manual 100% - {{ selectedOrderForRefund.orderCode }}</h3>
          <button class="close-btn" @click="selectedOrderForRefund = null">&times;</button>
        </div>

        <div class="modal-reject-body">
          <p class="modal-desc">
            Gunakan fitur ini apabila barang jastip tidak ditemukan / out of stock di luar negeri dan dana customer telah di-refund 100% secara manual.
          </p>
          <div class="modal-form-group">
            <label>Catatan Refund &amp; Bukti Mutasi Pengembalian:</label>
            <textarea
              v-model="refundReasonText"
              rows="3"
              class="form-textarea"
              placeholder="Contoh: Barang out of stock di store Tokyo. Dana Rp ... telah di-refund penuh ke rekening BCA customer."
            ></textarea>
          </div>
          <div class="modal-actions-row">
            <button class="btn-cancel" @click="selectedOrderForRefund = null">Batal</button>
            <button class="btn-confirm-reject" :disabled="isProcessing" @click="confirmRefundOrder">
              Catat Refund 100% &amp; Batalkan Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()

const { data: ordersData, pending, refresh } = await useFetch<any[]>('/api/admin/orders')

const orders = computed(() => ordersData.value || [])
const currentFilter = ref('all')
const isProcessing = ref(false)

// Modal states
const selectedOrderForAcc = ref<any | null>(null)
const accShippingCost = ref<number>(0)
const accAdminNote = ref('')

const selectedOrderForProof = ref<any | null>(null)
const selectedOrderForReject = ref<any | null>(null)
const rejectReasonPreset = ref('Kuota koper bagasi trip sudah penuh untuk kategori ini')
const customRejectReason = ref('')

const selectedOrderForAdvance = ref<any | null>(null)
const advanceAdminNote = ref('')
const advanceLogNote = ref('')
const advanceProofUrl = ref('')
const isUploadingProof = ref(false)

const selectedOrderForRefund = ref<any | null>(null)
const refundReasonText = ref('')

const statusFilters = computed(() => [
  { key: 'all', label: 'Semua Pesanan', count: orders.value.length },
  { key: 'pending_approval', label: 'Perlu ACC', count: orders.value.filter(o => o.orderStatus === 'pending_approval').length },
  { key: 'payment_uploaded', label: 'Cek Pembayaran', count: orders.value.filter(o => o.orderStatus === 'payment_uploaded').length },
  { key: 'pending_payment', label: 'Menunggu Bayar', count: orders.value.filter(o => o.orderStatus === 'pending_payment').length },
  { key: 'verified', label: 'Terverifikasi', count: orders.value.filter(o => o.orderStatus === 'verified').length },
  { key: 'purchasing', label: 'Sedang Dibelikan', count: orders.value.filter(o => o.orderStatus === 'purchasing').length },
  { key: 'arrived', label: 'Tiba di Indo', count: orders.value.filter(o => o.orderStatus === 'arrived').length },
  { key: 'ready_handover', label: 'Sedang Dikirim', count: orders.value.filter(o => o.orderStatus === 'ready_handover' || o.orderStatus === 'ready_pickup').length },
  { key: 'completed', label: 'Selesai', count: orders.value.filter(o => o.orderStatus === 'completed').length },
  { key: 'rejected', label: 'Ditolak / Batal', count: orders.value.filter(o => ['rejected', 'cancelled', 'expired'].includes(o.orderStatus)).length }
])

const filteredOrders = computed(() => {
  if (currentFilter.value === 'all') return orders.value
  if (currentFilter.value === 'ready_handover') {
    return orders.value.filter(o => o.orderStatus === 'ready_handover' || o.orderStatus === 'ready_pickup')
  }
  if (currentFilter.value === 'rejected') {
    return orders.value.filter(o => ['rejected', 'cancelled', 'expired'].includes(o.orderStatus))
  }
  return orders.value.filter(o => o.orderStatus === currentFilter.value)
})

// 1. ACC Modal
const openAccModal = (ord: any) => {
  selectedOrderForAcc.value = ord
  accShippingCost.value = ord.shippingCost || 0
  accAdminNote.value = ord.adminNote || ''
}

const confirmAccOrder = async () => {
  if (!selectedOrderForAcc.value) return
  isProcessing.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrderForAcc.value.orderCode}/status`, {
      method: 'PATCH',
      body: {
        action: 'acc',
        shippingCost: Number(accShippingCost.value) || 0,
        adminNote: accAdminNote.value
      }
    })
    showToast(
      'Pesanan Berhasil di-ACC!',
      `Pesanan #${selectedOrderForAcc.value.orderCode} disetujui & batas bayar 24 jam aktif.`,
      'success'
    )
    selectedOrderForAcc.value = null
    await refresh()
  } catch (err: any) {
    showToast('Gagal ACC', err?.data?.message || 'Gagal menyetujui pesanan.', 'warning')
  } finally {
    isProcessing.value = false
  }
}

// 2. Reject Order Modal
const openRejectModal = (ord: any) => {
  selectedOrderForReject.value = ord
  rejectReasonPreset.value =
    ord.orderType === 'ready'
      ? 'Stok ready barang telah habis terjual'
      : 'Kuota koper bagasi trip sudah penuh untuk kategori ini'
  customRejectReason.value = ''
}

const confirmRejectOrder = async () => {
  if (!selectedOrderForReject.value) return
  const reason =
    rejectReasonPreset.value === 'Lainnya'
      ? customRejectReason.value.trim() || 'Pesanan ditolak oleh admin.'
      : rejectReasonPreset.value

  isProcessing.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrderForReject.value.orderCode}/status`, {
      method: 'PATCH',
      body: {
        action: 'reject_order',
        reason
      }
    })
    showToast('Pesanan Ditolak', `Pesanan #${selectedOrderForReject.value.orderCode} telah ditolak.`, 'warning')
    selectedOrderForReject.value = null
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menolak', err?.data?.message || 'Terjadi kesalahan.', 'warning')
  } finally {
    isProcessing.value = false
  }
}

// 3. Proof Verification Modal
const openProofModal = (ord: any) => {
  selectedOrderForProof.value = ord
}

const confirmModalVerify = async () => {
  if (!selectedOrderForProof.value) return
  isProcessing.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrderForProof.value.orderCode}/status`, {
      method: 'PATCH',
      body: { action: 'verify_payment' }
    })
    showToast(
      'Pembayaran Terverifikasi!',
      `Mutasi pesanan #${selectedOrderForProof.value.orderCode} telah ditandai lunas.`,
      'success'
    )
    selectedOrderForProof.value = null
    await refresh()
  } catch (err: any) {
    showToast('Gagal Verifikasi', err?.data?.message || 'Terjadi kesalahan.', 'warning')
  } finally {
    isProcessing.value = false
  }
}

const rejectProofModal = async () => {
  if (!selectedOrderForProof.value) return
  isProcessing.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrderForProof.value.orderCode}/status`, {
      method: 'PATCH',
      body: {
        action: 'reject_payment',
        reason: 'Bukti transfer tidak sesuai dengan mutasi rekening. Mohon unggah ulang bukti yang valid.'
      }
    })
    showToast(
      'Bukti Transfer Ditolak',
      `Status pesanan #${selectedOrderForProof.value.orderCode} dikembalikan ke Menunggu Pembayaran.`,
      'warning'
    )
    selectedOrderForProof.value = null
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menolak Bukti', err?.data?.message || 'Terjadi kesalahan.', 'warning')
  } finally {
    isProcessing.value = false
  }
}

// 4. Advance Status / Input Resi / Upload Purchase Proof
const openAdvanceModal = (ord: any) => {
  selectedOrderForAdvance.value = ord
  advanceAdminNote.value = ord.adminNote || ''
  advanceLogNote.value = ''
  advanceProofUrl.value = ''
}

const handleUploadPurchaseProof = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingProof.value = true
  try {
    const fd = new FormData()
    fd.append('folder', 'purchase-proofs')
    fd.append('file', file)
    const uploaded = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: fd
    })
    if (uploaded?.url) {
      advanceProofUrl.value = uploaded.url
      showToast('Foto Bukti Terunggah', 'Foto struk pembelian siap disimpan.', 'success')
    }
  } catch (err: any) {
    showToast('Gagal Upload', err?.data?.message || 'Gagal mengunggah foto bukti.', 'warning')
  } finally {
    isUploadingProof.value = false
  }
}

const confirmAdvanceOrder = async () => {
  if (!selectedOrderForAdvance.value) return
  isProcessing.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrderForAdvance.value.orderCode}/status`, {
      method: 'PATCH',
      body: {
        action: 'advance_status',
        adminNote: advanceAdminNote.value,
        note: advanceLogNote.value,
        proofImageUrl: advanceProofUrl.value || null
      }
    })
    showToast(
      'Status Diperbarui',
      `Progres pesanan #${selectedOrderForAdvance.value.orderCode} berhasil diperbarui.`,
      'success'
    )
    selectedOrderForAdvance.value = null
    await refresh()
  } catch (err: any) {
    showToast('Gagal Update Status', err?.data?.message || 'Terjadi kesalahan.', 'warning')
  } finally {
    isProcessing.value = false
  }
}

// 5. Refund Manual 100%
const openRefundModal = (ord: any) => {
  selectedOrderForRefund.value = ord
  refundReasonText.value = 'Barang out of stock di toko resmi luar negeri. Dana telah di-refund 100% penuh ke rekening customer.'
}

const confirmRefundOrder = async () => {
  if (!selectedOrderForRefund.value) return
  isProcessing.value = true
  try {
    await $fetch(`/api/admin/orders/${selectedOrderForRefund.value.orderCode}/status`, {
      method: 'PATCH',
      body: {
        action: 'refund',
        reason: refundReasonText.value
      }
    })
    showToast(
      'Refund 100% Dicatat',
      `Pesanan #${selectedOrderForRefund.value.orderCode} ditandai batal (Full Refund).`,
      'info'
    )
    selectedOrderForRefund.value = null
    await refresh()
  } catch (err: any) {
    showToast('Gagal Mencatat Refund', err?.data?.message || 'Terjadi kesalahan.', 'warning')
  } finally {
    isProcessing.value = false
  }
}

const formatStatus = (st: string) => {
  const map: Record<string, string> = {
    pending_approval: 'Perlu ACC',
    pending_payment: 'Menunggu Bayar',
    payment_uploaded: 'Cek Bukti Transfer',
    verified: 'Lunas / Terverifikasi',
    purchasing: 'Sedang Dibelikan',
    arrived: 'Tiba di Indo',
    ready_handover: 'Sedang Dikirim',
    ready_pickup: 'Sedang Dikirim',
    completed: 'Selesai',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan / Refund',
    expired: 'Kedaluwarsa'
  }
  return map[st] || st
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}
</script>

<style scoped>
.admin-orders-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 4px;
}

.page-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.t-btn {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.t-btn.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.tab-badge {
  background: #EFE1C6;
  color: #2B2116;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 999px;
  font-weight: 800;
}

.t-btn.active .tab-badge {
  background: #ffffff;
  color: var(--color-primary, #8C6D3F);
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
  font-size: 0.84rem;
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  vertical-align: top;
}

.data-table th {
  background: #FFFDF8;
  font-weight: 800;
  color: var(--color-text, #2B2116);
}

.sub-txt {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
  margin-top: 2px;
}

.addr-clip,
.note-clip {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-pill {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  margin-bottom: 4px;
}

.type-pill.ready {
  background: #DCFCE7;
  color: #166534;
}

.type-pill.jastip {
  background: #EFE1C6;
  color: #8C6D3F;
}

.unique-badge {
  display: inline-block;
  font-size: 0.7rem;
  background: #FEF3C7;
  color: #92400E;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  margin-top: 2px;
}

.status-pill {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
}

.status-pill.pending_approval {
  background: #FEF9C3;
  color: #854D0E;
}

.status-pill.pending_payment {
  background: #FEF3C7;
  color: #92400E;
}

.status-pill.payment_uploaded {
  background: #DBEAFE;
  color: #1D4ED8;
}

.status-pill.verified,
.status-pill.ready_handover,
.status-pill.completed {
  background: #DCFCE7;
  color: #166534;
}

.status-pill.purchasing,
.status-pill.arrived {
  background: #F3E6CC;
  color: #6F5530;
}

.status-pill.rejected,
.status-pill.cancelled,
.status-pill.expired {
  background: #FEE2E2;
  color: #B91C1C;
}

.btn-view-receipt {
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.no-proof,
.no-proof-muted {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.action-btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-acc,
.btn-verify,
.btn-step {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-step.green {
  background: #16A34A;
}

.btn-reject,
.btn-reject-sm {
  background: #FEE2E2;
  color: #B91C1C;
  border: 1px solid #FCA5A5;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.done-label {
  color: #166534;
  font-weight: 700;
  font-size: 0.78rem;
}

.rejected-label {
  color: #B91C1C;
  font-weight: 700;
  font-size: 0.78rem;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 20, 12, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 14px;
  max-width: 760px;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.modal-reject-card {
  max-width: 520px;
}

.modal-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-head h3 {
  margin: 0;
  font-size: 1rem;
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
  gap: 20px;
  padding: 20px;
}

.proof-image-side img {
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.proof-details-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.box-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--color-secondary, #EFE1C6);
  gap: 10px;
}

.highlight-price {
  color: var(--color-primary, #8C6D3F);
  font-size: 1rem;
}

.audit-hint {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.76rem;
  color: #92400E;
}

.modal-actions-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.btn-approve-big {
  background: #16A34A;
  color: #ffffff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
}

.btn-reject-big {
  background: #FEE2E2;
  color: #B91C1C;
  border: 1px solid #FCA5A5;
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.modal-reject-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-desc {
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
}

.modal-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
}

.form-select,
.form-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  width: 100%;
  font-family: inherit;
}

.modal-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-cancel {
  background: #F3F4F6;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-confirm-reject {
  background: #DC2626;
  color: #ffffff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
</style>
