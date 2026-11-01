<template>
  <div class="orders-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Pesanan Saya</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Pesanan Saya</h1>
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
      <div v-if="pending" class="empty-orders">
        <p>Memuat daftar pesanan Anda...</p>
      </div>

      <div v-else-if="filteredOrders.length > 0" class="orders-list">
        <div v-for="ord in filteredOrders" :key="ord.id" class="order-card">
          <div class="order-card-header">
            <div class="order-code-group">
              <span class="type-pill" :class="ord.orderType">
                {{ ord.orderType === 'ready' ? 'Ready Stock' : `Jastip${ord.tripTitle ? ' • ' + ord.tripTitle : ''}` }}
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
              <span v-if="ord.paymentType === 'dp'" class="dp-badge">
                Skema DP 50% ({{ formatRupiah(ord.dpAmount) }})
              </span>
            </div>

            <div class="btn-actions">
              <button
                v-if="ord.orderStatus === 'pending_approval' || ord.orderStatus === 'pending_payment'"
                type="button"
                class="btn-cancel-ord"
                @click="handleCancelOrder(ord)"
              >
                Batalkan
              </button>
              <NuxtLink
                v-if="ord.orderStatus === 'pending_payment'"
                :to="`/orders/${ord.orderCode}/bayar`"
                class="btn-pay-now"
              >
                Bayar &amp; Upload Bukti &rarr;
              </NuxtLink>
              <NuxtLink :to="`/orders/${ord.orderCode}`" class="btn-detail">
                Detail &amp; Lacak
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
import { useToast } from '../../composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const { showToast } = useToast()
const currentTab = ref('all')

const { data: ordersData, pending, refresh } = await useFetch<any[]>('/api/orders')

const orders = computed(() => ordersData.value || [])

const filterTabs = [
  { key: 'all', label: 'Semua Pesanan' },
  { key: 'pending_approval', label: 'Menunggu ACC' },
  { key: 'pending_payment', label: 'Menunggu Bayar' },
  { key: 'payment_uploaded', label: 'Verifikasi Bayar' },
  { key: 'verified', label: 'Terverifikasi' },
  { key: 'purchasing', label: 'Sedang Dibelikan' },
  { key: 'ready_handover', label: 'Sedang Dikirim' },
  { key: 'completed', label: 'Selesai' }
]

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') return orders.value
  return orders.value.filter(o => o.orderStatus === currentTab.value)
})

const handleCancelOrder = async (ord: any) => {
  if (!confirm(`Yakin ingin membatalkan pesanan #${ord.orderCode}?`)) return
  try {
    await $fetch(`/api/orders/${ord.orderCode}/cancel`, {
      method: 'PATCH',
      body: { reason: 'Dibatalkan oleh customer melalui halaman Pesanan Saya.' }
    })
    showToast('Pesanan Dibatalkan', `Pesanan #${ord.orderCode} berhasil dibatalkan.`, 'info')
    await refresh()
  } catch (err: any) {
    showToast('Gagal Membatalkan', err?.data?.message || 'Tidak dapat membatalkan pesanan.', 'warning')
  }
}

const formatStatus = (st: string) => {
  const map: Record<string, string> = {
    pending_approval: 'Menunggu ACC Admin',
    pending_payment: 'Menunggu Pembayaran',
    payment_uploaded: 'Bukti Diupload',
    verified: 'Pembayaran Terverifikasi',
    purchasing: 'Sedang Dibelikan di Toko Asal',
    arrived: 'Barang Tiba di Indo',
    ready_handover: 'Sedang Dikirim ke Alamat',
    ready_pickup: 'Sedang Dikirim ke Alamat',
    completed: 'Pesanan Selesai',
    rejected: 'Ditolak Admin',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa'
  }
  return map[st] || st
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
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
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.status-filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab-btn {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.order-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 20px;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  flex-wrap: wrap;
  gap: 10px;
}

.order-code-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.type-pill {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.type-pill.ready {
  background: #DCFCE7;
  color: #059669;
}

.type-pill.jastip {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
}

.code-text {
  font-size: 0.95rem;
  color: var(--color-text, #2B2116);
}

.order-date {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
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
  color: var(--color-text, #2B2116);
  margin: 0 0 2px;
}

.item-qty-meta {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
}

.item-subtotal {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px dashed var(--color-secondary, #EFE1C6);
  flex-wrap: wrap;
  gap: 12px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.total-lbl {
  font-size: 0.8rem;
  color: var(--color-text-muted, #7A6A55);
}

.total-amount {
  font-size: 1.05rem;
  color: var(--color-primary, #8C6D3F);
}

.dp-badge {
  font-size: 0.72rem;
  background: #FEF3C7;
  color: #92400E;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 700;
}

.btn-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-cancel-ord {
  background: #FEE2E2;
  color: #B91C1C;
  border: 1px solid #FCA5A5;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-pay-now {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
}

.btn-detail {
  background: #FFFBF2;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text, #2B2116);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
}

.empty-orders {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
}

.btn-shop {
  display: inline-block;
  margin-top: 12px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
