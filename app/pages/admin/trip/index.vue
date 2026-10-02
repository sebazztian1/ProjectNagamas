<template>
  <div class="admin-trips-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Kelola Jadwal Jastip (Trip)</h1>
        <p class="page-subtitle">Atur tanggal buka & tutup PO, kuota koper belanja, estimasi tiba di Indonesia, dan status keberangkatan trip.</p>
      </div>
      <button class="btn-create-trip" @click="showModal = true">+ Buat Jadwal Trip Baru</button>
    </div>

    <!-- Trips Grid -->
    <div class="trip-cards-grid">
      <div v-for="t in trips" :key="t.id" class="trip-admin-card">
        <div class="card-cover-bar" :style="{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url(${t.coverImageUrl})` }">
          <div class="cover-top">
            <span class="flag-chip">{{ t.flag }} {{ t.country }}</span>
            <span class="status-chip" :class="t.status">{{ t.status === 'open' ? 'Open PO' : 'Tutup PO' }}</span>
          </div>
          <h3 class="trip-name">{{ t.title }}</h3>
          <span class="trip-area">{{ t.cityOrArea }}</span>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span>Tutup PO:</span>
            <strong>{{ t.closeDate }}</strong>
          </div>
          <div class="info-row">
            <span>Estimasi Tiba:</span>
            <strong>{{ t.estimatedArrivalDate }}</strong>
          </div>
          <div class="info-row">
            <span>Kurs Valuta:</span>
            <strong>1 {{ t.currency }} = Rp {{ t.exchangeRate }}</strong>
          </div>
          <div class="info-row">
            <span>Slot Kuota:</span>
            <strong>{{ t.quotaFilled }} / {{ t.quotaTotal }} terisi</strong>
          </div>

          <div class="card-actions-grid">
            <NuxtLink :to="`/admin/trip/${t.id}`" class="btn-detail-trip">
              Detail Trip & Daftar Belanja &rarr;
            </NuxtLink>
            <button v-if="t.status === 'open'" class="btn-close-po" @click="closeTrip(t.id)">
              Tutup PO Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Create Trip -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>Buat Jadwal Trip Jastip Baru</h3>
          <button class="close-x" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveTrip" class="trip-form">
          <div class="f-group">
            <label>Judul Trip:</label>
            <input v-model="form.title" type="text" placeholder="Contoh: Bangkok Mega Fashion & Snack Batch 5" required />
          </div>

          <div class="f-row-2">
            <div class="f-group">
              <label>Negara Tujuan:</label>
              <input v-model="form.country" type="text" placeholder="Thailand" required />
            </div>
            <div class="f-group">
              <label>Kota / Area Belanja:</label>
              <input v-model="form.cityOrArea" type="text" placeholder="Bangkok (Platinum & Big C)" required />
            </div>
          </div>

          <div class="f-row-2">
            <div class="f-group">
              <label>Tanggal Tutup PO (Cut-off):</label>
              <input v-model="form.closeDate" type="date" required />
            </div>
            <div class="f-group">
              <label>Estimasi Barang Tiba:</label>
              <input v-model="form.estimatedArrivalDate" type="date" required />
            </div>
          </div>

          <div class="f-row-2">
            <div class="f-group">
              <label>Mata Uang & Kurs IDR:</label>
              <input v-model.number="form.exchangeRate" type="number" placeholder="470" required />
            </div>
            <div class="f-group">
              <label>Default Fee Jastip (IDR):</label>
              <input v-model.number="form.feeValue" type="number" placeholder="30000" required />
            </div>
          </div>

          <div class="f-group">
            <label>Deskripsi & Ketentuan Trip:</label>
            <textarea v-model="form.description" rows="2" placeholder="Catatan untuk customer..."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-save">Simpan & Buka PO</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockJastipTrips, type JastipTrip } from '../../../data/mockJastipData'
import { useToast } from '../../../composables/useToast'

const { showToast } = useToast()
const trips = ref<JastipTrip[]>([...mockJastipTrips])
const showModal = ref(false)

const form = ref({
  title: '',
  country: 'Thailand',
  cityOrArea: 'Bangkok',
  closeDate: '2026-11-01',
  estimatedArrivalDate: '2026-11-10',
  exchangeRate: 470,
  feeValue: 30000,
  description: ''
})

const closeTrip = (id: string) => {
  const t = trips.value.find(item => item.id === id)
  if (t) {
    t.status = 'closed'
    showToast({
      title: 'Trip Ditutup',
      message: `${t.title} kini berstatus Tutup PO. Customer tidak dapat memesan lagi.`,
      type: 'info'
    })
  }
}

const saveTrip = () => {
  const newTrip: JastipTrip = {
    id: 'trip-' + Date.now(),
    title: form.value.title,
    slug: form.value.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    country: form.value.country,
    flag: '✈️',
    cityOrArea: form.value.cityOrArea,
    description: form.value.description,
    terms: 'Pelunasan wajib sebelum barang dikirim/diambil.',
    coverImageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    currency: 'THB',
    exchangeRate: form.value.exchangeRate,
    feeType: 'flat',
    feeValue: form.value.feeValue,
    openDate: '2026-10-02',
    closeDate: form.value.closeDate,
    departureDate: form.value.closeDate,
    estimatedArrivalDate: form.value.estimatedArrivalDate,
    quotaTotal: 50,
    quotaFilled: 0,
    status: 'open'
  }
  trips.value.unshift(newTrip)
  showModal.value = false
  showToast({
    title: 'Trip Berhasil Dibuat',
    message: 'Jadwal trip baru sekarang aktif untuk dipesan.',
    type: 'success'
  })
}
</script>

<style scoped>
.admin-trips-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
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

.btn-create-trip {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}

.trip-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.trip-admin-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-cover-bar {
  padding: 16px;
  color: #ffffff;
  background-size: cover;
  background-position: center;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cover-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flag-chip {
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-chip {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-chip.open {
  background: #10B981;
}

.status-chip.closed {
  background: #64748B;
}

.trip-name {
  font-size: 1.15rem;
  font-weight: 800;
  margin-top: 16px;
}

.trip-area {
  font-size: 0.75rem;
  color: #CBD5E1;
}

.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
}

.info-row strong {
  color: var(--color-text, #1E293B);
}

.card-actions-grid {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-detail-trip {
  text-decoration: none;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 9px;
  border-radius: 6px;
}

.btn-close-po {
  background: none;
  border: 1px solid #DC2626;
  color: #DC2626;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 7px;
  border-radius: 6px;
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
  max-width: 560px;
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

.trip-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.f-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
