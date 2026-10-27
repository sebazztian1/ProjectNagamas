<template>
  <div class="admin-dashboard">
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Ringkasan Operasional Toko</h1>
        <p class="dash-subtitle">Pantau pesanan yang perlu diverifikasi, jadwal trip jastip berjalan, dan omzet per batch.</p>
      </div>
      <NuxtLink to="/admin/trip" class="btn-new-trip">+ Jadwalkan Trip Jastip Baru</NuxtLink>
    </div>

    <!-- Stat KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Menunggu Verifikasi Pembayaran</span>
        <strong class="kpi-val warning">{{ stats?.pendingOrdersCount || 0 }} Order</strong>
        <span class="kpi-sub">Pesanan baru yang perlu diverifikasi</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Trip Jastip Sedang Buka (Open PO)</span>
        <strong class="kpi-val">{{ stats?.openTripsCount || 0 }} Trip Aktif</strong>
        <span class="kpi-sub">{{ activeTripsSummary }}</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Total Omzet Pesanan</span>
        <strong class="kpi-val highlight">{{ formatRupiah(stats?.totalOmzet || 0) }}</strong>
        <span class="kpi-sub">{{ stats?.totalItemsSold || 0 }} items dipesan customer</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Request Produk Masuk</span>
        <strong class="kpi-val">{{ stats?.pendingRequestsCount || 0 }} Menunggu Quote</strong>
        <span class="kpi-sub">Permintaan kustom titip dari pelanggan</span>
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
              <NuxtLink to="/admin/order" class="btn-check-proof">Verifikasi</NuxtLink>
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
import { computed } from 'vue'

const { data: stats } = await useFetch<any>('/api/admin/stats')

const activeTrips = computed(() => stats.value?.openTrips || [])

const activeTripsSummary = computed(() => {
  if (!activeTrips.value.length) return 'Tidak ada trip aktif'
  return activeTrips.value.map((t: any) => `${t.flag} ${t.country}`).join(' & ')
})

const pendingOrders = computed(() => [])

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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
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
