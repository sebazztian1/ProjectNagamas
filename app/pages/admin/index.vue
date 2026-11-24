<template>
  <div class="admin-dashboard">
    <div class="dash-header">
      <h1 class="dash-title">Dashboard</h1>
      <div class="dash-header-actions">
        <button type="button" class="btn-export-csv" @click="openExportModal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Ekspor laporan</span>
        </button>
        <button class="btn-refresh" @click="fetchAdminStats(false)" :disabled="pending">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          <span>Refresh</span>
        </button>
        <NuxtLink to="/admin/trip" class="btn-new-trip">+ Trip Baru</NuxtLink>
      </div>
    </div>

    <LoadingRegion :loading="initialStatsPending || pending" layout="dashboard">
    <!-- Stat KPI Cards -->
    <div class="kpi-grid">
      <NuxtLink to="/admin/order" class="kpi-card kpi-clickable">
        <span class="kpi-label">Menunggu Verifikasi</span>
        <strong class="kpi-val warning">{{ stats?.pendingOrdersCount || 0 }}</strong>
      </NuxtLink>

      <NuxtLink to="/admin/chat" class="kpi-card kpi-clickable">
        <div class="kpi-label-row">
          <span class="kpi-label">Chat Belum Dibaca</span>
          <span v-if="stats?.unreadChatCount > 0" class="kpi-live-dot"></span>
        </div>
        <strong class="kpi-val" :class="{ danger: (stats?.unreadChatCount || 0) > 0 }">
          {{ stats?.unreadChatCount || 0 }}
        </strong>
        <span class="kpi-sub">
          {{ (stats?.unreadChatRoomsCount || 0) > 0 ? `${stats.unreadChatRoomsCount} pelanggan` : '' }}
        </span>
      </NuxtLink>

      <NuxtLink to="/admin/request" class="kpi-card kpi-clickable">
        <span class="kpi-label">Request Masuk</span>
        <strong class="kpi-val">{{ stats?.pendingRequestsCount || 0 }}</strong>
      </NuxtLink>

      <NuxtLink to="/admin/trip" class="kpi-card kpi-clickable">
        <span class="kpi-label">Trip Aktif</span>
        <strong class="kpi-val">{{ stats?.openTripsCount || 0 }}</strong>
        <span class="kpi-sub">{{ activeTripsSummary }}</span>
      </NuxtLink>

      <div class="kpi-card">
        <span class="kpi-label">Total Omzet</span>
        <strong class="kpi-val highlight">{{ formatRupiah(stats?.totalOmzet || 0) }}</strong>
        <span class="kpi-sub">{{ stats?.totalItemsSold || 0 }} item terjual</span>
      </div>
    </div>

    <!-- Quick Action / Attention Section -->
    <div class="dash-two-col">
      <!-- Orders waiting for verification -->
      <div class="panel-box">
        <div class="panel-head">
          <h3>Perlu Verifikasi</h3>
          <NuxtLink to="/admin/order" class="panel-link">Lihat Semua &rarr;</NuxtLink>
        </div>

        <div class="order-quick-list">
          <div v-if="!pendingOrders || pendingOrders.length === 0" style="padding: 24px; text-align: center; color: #7A6A55; font-size: 0.85rem;">
            Tidak ada pesanan menunggu.
          </div>
          <div v-for="ord in pendingOrders" :key="ord.id" class="order-quick-row" v-else>
            <div>
              <strong class="ord-code">{{ ord.orderCode }}</strong>
              <span class="ord-cust">{{ ord.customerName }} &bull; {{ ord.customerPhone }}</span>
            </div>
            <div class="ord-right">
              <span class="ord-amount">{{ formatRupiah(ord.totalAmount) }}</span>
              <NuxtLink to="/admin/order" class="btn-check-proof">
                {{ ord.orderStatus === 'pending_approval' ? 'Review ACC' : 'Verifikasi' }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Trips Status -->
      <div class="panel-box">
        <div class="panel-head">
          <h3>Trip Berjalan</h3>
          <NuxtLink to="/admin/trip" class="panel-link">Kelola Trip &rarr;</NuxtLink>
        </div>

        <div class="trip-quick-list">
          <div v-if="activeTrips.length === 0" style="padding: 24px; text-align: center; color: #7A6A55; font-size: 0.85rem;">
            Belum ada trip aktif.
          </div>
          <div v-for="tr in activeTrips" :key="tr.id" class="trip-quick-item" v-else>
            <div class="tq-top">
              <strong>{{ tr.flag }} {{ tr.title }}</strong>
              <span class="tq-badge">Open PO</span>
            </div>
            <div class="tq-meta">
              <span>Tutup PO: <strong>{{ tr.closeDate }}</strong></span>
              <span>Kuota: <strong>{{ tr.quotaFilled }}/{{ tr.quotaTotal }}</strong></span>
            </div>
            <div class="tq-bar">
              <div class="tq-fill" :style="{ width: `${Math.min(100, (tr.quotaFilled / tr.quotaTotal) * 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    </LoadingRegion>

    <AdminCsvExportModal
      :show="showExportModal"
      title="Ekspor Laporan Akuntansi"
      subtitle="Pilih dataset keuangan dan rentang timestamp (Tanggal Minimal -> Tanggal Maksimal) untuk audit pembukuan."
      :datasets="exportDatasetOptions"
      v-model:selected-dataset="exportDataset"
      v-model:start-date="exportStartDate"
      v-model:end-date="exportEndDate"
      :preview-count="exportPreview.items.length"
      :min-timestamp="exportPreview.minTimestamp"
      :min-date="exportDataset === 'logs' ? auditWindow?.minDate : undefined"
      :audit-row-count="exportDataset === 'logs' ? exportPreview.items.length : undefined"
      :max-timestamp="exportPreview.maxTimestamp"
      :summary-metrics="exportMetrics"
      :loading="isExportLoading"
      @close="showExportModal = false"
      :prepare-files="prepareFiles"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAdminStats } from '../../composables/useAdminStats'
import { useToast } from '../../composables/useToast'
import type { CsvDatasetOption, CsvPreviewMetric } from '../../components/AdminCsvExportModal.vue'
import {
  prepareReportFiles,
  filterByDateRange,
  isValidDateRange,
  type CsvSummaryItem
} from '../../utils/csvExport'

const { stats, pending, fetchAdminStats } = useAdminStats()
const { showToast } = useToast()

const initialStatsPending = ref(true)
onMounted(async () => {
  try {
    await fetchAdminStats(true)
  } finally {
    initialStatsPending.value = false
  }
})

const activeTrips = computed(() => stats.value?.openTrips || [])

const activeTripsSummary = computed(() => {
  if (!activeTrips.value.length) return 'Tidak ada trip aktif'
  return activeTrips.value.map((t: any) => `${t.flag} ${t.country}`).join(' & ')
})

const pendingOrders = computed(() => stats.value?.pendingOrders || [])

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
}

// --- Accounting report export ---
const showExportModal = ref(false)
const exportDataset = ref<'orders' | 'payments' | 'trips' | 'products' | 'logs'>('orders')
const exportStartDate = ref('')
const exportEndDate = ref('')
const isExportLoading = ref(false)

const cachedOrders = ref<any[] | null>(null)
const cachedTrips = ref<any[] | null>(null)
const cachedProducts = ref<any[] | null>(null)
const cachedLogs = ref<any[]>([])
const auditWindow = ref<{ minDate: string; cutoff: string }>()
const retainedLogs = useRetainedAuditRows(() => cachedLogs.value, () => auditWindow.value?.cutoff)

const exportDatasetOptions: CsvDatasetOption[] = [
  { id: 'orders', label: 'Rekap Pesanan', description: 'Omzet, DP, sisa tagihan & ongkir per order' },
  { id: 'payments', label: 'Mutasi Pembayaran', description: 'Arus kas masuk DP & pelunasan terverifikasi' },
  { id: 'trips', label: 'Batch Trip & Kurs', description: 'Kurs valas, kuota & nilai pesanan per trip' },
  { id: 'products', label: 'Valuasi Stok', description: 'Stok produk Ready/Pre-order & nilai estimasi' },
  { id: 'logs', label: 'Audit Log', description: 'Riwayat aktivitas sistem & perubahan data' }
]

const loadDatasetSource = async (dataset: string) => {
  isExportLoading.value = true
  try {
    if ((dataset === 'orders' || dataset === 'payments') && cachedOrders.value === null) {
      cachedOrders.value = await $fetch<any[]>('/api/admin/orders')
    } else if (dataset === 'trips' && cachedTrips.value === null) {
      cachedTrips.value = await $fetch<any[]>('/api/admin/trips')
    } else if (dataset === 'products' && cachedProducts.value === null) {
      const res = await $fetch<{ products: any[] }>('/api/admin/products')
      cachedProducts.value = res.products || []
    } else if (dataset === 'logs') {
      if (!isValidDateRange(exportStartDate.value, exportEndDate.value)) {
        cachedLogs.value = []
        return
      }
      const res = await $fetch<{ logs: any[]; retention: { minDate: string; cutoff: string } }>('/api/admin/logs', {
        query: {
          exportAll: 'true',
          startDate: exportStartDate.value || undefined,
          endDate: exportEndDate.value || undefined
        }
      })
      cachedLogs.value = res.logs || []
      auditWindow.value = res.retention
    }
  } catch (err: any) {
    if (dataset === 'logs') cachedLogs.value = []
    showToast('Gagal Memuat Data Export', err?.data?.message || 'Tidak dapat mengambil data dari server.', 'warning')
  } finally {
    isExportLoading.value = false
  }
}

const openExportModal = async () => {
  showExportModal.value = true
  cachedOrders.value = null
  cachedTrips.value = null
  cachedProducts.value = null
  await loadDatasetSource(exportDataset.value)
}

watch(exportDataset, async (next) => {
  if (!showExportModal.value) return
  await loadDatasetSource(next)
})

watch([exportStartDate, exportEndDate], async () => {
  if (!showExportModal.value || exportDataset.value !== 'logs') return
  await loadDatasetSource('logs')
})

const flattenedPayments = computed(() => {
  const rows: any[] = []
  for (const ord of cachedOrders.value || []) {
    for (const p of ord.payments || []) {
      rows.push({
        ...p,
        orderCode: ord.orderCode,
        orderStatus: ord.orderStatus,
        orderType: ord.orderType,
        customerName: ord.customerName,
        customerUsername: ord.customerUsername,
        customerPhone: ord.customerPhone,
        tripTitle: ord.tripTitle || '-'
      })
    }
  }
  return rows
})

const exportPreview = computed(() => {
  if (exportDataset.value === 'orders') {
    return filterByDateRange(cachedOrders.value || [], o => o.createdAtIso, exportStartDate.value, exportEndDate.value)
  }
  if (exportDataset.value === 'payments') {
    return filterByDateRange(flattenedPayments.value, p => p.createdAt, exportStartDate.value, exportEndDate.value)
  }
  if (exportDataset.value === 'trips') {
    return filterByDateRange(cachedTrips.value || [], t => t.createdAt, exportStartDate.value, exportEndDate.value)
  }
  if (exportDataset.value === 'products') {
    return filterByDateRange(cachedProducts.value || [], p => p.createdAt, exportStartDate.value, exportEndDate.value)
  }
  return filterByDateRange(retainedLogs.value, l => l.createdAt, exportStartDate.value, exportEndDate.value)
})

const exportMetrics = computed<CsvPreviewMetric[]>(() => {
  const rows = exportPreview.value.items
  if (exportDataset.value === 'orders') {
    const valid = rows.filter(o => !['cancelled', 'rejected', 'expired'].includes(o.orderStatus))
    const totalOmzet = valid.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
    const totalPaid = valid.reduce((s, o) => s + Number(o.paidAmount || 0), 0)
    const totalRemaining = valid.reduce((s, o) => s + Number(o.remainingAmount || 0), 0)
    return [
      { label: 'Total Tagihan Aktif', value: formatRupiah(totalOmzet), highlight: true },
      { label: 'Total Sudah Dibayar', value: formatRupiah(totalPaid) },
      { label: 'Sisa Piutang / Pelunasan', value: formatRupiah(totalRemaining) }
    ]
  }
  if (exportDataset.value === 'payments') {
    const verifiedSum = rows.filter(p => p.status === 'verified').reduce((s, p) => s + Number(p.amount || 0), 0)
    const pendingSum = rows.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0)
    return [
      { label: 'Terverifikasi (Kas Masuk)', value: formatRupiah(verifiedSum), highlight: true },
      { label: 'Menunggu Verifikasi', value: formatRupiah(pendingSum) }
    ]
  }
  if (exportDataset.value === 'trips') {
    const totalValue = rows.reduce((s, t) => s + Number(t.totalOrdersAmount || 0), 0)
    const totalOrders = rows.reduce((s, t) => s + Number(t.ordersCount || 0), 0)
    return [
      { label: 'Total Nilai Pesanan Trip', value: formatRupiah(totalValue), highlight: true },
      { label: 'Jumlah Pesanan Aktif', value: `${totalOrders} pesanan` }
    ]
  }
  if (exportDataset.value === 'products') {
    const activeCount = rows.filter(p => p.isActive).length
    const totalAsset = rows.reduce((s, p) => {
      const units = p.productType === 'ready' ? Number(p.stockQuantity || 0) : Number(p.quota || 0)
      return s + Number(p.price || 0) * units
    }, 0)
    return [
      { label: 'Potensi Nilai Stok/Kuota', value: formatRupiah(totalAsset), highlight: true },
      { label: 'Produk Aktif', value: `${activeCount} / ${rows.length} SKU` }
    ]
  }
  return [{ label: 'Total Entri Audit Log', value: `${rows.length} catatan`, highlight: true }]
})

const prepareFiles = () => {
  const { items, minTimestamp, maxTimestamp } = exportPreview.value
  if (!items.length) return

  if (exportDataset.value === 'orders') {
    const valid = items.filter(o => !['cancelled', 'rejected', 'expired'].includes(o.orderStatus))
    const summaryItems: CsvSummaryItem[] = [
      { label: 'Total Nilai Order Aktif (IDR)', value: valid.reduce((s, o) => s + Number(o.totalAmount || 0), 0) },
      { label: 'Total Dana Masuk / Dibayar (IDR)', value: valid.reduce((s, o) => s + Number(o.paidAmount || 0), 0) },
      { label: 'Total Sisa Tagihan (IDR)', value: valid.reduce((s, o) => s + Number(o.remainingAmount || 0), 0) }
    ]
    return prepareReportFiles({
      filenamePrefix: 'nagamas_rekap_pesanan',
      reportTitle: 'Laporan Rekap Pesanan (Dashboard Accounting)',
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      summaryItems,
      columns: [
        { header: 'Waktu Pembuatan (WIB)', kind: 'datetime', key: 'createdAtIso' },
        { header: 'Kode Order', key: 'orderCode' },
        { header: 'Tipe Order', format: r => (r.orderType === 'ready' ? 'Ready Stock' : 'Pre-Order Jastip') },
        { header: 'Trip', format: r => r.tripTitle || '-' },
        { header: 'Nama Pelanggan', minWidth: 25, key: 'customerName' },
        { header: 'Username', key: 'customerUsername' },
        { header: 'Nomor HP / WhatsApp', key: 'customerPhone' },
        { header: 'Status Order', kind: 'status', key: 'orderStatus' },
        { header: 'Tipe Pembayaran', format: r => (r.paymentType === 'dp' ? 'DP 50%' : 'Full 100%') },
        { header: 'Subtotal Produk (IDR)', kind: 'number', key: 'subtotal' },
        { header: 'Ongkir (IDR)', kind: 'number', key: 'shippingCost' },
        { header: 'Kode Unik (IDR)', kind: 'number', key: 'uniqueCode' },
        { header: 'Total Tagihan (IDR)', kind: 'number', key: 'totalAmount' },
        { header: 'Sudah Dibayar (IDR)', kind: 'number', key: 'paidAmount' },
        { header: 'Sisa Tagihan (IDR)', kind: 'number', key: 'remainingAmount' },
        { header: 'Waktu Persetujuan (WIB)', kind: 'datetime', key: 'approvedAt' }
      ]
    })
  } else if (exportDataset.value === 'payments') {
    const verifiedSum = items.filter(p => p.status === 'verified').reduce((s, p) => s + Number(p.amount || 0), 0)
    const pendingSum = items.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0)
    return prepareReportFiles({
      filenamePrefix: 'nagamas_mutasi_pembayaran',
      reportTitle: 'Laporan Mutasi Pembayaran Masuk (Dashboard Accounting)',
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      summaryItems: [
        { label: 'Total Mutasi Terverifikasi (IDR)', value: verifiedSum },
        { label: 'Total Mutasi Menunggu Verifikasi (IDR)', value: pendingSum }
      ],
      columns: [
        { header: 'Waktu Unggah (WIB)', kind: 'datetime', key: 'createdAt' },
        { header: 'Waktu Verifikasi (WIB)', kind: 'datetime', key: 'verifiedAt' },
        { header: 'ID Pembayaran', kind: 'identifier', key: 'id' },
        { header: 'Kode Order', key: 'orderCode' },
        { header: 'Jenis Bayar', format: r => (r.paymentKind === 'dp' ? 'DP' : r.paymentKind === 'final' ? 'Pelunasan' : 'Full') },
        { header: 'Nama Pelanggan', minWidth: 25, key: 'customerName' },
        { header: 'Bank Tujuan', key: 'bankName' },
        { header: 'Nama Pengirim', key: 'senderName' },
        { header: 'Bank Pengirim', key: 'senderBank' },
        { header: 'Nominal (IDR)', kind: 'number', key: 'amount' },
        { header: 'Status Verifikasi', kind: 'status', key: 'status' },
        { header: 'Catatan Admin', key: 'adminNote' }
      ]
    })
  } else if (exportDataset.value === 'trips') {
    return prepareReportFiles({
      filenamePrefix: 'nagamas_laporan_trip',
      reportTitle: 'Laporan Batch Trip & Valas (Dashboard Accounting)',
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      summaryItems: [
        { label: 'Total Nilai Pesanan Trip (IDR)', value: items.reduce((s, t) => s + Number(t.totalOrdersAmount || 0), 0) }
      ],
      columns: [
        { header: 'Waktu Pembuatan (WIB)', kind: 'datetime', key: 'createdAt' },
        { header: 'ID Trip', kind: 'identifier', key: 'id' },
        { header: 'Nama Trip', key: 'title' },
        { header: 'Negara / Kota', format: r => `${r.country}${r.cityOrArea ? ' - ' + r.cityOrArea : ''}` },
        { header: 'Status Trip', kind: 'status', key: 'status' },
        { header: 'Mata Uang', key: 'currency' },
        { header: 'Kurs IDR', kind: 'number', key: 'exchangeRate' },
        { header: 'Tipe Fee', key: 'feeType' },
        { header: 'Nilai Fee', kind: 'number', key: 'feeValue' },
        { header: 'Kuota Terisi', kind: 'number', key: 'quotaFilled' },
        { header: 'Kuota Total', kind: 'number', key: 'quotaTotal' },
        { header: 'Jumlah Pesanan', kind: 'number', key: 'ordersCount' },
        { header: 'Total Nilai Order (IDR)', kind: 'number', key: 'totalOrdersAmount' },
        { header: 'Tanggal Buka PO', kind: 'date', key: 'openDate' },
        { header: 'Tanggal Tutup PO', kind: 'date', key: 'closeDate' },
        { header: 'Tanggal Berangkat', kind: 'date', key: 'departureDate' },
        { header: 'Estimasi Tiba', kind: 'date', key: 'estimatedArrivalDate' }
      ]
    })
  } else if (exportDataset.value === 'products') {
    const totalAsset = items.reduce((s, p) => {
      const units = p.productType === 'ready' ? Number(p.stockQuantity || 0) : Number(p.quota || 0)
      return s + Number(p.price || 0) * units
    }, 0)
    return prepareReportFiles({
      filenamePrefix: 'nagamas_valuasi_produk',
      reportTitle: 'Laporan Valuasi Produk & Stok (Dashboard Accounting)',
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      summaryItems: [{ label: 'Total Potensi Nilai Stok/Kuota (IDR)', value: totalAsset }],
      columns: [
        { header: 'Waktu Pembuatan (WIB)', kind: 'datetime', key: 'createdAt' },
        { header: 'Waktu Pembaruan (WIB)', kind: 'datetime', key: 'updatedAt' },
        { header: 'ID Produk', kind: 'identifier', key: 'id' },
        { header: 'Nama Produk', minWidth: 25, key: 'name' },
        { header: 'Tipe', format: r => (r.productType === 'ready' ? 'Ready Stock' : 'Pre-Order Jastip') },
        { header: 'Kategori', key: 'categoryName' },
        { header: 'Trip', format: r => r.tripTitle || '-' },
        { header: 'Mata Uang Asli', format: r => r.originalCurrency || 'IDR' },
        { header: 'Harga Asli Valas', kind: 'number', key: 'originalPrice' },
        { header: 'Harga Jual (IDR)', kind: 'number', key: 'price' },
        { header: 'Stok / Kuota', format: r => (r.productType === 'ready' ? Number(r.stockQuantity || 0) : Number(r.quota || 0)) },
        { header: 'Nilai Stok Potensial (IDR)', format: r => Number(r.price || 0) * (r.productType === 'ready' ? Number(r.stockQuantity || 0) : Number(r.quota || 0)) },
        { header: 'Status Stok', kind: 'status', key: 'stockStatus' },
        { header: 'Status Aktif', kind: 'status', format: r => (r.isActive ? 'Aktif' : 'Nonaktif') }
      ]
    })
  } else {
    return prepareReportFiles({
      filenamePrefix: 'nagamas_audit_log',
      reportTitle: 'Laporan Audit Log Sistem (Dashboard Accounting)',
      rows: items,
      minTimestamp,
      maxTimestamp,
      filterStartDate: exportStartDate.value,
      filterEndDate: exportEndDate.value,
      columns: [
        { header: 'Waktu Aktivitas (WIB)', kind: 'datetime', key: 'createdAt' },
        { header: 'ID Log', kind: 'identifier', key: 'id' },
        { header: 'Aktor / Admin', key: 'user' },
        { header: 'Role', key: 'userRole' },
        { header: 'Aksi', key: 'action' },
        { header: 'Entitas', key: 'entityType' },
        { header: 'ID Entitas', kind: 'identifier', key: 'entityId' },
        { header: 'Keterangan', key: 'summary' }
      ]
    })

  }
}


</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.dash-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.dash-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
}

.dash-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-export-csv {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #FAF5EC;
  border: 1px solid #D8B978;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #6F5530;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-export-csv:hover {
  background: #F4E9D2;
  border-color: #8C6D3F;
  color: #2B2116;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  font-size: 0.85rem;
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

.btn-new-trip {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-new-trip:hover {
  background: var(--color-primary-hover, #6F5530);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 16px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: all 0.18s ease;
}

.kpi-clickable:hover {
  border-color: #D8B978;
  box-shadow: 0 6px 18px -6px rgba(140, 109, 63, 0.12);
  transform: translateY(-2px);
}

.kpi-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.kpi-live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.18);
  flex-shrink: 0;
}

.kpi-label {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 600;
  margin-bottom: 6px;
}

.kpi-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.kpi-val.warning {
  color: #D97706;
}

.kpi-val.danger {
  color: #DC2626;
}

.kpi-val.highlight {
  color: var(--color-primary, #8C6D3F);
}

.kpi-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.dash-two-col {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 24px;
}

.panel-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
  min-width: 0;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.panel-head h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
}

.panel-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  text-decoration: none;
}

.order-quick-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-quick-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
}

.ord-code {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
}

.ord-cust {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.ord-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ord-amount {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-primary, #8C6D3F);
}

.btn-check-proof {
  background: #D97706;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
}

.trip-quick-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trip-quick-item {
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 12px;
  background: var(--color-canvas, #FFFBF2);
}

.tq-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tq-top strong {
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
}

.tq-badge {
  font-size: 0.68rem;
  background: #DCFCE7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
}

.tq-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 6px;
}

.tq-bar {
  height: 6px;
  background: var(--color-secondary, #EFE1C6);
  border-radius: 4px;
  overflow: hidden;
}

.tq-fill {
  height: 100%;
  background: var(--color-primary, #8C6D3F);
}

@media (max-width: 900px) {
  .dash-two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .dash-title {
    font-size: 1.35rem;
  }

  .dash-header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .dash-header-actions .btn-export-csv,
  .dash-header-actions .btn-refresh,
  .dash-header-actions .btn-new-trip {
    flex: 1;
    justify-content: center;
    text-align: center;
  }

  .kpi-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 155px), 1fr));
    gap: 12px;
  }

  .kpi-card,
  .panel-box {
    padding: 16px;
  }

  .kpi-val {
    font-size: 1.35rem;
  }

  .tq-meta,
  .panel-head {
    flex-wrap: wrap;
    gap: 6px;
  }
}
</style>

