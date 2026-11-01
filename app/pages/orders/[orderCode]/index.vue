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
          <span class="type-tag">
            {{ order.orderType === 'ready' ? 'Ready Stock' : `Jastip Pre-Order${order.tripTitle ? ' • ' + order.tripTitle : ''}` }}
          </span>
          <h1 class="order-heading">Pesanan #{{ order.orderCode }}</h1>
          <p class="order-created">Diajukan pada {{ order.createdAt }} WIB</p>
        </div>

        <div class="hero-right">
          <span class="status-banner" :class="order.orderStatus">
            {{ formatStatus(order.orderStatus) }}
          </span>
          <div class="hero-btn-row">
            <button
              v-if="order.orderStatus === 'pending_approval' || order.orderStatus === 'pending_payment'"
              type="button"
              class="btn-cancel-hero"
              @click="handleCancelOrder"
            >
              Batalkan Pesanan
            </button>
            <NuxtLink
              v-if="order.orderStatus === 'pending_payment'"
              :to="`/orders/${order.orderCode}/bayar`"
              class="btn-hero-pay"
            >
              Bayar &amp; Upload Bukti &rarr;
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
              ⏳ Menunggu Verifikasi
            </span>
          </div>
        </div>
      </div>

      <!-- Informative Status Alerts -->
      <div v-if="order.orderStatus === 'pending_approval'" class="status-alert-banner alert-approval">
        <div class="alert-text">
          <h4>Pesanan Sedang Ditinjau Admin (Tahap Pengajuan)</h4>
          <p>
            Admin dbb_luxe sedang memeriksa ketersediaan stok ready atau sisa kuota bagasi trip serta menghitung perkiraan ongkir. Rekening dan instruksi transfer akan terbuka otomatis setelah di-ACC.
          </p>
        </div>
      </div>

      <div v-else-if="order.orderStatus === 'pending_payment'" class="status-alert-banner alert-approved">
        <div class="alert-text">
          <h4>Pesanan Disetujui (ACC) — Batas Waktu Pembayaran 24 Jam Aktif</h4>
          <p>
            Silakan transfer sesuai nominal tagihan.
            <strong v-if="deadlineCountdown">Sisa waktu bayar: {{ deadlineCountdown }}</strong>
          </p>
        </div>
        <NuxtLink :to="`/orders/${order.orderCode}/bayar`" class="btn-alert-pay">
          Lihat Rekening &amp; Upload Bukti &rarr;
        </NuxtLink>
      </div>

      <div v-else-if="order.orderStatus === 'rejected' || order.orderStatus === 'cancelled' || order.orderStatus === 'expired'" class="status-alert-banner alert-rejected">
        <div class="alert-text">
          <h4>{{ formatStatus(order.orderStatus) }}</h4>
          <p>
            <strong>Catatan / Alasan:</strong>
            {{ order.rejectionReason || order.adminNote || 'Pesanan tidak dilanjutkan.' }}
          </p>
        </div>
      </div>

      <div class="order-grid-layout">
        <!-- Left: Tracking Timeline & Receipt Photos -->
        <div class="tracking-col">
          <div class="box-card">
            <h3 class="box-head">Lacak Progres Pesanan (Audit Trail)</h3>

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
                    <span class="proof-label">📷 Foto Bukti Pembelian / Pengiriman dari Admin:</span>
                    <div class="proof-img-wrap">
                      <a :href="log.proofImageUrl" target="_blank" rel="noopener">
                        <img :src="log.proofImageUrl" alt="Bukti Struk Belanja" />
                      </a>
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
            <h3 class="box-head">Rincian Barang &amp; Tagihan</h3>

            <div class="order-items-list">
              <div v-for="it in order.items" :key="it.id" class="order-item-row">
                <div class="it-info">
                  <strong>{{ it.productName }}</strong>
                  <span>{{ it.quantity }} pcs &bull; {{ it.variant || 'Standard' }} &bull; @{{ formatRupiah(it.priceAtOrder) }}</span>
                </div>
                <div class="it-price">{{ formatRupiah(it.subtotal) }}</div>
              </div>
            </div>

            <div class="financial-breakdown">
              <div class="f-row">
                <span>Subtotal Barang:</span>
                <span>{{ formatRupiah(order.subtotal) }}</span>
              </div>
              <div v-if="order.shippingCost > 0" class="f-row">
                <span>Ongkos Kirim:</span>
                <span>{{ formatRupiah(order.shippingCost) }}</span>
              </div>
              <div class="f-row total">
                <span>Total Tagihan:</span>
                <span class="total-bold">{{ formatRupiah(order.totalAmount) }}</span>
              </div>
              <div v-if="order.paymentType === 'dp'" class="f-row">
                <span>Skema Pembayaran:</span>
                <strong>DP 50% ({{ formatRupiah(order.dpAmount) }})</strong>
              </div>
              <div v-if="order.paidAmount > 0" class="f-row">
                <span>Sudah Dibayar (Terverifikasi):</span>
                <strong style="color: #166534">{{ formatRupiah(order.paidAmount) }}</strong>
              </div>
              <div v-if="order.remainingAmount > 0 && order.paidAmount > 0" class="f-row">
                <span>Sisa Pelunasan:</span>
                <strong style="color: #B91C1C">{{ formatRupiah(order.remainingAmount) }}</strong>
              </div>
              <div class="f-row">
                <span>Status Pembayaran:</span>
                <strong class="paid-status" :class="order.orderStatus">{{ getPaymentStatusLabel(order.orderStatus) }}</strong>
              </div>
            </div>

            <!-- Fulfillment / Shipping Address Info -->
            <div class="pickup-info-box">
              <h4>Alamat Pengiriman Tujuan:</h4>
              <p>
                <strong>{{ order.recipientName }} ({{ order.recipientPhone }})</strong><br />
                {{ order.shippingAddress || 'Alamat dalam konfirmasi admin' }}
              </p>
              <p v-if="order.adminNote" class="admin-note-box">
                <strong>Catatan Admin / Resi Kurir:</strong><br />
                {{ order.adminNote }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '../../../composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { showToast } = useToast()
const orderCode = route.params.orderCode as string

const { data: order, refresh } = await useFetch<any>(`/api/orders/${orderCode}`)

const nowTs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    nowTs.value = Date.now()
  }, 15000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const deadlineCountdown = computed(() => {
  if (!order.value?.paymentDeadline) return ''
  const diff = Math.max(0, new Date(order.value.paymentDeadline).getTime() - nowTs.value)
  if (diff <= 0) return 'Waktu habis'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours} jam ${mins} menit`
})

const handleCancelOrder = async () => {
  if (!order.value) return
  if (!confirm(`Yakin ingin membatalkan pesanan #${order.value.orderCode}?`)) return
  try {
    await $fetch(`/api/orders/${order.value.orderCode}/cancel`, {
      method: 'PATCH',
      body: { reason: 'Dibatalkan oleh customer melalui halaman detail pesanan.' }
    })
    showToast('Pesanan Dibatalkan', `Pesanan #${order.value.orderCode} telah dibatalkan.`, 'info')
    await refresh()
  } catch (err: any) {
    showToast('Gagal Membatalkan', err?.data?.message || 'Tidak dapat membatalkan pesanan.', 'warning')
  }
}

const formatStatus = (st: string) => {
  const map: Record<string, string> = {
    pending_approval: 'Menunggu ACC Admin',
    pending_payment: 'Disetujui (Menunggu Bayar)',
    payment_uploaded: 'Bukti Diupload',
    verified: 'Pembayaran Terverifikasi',
    purchasing: 'Sedang Dibelikan di Toko Asal',
    arrived: 'Barang Tiba di Indonesia',
    ready_handover: 'Sedang Dikirim ke Alamat Tujuan',
    ready_pickup: 'Sedang Dikirim ke Alamat Tujuan',
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
  if (st === 'payment_uploaded') return 'Bukti Terkirim (Menunggu Verifikasi Admin)'
  if (st === 'rejected' || st === 'cancelled' || st === 'expired') return 'Tidak Berlaku / Dibatalkan'
  return 'Terverifikasi'
}

const formatRupiah = (val: number) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
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

.order-hero-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.type-tag {
  font-size: 0.72rem;
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}

.order-heading {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 6px 0 2px;
}

.order-created {
  font-size: 0.8rem;
  color: var(--color-text-muted, #7A6A55);
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.hero-btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-cancel-hero {
  background: #FEE2E2;
  color: #B91C1C;
  border: 1px solid #FCA5A5;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-hero-pay {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
}

.btn-hero-pay.locked,
.btn-hero-pay.waiting-check {
  background: #F3F4F6;
  color: #4B5563;
}

.status-banner {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
}

.status-banner.purchasing,
.status-banner.arrived {
  background: #F3E6CC;
  color: #6F5530;
}

.status-banner.verified,
.status-banner.ready_handover,
.status-banner.completed {
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

.status-banner.rejected,
.status-banner.cancelled,
.status-banner.expired {
  background: #FEE2E2;
  color: #B91C1C;
}

.status-alert-banner {
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.alert-approval {
  background: #FEFCE8;
  border: 1px solid #FDE047;
  color: #713F12;
}

.alert-approved {
  background: #ECFDF5;
  border: 1px solid #6EE7B7;
  color: #065F46;
}

.alert-rejected {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.alert-text h4 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.alert-text p {
  margin: 0;
  font-size: 0.84rem;
}

.btn-alert-pay {
  background: #059669;
  color: #ffffff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
}

.order-grid-layout {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 24px;
}

.box-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
}

.box-head {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 18px;
}

.timeline-stepper {
  display: flex;
  flex-direction: column;
}

.timeline-step {
  display: flex;
  gap: 14px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary, #8C6D3F);
  margin-top: 4px;
}

.step-line {
  width: 2px;
  flex: 1;
  background: var(--color-secondary, #EFE1C6);
  min-height: 28px;
}

.step-content {
  padding-bottom: 20px;
  flex: 1;
}

.step-time {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.step-title {
  font-size: 0.9rem;
  color: var(--color-text, #2B2116);
  margin: 2px 0 4px;
}

.step-note {
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
  line-height: 1.45;
}

.receipt-proof-preview {
  margin-top: 10px;
}

.proof-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.proof-img-wrap img {
  max-width: 220px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  margin-bottom: 14px;
}

.order-item-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.it-info {
  display: flex;
  flex-direction: column;
  font-size: 0.84rem;
}

.it-info span {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.it-price {
  font-weight: 700;
  font-size: 0.86rem;
}

.financial-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.f-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: var(--color-text-muted, #7A6A55);
}

.f-row.total {
  padding-top: 8px;
  border-top: 1px dashed var(--color-secondary, #EFE1C6);
  font-size: 0.96rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
}

.total-bold {
  color: var(--color-primary, #8C6D3F);
}

.pickup-info-box {
  background: #FFFDF8;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  padding: 14px;
  font-size: 0.82rem;
  line-height: 1.5;
}

.pickup-info-box h4 {
  margin: 0 0 6px;
  font-size: 0.88rem;
}

.pickup-info-box p {
  margin: 0;
}

.admin-note-box {
  margin-top: 10px !important;
  padding-top: 10px;
  border-top: 1px dashed var(--color-secondary, #EFE1C6);
  color: #1E40AF;
}

@media (max-width: 860px) {
  .order-grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>
