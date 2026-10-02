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
        <strong class="kpi-val warning">2 Order</strong>
        <span class="kpi-sub">Total Rp 755.366 (perlu dicek mutasi)</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Trip Jastip Sedang Buka (Open PO)</span>
        <strong class="kpi-val">2 Trip Aktif</strong>
        <span class="kpi-sub">Jepang Autumn & Korea K-Beauty</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Total Omzet Batch Berjalan</span>
        <strong class="kpi-val highlight">Rp 14.850.000</strong>
        <span class="kpi-sub">53 items dipesan customer</span>
      </div>

      <div class="kpi-card">
        <span class="kpi-label">Request Produk Masuk</span>
        <strong class="kpi-val">1 Menunggu Quote</strong>
        <span class="kpi-sub">Pokemon Center Pikachu Limited</span>
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
          <div v-for="ord in pendingOrders" :key="ord.id" class="order-quick-row">
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
          <div v-for="tr in activeTrips" :key="tr.id" class="trip-quick-item">
            <div class="tq-top">
              <strong>{{ tr.flag }} {{ tr.title }}</strong>
              <span class="tq-badge">Open PO</span>
            </div>
            <div class="tq-meta">
              <span>Tutup PO: <strong>{{ tr.closeDate }}</strong></span>
              <span>Kuota: <strong>{{ tr.quotaFilled }}/{{ tr.quotaTotal }}</strong></span>
            </div>
            <div class="tq-bar">
              <div class="tq-fill" :style="{ width: `${(tr.quotaFilled / tr.quotaTotal) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mockOrders, mockJastipTrips } from '../../data/mockJastipData'

const pendingOrders = computed(() => {
  return mockOrders.slice(0, 2)
})

const activeTrips = computed(() => {
  return mockJastipTrips.filter(t => t.status === 'open')
})

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
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
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.dash-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
}

.btn-new-trip {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-new-trip:hover {
  background: var(--color-primary-hover, #384759);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 600;
  margin-bottom: 6px;
}

.kpi-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.kpi-val.warning {
  color: #D97706;
}

.kpi-val.highlight {
  color: var(--color-primary, #4A5D73);
}

.kpi-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.dash-two-col {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
}

.panel-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.panel-head h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
}

.panel-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
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
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
}

.ord-code {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
}

.ord-cust {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.ord-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ord-amount {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
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
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  padding: 12px;
  background: var(--color-canvas, #F4F6F8);
}

.tq-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tq-top strong {
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
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
  color: var(--color-text-muted, #64748B);
  margin-bottom: 6px;
}

.tq-bar {
  height: 6px;
  background: var(--color-secondary, #E4E7EB);
  border-radius: 4px;
  overflow: hidden;
}

.tq-fill {
  height: 100%;
  background: var(--color-primary, #4A5D73);
}

@media (max-width: 900px) {
  .dash-two-col {
    grid-template-columns: 1fr;
  }
}
</style>
