<template>
  <div class="checkout-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Checkout & Pembayaran</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Ringkasan Pemesanan</h1>
        <p class="page-subtitle">Periksa rincian barang, pilih metode pengambilan, dan selesaikan transfer manual sebelum batas waktu.</p>
      </div>

      <div class="checkout-layout">
        <!-- Left: Form details -->
        <div class="checkout-form-col">
          <!-- Customer Info -->
          <div class="section-box">
            <h3 class="box-title">1. Data Pemesan</h3>
            <div class="grid-2">
              <div class="input-item">
                <label>Nama Lengkap:</label>
                <input v-model="customerName" type="text" placeholder="Nama Anda" required />
              </div>
              <div class="input-item">
                <label>Nomor WhatsApp (Aktif):</label>
                <input v-model="customerPhone" type="tel" placeholder="0812xxxx" required />
              </div>
            </div>
          </div>

          <!-- Fulfillment Method -->
          <div class="section-box">
            <h3 class="box-title">2. Metode Pengambilan Barang</h3>
            <div class="fulfillment-options">
              <label class="radio-card" :class="{ selected: fulfillment === 'pickup' }">
                <input type="radio" value="pickup" v-model="fulfillment" />
                <div class="opt-text">
                  <strong>Ambil Mandiri di Toko Fisik (Gratis)</strong>
                  <span>dbb_luxe Store Jakarta (Pasar Baru). Barang langsung diambil saat siap/tiba.</span>
                </div>
              </label>

              <label class="radio-card" :class="{ selected: fulfillment === 'shipping' }">
                <input type="radio" value="shipping" v-model="fulfillment" />
                <div class="opt-text">
                  <strong>Pengiriman Ekspedisi Manual (JNE / J&T)</strong>
                  <span>Untuk luar kota. Ongkir dihitung manual oleh admin setelah barang ditimbang.</span>
                </div>
              </label>
            </div>

            <div v-if="fulfillment === 'shipping'" class="shipping-address-box">
              <label>Alamat Lengkap Pengiriman:</label>
              <textarea v-model="shippingAddress" rows="2" placeholder="Nama Jalan, No. Rumah, RT/RW, Kecamatan, Kota, Kode Pos..."></textarea>
            </div>
          </div>

          <!-- Payment Scheme (Full vs DP for Jastip) -->
          <div class="section-box">
            <h3 class="box-title">3. Skema Pembayaran</h3>
            <div class="payment-scheme-grid">
              <label class="radio-card" :class="{ selected: paymentType === 'full' }">
                <input type="radio" value="full" v-model="paymentType" />
                <div class="opt-text">
                  <strong>Pembayaran Penuh (100% Lunas)</strong>
                  <span>Lebih praktis, tidak perlu konfirmasi transfer dua kali.</span>
                </div>
              </label>

              <label class="radio-card" :class="{ selected: paymentType === 'dp' }">
                <input type="radio" value="dp" v-model="paymentType" />
                <div class="opt-text">
                  <strong>DP 50% Sekarang (Khusus Jastip)</strong>
                  <span>Pelunasan 50% sisanya dibayarkan saat barang tiba di Jakarta.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary & Total with Unique Code -->
        <div class="checkout-summary-col">
          <div class="summary-card">
            <h3 class="summary-title">Rincian Belanja</h3>

            <div class="summary-items">
              <div class="item-row">
                <div class="item-meta">
                  <span class="item-name">{{ itemProduct.name }}</span>
                  <span class="item-qty-sub">{{ qty }} pcs &bull; {{ itemProduct.productType === 'ready' ? 'Ready Stock' : 'Jastip' }}</span>
                </div>
                <div class="item-price">{{ formatRupiah(itemProduct.price * qty) }}</div>
              </div>
            </div>

            <div class="subtotal-calc">
              <div class="calc-row">
                <span>Subtotal Barang:</span>
                <span>{{ formatRupiah(subtotal) }}</span>
              </div>
              <div class="calc-row unique-code-row">
                <span>Kode Unik Transfer (3 Digit):</span>
                <span class="unique-highlight">+{{ uniqueCode }}</span>
              </div>
              <div class="calc-row total-row">
                <span>Total Tagihan:</span>
                <span class="total-price">{{ formatRupiah(totalTagihan) }}</span>
              </div>
              <div v-if="paymentType === 'dp'" class="dp-note-row">
                <span>Tagihan DP 50% Hari Ini:</span>
                <strong class="dp-price">{{ formatRupiah(Math.ceil(totalTagihan / 2)) }}</strong>
              </div>
            </div>

            <!-- Approval Notice -->
            <div class="transfer-notice">
              <span class="notice-icon">📋</span>
              <p>Pesanan akan diperiksa ketersediaannya terlebih dahulu oleh Admin dbb_luxe (cek kuota bagasi trip & stok toko). Setelah di-ACC, pembayaran dapat ditransfer.</p>
            </div>

            <button class="btn-create-order" @click="handleCreateOrder">
              Ajukan Pesanan (Menunggu ACC Admin) &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUnifiedProducts, mockOrders } from '../data/mockJastipData'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const productId = route.query.productId as string
const qty = ref(Number(route.query.qty) || 1)

const itemProduct = computed(() => {
  return mockUnifiedProducts.find(p => p.id === productId) || mockUnifiedProducts[0]
})

const customerName = ref('Siti Rahmawati')
const customerPhone = ref('0812-3456-7890')
const fulfillment = ref<'pickup' | 'shipping'>('pickup')
const shippingAddress = ref('')
const paymentType = ref<'full' | 'dp'>('full')

const subtotal = computed(() => itemProduct.value.price * qty.value)
const uniqueCode = ref(Math.floor(100 + Math.random() * 899))
const totalTagihan = computed(() => subtotal.value + uniqueCode.value)

const handleCreateOrder = () => {
  const newOrderCode = (itemProduct.value.productType === 'ready' ? 'RDY-' : 'JST-') + '20261002-' + Math.floor(100 + Math.random() * 900)
  
  // Add to mockOrders
  mockOrders.unshift({
    id: 'ord-new-' + Date.now(),
    orderCode: newOrderCode,
    userId: 'user-01',
    customerName: customerName.value,
    customerPhone: customerPhone.value,
    orderType: itemProduct.value.productType,
    tripId: itemProduct.value.tripId,
    tripTitle: itemProduct.value.tripTitle,
    items: [
      {
        id: 'item-new-' + Date.now(),
        productId: itemProduct.value.id,
        productSlug: itemProduct.value.slug,
        productName: itemProduct.value.name,
        variant: 'Standard',
        priceAtOrder: itemProduct.value.price,
        quantity: qty.value,
        subtotal: subtotal.value
      }
    ],
    subtotal: subtotal.value,
    uniqueCode: uniqueCode.value,
    totalAmount: totalTagihan.value,
    paymentType: paymentType.value,
    dpAmount: paymentType.value === 'dp' ? Math.ceil(totalTagihan.value / 2) : 0,
    paidAmount: 0,
    remainingAmount: totalTagihan.value,
    orderStatus: 'pending_approval',
    fulfillmentMethod: fulfillment.value,
    shippingAddress: shippingAddress.value,
    logs: [
      {
        id: 'log-' + Date.now(),
        fromStatus: '',
        toStatus: 'pending_approval',
        title: 'Pesanan Diajukan',
        note: 'Menunggu peninjauan & persetujuan (ACC) dari Admin dbb_luxe untuk ketersediaan barang.',
        createdAt: 'Baru saja'
      }
    ],
    createdAt: 'Baru saja'
  })

  showToast({
    title: 'Pesanan Berhasil Diajukan!',
    message: `Kode pesanan #${newOrderCode}. Menunggu persetujuan (ACC) dari Admin dbb_luxe.`,
    type: 'success'
  })
  
  // Redirect to order detail page (not directly to pay)
  router.push(`/orders/${newOrderCode}`)
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.checkout-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1140px;
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
  margin-bottom: 30px;
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

.checkout-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
}

.section-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 20px;
}

.box-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-item label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.input-item input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  outline: none;
}

.fulfillment-options, .payment-scheme-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.15s;
}

.radio-card.selected {
  border-color: var(--color-primary, #4A5D73);
  background: var(--color-canvas, #F4F6F8);
}

.radio-card input {
  accent-color: var(--color-primary, #4A5D73);
  margin-top: 3px;
}

.opt-text strong {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  margin-bottom: 2px;
}

.opt-text span {
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.35;
}

.shipping-address-box {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shipping-address-box label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.shipping-address-box textarea {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
  outline: none;
  font-family: inherit;
}

/* Summary Card */
.summary-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 14px;
  padding: 24px;
  position: sticky;
  top: 90px;
}

.summary-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.summary-items {
  margin-bottom: 16px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  display: block;
}

.item-qty-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
}

.item-price {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  white-space: nowrap;
}

.subtotal-calc {
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
}

.unique-code-row {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.total-row {
  border-top: 1px dashed var(--color-secondary, #E4E7EB);
  padding-top: 10px;
  margin-top: 4px;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
}

.total-price {
  color: var(--color-primary, #4A5D73);
  font-size: 1.35rem;
}

.dp-note-row {
  background: var(--color-secondary, #E4E7EB);
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-primary, #4A5D73);
  margin-top: 6px;
}

.transfer-notice {
  display: flex;
  gap: 8px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #92400E;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  line-height: 1.4;
  margin: 16px 0 20px;
}

.btn-create-order {
  width: 100%;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-create-order:hover {
  background: var(--color-primary-hover, #384759);
}

@media (max-width: 860px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}
</style>
