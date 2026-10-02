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
          <div class="card-cover" :style="{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.8)), url(${trip.coverImageUrl})` }">
            <div class="cover-top">
              <span class="country-badge">{{ trip.flag }} {{ trip.country }}</span>
              <span v-if="trip.status === 'open'" class="status-badge open">Open PO</span>
              <span v-else class="status-badge closed">Tutup PO</span>
            </div>

            <div class="cover-bottom">
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
import { mockJastipTrips } from '../../data/mockJastipData'

const activeStatusTab = ref<'open' | 'closed'>('open')

const openTripsCount = computed(() => mockJastipTrips.filter(t => t.status === 'open').length)
const closedTripsCount = computed(() => mockJastipTrips.filter(t => t.status !== 'open').length)

const displayedTrips = computed(() => {
  if (activeStatusTab.value === 'open') {
    return mockJastipTrips.filter(t => t.status === 'open')
  }
  return mockJastipTrips.filter(t => t.status !== 'open')
})

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.jastip-trips-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1240px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 12px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.header-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  font-size: 0.74rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.page-desc {
  font-size: 0.92rem;
  color: var(--color-text-muted, #64748B);
  max-width: 680px;
  line-height: 1.5;
}

.request-banner-link {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-left: 3px solid var(--color-primary, #4A5D73);
  padding: 12px 18px;
  border-radius: 10px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: all 0.15s;
}

.request-banner-link:hover {
  background: var(--color-canvas, #F4F6F8);
  border-color: var(--color-primary, #4A5D73);
}

.req-title {
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
}

.req-sub {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
}

.trip-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  padding-bottom: 12px;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748B);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
}

.tab-btn.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
}

.tab-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 800;
}

.tab-btn:not(.active) .tab-badge {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 26px;
}

.trip-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}

.trip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -6px rgba(74, 93, 115, 0.15);
}

.trip-card.is-closed {
  opacity: 0.85;
}

.card-cover {
  height: 180px;
  background-size: cover;
  background-position: center;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #ffffff;
}

.cover-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.country-badge {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-badge.open {
  background: #10B981;
  color: #ffffff;
}

.status-badge.closed {
  background: #64748B;
  color: #ffffff;
}

.city-label {
  font-size: 0.75rem;
  color: #E2E8F0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trip-card-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin-top: 2px;
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.trip-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.5;
  margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.trip-schedule-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
}

.sched-label {
  display: block;
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 2px;
}

.sched-val {
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
}

.sched-val.highlight {
  color: var(--color-primary, #4A5D73);
}

.quota-wrap {
  margin-bottom: 18px;
}

.quota-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  color: var(--color-text-muted, #64748B);
  margin-bottom: 6px;
}

.quota-bar {
  height: 6px;
  background: var(--color-secondary, #E4E7EB);
  border-radius: 4px;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: var(--color-primary, #4A5D73);
  border-radius: 4px;
}

.trip-card-footer {
  margin-top: auto;
}

.btn-open-trip {
  display: block;
  text-align: center;
  text-decoration: none;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.15s;
}

.btn-open-trip:hover {
  background: var(--color-primary-hover, #384759);
}

.btn-open-trip.btn-view-closed {
  background: var(--color-canvas, #F4F6F8);
  color: var(--color-primary, #4A5D73);
  border: 1px solid var(--color-secondary, #E4E7EB);
}

.btn-open-trip.btn-view-closed:hover {
  background: var(--color-secondary, #E4E7EB);
}
</style>
