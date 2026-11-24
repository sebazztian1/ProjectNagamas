<template>
  <div class="admin-audit-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Audit Log</h1>
        <small v-if="logsData?.retention">Log ditampilkan untuk {{ logsData.retention.days }} hari terakhir. {{ logsData.retention.active ? 'Log yang lebih lama dijadwalkan untuk dihapus otomatis.' : 'Penghapusan otomatis belum diaktifkan.' }}</small>
      </div>
      <div class="head-actions">
        <button type="button" class="btn-export-csv" @click="openExportModal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Ekspor laporan</span>
        </button>
        <button class="btn-refresh" @click="refresh()" :disabled="status === 'pending'">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': status === 'pending' }">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter Pills & Search -->
    <div v-if="logsData?.monitor">
      <small>Status eksekusi terakhir · {{ logsData.monitor.lastStatus || 'Belum pernah berjalan' }}</small>
      <p v-if="logsData.monitor.cleanup">Pembersihan terakhir · {{ formatDateTime(logsData.monitor.cleanup.at) }} WIB · {{ logsData.monitor.cleanup.deleted }} log dihapus.</p>
      <p v-if="logsData.monitor.dry">Dry-run terakhir · {{ formatDateTime(logsData.monitor.dry.at) }} WIB · {{ logsData.monitor.dry.eligible }} kandidat.</p>
      <p v-for="warning in logsData.monitor.warnings" :key="warning" role="status">{{ warning }}</p>
    </div>
    <div class="filter-bar">
      <div class="tabs">
        <button
          v-for="t in filterTabs"
          :key="t.key"
          class="t-btn"
          :class="{ active: currentEntityType === t.key }"
          @click="selectTab(t.key)"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="search-input-box">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Cari aksi, admin, atau target..."
          @input="onSearchInput"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat catatan log aktivitas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error.data?.message || error.message || 'Gagal memuat catatan audit log.' }}</p>
      <button type="button" class="btn-retry" @click="refresh()">Coba Lagi</button>
    </div>

    <!-- Table Card -->
    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Admin / Staf</th>
            <th>Aksi</th>
            <th>Entitas / Target</th>
            <th>Keterangan</th>
            <th class="col-center">Rincian</th>
          </tr>
        </thead>
        <tbody v-if="logs.length > 0">
          <tr v-for="l in logs" :key="l.id">
            <td class="col-time">
              <span class="date-txt">{{ formatDateTime(l.createdAt) }}</span>
            </td>
            <td>
              <span class="user-chip">
                {{ l.user }}
                <small v-if="l.userRole && l.userRole !== 'system'" class="role-tag">{{ l.userRole }}</small>
              </span>
            </td>
            <td>
              <span class="action-tag" :class="getActionBadgeClass(l.action)">
                {{ formatActionName(l.action) }}
              </span>
            </td>
            <td>
              <div class="target-cell">
                <span class="entity-pill">{{ formatEntityType(l.entityType) }}</span>
                <strong class="target-name">{{ getTargetDisplay(l) }}</strong>
              </div>
            </td>
            <td class="col-detail-summary">
              <span>{{ l.summary }}</span>
            </td>
            <td class="col-center">
              <button
                type="button"
                class="btn-detail-sm"
                @click="openDetailModal(l)"
                title="Lihat detail aktivitas"
              >
                Detail
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" class="empty-cell">
              Tidak ada catatan aktivitas yang sesuai dengan filter atau pencarian.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Footer -->
      <div v-if="pagination.totalPages > 1" class="pagination-footer">
        <span class="page-info">
          Menampilkan {{ logs.length }} dari total {{ pagination.total }} log (Halaman {{ pagination.page }} dari {{ pagination.totalPages }})
        </span>
        <div class="page-nav-btns">
          <button
            class="btn-page"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            &larr; Sebelumnya
          </button>
          <button
            class="btn-page"
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Berikutnya &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detail Log -->
    <div v-if="selectedLog" class="modal-backdrop" @click.self="selectedLog = null">
      <div class="modal-box">
        <div class="modal-head">
          <div>
            <h3>Detail Aktivitas #{{ selectedLog.id }}</h3>
            <span class="modal-sub">{{ formatDateTime(selectedLog.createdAt) }} &bull; Oleh {{ selectedLog.user }}</span>
          </div>
          <button class="close-x" @click="selectedLog = null">&times;</button>
        </div>

        <div class="modal-body">
          <div class="info-meta-grid">
            <div class="meta-row">
              <span class="meta-lbl">Aksi:</span>
              <span class="action-tag" :class="getActionBadgeClass(selectedLog.action)">
                {{ formatActionName(selectedLog.action) }} ({{ selectedLog.action }})
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-lbl">Entitas:</span>
              <span><b>{{ formatEntityType(selectedLog.entityType) }}</b> (ID: {{ selectedLog.entityId || '-' }})</span>
            </div>
          </div>

          <div class="info-meta-grid">
            <div v-for="fact in selectedLog.facts" :key="fact.label" class="meta-row">
              <span class="meta-lbl">{{ fact.label }}</span><span>{{ fact.value }}</span>
            </div>
            <table v-if="selectedLog.changes.length" class="data-table">
              <thead><tr><th>Perubahan</th><th>Sebelum</th><th>Sesudah</th></tr></thead>
              <tbody><tr v-for="change in selectedLog.changes" :key="change.label">
                <th scope="row">{{ change.label }}</th><td>{{ change.before }}</td><td>{{ change.after }}</td>
              </tr></tbody>
            </table>
            <p v-if="!selectedLog.facts.length && !selectedLog.changes.length">{{ selectedLog.summary }}</p>
            <div v-if="selectedLog.ipAddress" class="meta-row">
              <span class="meta-lbl">Alamat IP</span><span>{{ selectedLog.ipAddress }}</span>
            </div>
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn-close-modal" @click="selectedLog = null">Tutup</button>
        </div>
      </div>
    </div>

    <AdminCsvExportModal
      :show="showExportModal"
      title="Ekspor Audit Log"
      subtitle="Ekspor jejak audit aktivitas admin & transaksi berdasarkan tanggal minimal hingga tanggal maksimal (WIB)."
      v-model:start-date="exportStartDate"
      v-model:end-date="exportEndDate"
      v-model:use-active-filters="exportUseActiveFilters"
      :active-filter-label="activeFilterToggleLabel"
      :preview-count="exportPreview.items.length"
      :min-timestamp="exportPreview.minTimestamp"
      :min-date="logsData?.retention.minDate"
      :audit-row-count="exportPreview.items.length"
      :max-timestamp="exportPreview.maxTimestamp"
      :summary-metrics="exportMetrics"
      :loading="isExportLoading"
      @close="showExportModal = false"
      :prepare-files="prepareFiles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from '../../composables/useToast'
import type { CsvPreviewMetric } from '../../components/AdminCsvExportModal.vue'
import {
  prepareReportFiles,
  filterByDateRange,
  isValidDateRange
} from '../../utils/csvExport'

definePageMeta({
  middleware: 'admin'
})

useHead({
  title: 'Audit Log | Admin'
})

interface AuditLogItem {
  id: string
  userId: number | null
  user: string
  userRole: string
  action: string
  entityType: string
  entityId: number | null
  target: string | null
  summary: string
  facts: { label: string; value: string }[]
  changes: { label: string; before: string; after: string }[]
  ipAddress?: string | null
  createdAt: string
}

interface LogsApiResponse {
  retention: { days: number; active: boolean; cutoff: string; minDate: string }
  monitor: { lastStatus: string | null; cleanup: { at: string; deleted: string } | null; dry: { at: string; eligible: string } | null; warnings: string[] } | null
  success: boolean
  logs: AuditLogItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const currentEntityType = ref('all')
const searchInput = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const selectedLog = ref<AuditLogItem | null>(null)

let searchDebounceTimer: any = null
const onSearchInput = () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = searchInput.value.trim()
    currentPage.value = 1
  }, 350)
}

const filterTabs = [
  { key: 'all', label: 'Semua' },
  { key: 'order', label: 'Pesanan' },
  { key: 'product', label: 'Produk' },
  { key: 'trip', label: 'Trip Jastip' },
  { key: 'category', label: 'Kategori' },
  { key: 'request', label: 'Request' },
  { key: 'customer', label: 'Pelanggan' },
  { key: 'auth', label: 'Autentikasi' }
]

const queryParams = computed(() => ({
  monitor: true,
  page: currentPage.value,
  limit: 25,
  entityType: currentEntityType.value,
  search: searchQuery.value || undefined
}))

const { data: logsData, status, error, refresh } = await useFetch<LogsApiResponse>('/api/admin/logs', {
  query: queryParams,
  watch: [queryParams]
})

const logs = useRetainedAuditRows(() => logsData.value?.logs || [], () => logsData.value?.retention.cutoff)
watch(logs, rows => {
  if (selectedLog.value && !rows.some(row => row.id === selectedLog.value?.id)) selectedLog.value = null
  if (rows.length < (logsData.value?.logs.length ?? 0)) void refresh()
})
const pagination = computed(() => logsData.value?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 })

const selectTab = (key: string) => {
  currentEntityType.value = key
  currentPage.value = 1
}

const changePage = (p: number) => {
  currentPage.value = p
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

let detailRequest = 0
const openDetailModal = async (item: AuditLogItem) => {
  const request = ++detailRequest
  selectedLog.value = item
  try {
    const res = await $fetch<LogsApiResponse>(`/audit-log/${item.id}`)
    if (request === detailRequest && selectedLog.value?.id === item.id) selectedLog.value = res.logs[0] ?? null
  } catch {
    if (request === detailRequest && selectedLog.value?.id === item.id) {
      selectedLog.value = null
      showToast('Gagal Memuat', 'Detail aktivitas tidak tersedia.', 'warning')
    }
  }
}

const formatDateTime = (iso: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

const formatEntityType = (type: string) => {
  const map: Record<string, string> = {
    order: 'Pesanan',
    product: 'Produk',
    trip: 'Trip',
    category: 'Kategori',
    request: 'Request',
    customer: 'Pelanggan',
    auth: 'Akun',
    setting: 'Pengaturan'
  }
  return map[type.toLowerCase()] || type
}

const formatActionName = (action: string) => {
  const map: Record<string, string> = {
    ACC_ORDER: 'ACC Pesanan',
    VERIFY_PAYMENT: 'Verifikasi Pembayaran',
    REJECT_PAYMENT: 'Tolak Pembayaran',
    REJECT_ORDER: 'Tolak Pesanan',
    REFUND_ORDER: 'Refund Pesanan',
    CREATE_PRODUCT: 'Tambah Produk',
    UPDATE_PRODUCT: 'Ubah Produk',
    DELETE_PRODUCT: 'Hapus Produk',
    UPDATE_STOCK: 'Ubah Status Stok',
    DUPLICATE_PRODUCT: 'Duplikasi Produk',
    CREATE_TRIP: 'Buka Trip Baru',
    UPDATE_TRIP: 'Ubah Trip',
    DELETE_TRIP: 'Hapus Trip',
    CREATE_CATEGORY: 'Tambah Kategori',
    UPDATE_CATEGORY: 'Ubah Kategori',
    DELETE_CATEGORY: 'Hapus Kategori',
    REQUEST_QUOTED: 'Kirim Penawaran',
    REQUEST_REVIEWED: 'Tinjau Request',
    REQUEST_REJECTED: 'Tolak Request',
    CONVERT_REQUEST_TO_PRODUCT: 'Konversi ke Produk',
    UPDATE_CUSTOMER_ACCESS: 'Ubah Akses Pelanggan',
    DISABLE_CUSTOMER_ACCOUNT: 'Nonaktifkan Akun Pelanggan',
    ENABLE_CUSTOMER_ACCOUNT: 'Aktifkan Akun Pelanggan',
    RESET_USER_PASSWORD: 'Reset Kata Sandi',
    LOGIN_ADMIN: 'Login Admin'
  }

  if (map[action]) return map[action]
  if (action.startsWith('UPDATE_STATUS_')) {
    return `Status: ${action.replace('UPDATE_STATUS_', '').toLowerCase()}`
  }
  if (action.startsWith('UPDATE_TRIP_STATUS_')) {
    return `Status Trip: ${action.replace('UPDATE_TRIP_STATUS_', '').toLowerCase()}`
  }
  return action
}

const getActionBadgeClass = (action: string) => {
  if (action.includes('ACC') || action.includes('VERIFY') || action.startsWith('CREATE_') || action.includes('CONVERT') || action.startsWith('ENABLE_')) {
    return 'badge-success'
  }
  if (action.includes('REJECT') || action.includes('REFUND') || action.startsWith('DELETE_') || action.startsWith('DISABLE_')) {
    return 'badge-danger'
  }
  if (action.includes('STOCK') || action.includes('QUOTE') || action.includes('CUSTOMER') || action.includes('RESET')) {
    return 'badge-warning'
  }
  if (action.includes('LOGIN')) {
    return 'badge-primary'
  }
  return 'badge-info'
}

const getTargetDisplay = (log: AuditLogItem) => log.target || (log.entityId ? `#${log.entityId}` : '-')

// --- Accounting report export ---
const { showToast } = useToast()
const showExportModal = ref(false)
const exportStartDate = ref('')
const exportEndDate = ref('')
const exportUseActiveFilters = ref(false)
const isExportLoading = ref(false)
const exportLogsSource = ref<AuditLogItem[]>([])

const activeFilterToggleLabel = computed(() => {
  const parts: string[] = []
  if (currentEntityType.value !== 'all') {
    parts.push(`Entitas: ${formatEntityType(currentEntityType.value)}`)
  }
  if (searchQuery.value) {
    parts.push(`Pencarian: "${searchQuery.value}"`)
  }
  return parts.length ? `Terapkan filter aktif (${parts.join(', ')})` : ''
})

const exportCutoff = ref<string>()
const retainedExportLogs = useRetainedAuditRows(() => exportLogsSource.value, () => exportCutoff.value)
const fetchExportLogs = async () => {
  if (!isValidDateRange(exportStartDate.value, exportEndDate.value)) {
    exportLogsSource.value = []
    return
  }
  isExportLoading.value = true
  try {
    const res = await $fetch<LogsApiResponse>('/api/admin/logs', {
      query: {
        exportAll: 'true',
        entityType: exportUseActiveFilters.value ? currentEntityType.value : 'all',
        search: exportUseActiveFilters.value && searchQuery.value ? searchQuery.value : undefined,
        startDate: exportStartDate.value || undefined,
        endDate: exportEndDate.value || undefined
      }
    })
    exportLogsSource.value = res.logs || []
    exportCutoff.value = res.retention.cutoff
  } catch (err: any) {
    exportLogsSource.value = []
    showToast('Gagal Memuat Audit Log', err?.data?.message || 'Tidak dapat memuat data export audit log.', 'warning')
  } finally {
    isExportLoading.value = false
  }
}

const openExportModal = async () => {
  exportUseActiveFilters.value = Boolean(currentEntityType.value !== 'all' || searchQuery.value)
  showExportModal.value = true
  await fetchExportLogs()
}

watch([exportStartDate, exportEndDate, exportUseActiveFilters], async () => {
  if (!showExportModal.value) return
  await fetchExportLogs()
})

const exportPreview = computed(() =>
  filterByDateRange(retainedExportLogs.value, l => l.createdAt, exportStartDate.value, exportEndDate.value)
)

const exportMetrics = computed<CsvPreviewMetric[]>(() => {
  const rows = exportPreview.value.items
  const orderLogs = rows.filter(r => r.entityType === 'order').length
  return [
    { label: 'Total Catatan Log', value: `${rows.length} baris`, highlight: true },
    { label: 'Aktivitas Terkait Pesanan', value: `${orderLogs} catatan` }
  ]
})

const prepareFiles = () => {
  const { items, minTimestamp, maxTimestamp } = exportPreview.value
  if (!items.length) return

  return prepareReportFiles({
    filenamePrefix: 'audit_log_nagamas',
    reportTitle: 'Laporan Audit Log Aktivitas Admin',
    rows: items,
    minTimestamp,
    maxTimestamp,
    filterStartDate: exportStartDate.value,
    filterEndDate: exportEndDate.value,
    columns: [
      { header: 'Waktu Aktivitas (WIB)', kind: 'datetime', key: 'createdAt' },
      { header: 'ID Log', kind: 'identifier', key: 'id' },
      { header: 'Aktor / User', key: 'user' },
      { header: 'Role', key: 'userRole' },
      { header: 'Kategori Entitas', format: r => formatEntityType(r.entityType) },
      { header: 'Kode Aksi', key: 'action' },
      { header: 'Label Aksi', format: r => formatActionName(r.action) },
      { header: 'Target', format: r => getTargetDisplay(r) },
      { header: 'Keterangan', key: 'summary' }
    ]
  })
}
</script>

<style scoped>
.admin-audit-page {
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

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-export-csv {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #FAF5EC;
  border: 1px solid #D8B978;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #6F5530;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-export-csv:hover {
  background: #F4E9D2;
  border-color: var(--color-primary, #8C6D3F);
  color: #2B2116;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 8px 14px;
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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.t-btn {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.t-btn.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.search-input-box {
  flex: 1 1 220px;
  min-width: 0;
  max-width: 300px;
}

.search-input-box input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  width: 100%;
  min-width: 0;
  outline: none;
  background: #ffffff;
}

.search-input-box input:focus {
  border-color: var(--color-primary, #8C6D3F);
}

.loading-state {
  text-align: center;
  padding: 48px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  color: var(--color-text-muted, #7A6A55);
}

.error-state {
  text-align: center;
  padding: 48px;
  background: #ffffff;
  border: 1px solid #FECACA;
  border-radius: 12px;
  color: #991B1B;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-state p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-retry {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
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
  padding: 13px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.84rem;
  color: var(--color-text, #2B2116);
  vertical-align: middle;
}

.col-time {
  white-space: nowrap;
}

.date-txt {
  font-size: 0.8rem;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 600;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FAF7F0;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.role-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: 700;
}

.action-tag {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 700;
  display: inline-block;
  white-space: nowrap;
}

.badge-success {
  background: #DCFCE7;
  color: #166534;
}

.badge-danger {
  background: #FEE2E2;
  color: #991B1B;
}

.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}

.badge-info {
  background: #E0E7FF;
  color: #3730A3;
}

.badge-primary {
  background: #EFE1C6;
  color: #8C6D3F;
}

.target-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entity-pill {
  font-size: 0.68rem;
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 700;
}

.target-name {
  font-size: 0.84rem;
  color: var(--color-text, #2B2116);
}

.col-detail-summary {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
}

.col-center {
  text-align: center;
}

.dash-muted {
  color: var(--color-text-muted, #7A6A55);
}

.btn-detail-sm {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-detail-sm:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.empty-cell {
  text-align: center;
  padding: 40px;
  color: var(--color-text-muted, #7A6A55);
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--color-secondary, #EFE1C6);
  background: #ffffff;
  gap: 12px;
  flex-wrap: wrap;
}

.page-info {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
}

.page-nav-btns {
  display: flex;
  gap: 8px;
}

.btn-page {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-page:hover:not(:disabled) {
  background: var(--color-canvas, #FFFBF2);
  border-color: var(--color-primary, #8C6D3F);
  color: var(--color-primary, #8C6D3F);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  max-width: 580px;
  padding: 24px;
  max-height: 92dvh;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.modal-head h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: var(--color-text, #2B2116);
}

.modal-sub {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
}

.close-x {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-canvas, #FFFBF2);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
}

.meta-lbl {
  width: 70px;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 700;
}

.modal-body .data-table {
  table-layout: fixed;
  overflow-wrap: anywhere;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--color-secondary, #EFE1C6);
}

.btn-close-modal {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 680px) {
  .admin-logs-page {
    padding: 16px 12px 40px;
  }
  .head-actions {
    width: 100%;
  }
  .btn-export-csv,
  .btn-refresh {
    flex: 1;
    justify-content: center;
  }
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-box {
    max-width: none;
    width: 100%;
  }
  .modal-backdrop {
    padding: 12px;
  }
  .modal-box {
    padding: 16px;
    max-height: 92dvh;
    overflow-x: hidden;
  }
  .meta-row {
    flex-wrap: wrap;
    gap: 4px 10px;
  }
}
</style>
