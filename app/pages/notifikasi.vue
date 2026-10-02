<template>
  <div class="notifications-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Notifikasi</span>
      </div>

      <div class="page-header">
        <div class="header-row">
          <div>
            <h1 class="page-title">Pusat Notifikasi</h1>
            <p class="page-subtitle">Informasi terbaru mengenai status pesanan jastip Anda, update stok, dan penawaran request produk.</p>
          </div>
          <button class="btn-mark-all" @click="markAllAsRead">
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      <div class="notif-list-card">
        <div v-if="notifications.length > 0" class="notif-items">
          <div 
            v-for="notif in notifications" 
            :key="notif.id"
            class="notif-item"
            :class="{ unread: !notif.isRead }"
            @click="readNotif(notif)"
          >
            <div class="notif-icon-col">
              <span v-if="notif.type === 'order'" class="icon-bubble order">📦</span>
              <span v-else-if="notif.type === 'request'" class="icon-bubble request">💬</span>
              <span v-else class="icon-bubble system">🔔</span>
            </div>

            <div class="notif-body">
              <div class="notif-title-row">
                <h4 class="notif-title">{{ notif.title }}</h4>
                <span class="notif-time">{{ notif.createdAt }}</span>
              </div>
              <p class="notif-text">{{ notif.body }}</p>
              <NuxtLink :to="notif.linkUrl" class="notif-action-link">
                Lihat Rincian &rarr;
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else class="empty-notif">
          <p>Belum ada notifikasi baru untuk Anda.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockNotifications, type AppNotification } from '../data/mockJastipData'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const notifications = ref<AppNotification[]>([...mockNotifications])

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
  showToast({
    title: 'Sukses',
    message: 'Semua notifikasi telah ditandai dibaca.',
    type: 'info'
  })
}

const readNotif = (notif: AppNotification) => {
  notif.isRead = true
}
</script>

<style scoped>
.notifications-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 860px;
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
  margin-bottom: 24px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
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

.btn-mark-all {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.notif-list-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow: hidden;
}

.notif-items {
  display: flex;
  flex-direction: column;
}

.notif-item {
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.notif-item:hover {
  background: var(--color-canvas, #F4F6F8);
}

.notif-item.unread {
  background: rgba(74, 93, 115, 0.05);
  border-left: 3px solid var(--color-primary, #4A5D73);
}

.notif-icon-col {
  flex-shrink: 0;
}

.icon-bubble {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.icon-bubble.order {
  background: #E0E7FF;
}

.icon-bubble.request {
  background: #DCFCE7;
}

.icon-bubble.system {
  background: #FEF3C7;
}

.notif-body {
  flex: 1;
}

.notif-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notif-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.notif-time {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

.notif-text {
  font-size: 0.86rem;
  color: var(--color-text-muted, #64748B);
  line-height: 1.45;
  margin-bottom: 8px;
}

.notif-action-link {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  text-decoration: none;
}

.notif-action-link:hover {
  text-decoration: underline;
}

.empty-notif {
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-muted, #64748B);
}
</style>
