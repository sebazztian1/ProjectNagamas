<template>
  <div class="customer-detail-page">
    <!-- Top Breadcrumb / Action Row -->
    <div class="top-bar">
      <NuxtLink to="/admin/customer" class="btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path d="M15 18l-6-6 6-6"></path>
        </svg>
        <span>Kembali ke Pelanggan</span>
      </NuxtLink>

      <div class="top-actions">
        <button type="button" class="btn-export-csv" :disabled="!detail" @click="openExportModal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Export CSV</span>
        </button>

        <button type="button" class="btn-refresh" :disabled="pending" @click="fetchDetail">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }" aria-hidden="true">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="pending && !detail" class="state-card">
      Memuat detail pelanggan...
    </div>

    <div v-else-if="loadError" class="state-card error">
      <p>{{ loadError }}</p>
      <NuxtLink to="/admin/customer" class="btn-secondary">Kembali ke Daftar Pelanggan</NuxtLink>
    </div>

    <template v-else-if="detail">
      <!-- Profile + Summary Header -->
      <section class="profile-card" aria-label="Profil Pelanggan">
        <div class="profile-main">
          <div class="profile-avatar" :class="{ inactive: !detail.customer.isActive }">
            {{ (detail.customer.username || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="profile-meta">
            <div class="profile-title-row">
              <h1 class="profile-username">@{{ detail.customer.username }}</h1>
              <span class="status-pill" :class="detail.customer.isActive ? 'is-ok' : 'is-danger'">
                {{ detail.customer.isActive ? 'Akun Aktif' : 'Akun Dinonaktifkan' }}
              </span>
            </div>
            <div class="profile-sub-row">
              <span>No. WhatsApp: <strong>{{ detail.customer.phone }}</strong></span>
              <span aria-hidden="true">&bull;</span>
              <span>Bergabung: <strong>{{ formatDateTime(detail.customer.joinedAt, false) }}</strong></span>
            </div>
            <div class="access-pills">
              <span class="access-chip" :class="{ blocked: !detail.customer.canOrder }">
                Pesanan: {{ detail.customer.canOrder ? 'Aktif' : 'Dinonaktifkan' }}
              </span>
              <span class="access-chip" :class="{ blocked: !detail.customer.canRequest }">
                Request: {{ detail.customer.canRequest ? 'Aktif' : 'Dinonaktifkan' }}
              </span>
              <span class="access-chip" :class="{ blocked: !detail.customer.canChat }">
                Live Chat: {{ detail.customer.canChat ? 'Aktif' : 'Dinonaktifkan' }}
              </span>
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <span class="kpi-label">Total Pesanan</span>
            <strong class="kpi-val">{{ detail.summary.totalOrders }}</strong>
            <span class="kpi-sub">
              {{ detail.summary.unpaidOrders }} belum bayar &bull; {{ detail.summary.paidOrders }} dibayar/proses
            </span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Total Pembayaran</span>
            <strong class="kpi-val">{{ formatRupiah(detail.summary.totalPaidAmount) }}</strong>
            <span class="kpi-sub">{{ detail.summary.completedOrders }} pesanan selesai</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Request Produk</span>
            <strong class="kpi-val">{{ detail.summary.totalRequests }}</strong>
            <span class="kpi-sub">{{ detail.summary.pendingRequests }} menunggu / penawaran</span>
          </div>
        </div>
      </section>

      <!-- Admin Actions & Access Control Panel -->
      <section class="admin-actions-card" aria-label="Kontrol dan Aksi Admin">
        <div class="card-head-row">
          <div>
            <h2 class="section-title">Kontrol Akses &amp; Aksi Admin</h2>
            <p class="section-sub">Batasi fitur tertentu atau nonaktifkan akun pelanggan ini.</p>
          </div>
          <button type="button" class="btn-outline" @click="openResetModal">
            Reset Kata Sandi
          </button>
        </div>

        <div class="toggles-grid">
          <!-- Toggle Account Active -->
          <label class="toggle-card danger-zone" :class="{ 'is-blocked': !accessForm.isActive }">
            <div class="toggle-text">
              <strong>Status Akun</strong>
              <span>{{ accessForm.isActive ? 'Akun dapat masuk dan memakai layanan.' : 'Akun diblokir total (tidak bisa masuk).' }}</span>
            </div>
            <input
              v-model="accessForm.isActive"
              type="checkbox"
              class="switch-input"
              aria-label="Aktifkan akun pelanggan"
            />
          </label>

          <!-- Toggle Can Order -->
          <label class="toggle-card" :class="{ 'is-blocked': !accessForm.canOrder }">
            <div class="toggle-text">
              <strong>Izin Pesanan &amp; Checkout</strong>
              <span>{{ accessForm.canOrder ? 'Dapat mengajukan pesanan baru.' : 'Dilarang membuat pesanan baru.' }}</span>
            </div>
            <input
              v-model="accessForm.canOrder"
              type="checkbox"
              class="switch-input"
              aria-label="Izinkan pelanggan membuat pesanan"
            />
          </label>

          <!-- Toggle Can Request -->
          <label class="toggle-card" :class="{ 'is-blocked': !accessForm.canRequest }">
            <div class="toggle-text">
              <strong>Izin Request Produk</strong>
              <span>{{ accessForm.canRequest ? 'Dapat mengajukan dan menyetujui request.' : 'Dilarang membuat/menyetujui request.' }}</span>
            </div>
            <input
              v-model="accessForm.canRequest"
              type="checkbox"
              class="switch-input"
              aria-label="Izinkan pelanggan membuat request produk"
            />
          </label>

          <!-- Toggle Can Chat -->
          <label class="toggle-card" :class="{ 'is-blocked': !accessForm.canChat }">
            <div class="toggle-text">
              <strong>Izin Live Chat</strong>
              <span>{{ accessForm.canChat ? 'Dapat mengirim pesan di live chat.' : 'Pengiriman pesan live chat dimatikan.' }}</span>
            </div>
            <input
              v-model="accessForm.canChat"
              type="checkbox"
              class="switch-input"
              aria-label="Izinkan pelanggan mengirim live chat"
            />
          </label>
        </div>

        <div class="reason-row">
          <div class="reason-field">
            <label for="restriction-reason">Alasan Pembatasan / Catatan Admin (Opsional)</label>
            <textarea
              id="restriction-reason"
              v-model="accessForm.restrictionReason"
              rows="2"
              maxlength="500"
              placeholder="Contoh: Sering membatalkan pesanan setelah ACC / spam chat..."
            ></textarea>
          </div>

          <div class="save-actions">
            <button
              type="button"
              class="btn-save-access"
              :disabled="savingAccess || !hasAccessChanges"
              @click="saveAccessSettings"
            >
              {{ savingAccess ? 'Menyimpan...' : 'Simpan Pengaturan Akses' }}
            </button>
            <button
              v-if="hasAccessChanges"
              type="button"
              class="btn-reset-form"
              :disabled="savingAccess"
              @click="resetAccessForm"
            >
              Batal
            </button>
          </div>
        </div>
      </section>

      <!-- Tabs for Orders & Product Requests -->
      <section class="history-card">
        <div class="main-tabs" role="tablist" aria-label="Riwayat Aktivitas Pelanggan">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'orders'"
            class="main-tab-btn"
            :class="{ active: activeTab === 'orders' }"
            @click="activeTab = 'orders'"
          >
            <span>Semua Pesanan</span>
            <span class="tab-count">{{ detail.orders.length }}</span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'requests'"
            class="main-tab-btn"
            :class="{ active: activeTab === 'requests' }"
            @click="activeTab = 'requests'"
          >
            <span>Semua Request Produk</span>
            <span class="tab-count">{{ detail.requests.length }}</span>
          </button>
        </div>

        <!-- TAB 1: ORDERS -->
        <div v-if="activeTab === 'orders'" class="tab-panel" role="tabpanel">
          <div class="sub-filter-bar">
            <div class="chip-group">
              <button
                v-for="f in orderFilterOptions"
                :key="f.key"
                type="button"
                class="filter-chip"
                :class="{ active: orderFilter === f.key }"
                @click="orderFilter = f.key"
              >
                {{ f.label }} ({{ f.count }})
              </button>
            </div>
            <NuxtLink to="/admin/order" class="manage-link">Kelola di Halaman Pesanan &rarr;</NuxtLink>
          </div>

          <div v-if="filteredOrders.length === 0" class="empty-panel">
            Tidak ada pesanan pada kategori ini.
          </div>

          <div v-else class="items-list">
            <article v-for="o in filteredOrders" :key="o.id" class="record-card">
              <div class="record-head">
                <div class="record-id-group">
                  <strong class="order-code">#{{ o.orderCode }}</strong>
                  <span class="type-pill" :class="o.orderType">{{ o.orderType === 'ready' ? 'Ready Stock' : 'Jastip' }}</span>
                  <span v-if="o.tripTitle" class="trip-pill">{{ o.tripTitle }}</span>
                </div>
                <span class="order-status-pill" :class="o.orderStatus">
                  {{ formatOrderStatus(o.orderStatus) }}
                </span>
              </div>

              <div class="record-body">
                <div class="order-items-mini">
                  <div v-for="it in o.items" :key="it.id" class="mini-item-row">
                    <span>{{ it.productName }} <small v-if="it.variant">({{ it.variant }})</small> &times; {{ it.quantity }}</span>
                    <strong>{{ formatRupiah(it.subtotal) }}</strong>
                  </div>
                </div>

                <div class="payment-summary-strip">
                  <div class="pay-col">
                    <span class="lbl">Total Tagihan</span>
                    <strong>{{ formatRupiah(o.totalAmount) }}</strong>
                  </div>
                  <div class="pay-col">
                    <span class="lbl">Sudah Dibayar</span>
                    <strong class="text-paid">{{ formatRupiah(o.paidAmount) }}</strong>
                  </div>
                  <div class="pay-col">
                    <span class="lbl">Sisa Tagihan</span>
                    <strong :class="{ 'text-due': o.remainingAmount > 0 }">{{ formatRupiah(o.remainingAmount) }}</strong>
                  </div>
                  <div class="pay-col">
                    <span class="lbl">Skema &amp; Pengiriman</span>
                    <span>{{ o.paymentType === 'dp' ? 'DP 50%' : 'Full' }} &bull; {{ o.fulfillmentMethod === 'pickup' ? 'Ambil Toko' : 'Kirim Kurir' }}</span>
                  </div>
                </div>

                <div v-if="o.latestPayment" class="latest-payment-note">
                  <span>
                    Pembayaran terakhir ({{ o.latestPayment.paymentKind.toUpperCase() }}):
                    <strong>{{ o.latestPayment.senderName }}</strong> ({{ o.latestPayment.senderBank }}) &bull;
                    Status: <strong>{{ formatPaymentStatus(o.latestPayment.status) }}</strong>
                  </span>
                  <button
                    v-if="o.latestPayment.receiptUrl"
                    type="button"
                    class="btn-link-inline"
                    @click="previewImageUrl = o.latestPayment.receiptUrl"
                  >
                    Lihat Bukti Transfer
                  </button>
                </div>
              </div>

              <div class="record-foot">
                <span class="timestamp">Dibuat: {{ o.createdAt }}</span>
                <button type="button" class="btn-small-detail" @click="selectedOrder = o">
                  Rincian Lengkap
                </button>
              </div>
            </article>
          </div>
        </div>

        <!-- TAB 2: PRODUCT REQUESTS -->
        <div v-if="activeTab === 'requests'" class="tab-panel" role="tabpanel">
          <div class="sub-filter-bar">
            <div class="chip-group">
              <button
                v-for="f in requestFilterOptions"
                :key="f.key"
                type="button"
                class="filter-chip"
                :class="{ active: requestFilter === f.key }"
                @click="requestFilter = f.key"
              >
                {{ f.label }} ({{ f.count }})
              </button>
            </div>
            <NuxtLink to="/admin/request" class="manage-link">Kelola di Halaman Request &rarr;</NuxtLink>
          </div>

          <div v-if="filteredRequests.length === 0" class="empty-panel">
            Tidak ada request produk pada kategori ini.
          </div>

          <div v-else class="items-list">
            <article v-for="r in filteredRequests" :key="r.id" class="record-card">
              <div class="record-head">
                <div class="record-id-group">
                  <strong class="order-code">REQ #{{ r.id }}</strong>
                  <span class="trip-pill">{{ r.flag }} {{ r.tripTitle }}</span>
                </div>
                <span class="req-status-pill" :class="r.status">
                  {{ formatRequestStatus(r.status) }}
                </span>
              </div>

              <div class="req-body-flex">
                <button
                  v-if="r.referenceImageUrl"
                  type="button"
                  class="req-thumb-btn"
                  aria-label="Perbesar foto referensi"
                  @click="previewImageUrl = r.referenceImageUrl"
                >
                  <img :src="r.referenceImageUrl" :alt="r.productName" />
                </button>

                <div class="req-info-col">
                  <h3 class="req-prod-name">{{ r.productName }}</h3>
                  <p v-if="r.description" class="req-desc">{{ r.description }}</p>

                  <div class="req-meta-row">
                    <span v-if="r.quotedPrice !== null" class="quote-chip">
                      Penawaran: <strong>{{ formatRupiah(r.quotedPrice) }}</strong>
                    </span>
                    <a
                      v-if="r.referenceLink"
                      :href="r.referenceLink"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn-link-inline"
                    >
                      Buka Link Referensi &rarr;
                    </a>
                  </div>

                  <p v-if="r.quoteNote || r.adminNote" class="admin-note-line">
                    <strong>Catatan Admin:</strong> {{ r.quoteNote || r.adminNote }}
                  </p>
                </div>
              </div>

              <div class="record-foot">
                <span class="timestamp">Diajukan: {{ formatDateTime(r.createdAt) }}</span>
                <span v-if="r.quoteExpiresAt" class="timestamp">
                  Batas Quote: {{ formatDateTime(r.quoteExpiresAt) }}
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </template>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Rincian Pesanan" @click.self="selectedOrder = null">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Pesanan #{{ selectedOrder.orderCode }}</h3>
          <button type="button" class="btn-close-modal" aria-label="Tutup rincian" @click="selectedOrder = null">&times;</button>
        </div>

        <div class="modal-body">
          <div class="modal-section">
            <span class="modal-section-title">Penerima &amp; Alamat</span>
            <p><strong>{{ selectedOrder.recipientName }}</strong> &bull; {{ selectedOrder.recipientPhone }}</p>
            <p class="muted-p">{{ selectedOrder.shippingAddress }}</p>
            <p v-if="selectedOrder.customerNote" class="note-p">Catatan Customer: {{ selectedOrder.customerNote }}</p>
            <p v-if="selectedOrder.rejectionReason" class="error-p">Alasan Penolakan: {{ selectedOrder.rejectionReason }}</p>
          </div>

          <div class="modal-section">
            <span class="modal-section-title">Item Pesanan</span>
            <div v-for="it in selectedOrder.items" :key="it.id" class="modal-item-line">
              <span>{{ it.productName }} ({{ it.variant }}) &times; {{ it.quantity }}</span>
              <strong>{{ formatRupiah(it.subtotal) }}</strong>
            </div>
            <div class="modal-total-line">
              <span>Subtotal: {{ formatRupiah(selectedOrder.subtotal) }}</span>
              <span>Ongkir: {{ formatRupiah(selectedOrder.shippingCost) }}</span>
              <strong>Total: {{ formatRupiah(selectedOrder.totalAmount) }}</strong>
            </div>
          </div>

          <div v-if="selectedOrder.payments && selectedOrder.payments.length > 0" class="modal-section">
            <span class="modal-section-title">Riwayat Pembayaran</span>
            <div v-for="p in selectedOrder.payments" :key="p.id" class="modal-payment-row">
              <div>
                <strong>{{ p.paymentKind.toUpperCase() }} - {{ formatRupiah(p.amount) }}</strong>
                <div class="muted-p">{{ p.senderName }} ({{ p.senderBank }}) &rarr; {{ p.bankName }} &bull; {{ formatPaymentStatus(p.status) }}</div>
                <div v-if="p.adminNote" class="muted-p">Catatan: {{ p.adminNote }}</div>
              </div>
              <button v-if="p.receiptUrl" type="button" class="btn-small-detail" @click="previewImageUrl = p.receiptUrl">
                Bukti
              </button>
            </div>
          </div>

          <div v-if="selectedOrder.logs && selectedOrder.logs.length > 0" class="modal-section">
            <span class="modal-section-title">Timeline Status</span>
            <ul class="timeline-list">
              <li v-for="log in selectedOrder.logs" :key="log.id">
                <strong>{{ log.title }}</strong>
                <span class="muted-p">{{ log.createdAt }} ({{ log.changedBy }})</span>
                <p v-if="log.note" class="muted-p">{{ log.note }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="previewImageUrl" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Pratinjau Gambar" @click.self="previewImageUrl = null">
      <div class="lightbox-card">
        <button type="button" class="btn-close-lightbox" aria-label="Tutup pratinjau" @click="previewImageUrl = null">&times;</button>
        <img :src="previewImageUrl" alt="Bukti atau foto referensi" class="lightbox-img" />
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetModal" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Reset Kata Sandi" @click.self="showResetModal = false">
      <div class="modal-card small">
        <div class="modal-head">
          <h3>Reset Kata Sandi @{{ detail?.customer.username }}</h3>
          <button type="button" class="btn-close-modal" aria-label="Tutup modal reset kata sandi" @click="showResetModal = false">&times;</button>
        </div>
        <form class="modal-body" @submit.prevent="submitResetPassword">
          <div class="reason-field">
            <label for="new-customer-pw">Kata Sandi Baru (min. 8 karakter + angka/simbol)</label>
            <input
              id="new-customer-pw"
              v-model="newPasswordInput"
              type="text"
              placeholder="Masukkan kata sandi baru..."
              required
            />
          </div>
          <div class="modal-foot">
            <button type="button" class="btn-reset-form" @click="showResetModal = false">Batal</button>
            <button type="submit" class="btn-save-access" :disabled="resettingPassword">
              {{ resettingPassword ? 'Menyimpan...' : 'Reset Kata Sandi' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <AdminCsvExportModal
      :show="showExportModal"
      :title="`Export Transaksi @${detail?.customer?.username || 'pelanggan'}`"
      subtitle="Ekspor riwayat pesanan atau request produk pelanggan ini beserta rincian pembayaran dan timestamp WIB."
      :datasets="exportDatasetOptions"
      v-model:selected-dataset="exportDataset"
      v-model:start-date="exportStartDate"
      v-model:end-date="exportEndDate"
      :preview-count="exportPreview.items.length"
      :min-timestamp="exportPreview.minTimestamp"
      :max-timestamp="exportPreview.maxTimestamp"
      :summary-metrics="exportMetrics"
      @close="showExportModal = false"
      @export="handleExportCsv"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '../../../composables/useToast'
import type { CsvDatasetOption, CsvPreviewMetric } from '../../../components/AdminCsvExportModal.vue'
import {
  downloadCsvFile,
  filterByDateRange,
  formatCsvTimestamp
} from '../../../utils/csvExport'

const route = useRoute()
const { showToast } = useToast()

const customerId = computed(() => Number(route.params.id))
const detail = ref<any>(null)
const pending = ref(true)
const loadError = ref('')

const activeTab = ref<'orders' | 'requests'>('orders')
const orderFilter = ref<'all' | 'unpaid' | 'paid' | 'cancelled'>('all')
const requestFilter = ref<'all' | 'pending' | 'quoted' | 'approved' | 'rejected'>('all')

const selectedOrder = ref<any>(null)
const previewImageUrl = ref<string | null>(null)

const showResetModal = ref(false)
const newPasswordInput = ref('')
const resettingPassword = ref(false)

const savingAccess = ref(false)
const accessForm = reactive({
  isActive: true,
  canOrder: true,
  canRequest: true,
  canChat: true,
  restrictionReason: ''
})

const syncFormFromCustomer = (c: any) => {
  accessForm.isActive = Boolean(c.isActive)
  accessForm.canOrder = Boolean(c.canOrder)
  accessForm.canRequest = Boolean(c.canRequest)
  accessForm.canChat = Boolean(c.canChat)
  accessForm.restrictionReason = c.restrictionReason || ''
}

const hasAccessChanges = computed(() => {
  const c = detail.value?.customer
  if (!c) return false
  return (
    accessForm.isActive !== Boolean(c.isActive) ||
    accessForm.canOrder !== Boolean(c.canOrder) ||
    accessForm.canRequest !== Boolean(c.canRequest) ||
    accessForm.canChat !== Boolean(c.canChat) ||
    accessForm.restrictionReason.trim() !== (c.restrictionReason || '').trim()
  )
})

const resetAccessForm = () => {
  if (detail.value?.customer) {
    syncFormFromCustomer(detail.value.customer)
  }
}

const fetchDetail = async () => {
  if (!customerId.value || isNaN(customerId.value)) {
    loadError.value = 'ID pelanggan tidak valid.'
    pending.value = false
    return
  }

  pending.value = true
  loadError.value = ''
  try {
    const res = await $fetch<any>(`/api/admin/customers/${customerId.value}`)
    detail.value = res
    if (res?.customer) {
      syncFormFromCustomer(res.customer)
    }
  } catch (err: any) {
    loadError.value = err?.data?.message || 'Gagal memuat detail pelanggan.'
  } finally {
    pending.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  if (previewImageUrl.value) {
    previewImageUrl.value = null
  } else if (showResetModal.value) {
    showResetModal.value = false
  } else if (selectedOrder.value) {
    selectedOrder.value = null
  }
}

onMounted(() => {
  fetchDetail()
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})

const saveAccessSettings = async () => {
  if (!detail.value?.customer) return
  if (
    detail.value.customer.isActive &&
    !accessForm.isActive &&
    !confirm(`Nonaktifkan akun @${detail.value.customer.username}? Pelanggan tidak akan dapat masuk hingga diaktifkan kembali.`)
  ) {
    return
  }

  savingAccess.value = true
  try {
    const res = await $fetch<any>(`/api/admin/customers/${customerId.value}`, {
      method: 'PATCH',
      body: {
        isActive: accessForm.isActive,
        canOrder: accessForm.canOrder,
        canRequest: accessForm.canRequest,
        canChat: accessForm.canChat,
        restrictionReason: accessForm.restrictionReason.trim() || null
      }
    })

    if (res?.customer && detail.value) {
      detail.value.customer = {
        ...detail.value.customer,
        ...res.customer
      }
      syncFormFromCustomer(detail.value.customer)
    }
    showToast('Tersimpan', res?.message || 'Pengaturan akses pelanggan diperbarui.', 'success')
  } catch (err: any) {
    showToast('Gagal Menyimpan', err?.data?.message || 'Gagal memperbarui status pelanggan.', 'warning')
  } finally {
    savingAccess.value = false
  }
}

const openResetModal = () => {
  newPasswordInput.value = ''
  showResetModal.value = true
}

const submitResetPassword = async () => {
  if (!detail.value?.customer || !newPasswordInput.value.trim()) return
  resettingPassword.value = true
  try {
    const res = await $fetch<any>('/api/admin/users/reset-password', {
      method: 'POST',
      body: {
        userId: detail.value.customer.id,
        newPassword: newPasswordInput.value.trim()
      }
    })
    showToast('Berhasil', res?.message || 'Kata sandi pelanggan berhasil direset.', 'success')
    showResetModal.value = false
    newPasswordInput.value = ''
  } catch (err: any) {
    showToast('Gagal Reset', err?.data?.message || 'Gagal mereset kata sandi.', 'warning')
  } finally {
    resettingPassword.value = false
  }
}

const unpaidStatuses = new Set(['pending_approval', 'pending_payment'])
const paidStatuses = new Set(['payment_uploaded', 'verified', 'purchasing', 'arrived', 'ready_handover', 'completed'])
const cancelledStatuses = new Set(['rejected', 'cancelled', 'expired'])

const orderFilterOptions = computed(() => {
  const list = detail.value?.orders || []
  return [
    { key: 'all' as const, label: 'Semua', count: list.length },
    { key: 'unpaid' as const, label: 'Belum Dibayar', count: list.filter((o: any) => unpaidStatuses.has(o.orderStatus)).length },
    { key: 'paid' as const, label: 'Sudah Dibayar / Proses', count: list.filter((o: any) => paidStatuses.has(o.orderStatus)).length },
    { key: 'cancelled' as const, label: 'Batal / Ditolak', count: list.filter((o: any) => cancelledStatuses.has(o.orderStatus)).length }
  ]
})

const filteredOrders = computed(() => {
  const list = detail.value?.orders || []
  if (orderFilter.value === 'unpaid') return list.filter((o: any) => unpaidStatuses.has(o.orderStatus))
  if (orderFilter.value === 'paid') return list.filter((o: any) => paidStatuses.has(o.orderStatus))
  if (orderFilter.value === 'cancelled') return list.filter((o: any) => cancelledStatuses.has(o.orderStatus))
  return list
})

const requestFilterOptions = computed(() => {
  const list = detail.value?.requests || []
  return [
    { key: 'all' as const, label: 'Semua', count: list.length },
    { key: 'pending' as const, label: 'Menunggu / Ditinjau', count: list.filter((r: any) => ['pending', 'reviewed'].includes(r.status)).length },
    { key: 'quoted' as const, label: 'Ada Penawaran', count: list.filter((r: any) => r.status === 'quoted').length },
    { key: 'approved' as const, label: 'Disetujui / Katalog', count: list.filter((r: any) => ['accepted', 'available'].includes(r.status)).length },
    { key: 'rejected' as const, label: 'Ditolak', count: list.filter((r: any) => r.status === 'rejected').length }
  ]
})

const filteredRequests = computed(() => {
  const list = detail.value?.requests || []
  if (requestFilter.value === 'pending') return list.filter((r: any) => ['pending', 'reviewed'].includes(r.status))
  if (requestFilter.value === 'quoted') return list.filter((r: any) => r.status === 'quoted')
  if (requestFilter.value === 'approved') return list.filter((r: any) => ['accepted', 'available'].includes(r.status))
  if (requestFilter.value === 'rejected') return list.filter((r: any) => r.status === 'rejected')
  return list
})

const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID')

const formatDateTime = (iso?: string | null, withTime = true) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('id-ID', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }
  ).format(d)
}

const formatOrderStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_approval: 'Menunggu ACC',
    pending_payment: 'Belum Dibayar',
    payment_uploaded: 'Bukti Diunggah',
    verified: 'Terverifikasi',
    purchasing: 'Dibelikan',
    arrived: 'Tiba di ID',
    ready_handover: 'Dikirim / Serah Terima',
    completed: 'Selesai',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa'
  }
  return map[status] || status
}

const formatPaymentStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Menunggu Verifikasi',
    verified: 'Terverifikasi',
    rejected: 'Ditolak'
  }
  return map[status] || status
}

const formatRequestStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Menunggu',
    reviewed: 'Ditinjau',
    quoted: 'Penawaran Dikirim',
    accepted: 'Disetujui',
    available: 'Masuk Katalog',
    rejected: 'Ditolak'
  }
  return map[status] || status
}

// --- Accounting CSV Export ---
const showExportModal = ref(false)
const exportDataset = ref<'orders' | 'requests'>('orders')
const exportStartDate = ref('')
const exportEndDate = ref('')

const exportDatasetOptions: CsvDatasetOption[] = [
  { id: 'orders', label: 'Riwayat Pesanan', description: 'Tagihan, pembayaran masuk & sisa piutang customer' },
  { id: 'requests', label: 'Riwayat Request Produk', description: 'Permintaan titip custom & penawaran harga' }
]

const openExportModal = () => {
  if (!detail.value) return
  exportDataset.value = activeTab.value === 'requests' ? 'requests' : 'orders'
  showExportModal.value = true
}

const exportPreview = computed(() => {
  if (exportDataset.value === 'orders') {
    return filterByDateRange(detail.value?.orders || [], o => o.createdAtIso, exportStartDate.value, exportEndDate.value)
  }
  return filterByDateRange(detail.value?.requests || [], r => r.createdAt, exportStartDate.value, exportEndDate.value)
})

const exportMetrics = computed<CsvPreviewMetric[]>(() => {
  const rows = exportPreview.value.items
  if (exportDataset.value === 'orders') {
    const valid = rows.filter(o => !['cancelled', 'rejected', 'expired'].includes(o.orderStatus))
    return [
      { label: 'Total Tagihan Aktif', value: formatRupiah(valid.reduce((s, o) => s + Number(o.totalAmount || 0), 0)), highlight: true },
      { label: 'Total Dibayar', value: formatRupiah(valid.reduce((s, o) => s + Number(o.paidAmount || 0), 0)) },
      { label: 'Sisa Piutang', value: formatRupiah(valid.reduce((s, o) => s + Number(o.remainingAmount || 0), 0)) }
    ]
  }
  const quotedSum = rows.reduce((s, r) => s + Number(r.quotedPrice || 0), 0)
  return [
    { label: 'Akumulasi Quote', value: formatRupiah(quotedSum), highlight: true },
    { label: 'Jumlah Request', value: `${rows.length} request` }
  ]
})

const handleExportCsv = () => {
  if (!detail.value) return
  const { items, minTimestamp, maxTimestamp } = exportPreview.value
  if (!items.length) return

  const uname = detail.value.customer?.username || `id_${customerId.value}`
  if (exportDataset.value === 'orders') {
    const valid = items.filter(o => !['cancelled', 'rejected', 'expired'].includes(o.orderStatus))
    const res = downloadCsvFile({
      filenamePrefix: `pelanggan_${uname}_pesanan`,
      reportTitle: `Riwayat Pesanan Pelanggan @${uname}`,
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      summaryItems: [
        { label: 'Total Tagihan Aktif (IDR)', value: valid.reduce((s, o) => s + Number(o.totalAmount || 0), 0) },
        { label: 'Total Dibayar (IDR)', value: valid.reduce((s, o) => s + Number(o.paidAmount || 0), 0) },
        { label: 'Total Sisa Piutang (IDR)', value: valid.reduce((s, o) => s + Number(o.remainingAmount || 0), 0) }
      ],
      columns: [
        { header: 'Timestamp Order (WIB)', format: r => formatCsvTimestamp(r.createdAtIso) },
        { header: 'Kode Order', key: 'orderCode' },
        { header: 'Tipe', format: r => (r.orderType === 'ready' ? 'Ready Stock' : 'Jastip') },
        { header: 'Trip', format: r => r.tripTitle || '-' },
        { header: 'Status Order', format: r => formatOrderStatus(r.orderStatus) },
        { header: 'Skema Bayar', format: r => (r.paymentType === 'dp' ? 'DP 50%' : 'Full 100%') },
        { header: 'Subtotal Barang (IDR)', format: r => Number(r.subtotal || 0) },
        { header: 'Ongkir (IDR)', format: r => Number(r.shippingCost || 0) },
        { header: 'Kode Unik (IDR)', format: r => Number(r.uniqueCode || 0) },
        { header: 'Total Tagihan (IDR)', format: r => Number(r.totalAmount || 0) },
        { header: 'Sudah Dibayar (IDR)', format: r => Number(r.paidAmount || 0) },
        { header: 'Sisa Tagihan (IDR)', format: r => Number(r.remainingAmount || 0) },
        { header: 'Rincian Item', format: r => (r.items || []).map((it: any) => `${it.productName} x${it.quantity}`).join('; ') }
      ]
    })
    showToast('CSV Berhasil Diekspor', `${res.rowCount} pesanan pelanggan diunduh (${res.filename}).`, 'success')
  } else {
    const quotedSum = items.reduce((s, r) => s + Number(r.quotedPrice || 0), 0)
    const res = downloadCsvFile({
      filenamePrefix: `pelanggan_${uname}_request`,
      reportTitle: `Riwayat Request Produk Pelanggan @${uname}`,
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      summaryItems: [{ label: 'Akumulasi Harga Quote (IDR)', value: quotedSum }],
      columns: [
        { header: 'Timestamp Request (WIB)', format: r => formatCsvTimestamp(r.createdAt) },
        { header: 'ID Request', key: 'id' },
        { header: 'Produk Diminta', key: 'productName' },
        { header: 'Trip Tujuan', key: 'tripTitle' },
        { header: 'Negara', key: 'targetCountry' },
        { header: 'Status', format: r => formatRequestStatus(r.status) },
        { header: 'Harga Penawaran (IDR)', format: r => (r.quotedPrice !== null ? Number(r.quotedPrice) : '') },
        { header: 'Catatan Quote', format: r => r.quoteNote || '' },
        { header: 'Batas Berlaku Quote (WIB)', format: r => formatCsvTimestamp(r.quoteExpiresAt) }
      ]
    })
    showToast('CSV Berhasil Diekspor', `${res.rowCount} request pelanggan diunduh (${res.filename}).`, 'success')
  }
  showExportModal.value = false
}
</script>

<style scoped>
.customer-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-export-csv {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  min-height: 40px;
  background: #FAF5EC;
  border: 1px solid #D8B978;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6F5530;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export-csv:hover:not(:disabled) {
  background: #F4E9D2;
  border-color: #8C6D3F;
  color: #2B2116;
}

.btn-export-csv:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back,
.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  min-height: 40px;
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #5C4930;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover,
.btn-refresh:hover:not(:disabled) {
  border-color: #D8B978;
  background: #FFFBF2;
  color: #2B2116;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.state-card {
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  border-radius: 12px;
  padding: 36px 20px;
  text-align: center;
  color: #7A6A55;
  font-size: 0.9rem;
}

.state-card.error {
  color: #991B1B;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-card,
.admin-actions-card,
.history-card {
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  border-radius: 14px;
  padding: 20px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #8C6D3F;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-avatar.inactive {
  background: #991B1B;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: min(100%, 220px);
  overflow-wrap: anywhere;
}

.profile-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-username {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: #2B2116;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.status-pill.is-ok {
  background: #DCFCE7;
  color: #166534;
}

.status-pill.is-danger {
  background: #FEE2E2;
  color: #991B1B;
}

.profile-sub-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.84rem;
  color: #6B5B45;
}

.access-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.access-chip {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  background: #F4EFE6;
  color: #5C4930;
}

.access-chip.blocked {
  background: #FEE2E2;
  color: #991B1B;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.kpi-box {
  background: #FFFBF2;
  border: 1px solid #EFE1C6;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #7A6A55;
}

.kpi-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2B2116;
}

.kpi-sub {
  font-size: 0.75rem;
  color: #7A6A55;
}

.card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.section-title {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #2B2116;
}

.section-sub {
  margin: 0;
  font-size: 0.82rem;
  color: #7A6A55;
}

.btn-outline {
  padding: 8px 14px;
  min-height: 38px;
  border-radius: 8px;
  border: 1px solid #D8B978;
  background: #FFFBF2;
  color: #6B502A;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-outline:hover {
  background: #EFE1C6;
}

.toggles-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #EFE1C6;
  background: #FFFBF2;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.toggle-card.is-blocked {
  background: #FEF2F2;
  border-color: #FECACA;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.toggle-text strong {
  font-size: 0.88rem;
  color: #2B2116;
}

.toggle-text span {
  font-size: 0.76rem;
  color: #6B5B45;
}

.switch-input {
  appearance: none;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #D6CEC0;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.switch-input::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #FFFFFF;
  transition: transform 0.2s;
}

.switch-input:checked {
  background: #16A34A;
}

.switch-input:checked::after {
  transform: translateX(20px);
}

.reason-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reason-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reason-field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #5C4930;
}

.reason-field textarea,
.reason-field input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #DFC99F;
  background: #FFFBF2;
  font-size: 0.86rem;
  color: #2B2116;
  box-sizing: border-box;
  font-family: inherit;
}

.reason-field textarea:focus,
.reason-field input:focus {
  outline: none;
  border-color: #8C6D3F;
  background: #FFFFFF;
}

.save-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-save-access {
  padding: 10px 18px;
  min-height: 40px;
  border-radius: 8px;
  border: none;
  background: #8C6D3F;
  color: #FFFFFF;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-save-access:hover:not(:disabled) {
  background: #6F5530;
}

.btn-save-access:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-reset-form {
  padding: 10px 16px;
  min-height: 40px;
  border-radius: 8px;
  border: 1px solid #EFE1C6;
  background: #FFFFFF;
  color: #5C4930;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.main-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #EFE1C6;
  padding-bottom: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.main-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid #EFE1C6;
  background: #FFFBF2;
  color: #5C4930;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
}

.main-tab-btn.active {
  background: #8C6D3F;
  border-color: #8C6D3F;
  color: #FFFFFF;
}

.tab-count {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.72rem;
  background: rgba(0, 0, 0, 0.1);
}

.sub-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #EFE1C6;
  background: #FFFFFF;
  color: #5C4930;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.filter-chip.active {
  background: #EFE1C6;
  border-color: #8C6D3F;
  color: #2B2116;
}

.manage-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: #8C6D3F;
  text-decoration: none;
}

.manage-link:hover {
  text-decoration: underline;
}

.empty-panel {
  padding: 36px 16px;
  text-align: center;
  color: #7A6A55;
  font-size: 0.88rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  border: 1px solid #EFE1C6;
  border-radius: 12px;
  padding: 14px 16px;
  background: #FFFDF8;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.record-id-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.order-code {
  font-size: 0.92rem;
  color: #2B2116;
}

.type-pill,
.trip-pill {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #F4EFE6;
  color: #5C4930;
}

.order-status-pill,
.req-status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  background: #EFE1C6;
  color: #5C4930;
}

.order-status-pill.pending_approval,
.order-status-pill.pending_payment,
.req-status-pill.pending,
.req-status-pill.reviewed {
  background: #FEF3C7;
  color: #92400E;
}

.order-status-pill.payment_uploaded,
.req-status-pill.quoted {
  background: #DBEAFE;
  color: #1E40AF;
}

.order-status-pill.verified,
.order-status-pill.purchasing,
.order-status-pill.arrived,
.order-status-pill.ready_handover,
.order-status-pill.completed,
.req-status-pill.accepted,
.req-status-pill.available {
  background: #DCFCE7;
  color: #166534;
}

.order-status-pill.rejected,
.order-status-pill.cancelled,
.order-status-pill.expired,
.req-status-pill.rejected {
  background: #FEE2E2;
  color: #991B1B;
}

.order-items-mini {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.84rem;
  color: #2B2116;
}

.mini-item-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.payment-summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  margin-top: 8px;
}

.pay-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
}

.pay-col .lbl {
  font-size: 0.72rem;
  color: #7A6A55;
}

.text-paid {
  color: #166534;
}

.text-due {
  color: #9A3412;
}

.latest-payment-note {
  margin-top: 8px;
  font-size: 0.78rem;
  color: #5C4930;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-link-inline {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: #8C6D3F;
  text-decoration: underline;
  cursor: pointer;
}

.record-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border-top: 1px dashed #EFE1C6;
  padding-top: 10px;
}

.timestamp {
  font-size: 0.76rem;
  color: #7A6A55;
}

.btn-small-detail {
  padding: 6px 12px;
  min-height: 32px;
  border-radius: 7px;
  border: 1px solid #DFC99F;
  background: #FFFFFF;
  color: #5C4930;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-small-detail:hover {
  background: #8C6D3F;
  border-color: #8C6D3F;
  color: #FFFFFF;
}

.req-body-flex {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.req-thumb-btn {
  width: 72px;
  height: 72px;
  padding: 0;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: #FFFFFF;
}

.req-thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.req-info-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.req-prod-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #2B2116;
}

.req-desc {
  margin: 0;
  font-size: 0.83rem;
  color: #5C4930;
}

.req-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.8rem;
}

.quote-chip {
  background: #EFF6FF;
  color: #1E40AF;
  padding: 3px 9px;
  border-radius: 6px;
}

.admin-note-line {
  margin: 0;
  font-size: 0.78rem;
  color: #6B5B45;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(24, 18, 12, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1200;
}

.modal-card {
  width: 100%;
  max-width: 640px;
  max-height: 90dvh;
  overflow-y: auto;
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #EFE1C6;
  padding: 20px;
}

.modal-card.small {
  max-width: 440px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EFE1C6;
  margin-bottom: 14px;
}

.modal-head h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #2B2116;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #5C4930;
  cursor: pointer;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-section {
  border-bottom: 1px dashed #EFE1C6;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.84rem;
}

.modal-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.modal-section-title {
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #8C6D3F;
  margin-bottom: 2px;
}

.muted-p {
  margin: 0;
  font-size: 0.8rem;
  color: #6B5B45;
}

.note-p {
  margin: 0;
  font-size: 0.8rem;
  color: #5C4930;
}

.error-p {
  margin: 0;
  font-size: 0.8rem;
  color: #991B1B;
}

.modal-item-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.modal-total-line {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #EFE1C6;
}

.modal-payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.timeline-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.lightbox-card {
  position: relative;
  max-width: 90vw;
  max-height: 90dvh;
}

.lightbox-img {
  max-width: 100%;
  max-height: 85dvh;
  border-radius: 10px;
  display: block;
}

.btn-close-lightbox {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #FFFFFF;
  color: #2B2116;
  font-size: 1.25rem;
  font-weight: 800;
  cursor: pointer;
}

.btn-back:focus-visible,
.btn-refresh:focus-visible,
.btn-outline:focus-visible,
.switch-input:focus-visible,
.btn-save-access:focus-visible,
.main-tab-btn:focus-visible,
.filter-chip:focus-visible,
.btn-small-detail:focus-visible {
  outline: 2px solid #8C6D3F;
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .kpi-grid,
  .toggles-grid {
    grid-template-columns: 1fr;
  }
  .payment-summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .top-actions {
    width: 100%;
  }
  .top-actions .btn-export-csv,
  .top-actions .btn-refresh {
    flex: 1;
    justify-content: center;
  }
  .profile-card,
  .admin-actions-card,
  .history-card {
    padding: 14px;
  }
  .payment-summary-strip {
    grid-template-columns: 1fr;
  }
  .req-body-flex {
    flex-direction: column;
  }
}
</style>
