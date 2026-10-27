<template>
  <div class="jastip-trips-page">
    <div class="page-container">
      <!-- Breadcrumb & Header -->
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Jadwal Jastip</span>
      </div>

      <div class="header-main">
        <div class="header-text">
          <div class="header-pill">
            <span class="airplane-icon">✈️</span>
            JASA TITIP BELI LUAR NEGERI
          </div>
          <h1 class="page-title">Jadwal & Trip Jastip (Open PO)</h1>
          <p class="page-desc">
            Pilih destinasi trip keberangkatan admin untuk memesan barang langsung dari toko resmi luar negeri. Pesanan akan dibelikan secara langsung dan dibawa pulang ke Indonesia.
          </p>
        </div>

        <NuxtLink to="/request" class="request-banner-link">
          <span class="req-title">Ingin titip barang dari trip di atas?</span>
          <span class="req-sub">Ajukan Request Titip Kustom &rarr;</span>
        </NuxtLink>
      </div>

      <!-- Trip Status Filter Tabs -->
      <div class="trip-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeStatusTab === 'open' }"
          @click="activeStatusTab = 'open'"
        >
          Open PO (Sedang Buka)
          <span class="tab-badge">{{ openTripsCount }}</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeStatusTab === 'closed' }"
          @click="activeStatusTab = 'closed'"
        >
          Arsip Trip (Sudah Tutup)
          <span class="tab-badge">{{ closedTripsCount }}</span>
        </button>
      </div>

      <!-- Trips Grid -->
      <div class="trips-grid">
        <div 
          v-for="trip in displayedTrips" 
          :key="trip.id" 
          class="trip-card"
          :class="{ 'is-closed': trip.status === 'closed' }"
        >
          <div class="card-head-clean">
            <div class="head-top">
              <span class="country-badge">{{ trip.flag }} {{ trip.country }}</span>
              <span v-if="trip.status === 'open'" class="status-badge open">Open PO</span>
              <span v-else class="status-badge closed">Tutup PO</span>
            </div>

            <div class="head-body">
              <span class="city-label">{{ trip.cityOrArea }}</span>
              <h2 class="trip-card-title">{{ trip.title }}</h2>
            </div>
          </div>

          <div class="card-content">
            <p class="trip-desc">{{ trip.description }}</p>

            <div class="trip-schedule-grid">
              <div class="sched-box">
                <span class="sched-label">Tutup PO (Cut-off):</span>
                <strong class="sched-val">{{ formatDate(trip.closeDate) }}</strong>
              </div>
              <div class="sched-box">
                <span class="sched-label">Estimasi Tiba di Indo:</span>
                <strong class="sched-val highlight">{{ formatDate(trip.estimatedArrivalDate) }}</strong>
              </div>
            </div>

            <!-- Quota Bar -->
            <div class="quota-wrap">
              <div class="quota-labels">
                <span>Kuota Slot Titip</span>
                <strong>{{ trip.quotaFilled }} / {{ trip.quotaTotal }} terisi</strong>
              </div>
              <div class="quota-bar">
                <div 
                  class="quota-fill" 
                  :style="{ width: `${Math.min(100, (trip.quotaFilled / trip.quotaTotal) * 100)}%` }"
                ></div>
              </div>
            </div>

            <div class="trip-card-footer">
              <NuxtLink :to="`/jastip/${trip.slug}`" class="btn-open-trip" :class="{ 'btn-view-closed': trip.status === 'closed' }">
                <span v-if="trip.status === 'open'">Buka Katalog Trip Ini &rarr;</span>
                <span v-else>Lihat Detail Arsip Trip</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApiTrip } from '../../composables/useTrips'

const { data: dbTrips, status, refresh } = await useFetch<ApiTrip[]>('/api/trips')

const activeStatusTab = ref<'open' | 'closed'>('open')

const allTrips = computed(() => dbTrips.value || [])
const openTripsCount = computed(() => allTrips.value.filter(t => t.status === 'open').length)
const closedTripsCount = computed(() => allTrips.value.filter(t => t.status !== 'open').length)

const displayedTrips = computed(() => {
  if (activeStatusTab.value === 'open') {
    return allTrips.value.filter(t => t.status === 'open')
  }
  return allTrips.value.filter(t => t.status !== 'open')
})

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.jastip-trips-page {
  padding: 32px 24px 80px;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: var(--color-text-muted);
  transition: color 0.15s ease;
}

.breadcrumb a:hover {
  color: var(--brand-accent);
}

.breadcrumb .active {
  color: var(--brand-accent);
  font-weight: 700;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.header-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--brand-primary);
  color: var(--brand-accent);
  font-size: 0.74rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 12px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(216, 185, 120, 0.4);
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  max-width: 680px;
  line-height: 1.65;
}

.request-banner-link {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-left: 4px solid var(--brand-accent);
  padding: 14px 20px;
  border-radius: var(--radius-md);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.request-banner-link:hover {
  background: var(--brand-neutral);
  border-color: var(--brand-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.req-title {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.req-sub {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--brand-accent);
}

.trip-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--brand-primary);
  padding-bottom: 14px;
}

.tab-btn {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 9px 20px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-subtle);
}

.tab-btn:hover {
  background: var(--brand-neutral);
  border-color: var(--brand-secondary);
  color: var(--brand-accent);
}

.tab-btn.active {
  background: var(--brand-accent);
  color: #FFFBF2;
  border-color: var(--brand-accent);
  box-shadow: 0 4px 14px -2px rgba(140, 109, 63, 0.35);
}

.tab-badge {
  background: rgba(255, 251, 242, 0.25);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.74rem;
  font-weight: 700;
}

.tab-btn:not(.active) .tab-badge {
  background: var(--brand-primary);
  color: var(--brand-accent);
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
}

.trip-card {
  background: #FFFFFF;
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--brand-secondary);
}

.trip-card.is-closed {
  opacity: 0.85;
}

.card-head-clean {
  padding: 22px 20px 16px;
  background: linear-gradient(135deg, #2B2116 0%, #443422 100%);
  color: #FFFBF2;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.head-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.country-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  color: #FFFBF2;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-badge {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.open {
  background: var(--color-ready-bg);
  color: var(--color-ready);
  border: 1px solid rgba(59, 110, 72, 0.3);
}

.status-badge.closed {
  background: rgba(255, 251, 242, 0.2);
  color: #FFFBF2;
  border: 1px solid rgba(255, 251, 242, 0.3);
}

.city-label {
  font-size: 0.76rem;
  color: var(--brand-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.trip-card-title {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  color: #FFFBF2;
  margin-top: 2px;
  line-height: 1.25;
}

.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.trip-desc {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trip-schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background: var(--brand-neutral);
  border: 1px solid var(--brand-primary);
  border-radius: var(--radius-sm);
  padding: 14px;
  margin-bottom: 20px;
}

.sched-label {
  display: block;
  font-size: 0.74rem;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.sched-val {
  font-size: 0.88rem;
  color: var(--color-text);
  font-weight: 600;
}

.sched-val.highlight {
  color: var(--brand-accent);
  font-weight: 700;
}

.quota-wrap {
  margin-bottom: 22px;
}

.quota-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.quota-bar {
  height: 6px;
  background: var(--brand-primary);
  border-radius: 999px;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-secondary) 0%, var(--brand-accent) 100%);
  border-radius: 999px;
}

.trip-card-footer {
  margin-top: auto;
}

.btn-open-trip {
  display: block;
  text-align: center;
  text-decoration: none;
  background: var(--brand-accent);
  color: #FFFBF2;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 11px 16px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
  border: 1px solid var(--brand-secondary);
}

.btn-open-trip:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -3px rgba(140, 109, 63, 0.35);
}

.btn-open-trip.btn-view-closed {
  background: var(--brand-neutral);
  color: var(--brand-accent);
  border: 1px solid var(--brand-primary);
}

.btn-open-trip.btn-view-closed:hover {
  background: var(--brand-primary);
  border-color: var(--brand-secondary);
}
</style>
