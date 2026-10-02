<template>
  <div class="orders-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Pesanan Saya</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Riwayat Pesanan Saya</h1>
        <p class="page-subtitle">Pantau status verifikasi pembayaran, proses pembelian jastip di luar negeri, dan pengambilan pesanan Anda.</p>
      </div>

      <!-- Filter Tabs -->
      <div class="status-filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.key"
          class="tab-btn"
          :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Orders List -->
      <div v-if="filteredOrders.length > 0" class="orders-list">
        <div v-for="ord in filteredOrders" :key="ord.id" class="order-card">
          <div class="order-card-header">
            <div class="order-code-group">
              <span class="type-pill" :class="ord.orderType">
                {{ ord.orderType === 'ready' ? 'Ready Stock' : 'Jastip Luar Negeri' }}
              </span>
              <strong class="code-text">{{ ord.orderCode }}</strong>
              <span class="order-date">&bull; {{ ord.createdAt }}</span>
            </div>

            <div class="status-pill" :class="ord.orderStatus">
              {{ formatStatus(ord.orderStatus) }}
            </div>
          </div>

          <div class="order-items-preview">
            <div v-for="it in ord.items" :key="it.id" class="item-preview-row">
              <div class="item-details">
                <h4>{{ it.productName }}</h4>
                <span class="item-qty-meta">{{ it.quantity }} pcs &bull; {{ it.variant || 'Standard' }}</span>
              </div>
              <div class="item-subtotal">{{ formatRupiah(it.subtotal) }}</div>
            </div>
          </div>

          <div class="order-card-footer">
            <div class="total-info">
              <span class="total-lbl">Total Tagihan:</span>
              <strong class="total-amount">{{ formatRupiah(ord.totalAmount) }}</strong>
            </div>

            <div class="btn-actions">
              <NuxtLink 
                v-if="ord.orderStatus === 'pending_payment'" 
                :to="`/orders/${ord.orderCode}/bayar`" 
                class="btn-pay-now"
              >
                Upload Bukti Transfer &rarr;
              </NuxtLink>
              <NuxtLink :to="`/orders/${ord.orderCode}`" class="btn-detail">
                Lacak Status & Tracking
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-orders">
        <p>Tidak ada pesanan pada kategori status ini.</p>
        <NuxtLink to="/" class="btn-shop">Mulai Berbelanja</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockOrders } from '../../data/mockJastipData'

const currentTab = ref('all')

const filterTabs = [
  { key: 'all', label: 'Semua Pesanan' },
  { key: 'pending_approval', label: 'Menunggu ACC' },
  { key: 'pending_payment', label: 'Menunggu Bayar' },
  { key: 'purchasing', label: 'Sedang Dibelikan' },
  { key: 'ready_pickup', label: 'Siap Diambil' }
]

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return mockOrders
  return mockOrders.filter(o => o.orderStatus === currentTab.value)
})

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending_approval: 'Menunggu ACC Admin',
    pending_payment: 'Menunggu Pembayaran',
    payment_uploaded: 'Bukti Diupload',
    verified: 'Pembayaran Terverifikasi',
    purchasing: 'Sedang Dibelikan di Toko Asal',
    arrived: 'Barang Tiba di Indo',
    ready_pickup: 'Siap Diambil di Toko',
    completed: 'Pesanan Selesai',
    rejected: 'Ditolak Admin',
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
.orders-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 980px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #64748B);
}

.status-filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-btn {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.order-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 20px;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  flex-wrap: wrap;
  gap: 10px;
}

.order-code-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-pill {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.type-pill.ready {
  background: var(--color-ready-bg, #DCFCE7);
  color: var(--color-ready, #059669);
}

.type-pill.jastip {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
}

.code-text {
  font-size: 0.95rem;
  color: var(--color-text, #1E293B);
}

.order-date {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.status-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
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

.status-pill.ready_pickup {
  background: #DCFCE7;
  color: #166534;
}

.status-pill.rejected {
  background: #FEE2E2;
  color: #B91C1C;
}

.order-items-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.item-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-details h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.item-qty-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.item-subtotal {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  padding-top: 14px;
  flex-wrap: wrap;
  gap: 12px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.total-lbl {
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748B);
}

.total-amount {
  font-size: 1.15rem;
  color: var(--color-primary, #4A5D73);
}

.btn-actions {
  display: flex;
  gap: 10px;
}

.btn-pay-now {
  text-decoration: none;
  background: #D97706;
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
}

.btn-detail {
  text-decoration: none;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
}

.empty-orders {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  color: var(--color-text-muted, #64748B);
}

.btn-shop {
  display: inline-block;
  margin-top: 10px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
}
</style>
