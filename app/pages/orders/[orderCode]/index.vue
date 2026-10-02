<template>
  <div class="order-detail-page" v-if="order">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <NuxtLink to="/orders">Pesanan Saya</NuxtLink>
        <span>/</span>
        <span class="active">{{ order.orderCode }}</span>
      </div>

      <!-- Header with Status -->
      <div class="order-hero-card">
        <div class="hero-left">
          <span class="type-tag">{{ order.orderType === 'ready' ? 'Ready Stock' : 'Jastip Pre-Order' }}</span>
          <h1 class="order-heading">Pesanan #{{ order.orderCode }}</h1>
          <p class="order-created">Dibuat pada {{ order.createdAt }} WIB</p>
        </div>

        <div class="hero-right">
          <span class="status-banner" :class="order.orderStatus">
            {{ formatStatus(order.orderStatus) }}
          </span>
          <NuxtLink 
            v-if="order.orderStatus === 'pending_payment'" 
            :to="`/orders/${order.orderCode}/bayar`" 
            class="btn-hero-pay"
          >
            💳 Bayar & Upload Bukti &rarr;
          </NuxtLink>
          <span 
            v-else-if="order.orderStatus === 'pending_approval'" 
            class="btn-hero-pay locked"
          >
            🔒 Menunggu ACC Admin
          </span>
          <span 
            v-else-if="order.orderStatus === 'payment_uploaded'" 
            class="btn-hero-pay waiting-check"
          >
            ⏳ Menunggu Cek Admin
          </span>
        </div>
      </div>

      <!-- Informative Status Alert -->
      <div v-if="order.orderStatus === 'pending_approval'" class="status-alert-banner alert-approval">
        <div class="alert-icon">⏳</div>
        <div class="alert-text">
          <h4>Pesanan Anda Sedang Ditinjau oleh Admin dbb_luxe</h4>
          <p>Admin kami sedang mengecek ketersediaan fisik barang di Pasar Baru atau sisa kuota koper traveler luar negeri. Instruksi pembayaran transfer manual dan tombol bayar akan terbuka otomatis setelah pesanan disetujui (di-ACC).</p>
        </div>
      </div>

      <div v-else-if="order.orderStatus === 'pending_payment'" class="status-alert-banner alert-approved">
        <div class="alert-icon">✅</div>
        <div class="alert-text">
          <h4>Pesanan Telah Disetujui Admin!</h4>
          <p>Ketersediaan barang dan kuota bagasi telah dikonfirmasi oleh Admin dbb_luxe. Silakan selesaikan pembayaran sebelum batas waktu berakhir.</p>
        </div>
        <NuxtLink :to="`/orders/${order.orderCode}/bayar`" class="btn-alert-pay">
          Bayar Sekarang &rarr;
        </NuxtLink>
      </div>

      <div v-else-if="order.orderStatus === 'rejected'" class="status-alert-banner alert-rejected">
        <div class="alert-icon">❌</div>
        <div class="alert-text">
          <h4>Pesanan Tidak Dapat Diproses (Ditolak)</h4>
          <p><strong>Alasan:</strong> {{ order.rejectionReason || 'Stok fisik habis atau kuota bagasi trip penuh.' }}</p>
          <span class="sub-alert-note">Anda tidak perlu melakukan pembayaran. Silakan hubungi admin via Live Chat untuk rekomendasi lainnya.</span>
        </div>
      </div>

      <div class="order-grid-layout">
        <!-- Left: Tracking Timeline & Receipt Photos -->
        <div class="tracking-col">
          <div class="box-card">
            <h3 class="box-head">Lacak Progres Pesanan</h3>

            <div class="timeline-stepper">
              <div v-for="(log, idx) in order.logs" :key="log.id" class="timeline-step">
                <div class="step-indicator">
                  <div class="step-dot active"></div>
                  <div v-if="idx < order.logs.length - 1" class="step-line"></div>
                </div>

                <div class="step-content">
                  <div class="step-time">{{ log.createdAt }} WIB</div>
                  <h4 class="step-title">{{ log.title }}</h4>
                  <p v-if="log.note" class="step-note">{{ log.note }}</p>

                  <!-- Physical Store Receipt Photo Proof from Admin -->
                  <div v-if="log.proofImageUrl" class="receipt-proof-preview">
                    <span class="proof-label">📷 Foto Bukti Pembelian di Toko Resmi Luar Negeri:</span>
                    <div class="proof-img-wrap">
                      <img :src="log.proofImageUrl" alt="Bukti Struk Belanja" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Items & Payment Breakdown -->
        <div class="summary-col">
          <div class="box-card">
            <h3 class="box-head">Rincian Barang</h3>

            <div class="order-items-list">
              <div v-for="it in order.items" :key="it.id" class="order-item-row">
                <div class="it-info">
                  <strong>{{ it.productName }}</strong>
                  <span>{{ it.quantity }} pcs &bull; {{ it.variant || 'Standard' }}</span>
                </div>
                <div class="it-price">{{ formatRupiah(it.subtotal) }}</div>
              </div>
            </div>

            <div class="financial-breakdown">
              <div class="f-row">
                <span>Subtotal:</span>
                <span>{{ formatRupiah(order.subtotal) }}</span>
              </div>
              <div class="f-row">
                <span>Kode Unik Transfer:</span>
                <span>+{{ order.uniqueCode }}</span>
              </div>
              <div class="f-row total">
                <span>Total Tagihan:</span>
                <span class="total-bold">{{ formatRupiah(order.totalAmount) }}</span>
              </div>
              <div class="f-row">
                <span>Status Pembayaran:</span>
                <strong class="paid-status" :class="order.orderStatus">{{ getPaymentStatusLabel(order.orderStatus) }}</strong>
              </div>
            </div>

            <!-- Fulfillment Info -->
            <div class="pickup-info-box">
              <h4>Metode Pengambilan:</h4>
              <p v-if="order.fulfillmentMethod === 'pickup'">
                <strong>Ambil Mandiri di Toko Fisik (dbb_luxe Pasar Baru Jakarta)</strong><br />
                Tunjukkan kode order <strong>{{ order.orderCode }}</strong> ke kasir saat status berubah menjadi <em>Siap Diambil</em>.
              </p>
              <p v-else>
                <strong>Pengiriman ke Alamat:</strong><br />
                {{ order.shippingAddress || 'Alamat dalam konfirmasi admin' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mockOrders } from '../../../data/mockJastipData'

const route = useRoute()
const orderCode = route.params.orderCode as string

const order = computed(() => {
  return mockOrders.find(o => o.orderCode === orderCode) || mockOrders[0]
})

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending_approval: 'Menunggu ACC Admin',
    pending_payment: 'Disetujui (Menunggu Bayar)',
    payment_uploaded: 'Bukti Diupload',
    verified: 'Pembayaran Terverifikasi',
    purchasing: 'Sedang Dibelikan di Toko Asal',
    arrived: 'Barang Tiba di Indonesia',
    ready_pickup: 'Siap Diambil di Toko',
    completed: 'Pesanan Selesai',
    rejected: 'Pesanan Ditolak',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa'
  }
  return map[st] || st
}

const getPaymentStatusLabel = (st: string) => {
  if (st === 'pending_approval') return 'Menunggu ACC Admin (Belum Ditagih)'
  if (st === 'pending_payment') return 'Menunggu Pembayaran Transfer'
  if (st === 'payment_uploaded') return 'Bukti Terkirim (Verifikasi Admin)'
  if (st === 'rejected') return 'Pesanan Dibatalkan / Ditolak'
  return 'Terverifikasi Lunas'
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.order-detail-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1040px;
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

.order-hero-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.type-tag {
  font-size: 0.72rem;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.order-heading {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin: 6px 0 2px;
}

.order-created {
  font-size: 0.8rem;
  color: var(--color-text-muted, #64748B);
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.status-banner {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
}

.status-banner.purchasing {
  background: #E0E7FF;
  color: #4338CA;
}

.status-banner.ready_pickup {
  background: #DCFCE7;
  color: #166534;
}

.status-banner.pending_payment {
  background: #FEF3C7;
  color: #92400E;
}

.status-banner.pending_approval {
  background: #FEF9C3;
  color: #854D0E;
  border: 1px dashed #CA8A04;
}

.status-banner.payment_uploaded {
  background: #DBEAFE;
  color: #1D4ED8;
}

.status-banner.rejected {
  background: #FEE2E2;
  color: #B91C1C;
}

.btn-hero-pay {
  background: #D97706;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-hero-pay.locked {
  background: #E2E8F0;
  color: #64748B;
  cursor: not-allowed;
}

.btn-hero-pay.waiting-check {
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

/* Informative Status Alert */
.status-alert-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid transparent;
}

.alert-approval {
  background: #FEFCE8;
  border-color: #FEF08A;
  color: #713F12;
}

.alert-approved {
  background: #F0FDF4;
  border-color: #BBF7D0;
  color: #166534;
}

.alert-rejected {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #991B1B;
}

.alert-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.alert-text h4 {
  margin: 0 0 4px;
  font-size: 0.95rem;
  font-weight: 700;
}

.alert-text p {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.45;
}

.sub-alert-note {
  display: block;
  margin-top: 4px;
  font-size: 0.78rem;
  opacity: 0.85;
}

.btn-alert-pay {
  margin-left: auto;
  background: #16A34A;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.order-grid-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 28px;
}

.box-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px;
}

.box-head {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

/* Timeline */
.timeline-stepper {
  display: flex;
  flex-direction: column;
}

.timeline-step {
  display: flex;
  gap: 16px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-secondary, #E4E7EB);
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 2px var(--color-secondary, #E4E7EB);
}

.step-dot.active {
  background: var(--color-primary, #4A5D73);
  box-shadow: 0 0 0 2px var(--color-primary, #4A5D73);
}

.step-line {
  width: 2px;
  flex: 1;
  background: var(--color-secondary, #E4E7EB);
  margin: 4px 0;
  min-height: 40px;
}

.step-content {
  padding-bottom: 24px;
  flex: 1;
}

.step-time {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 2px;
}

.step-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.step-note {
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.45;
  margin-bottom: 8px;
}

.receipt-proof-preview {
  margin-top: 8px;
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  padding: 10px;
}

.proof-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 6px;
}

.proof-img-wrap {
  max-width: 260px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-secondary, #E4E7EB);
}

.proof-img-wrap img {
  width: 100%;
  display: block;
}

/* Items List */
.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.order-item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.it-info strong {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
}

.it-info span {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.it-price {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.financial-breakdown {
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.f-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
}

.f-row.total {
  border-top: 1px dashed var(--color-secondary, #E4E7EB);
  padding-top: 8px;
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
}

.total-bold {
  color: var(--color-primary, #4A5D73);
  font-size: 1.2rem;
}

.paid-status {
  color: #166534;
}

.pickup-info-box {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  padding: 12px;
}

.pickup-info-box h4 {
  font-size: 0.8rem;
  color: var(--color-primary, #4A5D73);
  margin-bottom: 4px;
}

.pickup-info-box p {
  font-size: 0.82rem;
  color: var(--color-text, #1E293B);
  line-height: 1.4;
}

@media (max-width: 800px) {
  .order-grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>
