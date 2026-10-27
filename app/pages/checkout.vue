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

          <!-- Fulfillment / Shipping Address -->
          <div class="section-box">
            <h3 class="box-title">2. Alamat Pengiriman</h3>
            <p class="section-sub-text">
              dbb_luxe beroperasi penuh secara online. Seluruh pesanan dikemas rapi dan dikirimkan langsung oleh admin ke alamat Anda.
            </p>
            <div class="shipping-address-box">
              <label>Alamat Lengkap Tujuan (Wajib Diisi):</label>
              <textarea v-model="shippingAddress" rows="3" placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos..."></textarea>
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
import { mockOrders } from '../data/mockJastipData'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import type { ApiProduct } from '../composables/useProducts'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const { showToast } = useToast()

const productId = route.query.productId as string
const qty = ref(Number(route.query.qty) || 1)

const { data: dbProducts } = await useFetch<ApiProduct[]>('/api/products')

const itemProduct = computed(() => {
  if (dbProducts.value && dbProducts.value.length > 0) {
    const found = dbProducts.value.find(p => String(p.id) === String(productId) || p.slug === String(productId))
    if (found) return found
    return dbProducts.value[0]
  }
  return {
    id: 1,
    name: 'Produk',
    slug: 'produk',
    price: 0,
    image: '',
    productType: 'ready',
    tripId: null,
    trip: null
  } as unknown as ApiProduct
})

const customerUsername = ref(currentUser.value?.username || '')
const customerPhone = ref(currentUser.value?.phone_number || '')
const fulfillment = ref<'shipping'>('shipping')
const shippingAddress = ref('')
const paymentType = ref<'full' | 'dp'>('full')

const subtotal = computed(() => itemProduct.value.price * qty.value)
const totalTagihan = computed(() => subtotal.value)

const handleCreateOrder = () => {
  if (!shippingAddress.value.trim()) {
    showToast('Alamat Wajib Diisi', 'Mohon masukkan alamat lengkap pengiriman pesanan Anda.', 'warning')
    return
  }
  const newOrderCode = (itemProduct.value.productType === 'ready' ? 'RDY-' : 'JST-') + '20261002-' + Math.floor(100 + Math.random() * 900)
  
  // Add to mockOrders
  mockOrders.unshift({
    id: 'ord-new-' + Date.now(),
    orderCode: newOrderCode,
    userId: String(currentUser.value?.id || 'user-01'),
    customerName: customerUsername.value || currentUser.value?.username || 'Customer',
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
    uniqueCode: 0,
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

  showToast('Pesanan Berhasil Diajukan!', `Kode pesanan #${newOrderCode}. Menunggu persetujuan (ACC) dari Admin dbb_luxe.`, 'success')
  
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
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #7A6A55);
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
}

.section-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 20px;
}

.box-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
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
  color: var(--color-text, #2B2116);
}

.input-item input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
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
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 10px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.15s;
}

.radio-card.selected {
  border-color: var(--color-primary, #8C6D3F);
  background: var(--color-canvas, #FFFBF2);
}

.radio-card input {
  accent-color: var(--color-primary, #8C6D3F);
  margin-top: 3px;
}

.opt-text strong {
  display: block;
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  margin-bottom: 2px;
}

.opt-text span {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
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
  color: var(--color-text, #2B2116);
}

.shipping-address-box textarea {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
  outline: none;
  font-family: inherit;
}

/* Summary Card */
.summary-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  padding: 24px;
  position: sticky;
  top: 90px;
}

.summary-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
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
  color: var(--color-text, #2B2116);
  display: block;
}

.item-qty-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.item-price {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  white-space: nowrap;
}

.subtotal-calc {
  border-top: 1px solid var(--color-secondary, #EFE1C6);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted, #7A6A55);
}

.unique-code-row {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.total-row {
  border-top: 1px dashed var(--color-secondary, #EFE1C6);
  padding-top: 10px;
  margin-top: 4px;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
}

.total-price {
  color: var(--color-primary, #8C6D3F);
  font-size: 1.35rem;
}

.dp-note-row {
  background: var(--color-secondary, #EFE1C6);
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-primary, #8C6D3F);
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
  background: var(--color-primary, #8C6D3F);
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
  background: var(--color-primary-hover, #6F5530);
}

@media (max-width: 860px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}
</style>
