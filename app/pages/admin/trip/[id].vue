<template>
  <div class="admin-trip-detail-page" v-if="trip">
    <!-- Breadcrumb & Header -->
    <div class="breadcrumb">
      <NuxtLink to="/admin">Admin</NuxtLink>
      <span>/</span>
      <NuxtLink to="/admin/trip">Jadwal Jastip</NuxtLink>
      <span>/</span>
      <span class="active">{{ trip.title }}</span>
    </div>

    <div class="trip-head-bar">
      <div>
        <div class="country-pill">{{ trip.flag }} {{ trip.country }} &bull; {{ trip.cityOrArea }}</div>
        <h1 class="trip-title">{{ trip.title }}</h1>
        <p class="trip-sub">Tutup PO: {{ trip.closeDate }} &bull; Estimasi Tiba: {{ trip.estimatedArrivalDate }}</p>
      </div>

      <div class="head-actions">
        <button class="btn-export-csv" @click="exportCSV">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Daftar Belanja (CSV)
        </button>
      </div>
    </div>

    <!-- Sub Navigation Tabs (Daftar Belanja vs Produk vs Order) -->
    <div class="trip-subtabs">
      <button class="subtab-btn" :class="{ active: currentTab === 'shopping' }" @click="currentTab = 'shopping'">
        🛒 Daftar Belanja Admin (Shopping List)
      </button>
      <button class="subtab-btn" :class="{ active: currentTab === 'products' }" @click="currentTab = 'products'">
        📦 Katalog Produk Trip Ini
      </button>
      <button class="subtab-btn" :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">
        📑 Daftar Pesanan Masuk
      </button>
    </div>

    <!-- TAB 1: SHOPPING LIST (REKAP BELANJA DI TOKO LUAR NEGERI) -->
    <div v-if="currentTab === 'shopping'" class="shopping-list-section">
      <div class="list-head-alert">
        <span>Rekap total barang yang wajib dibeli admin di toko fisik luar negeri berdasarkan pesanan yang sudah terverifikasi:</span>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th width="40">Status</th>
              <th>Nama Barang</th>
              <th>Toko Sumber</th>
              <th>Harga Asal</th>
              <th>Total Qty</th>
              <th>Estimasi Modal</th>
              <th>Aksi Beli</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in shoppingList" :key="item.id" :class="{ 'row-bought': item.bought }">
              <td>
                <input type="checkbox" v-model="item.bought" />
              </td>
              <td>
                <strong>{{ item.name }}</strong>
                <span class="variant-text">{{ item.variant }}</span>
              </td>
              <td>
                <span class="store-tag">{{ item.store }}</span>
              </td>
              <td>{{ item.currency }} {{ item.originalPrice.toLocaleString('id-ID') }}</td>
              <td>
                <span class="qty-badge">{{ item.totalQty }} pcs</span>
              </td>
              <td><strong>{{ item.currency }} {{ (item.originalPrice * item.totalQty).toLocaleString('id-ID') }}</strong></td>
              <td>
                <button 
                  class="btn-toggle-buy" 
                  :class="{ bought: item.bought }"
                  @click="item.bought = !item.bought"
                >
                  {{ item.bought ? '✓ Sudah Dibeli' : 'Tandai Dibeli' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: PRODUCTS IN TRIP -->
    <div v-else-if="currentTab === 'products'" class="products-in-trip">
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Harga Jual (IDR)</th>
              <th>Kuota Slot</th>
              <th>Sisa Kuota</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in tripProducts" :key="p.id">
              <td>
                <strong>{{ p.name }}</strong>
                <span class="variant-text">{{ p.category }}</span>
              </td>
              <td>{{ formatRupiah(p.price) }}</td>
              <td>{{ p.quota }} slot</td>
              <td><strong class="highlight-quota">{{ p.quotaRemaining }} slot</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: ORDERS IN TRIP -->
    <div v-else class="orders-in-trip">
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode Order</th>
              <th>Customer</th>
              <th>Item Pesanan</th>
              <th>Total Tagihan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in tripOrders" :key="ord.id">
              <td><strong>{{ ord.orderCode }}</strong></td>
              <td>
                <span>{{ ord.customerName }}</span>
                <span class="variant-text">{{ ord.customerPhone }}</span>
              </td>
              <td>{{ ord.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ') }}</td>
              <td><strong>{{ formatRupiah(ord.totalAmount) }}</strong></td>
              <td>
                <span class="status-pill verified">Terverifikasi Lunas</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockJastipTrips, mockUnifiedProducts, mockOrders } from '../../../data/mockJastipData'
import { useToast } from '../../../composables/useToast'

const route = useRoute()
const { showToast } = useToast()
const tripId = route.params.id as string

const currentTab = ref<'shopping' | 'products' | 'orders'>('shopping')

const trip = computed(() => {
  return mockJastipTrips.find(t => t.id === tripId) || mockJastipTrips[0]
})

const tripProducts = computed(() => {
  return mockUnifiedProducts.filter(p => p.productType === 'jastip')
})

const tripOrders = computed(() => {
  return mockOrders.filter(o => o.orderType === 'jastip')
})

const shoppingList = ref([
  {
    id: 'shop-1',
    name: 'Shiroi Koibito White Chocolate Cookies',
    variant: 'Box isi 18 pcs',
    store: 'Haneda Airport / Don Quijote',
    currency: 'JPY',
    originalPrice: 1500,
    totalQty: 6,
    bought: true
  },
  {
    id: 'shop-2',
    name: 'Rohto Melano CC Intensive Anti-Spot Essence',
    variant: '20ml Tube',
    store: 'Matsumoto Kiyoshi Shinjuku',
    currency: 'JPY',
    originalPrice: 1100,
    totalQty: 10,
    bought: false
  },
  {
    id: 'shop-3',
    name: 'Starbucks Japan Sakura Tumbler 2026',
    variant: '473ml Limited Edition',
    store: 'Starbucks Reserve Ginza',
    currency: 'JPY',
    originalPrice: 2800,
    totalQty: 2,
    bought: false
  }
])

const exportCSV = () => {
  const headers = 'Nama Barang,Varian,Toko Sumber,Qty,Harga Asli,Status\n'
  const rows = shoppingList.value.map(i => `"${i.name}","${i.variant}","${i.store}",${i.totalQty},"${i.currency} ${i.originalPrice}",${i.bought ? 'Sudah Dibeli' : 'Belum'}`).join('\n')
  
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daftar_belanja_${trip.value.slug}.csv`
  a.click()

  showToast({
    title: 'CSV Berhasil Diekspor',
    message: 'File daftar belanja trip telah diunduh.',
    type: 'success'
  })
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.admin-trip-detail-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.trip-head-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.country-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
}

.trip-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin: 4px 0 2px;
}

.trip-sub {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
}

.btn-export-csv {
  background: #10B981;
  color: #ffffff;
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.trip-subtabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  padding-bottom: 10px;
}

.subtab-btn {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.subtab-btn.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
}

.list-head-alert {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 14px;
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-canvas, #F4F6F8);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
  vertical-align: middle;
}

.row-bought {
  background: #F0FDF4;
}

.variant-text {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted, #64748B);
}

.store-tag {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.74rem;
}

.qty-badge {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.8rem;
}

.btn-toggle-buy {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-toggle-buy.bought {
  background: #DCFCE7;
  color: #166534;
  border-color: #BBF7D0;
}

.highlight-quota {
  color: var(--color-primary, #4A5D73);
}

.status-pill.verified {
  background: #DCFCE7;
  color: #166534;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.74rem;
  font-weight: 700;
}
</style>
