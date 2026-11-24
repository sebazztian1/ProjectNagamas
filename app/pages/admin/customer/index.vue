<template>
  <div class="admin-customers-page">
    <div class="page-head">
      <h1 class="page-title">Pelanggan</h1>
      <div class="head-actions">
        <button type="button" class="btn-export-csv" @click="openExportModal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Ekspor laporan</span>
        </button>
        <button class="btn-refresh" @click="fetchCustomers" :disabled="pending">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          aria-label="Cari username atau nomor WhatsApp pelanggan"
          placeholder="Cari username atau no. WhatsApp..."
          @input="handleSearchInput"
        />
        <button v-if="searchQuery" type="button" class="clear-search" aria-label="Hapus pencarian" @click="searchQuery = ''">&times;</button>
      </div>
      <div class="count-tag">
        {{ pending && !customerList.length ? '…' : filteredCustomers.length }} Pelanggan
      </div>
    </div>

    <LoadingRegion :loading="pending" :has-content="customerList.length > 0" :columns="5">
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>No. WhatsApp</th>
            <th>Aktivitas</th>
            <th>Status &amp; Akses</th>
            <th class="col-actions-head">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="filteredCustomers.length > 0">
          <tr v-for="c in filteredCustomers" :key="c.id">
            <td class="col-user">
              <div class="avatar">{{ (c.username || 'U').charAt(0).toUpperCase() }}</div>
              <div class="user-identity">
                <strong>@{{ c.username }}</strong>
                <span class="joined-date">{{ formatJoinedDate(c.joinedAt) }}</span>
              </div>
            </td>
            <td>{{ c.phone }}</td>
            <td>
              <div class="activity-badges">
                <span class="order-count-badge">{{ c.totalOrders || 0 }} Pesanan</span>
                <span class="request-count-badge">{{ c.totalRequests || 0 }} Request</span>
              </div>
            </td>
            <td>
              <div class="status-badges">
                <span class="active-badge" :class="{ inactive: !c.isActive }">
                  {{ c.isActive ? 'Aktif' : 'Nonaktif' }}
                </span>
                <span v-if="c.isActive && (!c.canOrder || !c.canRequest || !c.canChat)" class="restricted-badge">
                  Terbatas
                </span>
              </div>
            </td>
            <td class="col-actions">
              <NuxtLink :to="`/admin/customer/${c.id}`" class="btn-details">
                <span>Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </NuxtLink>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="empty-state">
              {{ searchQuery.trim() ? 'Pelanggan tidak ditemukan.' : 'Belum ada data pelanggan.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    </LoadingRegion>

    <AdminCsvExportModal
      :show="showExportModal"
      title="Ekspor Data Pelanggan & Piutang"
      subtitle="Ekspor ringkasan akun, nilai transaksi, total pembayaran masuk, dan sisa tagihan pelanggan berdasarkan tanggal bergabung (WIB)."
      v-model:start-date="exportStartDate"
      v-model:end-date="exportEndDate"
      v-model:use-active-filters="exportUseActiveFilters"
      :active-filter-label="activeFilterToggleLabel"
      :preview-count="exportPreview.items.length"
      :min-timestamp="exportPreview.minTimestamp"
      :max-timestamp="exportPreview.maxTimestamp"
      :summary-metrics="exportMetrics"
      @close="showExportModal = false"
      :prepare-files="prepareFiles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../../../composables/useToast'
import { useAdminStats } from '../../../composables/useAdminStats'
import type { CsvPreviewMetric } from '../../../components/AdminCsvExportModal.vue'
import {
  prepareReportFiles,
  filterByDateRange
} from '../../../utils/csvExport'

const { showToast } = useToast()
const { fetchAdminStats } = useAdminStats()

const customerList = ref<any[]>([])
const pending = ref(true)
const searchQuery = ref('')

const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null
  if (target) {
    searchQuery.value = target.value
  }
}

const formatJoinedDate = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

const fetchCustomers = async () => {
  pending.value = true
  try {
    const data = await $fetch<any[]>('/api/admin/customers')
    customerList.value = data || []
    fetchAdminStats(true)
  } catch (err: any) {
    showToast('Gagal Memuat', err?.data?.message || 'Gagal memuat daftar pelanggan', 'warning')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})

const normalizePhoneDigits = (val: string) => {
  const digits = (val || '').replace(/\D/g, '')
  if (digits.startsWith('62')) return '0' + digits.slice(2)
  return digits
}

const filteredCustomers = computed(() => {
  const rawQuery = searchQuery.value.trim().toLowerCase()
  if (!rawQuery) return customerList.value

  const cleanUsernameQuery = rawQuery.replace(/^@/, '')
  const rawDigits = rawQuery.replace(/\D/g, '')
  const normalizedQueryDigits = normalizePhoneDigits(rawQuery)

  return customerList.value.filter(c => {
    const uname = (c.username || '').toLowerCase()
    const phoneRaw = (c.phone || '').toLowerCase()
    const phoneDigits = (c.phone || '').replace(/\D/g, '')
    const normalizedCustomerPhone = normalizePhoneDigits(c.phone || '')

    const matchUsername = uname.includes(cleanUsernameQuery)
    const matchPhoneRaw = phoneRaw.includes(rawQuery)
    const matchPhoneDigits =
      rawDigits.length > 0 &&
      (phoneDigits.includes(rawDigits) || normalizedCustomerPhone.includes(normalizedQueryDigits))

    return matchUsername || matchPhoneRaw || matchPhoneDigits
  })
})

// --- Accounting report export ---
const showExportModal = ref(false)
const exportStartDate = ref('')
const exportEndDate = ref('')
const exportUseActiveFilters = ref(false)

const openExportModal = () => {
  exportUseActiveFilters.value = Boolean(searchQuery.value.trim())
  showExportModal.value = true
}

const activeFilterToggleLabel = computed(() =>
  searchQuery.value.trim() ? `Hanya ekspor hasil pencarian "${searchQuery.value.trim()}"` : ''
)

const exportSourceCustomers = computed(() =>
  exportUseActiveFilters.value && searchQuery.value.trim() ? filteredCustomers.value : customerList.value
)

const exportPreview = computed(() =>
  filterByDateRange(exportSourceCustomers.value, c => c.joinedAt, exportStartDate.value, exportEndDate.value)
)

const exportMetrics = computed<CsvPreviewMetric[]>(() => {
  const rows = exportPreview.value.items
  const totalOrderAmt = rows.reduce((s, c) => s + Number(c.totalOrderAmount || 0), 0)
  const totalPaidAmt = rows.reduce((s, c) => s + Number(c.totalPaidAmount || 0), 0)
  const totalRemaining = rows.reduce((s, c) => s + Number(c.totalRemainingAmount || 0), 0)
  return [
    { label: 'Akumulasi Tagihan Aktif', value: `Rp ${totalOrderAmt.toLocaleString('id-ID')}`, highlight: true },
    { label: 'Total Sudah Dibayar', value: `Rp ${totalPaidAmt.toLocaleString('id-ID')}` },
    { label: 'Total Sisa Piutang', value: `Rp ${totalRemaining.toLocaleString('id-ID')}` }
  ]
})

const prepareFiles = () => {
  const { items, minTimestamp, maxTimestamp } = exportPreview.value
  if (!items.length) return

  const totalOrderAmt = items.reduce((s, c) => s + Number(c.totalOrderAmount || 0), 0)
  const totalPaidAmt = items.reduce((s, c) => s + Number(c.totalPaidAmount || 0), 0)
  const totalRemaining = items.reduce((s, c) => s + Number(c.totalRemainingAmount || 0), 0)

  return prepareReportFiles({
    filenamePrefix: 'pelanggan_rekap_accounting',
    reportTitle: 'Laporan Rekap Akun & Nilai Transaksi Pelanggan',
    rows: items,
    minTimestamp,
    maxTimestamp,
    filterStartDate: exportStartDate.value,
    filterEndDate: exportEndDate.value,
    summaryItems: [
      { label: 'Akumulasi Tagihan Order Aktif (IDR)', value: totalOrderAmt },
      { label: 'Total Dana Terbayar (IDR)', value: totalPaidAmt },
      { label: 'Total Sisa Piutang Pelanggan (IDR)', value: totalRemaining }
    ],
    columns: [
      { header: 'Waktu Bergabung (WIB)', kind: 'datetime', key: 'joinedAt' },
      { header: 'ID Pelanggan', kind: 'identifier', key: 'id' },
      { header: 'Username', key: 'username' },
      { header: 'Nomor HP / WhatsApp', key: 'phone' },
      { header: 'Status Akun', kind: 'status', format: r => (r.isActive ? 'Aktif' : 'Nonaktif') },
      { header: 'Akses Order', format: r => (r.canOrder ? 'Ya' : 'Tidak') },
      { header: 'Akses Request', format: r => (r.canRequest ? 'Ya' : 'Tidak') },
      { header: 'Akses Chat', format: r => (r.canChat ? 'Ya' : 'Tidak') },
      { header: 'Total Pesanan', kind: 'number', key: 'totalOrders' },
      { header: 'Pesanan Selesai', kind: 'number', key: 'completedOrdersCount' },
      { header: 'Nilai Order Aktif (IDR)', kind: 'number', key: 'totalOrderAmount' },
      { header: 'Sudah Dibayar (IDR)', kind: 'number', key: 'totalPaidAmount' },
      { header: 'Sisa Tagihan (IDR)', kind: 'number', key: 'totalRemainingAmount' },
      { header: 'Total Request Produk', kind: 'number', key: 'totalRequests' },
      { header: 'Alasan Pembatasan', format: r => r.restrictionReason || '' }
    ]
  })
}
</script>

<style scoped>
.admin-customers-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.head-actions {
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
  background: #FAF5EC;
  border: 1px solid #D8B978;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #6F5530;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-export-csv:hover {
  border-color: #8C6D3F;
  background: #F4E9D2;
  color: #2B2116;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 0;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 15px;
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #5C4930;
  cursor: pointer;
  transition: all 0.2s;
}

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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: min(100%, 220px);
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8E7B62;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 9px 32px 9px 36px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: var(--color-canvas, #FFFBF2);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
  box-sizing: border-box;
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary, #8C6D3F);
  background: #ffffff;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #8E7B62;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}

.count-tag {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted, #7A6A55);
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow-x: auto;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.85rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 640px;
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

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
  vertical-align: middle;
}

.col-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.user-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.joined-date {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.activity-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.order-count-badge {
  background: var(--color-secondary, #EFE1C6);
  color: #6B502A;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
  white-space: nowrap;
}

.request-count-badge {
  background: #F4EFE6;
  color: #5C4930;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
  white-space: nowrap;
}

.status-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.active-badge {
  background: #DCFCE7;
  color: #166534;
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
}

.active-badge.inactive {
  background: #FEE2E2;
  color: #991B1B;
}

.restricted-badge {
  background: #FEF3C7;
  color: #92400E;
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
}

.col-actions-head,
.col-actions {
  text-align: right;
  white-space: nowrap;
}

.btn-details {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  min-height: 36px;
  border-radius: 8px;
  background: #FFFBF2;
  border: 1px solid #DFC99F;
  color: #6B502A;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-details:hover {
  background: #8C6D3F;
  border-color: #8C6D3F;
  color: #FFFFFF;
}

.btn-details:focus-visible,
.btn-refresh:focus-visible {
  outline: 2px solid #8C6D3F;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
  .head-actions {
    width: 100%;
  }
  .btn-export-csv,
  .btn-refresh {
    flex: 1;
    justify-content: center;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: 100%;
    min-width: 100%;
  }
}
</style>

