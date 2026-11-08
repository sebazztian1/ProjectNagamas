<template>
  <div class="admin-dashboard">
    <div class="dash-header">
      <h1 class="dash-title">Dashboard</h1>
      <div class="dash-header-actions">
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

    <!-- Stat KPI Cards -->
    <div class="kpi-grid">
      <NuxtLink to="/admin/order" class="kpi-card kpi-clickable">
        <span class="kpi-label">Menunggu Verifikasi</span>
        <strong class="kpi-val warning">{{ stats?.pendingOrdersCount || 0 }}</strong>
        <span class="kpi-sub">Pesanan butuh ACC / cek bukti</span>
      </NuxtLink>

      <NuxtLink to="/admin/chat" class="kpi-card kpi-clickable">
        <div class="kpi-label-row">
          <span class="kpi-label">Live Chat Belum Dibaca</span>
          <span v-if="stats?.unreadChatCount > 0" class="kpi-live-dot"></span>
        </div>
        <strong class="kpi-val" :class="{ danger: (stats?.unreadChatCount || 0) > 0 }">
          {{ stats?.unreadChatCount || 0 }}
        </strong>
        <span class="kpi-sub">
          {{ (stats?.unreadChatRoomsCount || 0) > 0 ? `${stats.unreadChatRoomsCount} pelanggan menunggu balasan` : 'Semua pesan sudah dibaca' }}
        </span>
      </NuxtLink>

      <NuxtLink to="/admin/request" class="kpi-card kpi-clickable">
        <span class="kpi-label">Request Masuk</span>
        <strong class="kpi-val">{{ stats?.pendingRequestsCount || 0 }}</strong>
        <span class="kpi-sub">Menunggu penawaran harga</span>
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
          <h3>Pesanan Memerlukan Verifikasi</h3>
          <NuxtLink to="/admin/order" class="panel-link">Lihat Semua &rarr;</NuxtLink>
        </div>

        <div class="order-quick-list">
          <div v-if="!pendingOrders || pendingOrders.length === 0" style="padding: 24px; text-align: center; color: #7A6A55; font-size: 0.85rem;">
            Tidak ada pesanan yang sedang menunggu verifikasi saat ini.
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
          <h3>Jadwal Trip Jastip Berjalan</h3>
          <NuxtLink to="/admin/trip" class="panel-link">Kelola Trip &rarr;</NuxtLink>
        </div>

        <div class="trip-quick-list">
          <div v-if="activeTrips.length === 0" style="padding: 24px; text-align: center; color: #7A6A55; font-size: 0.85rem;">
            Belum ada trip yang sedang Open PO.
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAdminStats } from '../../composables/useAdminStats'

const { stats, pending, fetchAdminStats } = useAdminStats()

onMounted(() => {
  fetchAdminStats(true)
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
}

.panel-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
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
</style>
