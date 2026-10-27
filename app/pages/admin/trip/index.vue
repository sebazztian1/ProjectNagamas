<template>
  <div class="admin-trips-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Kelola Jadwal Jastip (Trip)</h1>
        <p class="page-subtitle">Atur tanggal buka & tutup PO, kuota koper belanja, estimasi tiba di Indonesia, dan status keberangkatan trip.</p>
      </div>
      <button class="btn-create-trip" @click="openCreateModal">+ Buat Jadwal Trip Baru</button>
    </div>

    <!-- Status Filter Tabs -->
    <div class="filter-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeStatus === 'all' }" 
        @click="activeStatus = 'all'"
      >
        Semua Trip ({{ allTrips.length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeStatus === 'open' }" 
        @click="activeStatus = 'open'"
      >
        Open PO ({{ openCount }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeStatus === 'closed' }" 
        @click="activeStatus = 'closed'"
      >
        Tutup PO ({{ closedCount }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeStatus === 'arrived' }" 
        @click="activeStatus = 'arrived'"
      >
        Barang Tiba ({{ arrivedCount }})
      </button>
    </div>

    <!-- Trips Grid -->
    <div v-if="filteredTrips.length === 0" class="empty-state">
      <p>Belum ada trip dalam kategori ini.</p>
    </div>

    <div v-else class="trip-cards-grid">
      <div v-for="t in filteredTrips" :key="t.id" class="trip-admin-card" :class="t.status">
        <!-- Clean Header -->
        <div class="card-head-bar">
          <div class="head-top-row">
            <span class="flag-chip">{{ t.flag }} {{ t.country }}</span>
            <span class="status-chip" :class="t.status">{{ formatStatusLabel(t.status) }}</span>
          </div>
          <h3 class="trip-name">{{ t.title }}</h3>
          <div class="trip-area">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{{ t.cityOrArea || 'Kota Belanja Resmi' }}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Tutup PO (Cut-off)</span>
              <strong class="info-value">{{ formatDate(t.closeDate) }}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Estimasi Tiba di Indo</span>
              <strong class="info-value highlight-date">{{ formatDate(t.estimatedArrivalDate) }}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Kurs Valuta</span>
              <strong class="info-value">1 {{ t.currency }} = Rp {{ t.exchangeRate.toLocaleString('id-ID') }}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Pesanan & Produk</span>
              <strong class="info-value">{{ t.ordersCount || 0 }} order &bull; {{ t.productsCount || 0 }} produk</strong>
            </div>
          </div>

          <!-- Quota Progress Bar -->
          <div class="quota-box">
            <div class="quota-head">
              <span class="q-label">Kapasitas Koper Titip:</span>
              <span class="q-nums"><strong>{{ t.quotaFilled }}</strong> / {{ t.quotaTotal }} slot</span>
            </div>
            <div class="quota-track">
              <div 
                class="quota-fill" 
                :style="{ width: `${Math.min(100, (t.quotaFilled / t.quotaTotal) * 100)}%` }"
              ></div>
            </div>
          </div>

          <!-- Quick Status Actions -->
          <div class="status-quick-bar">
            <span class="sq-label">Ubah Status:</span>
            <select :value="t.status" @change="changeTripStatus(t.id, ($event.target as HTMLSelectElement).value)" class="status-select">
              <option value="draft">Draft</option>
              <option value="open">Open PO</option>
              <option value="closed">Closed (Tutup PO)</option>
              <option value="purchasing">Sedang Belanja di LN</option>
              <option value="arrived">Barang Tiba di Indo</option>
              <option value="completed">Selesai (Semua Dikirim)</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div class="card-actions-grid">
            <NuxtLink :to="`/admin/trip/${t.id}`" class="btn-detail-trip">
              Detail Trip & Daftar Belanja &rarr;
            </NuxtLink>
            <div class="btn-sub-row">
              <button class="btn-edit-trip" @click="openEditModal(t)">Edit</button>
              <button v-if="t.status === 'open'" class="btn-close-po" @click="changeTripStatus(t.id, 'closed')">
                Tutup PO
              </button>
              <button class="btn-delete-trip" @click="deleteTrip(t)">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Create / Edit Trip -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-head">
          <h3>{{ isEditing ? 'Edit Jadwal Trip Jastip' : 'Buat Jadwal Trip Jastip Baru' }}</h3>
          <button class="close-x" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="saveTrip" class="trip-form">
          <div class="f-group">
            <label>Judul Trip:</label>
            <input v-model="form.title" type="text" placeholder="Contoh: Bangkok Mega Fashion & Snack Batch 5" required />
          </div>

          <!-- Country with typeable dropdown & flag preview -->
          <div class="f-row-2">
            <div class="f-group" ref="countryDropdownRef">
              <label>
                Negara Tujuan: 
                <span class="flag-preview-badge" v-if="autoFlag">{{ autoFlag }}</span>
              </label>

              <div class="country-combobox-wrap">
                <div class="combobox-input-inner">
                  <span class="combobox-flag-prefix">{{ autoFlag || '🌐' }}</span>
                  <input 
                    v-model="form.country" 
                    type="text" 
                    placeholder="Pilih atau ketik negara..." 
                    required 
                    @focus="isCountryDropdownOpen = true"
                    @input="handleCountryInput"
                    @keydown.down.prevent="navigateDropdown(1)"
                    @keydown.up.prevent="navigateDropdown(-1)"
                    @keydown.enter.prevent="selectHighlightedCountry"
                    @keydown.esc="isCountryDropdownOpen = false"
                    autocomplete="off"
                  />
                  <button 
                    type="button" 
                    class="combobox-toggle-btn"
                    @click.stop="isCountryDropdownOpen = !isCountryDropdownOpen"
                    tabindex="-1"
                    title="Buka pilihan negara"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>

                <!-- Floating Dropdown List with World Grouping -->
                <div v-if="isCountryDropdownOpen" class="country-dropdown-menu">
                  <!-- Search Results Mode -->
                  <template v-if="isSearching">
                    <div v-if="searchResults.length > 0" class="dropdown-group-title">
                      Hasil Pencarian ({{ searchResults.length }} negara)
                    </div>
                    <div 
                      v-for="(c, idx) in searchResults" 
                      :key="'res-' + c.name" 
                      class="country-dropdown-item"
                      :class="{ 'is-selected': form.country.toLowerCase() === c.name.toLowerCase(), 'is-highlighted': highlightedIndex === idx }"
                      @click="chooseCountryFromDropdown(c)"
                    >
                      <span class="item-flag">{{ c.flag }}</span>
                      <span class="item-name">{{ c.name }}</span>
                      <span class="item-curr">{{ c.currency }}</span>
                    </div>

                    <div v-if="searchResults.length === 0" class="country-dropdown-custom" @click="isCountryDropdownOpen = false">
                      <span>Gunakan <strong>"{{ form.country.trim() }}"</strong> (Negara Kustom)</span>
                      <span class="item-flag">{{ autoFlag }}</span>
                    </div>
                  </template>

                  <!-- Default Grouped Mode (Not searching) -->
                  <template v-else>
                    <div class="dropdown-group-title">⭐ Destinasi Populer Jastip</div>
                    <div 
                      v-for="(c, idx) in POPULAR_JASTIP_COUNTRIES" 
                      :key="'pop-' + c.name" 
                      class="country-dropdown-item"
                      :class="{ 'is-selected': form.country.toLowerCase() === c.name.toLowerCase(), 'is-highlighted': highlightedIndex === idx }"
                      @click="chooseCountryFromDropdown(c)"
                    >
                      <span class="item-flag">{{ c.flag }}</span>
                      <span class="item-name">{{ c.name }}</span>
                      <span class="item-curr">{{ c.currency }}</span>
                    </div>

                    <div class="dropdown-group-title">🌍 Seluruh Negara Dunia (A - Z)</div>
                    <div 
                      v-for="c in ALL_WORLD_COUNTRIES" 
                      :key="'world-' + c.name" 
                      class="country-dropdown-item"
                      :class="{ 'is-selected': form.country.toLowerCase() === c.name.toLowerCase() }"
                      @click="chooseCountryFromDropdown(c)"
                    >
                      <span class="item-flag">{{ c.flag }}</span>
                      <span class="item-name">{{ c.name }}</span>
                      <span class="item-curr">{{ c.currency }}</span>
                    </div>
                  </template>
                </div>
              </div>

              <div class="country-quick-chips">
                <span class="chips-label">Populer:</span>
                <button 
                  type="button" 
                  v-for="c in quickCountries" 
                  :key="c.name" 
                  class="chip-btn"
                  @click="chooseCountryFromDropdown(c)"
                >
                  {{ c.flag }} {{ c.name }}
                </button>
              </div>
            </div>

            <div class="f-group">
              <label>Kota / Area Belanja Utama:</label>
              <input v-model="form.cityOrArea" type="text" placeholder="Tokyo (Ginza, Donki, Shinjuku)" required />
            </div>
          </div>

          <div class="f-row-2">
            <div class="f-group">
              <label>Tanggal Tutup PO (Cut-off):</label>
              <input v-model="form.closeDate" type="date" required />
            </div>
            <div class="f-group">
              <label>Estimasi Barang Tiba di Indonesia:</label>
              <input v-model="form.estimatedArrivalDate" type="date" required />
            </div>
          </div>

          <div class="f-row-2">
            <div class="f-group">
              <label>Tanggal Keberangkatan (Opsional):</label>
              <input v-model="form.departureDate" type="date" />
            </div>
            <div class="f-group">
              <label>Total Slot Kuota Koper (pcs/slot):</label>
              <input v-model.number="form.quotaTotal" type="number" min="1" placeholder="50" required />
            </div>
          </div>

          <div class="f-row-3">
            <div class="f-group">
              <label>Mata Uang:</label>
              <input v-model="form.currency" type="text" placeholder="JPY / KRW / THB" maxlength="3" required />
            </div>
            <div class="f-group">
              <label>Kurs Valuta ke IDR:</label>
              <input v-model.number="form.exchangeRate" type="number" placeholder="108" required />
            </div>
            <div class="f-group">
              <label>Default Fee Jastip (Rp):</label>
              <input v-model.number="form.feeValue" type="number" placeholder="35000" required />
            </div>
          </div>


          <div class="f-group">
            <label>Deskripsi & Ringkasan Trip:</label>
            <textarea v-model="form.description" rows="2" placeholder="Barang incaran, toko tujuan, catatan belanja..."></textarea>
          </div>

          <div class="f-group">
            <label>Syarat & Ketentuan Khusus Trip:</label>
            <textarea v-model="form.terms" rows="2" placeholder="Ketentuan DP, garansi refund jika kosong, regulasi bagasi..."></textarea>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="showModal = false">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan Trip' : 'Simpan & Buka PO') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from '../../../composables/useToast'
import type { ApiTrip } from '../../../composables/useTrips'
import { getCountryFlag, getCountryCurrency, getCountryDefaultRate, POPULAR_JASTIP_COUNTRIES, ALL_WORLD_COUNTRIES } from '../../../utils/countryFlags'

definePageMeta({
  middleware: 'admin'
})

const { showToast } = useToast()

const { data: dbTrips, refresh } = await useFetch<ApiTrip[]>('/api/admin/trips')

const allTrips = computed(() => dbTrips.value || [])
const activeStatus = ref<'all' | 'open' | 'closed' | 'arrived'>('all')

const openCount = computed(() => allTrips.value.filter(t => t.status === 'open').length)
const closedCount = computed(() => allTrips.value.filter(t => t.status === 'closed').length)
const arrivedCount = computed(() => allTrips.value.filter(t => t.status === 'arrived').length)

const filteredTrips = computed(() => {
  if (activeStatus.value === 'all') return allTrips.value
  return allTrips.value.filter(t => t.status === activeStatus.value)
})

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const isSaving = ref(false)

// Country Combobox State
const isCountryDropdownOpen = ref(false)
const highlightedIndex = ref(-1)
const countryDropdownRef = ref<HTMLElement | null>(null)
const quickCountries = POPULAR_JASTIP_COUNTRIES.slice(0, 6)

const form = ref({
  title: '',
  country: 'Jepang',
  cityOrArea: 'Tokyo (Ginza, Shinjuku, Donki)',
  closeDate: '',
  departureDate: '',
  estimatedArrivalDate: '',
  currency: 'JPY',
  exchangeRate: 108,
  feeValue: 35000,
  quotaTotal: 50,
  description: '',
  terms: ''
})

const autoFlag = computed(() => {
  return getCountryFlag(form.value.country)
})

const isSearching = computed(() => {
  return !!form.value.country && form.value.country.trim().length > 0
})

const searchResults = computed(() => {
  const query = form.value.country ? form.value.country.toLowerCase().trim() : ''
  if (!query) return []
  return ALL_WORLD_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.currency.toLowerCase().includes(query)
  )
})

const handleCountryInput = () => {
  isCountryDropdownOpen.value = true
  highlightedIndex.value = -1
  const c = form.value.country
  if (c && !isEditing.value) {
    const suggestedCurr = getCountryCurrency(c)
    if (suggestedCurr) form.value.currency = suggestedCurr
    const suggestedRate = getCountryDefaultRate(c)
    if (suggestedRate) form.value.exchangeRate = suggestedRate
  }
}

const chooseCountryFromDropdown = (c: typeof POPULAR_JASTIP_COUNTRIES[0]) => {
  form.value.country = c.name
  form.value.currency = c.currency
  if (c.exchangeRateApprox) {
    form.value.exchangeRate = c.exchangeRateApprox
  }
  isCountryDropdownOpen.value = false
  highlightedIndex.value = -1
}

const currentNavList = computed(() => {
  return isSearching.value ? searchResults.value : POPULAR_JASTIP_COUNTRIES
})

const navigateDropdown = (step: number) => {
  if (!isCountryDropdownOpen.value) {
    isCountryDropdownOpen.value = true
    return
  }
  const total = currentNavList.value.length
  if (total === 0) return
  highlightedIndex.value = (highlightedIndex.value + step + total) % total
}

const selectHighlightedCountry = () => {
  if (isCountryDropdownOpen.value && highlightedIndex.value >= 0 && highlightedIndex.value < currentNavList.value.length) {
    chooseCountryFromDropdown(currentNavList.value[highlightedIndex.value])
  } else {
    isCountryDropdownOpen.value = false
  }
}

const handleDocumentClick = (e: MouseEvent) => {
  if (countryDropdownRef.value && !countryDropdownRef.value.contains(e.target as Node)) {
    isCountryDropdownOpen.value = false
  }
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleDocumentClick)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('click', handleDocumentClick)
  }
})

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  const now = new Date()
  const defaultClose = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const defaultArrival = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  form.value = {
    title: '',
    country: 'Jepang',
    cityOrArea: 'Tokyo & Osaka (Donki, Ginza)',
    closeDate: defaultClose,
    departureDate: '',
    estimatedArrivalDate: defaultArrival,
    currency: 'JPY',
    exchangeRate: 108,
    feeValue: 35000,
    quotaTotal: 50,
    description: 'Titip berbagai macam snack, kosmetik & skincare drugstore, rilisan eksklusif, serta produk toko resmi luar negeri.',
    terms: 'Batas pelunasan atau DP 50% wajib sebelum cut-off date. Barang yang out of stock di toko resmi akan di-refund 100%.'
  }
  isCountryDropdownOpen.value = false
  showModal.value = true
}

const openEditModal = (t: ApiTrip) => {
  isEditing.value = true
  editingId.value = t.id
  form.value = {
    title: t.title,
    country: t.country,
    cityOrArea: t.cityOrArea,
    closeDate: t.closeDate,
    departureDate: t.departureDate || '',
    estimatedArrivalDate: t.estimatedArrivalDate || '',
    currency: t.currency,
    exchangeRate: t.exchangeRate,
    feeValue: t.feeValue,
    quotaTotal: t.quotaTotal,
    description: t.description,
    terms: t.terms
  }
  isCountryDropdownOpen.value = false
  showModal.value = true
}

const changeTripStatus = async (id: number, nextStatus: string) => {
  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/trips/${id}/status`, {
      method: 'PATCH',
      body: { status: nextStatus }
    })
    showToast('Status Diperbarui', res.message, 'success')
    await refresh()
  } catch (err: any) {
    showToast('Gagal', err?.data?.message || 'Gagal memperbarui status trip', 'warning')
  }
}

const deleteTrip = async (t: ApiTrip) => {
  const confirmDel = confirm(`Hapus jadwal trip "${t.title}"?`)
  if (!confirmDel) return

  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/trips/${t.id}`, {
      method: 'DELETE'
    })
    showToast('Trip Dihapus', res.message, 'info')
    await refresh()
  } catch (err: any) {
    showToast('Gagal Menghapus', err?.data?.message || 'Gagal menghapus trip', 'warning')
  }
}

const saveTrip = async () => {
  isSaving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/admin/trips/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
      showToast('Berhasil', 'Perubahan jadwal trip berhasil disimpan.', 'success')
    } else {
      await $fetch('/api/admin/trips', {
        method: 'POST',
        body: form.value
      })
      showToast('Berhasil', 'Jadwal trip baru berhasil dibuka!', 'success')
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    showToast('Gagal', err?.data?.message || 'Terjadi kesalahan saat menyimpan trip', 'warning')
  } finally {
    isSaving.value = false
  }
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatStatusLabel = (s: string) => {
  const map: Record<string, string> = {
    draft: 'Draft',
    open: 'Open PO',
    closed: 'Tutup PO',
    purchasing: 'Belanja di LN',
    arrived: 'Barang Tiba',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  }
  return map[s] || s
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
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
}

.btn-create-trip {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create-trip:hover {
  background: var(--color-primary-hover, #6F5530);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(43, 33, 22, 0.1);
  padding-bottom: 12px;
  overflow-x: auto;
}

.tab-btn {
  background: transparent;
  border: 1px solid rgba(43, 33, 22, 0.15);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--color-primary, #8C6D3F);
  border-color: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.empty-state {
  padding: 40px;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed rgba(43, 33, 22, 0.2);
  color: var(--color-text-muted, #7A6A55);
}

.trip-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 22px;
}

.trip-admin-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(43, 33, 22, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(43, 33, 22, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.trip-admin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(43, 33, 22, 0.08);
  border-color: rgba(140, 109, 63, 0.35);
}

.card-head-bar {
  padding: 18px 20px 14px;
  background: #FAF8F4;
  border-bottom: 1px solid rgba(43, 33, 22, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.head-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.flag-chip {
  background: #ffffff;
  border: 1px solid rgba(140, 109, 63, 0.25);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #2B2116;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.status-chip {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-chip.open { background: #E8F5E9; color: #2E7D32; border: 1px solid #A5D6A7; }
.status-chip.closed { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }
.status-chip.purchasing { background: #E1F5FE; color: #0288D1; border: 1px solid #81D4FA; }
.status-chip.arrived { background: #FFF3E0; color: #E65100; border: 1px solid #FFCC80; }
.status-chip.completed { background: #F1F8E9; color: #558B2F; border: 1px solid #C5E1A5; }
.status-chip.draft { background: #F5F5F5; color: #616161; border: 1px solid #E0E0E0; }
.status-chip.cancelled { background: #ECEFF1; color: #546E7A; border: 1px solid #CFD8DC; }

.trip-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2B2116;
  margin: 2px 0 2px;
  line-height: 1.35;
}

.trip-area {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #7A6A55;
  font-weight: 500;
}

.trip-area svg {
  color: #8C6D3F;
  flex-shrink: 0;
}

.card-body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.84rem;
  padding-bottom: 6px;
  border-bottom: 1px dashed rgba(43, 33, 22, 0.08);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  color: #7A6A55;
  font-weight: 500;
}

.info-value {
  color: #2B2116;
  font-weight: 700;
}

.info-value.highlight-date {
  color: #8C6D3F;
}

.quota-box {
  background: #FAF8F4;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quota-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #7A6A55;
}

.quota-nums strong {
  color: #2B2116;
}

.quota-track {
  height: 6px;
  background: rgba(43, 33, 22, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: #8C6D3F;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.status-quick-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: #FAF8F4;
  border: 1px solid rgba(43, 33, 22, 0.08);
  border-radius: 8px;
  font-size: 0.82rem;
}

.sq-label {
  font-weight: 600;
  color: #7A6A55;
}

.status-select {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid rgba(43, 33, 22, 0.18);
  font-size: 0.8rem;
  font-weight: 600;
  background: #ffffff;
  color: #2B2116;
  cursor: pointer;
  outline: none;
}

.status-select:focus {
  border-color: #8C6D3F;
}

.card-actions-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}

.btn-detail-trip {
  text-align: center;
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.3);
  color: #8C6D3F;
  padding: 9px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-detail-trip:hover {
  background: #8C6D3F;
  color: #ffffff;
  border-color: #8C6D3F;
}

.btn-sub-row {
  display: flex;
  gap: 8px;
}

.btn-edit-trip {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(43, 33, 22, 0.18);
  color: #2B2116;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit-trip:hover {
  background: #FAF8F4;
  border-color: rgba(43, 33, 22, 0.3);
}

.btn-close-po {
  flex: 1;
  background: #FFF3E0;
  border: 1px solid #FFE082;
  color: #E65100;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-close-po:hover {
  background: #FFE082;
}

.btn-delete-trip {
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  color: #C62828;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-delete-trip:hover {
  background: #FFCDD2;
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(43, 33, 22, 0.1);
}

.modal-head h3 {
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-text, #2B2116);
}

.close-x {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted, #7A6A55);
}

.trip-form {
  padding: 20px;
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
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  display: flex;
  align-items: center;
  gap: 6px;
}

.flag-preview-badge {
  font-size: 1.1rem;
}

.f-group input, .f-group textarea, .f-group select {
  padding: 9px 12px;
  border: 1px solid rgba(43, 33, 22, 0.2);
  border-radius: 8px;
  font-size: 0.86rem;
  font-family: inherit;
  color: var(--color-text, #2B2116);
}

.f-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.f-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.country-combobox-wrap {
  position: relative;
  width: 100%;
}

.combobox-input-inner {
  position: relative;
  display: flex;
  align-items: center;
}

.combobox-flag-prefix {
  position: absolute;
  left: 10px;
  font-size: 1.15rem;
  pointer-events: none;
  z-index: 2;
  user-select: none;
}

.combobox-input-inner input {
  width: 100%;
  padding-left: 38px !important;
  padding-right: 36px !important;
}

.combobox-toggle-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #7A6A55;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
}

.combobox-toggle-btn:hover {
  color: #2B2116;
  background: rgba(43, 33, 22, 0.06);
}

.country-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid rgba(43, 33, 22, 0.15);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(43, 33, 22, 0.15);
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
  padding: 4px;
}

.dropdown-group-title {
  padding: 6px 10px 4px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8C6D3F;
  background: #FAF8F4;
  border-radius: 5px;
  margin: 6px 2px 2px;
  position: sticky;
  top: 0;
  z-index: 5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.country-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #2B2116;
  transition: background 0.12s;
}

.country-dropdown-item:hover,
.country-dropdown-item.is-highlighted {
  background: #FAF8F4;
  color: #8C6D3F;
}

.country-dropdown-item.is-selected {
  background: rgba(140, 109, 63, 0.1);
  font-weight: 700;
  color: #8C6D3F;
}

.item-flag {
  font-size: 1.2rem;
  line-height: 1;
}

.item-name {
  flex: 1;
  font-weight: 600;
}

.item-curr {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(43, 33, 22, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  color: #7A6A55;
}

.country-dropdown-custom {
  padding: 10px 12px;
  border-top: 1px dashed rgba(43, 33, 22, 0.1);
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #7A6A55;
  cursor: pointer;
  border-radius: 6px;
}

.country-dropdown-custom:hover {
  background: #FAF8F4;
  color: #2B2116;
}

.chips-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #7A6A55;
  align-self: center;
}

.country-quick-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.chip-btn {
  background: var(--color-surface, #FBF9F5);
  border: 1px solid rgba(43, 33, 22, 0.15);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.chip-btn:hover {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}


.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(43, 33, 22, 0.1);
}

.btn-cancel {
  background: transparent;
  border: 1px solid rgba(43, 33, 22, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 600px) {
  .f-row-2, .f-row-3 {
    grid-template-columns: 1fr;
  }
}
</style>
