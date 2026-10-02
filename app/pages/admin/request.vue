<template>
  <div class="admin-requests-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Permintaan Titip Produk (Request)</h1>
        <p class="page-subtitle">Tinjau barang yang diajukan customer dan kirimkan penawaran harga resmi (Quote) untuk dititipkan pada trip luar negeri.</p>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Barang Request</th>
            <th>Customer</th>
            <th>Negara Tujuan</th>
            <th>Status</th>
            <th>Harga Penawaran</th>
            <th>Aksi Penawaran</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id">
            <td class="col-item">
              <div class="thumb">
                <img :src="r.referenceImageUrl" :alt="r.productName" />
              </div>
              <div class="info">
                <strong>{{ r.productName }}</strong>
                <p class="desc">{{ r.description }}</p>
                <a v-if="r.referenceLink" :href="r.referenceLink" target="_blank" class="ref-link">Lihat Link Referensi &rarr;</a>
              </div>
            </td>
            <td>
              <strong>{{ r.userName }}</strong>
              <span class="sub-txt">{{ r.createdAt }}</span>
            </td>
            <td>
              <span class="country-tag">{{ r.targetCountry }}</span>
            </td>
            <td>
              <span class="status-badge" :class="r.status">
                {{ formatStatus(r.status) }}
              </span>
            </td>
            <td>
              <strong v-if="r.quotedPrice" class="quote-val">{{ formatRupiah(r.quotedPrice) }}</strong>
              <span v-else class="sub-txt">Belum diberi penawaran</span>
            </td>
            <td>
              <button class="btn-quote" @click="openQuoteModal(r)">
                {{ r.status === 'quoted' ? 'Ubah Penawaran' : 'Kirim Penawaran' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form Input Quote -->
    <div v-if="selectedRequest" class="modal-backdrop" @click.self="selectedRequest = null">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Kirim Penawaran Harga - {{ selectedRequest.productName }}</h3>
          <button class="close-x" @click="selectedRequest = null">&times;</button>
        </div>

        <form @submit.prevent="submitQuote" class="modal-form">
          <div class="f-group">
            <label>Total Harga Penawaran Bersih (IDR):</label>
            <input v-model.number="quotePrice" type="number" placeholder="Contoh: 420000" required />
            <span class="calc-hint">*Sudah mencakup harga estimasi toko luar negeri + fee jastip admin.</span>
          </div>

          <div class="f-group">
            <label>Catatan Penawaran untuk Customer:</label>
            <textarea v-model="quoteNote" rows="3" placeholder="Contoh: Barang tersedia di store Tokyo Station. Harga include bubble wrap tebal."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="selectedRequest = null">Batal</button>
            <button type="submit" class="btn-save">Kirim Penawaran ke Customer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockProductRequests, type ProductRequest } from '../../data/mockJastipData'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()
const requests = ref<ProductRequest[]>([...mockProductRequests])
const selectedRequest = ref<ProductRequest | null>(null)

const quotePrice = ref(420000)
const quoteNote = ref('')

const openQuoteModal = (r: ProductRequest) => {
  selectedRequest.value = r
  quotePrice.value = r.quotedPrice || 420000
  quoteNote.value = r.quoteNote || 'Estimasi harga store resmi + fee titip.'
}

const submitQuote = () => {
  if (selectedRequest.value) {
    selectedRequest.value.status = 'quoted'
    selectedRequest.value.quotedPrice = quotePrice.value
    selectedRequest.value.quoteNote = quoteNote.value

    showToast({
      title: 'Penawaran Terkirim!',
      message: `Penawaran ${formatRupiah(quotePrice.value)} telah dikirim ke customer.`,
      type: 'success'
    })
    selectedRequest.value = null
  }
}

const formatStatus = (st: string) => {
  const map: { [key: string]: string } = {
    pending: 'Menunggu Review',
    reviewed: 'Dicek',
    quoted: 'Penawaran Terkirim',
    accepted: 'Disetujui Customer',
    rejected: 'Ditolak'
  }
  return map[st] || st
}

const formatRupiah = (val: number) => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
</script>

<style scoped>
.admin-requests-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
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

.col-item {
  display: flex;
  gap: 12px;
  max-width: 380px;
}

.thumb {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info strong {
  display: block;
  font-size: 0.88rem;
  margin-bottom: 2px;
}

.desc {
  font-size: 0.76rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.35;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ref-link {
  font-size: 0.72rem;
  color: var(--color-primary, #4A5D73);
  text-decoration: none;
  font-weight: 700;
}

.sub-txt {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted, #64748B);
}

.country-tag {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 700;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.quoted {
  background: #DCFCE7;
  color: #166534;
}

.quote-val {
  color: var(--color-primary, #4A5D73);
  font-size: 0.95rem;
}

.btn-quote {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  padding: 24px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.close-x {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.f-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.f-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.f-group input, .f-group textarea {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  outline: none;
}

.calc-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
}

.btn-cancel {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-save {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
