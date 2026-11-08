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
            <h1 class="page-title">Notifikasi</h1>
            <p class="page-subtitle">
              Pantau pembaruan pesanan, verifikasi pembayaran, penawaran request produk, dan balasan live chat Anda.
            </p>
          </div>

          <div class="header-actions">
            <button class="btn-refresh" :disabled="pending" @click="fetchNotifications(false)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              <span>Refresh</span>
            </button>

            <button
              v-if="unreadCount > 0"
              class="btn-mark-all"
              @click="handleMarkAllAsRead"
            >
              ✓ Tandai Semua Dibaca ({{ unreadCount }})
            </button>

            <button
              v-if="hasReadNotifications"
              class="btn-clear-read"
              @click="handleClearRead"
            >
              Bersihkan yang Dibaca
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          type="button"
          class="tab-pill"
          :class="{ active: activeFilter === tab.key }"
          @click="activeFilter = tab.key"
        >
          <span>{{ tab.label }}</span>
          <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="notif-list-card">
        <div v-if="pending && notifications.length === 0" class="loading-notif">
          <div class="spinner"></div>
          <p>Memuat notifikasi Anda...</p>
        </div>

        <div v-else-if="filteredNotifications.length > 0" class="notif-items">
          <div
            v-for="notif in filteredNotifications"
            :key="notif.id"
            class="notif-item"
            :class="{ unread: !notif.isRead }"
            @click="handleClickNotif(notif)"
          >
            <div class="notif-icon-col">
              <div class="icon-bubble" :class="getCategoryClass(notif.type)">
                <span>{{ getCategoryEmoji(notif.type) }}</span>
              </div>
            </div>

            <div class="notif-body">
              <div class="notif-title-row">
                <div class="title-left">
                  <span class="type-tag" :class="getCategoryClass(notif.type)">
                    {{ getCategoryLabel(notif.type) }}
                  </span>
                  <h4 class="notif-title">{{ notif.title }}</h4>
                  <span v-if="!notif.isRead" class="unread-dot" title="Belum dibaca"></span>
                </div>
                <div class="title-right">
                  <span class="notif-time">{{ formatNotifTime(notif.createdAt) }}</span>
                  <button
                    type="button"
                    class="btn-delete-notif"
                    title="Hapus notifikasi"
                    @click.stop="handleDeleteNotif(notif.id)"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <p class="notif-text">{{ notif.body }}</p>

              <div class="notif-footer-row">
                <NuxtLink :to="notif.linkUrl" class="notif-action-link" @click.stop="markAsRead(notif.id)">
                  {{ getActionLabel(notif.type) }} &rarr;
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-notif">
          <div class="empty-icon">🔔</div>
          <h3>Belum Ada Notifikasi</h3>
          <p>
            {{
              activeFilter === 'unread'
                ? 'Semua notifikasi Anda telah dibaca.'
                : 'Belum ada pembaruan pesanan, penawaran request, atau pesan baru pada kategori ini.'
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotifications, type CustomerNotification } from '../composables/useNotifications'
import { useToast } from '../composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const { showToast } = useToast()
const {
  notifications,
  unreadCount,
  pending,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
} = useNotifications()

const activeFilter = ref<'all' | 'unread' | 'order' | 'request' | 'chat'>('all')

onMounted(async () => {
  await fetchNotifications(false)
})

const getCategoryGroup = (type: string): 'order' | 'request' | 'chat' => {
  if (type === 'chat' || type === 'chat_reply') return 'chat'
  if (type === 'request' || type.startsWith('trip_')) return 'request'
  return 'order'
}

const filterTabs = computed(() => [
  { key: 'all' as const, label: 'Semua', count: notifications.value.length },
  { key: 'unread' as const, label: 'Belum Dibaca', count: unreadCount.value },
  {
    key: 'order' as const,
    label: 'Pesanan & Pembayaran',
    count: notifications.value.filter((n) => getCategoryGroup(n.type) === 'order').length
  },
  {
    key: 'request' as const,
    label: 'Request & Trip Jastip',
    count: notifications.value.filter((n) => getCategoryGroup(n.type) === 'request').length
  },
  {
    key: 'chat' as const,
    label: 'Live Chat',
    count: notifications.value.filter((n) => getCategoryGroup(n.type) === 'chat').length
  }
])

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  if (activeFilter.value === 'unread') return notifications.value.filter((n) => !n.isRead)
  return notifications.value.filter((n) => getCategoryGroup(n.type) === activeFilter.value)
})

const hasReadNotifications = computed(() => notifications.value.some((n) => n.isRead))

const getCategoryClass = (type: string) => {
  if (type === 'chat' || type === 'chat_reply') return 'chat'
  if (type === 'request') return 'request'
  if (type.startsWith('trip_')) return 'trip'
  if (type.includes('rejected') || type.includes('expired') || type.includes('cancelled')) return 'danger'
  if (type.includes('verified') || type.includes('approved')) return 'success'
  return 'order'
}

const getCategoryEmoji = (type: string) => {
  if (type === 'chat' || type === 'chat_reply') return '💬'
  if (type === 'request') return '📋'
  if (type.startsWith('trip_')) return '✈️'
  if (type.includes('payment')) return '💳'
  if (type.includes('rejected') || type.includes('expired')) return '⚠️'
  if (type.includes('approved') || type.includes('verified')) return '✅'
  return '🛍️'
}

const getCategoryLabel = (type: string) => {
  if (type === 'chat' || type === 'chat_reply') return 'Live Chat'
  if (type === 'request') return 'Request Produk'
  if (type.startsWith('trip_')) return 'Jadwal Trip'
  if (type.includes('payment')) return 'Pembayaran'
  return 'Pesanan'
}

const getActionLabel = (type: string) => {
  if (type === 'chat' || type === 'chat_reply') return 'Buka Ruang Chat'
  if (type === 'request') return 'Lihat Request & Penawaran'
  if (type === 'order_approved' || type === 'payment_rejected') return 'Lanjut ke Pembayaran'
  return 'Lihat Detail Pesanan'
}

const formatNotifTime = (isoStr: string) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return isoStr

  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`

  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleClickNotif = async (notif: CustomerNotification) => {
  if (!notif.isRead) {
    await markAsRead(notif.id)
  }
  if (notif.linkUrl) {
    await navigateTo(notif.linkUrl)
  }
}

const handleMarkAllAsRead = async () => {
  await markAllAsRead()
  showToast('Sukses', 'Semua notifikasi telah ditandai dibaca.', 'info')
}

const handleDeleteNotif = async (id: string) => {
  await deleteNotification(id)
}

const handleClearRead = async () => {
  await clearReadNotifications()
  showToast('Dibersihkan', 'Notifikasi yang sudah dibaca telah dihapus.', 'info')
}
</script>

<style scoped>
.notifications-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 900px;
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
  margin-bottom: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted, #7A6A55);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: var(--color-canvas, #FFFBF2);
  border-color: var(--color-primary, #8C6D3F);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-mark-all {
  background: var(--color-primary, #8C6D3F);
  border: 1px solid var(--color-primary, #8C6D3F);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-mark-all:hover {
  background: var(--color-primary-hover, #6F5530);
}

.btn-clear-read {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-clear-read:hover {
  border-color: #C0392B;
  color: #C0392B;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-pill:hover {
  border-color: var(--color-primary, #8C6D3F);
  color: var(--color-primary, #8C6D3F);
}

.tab-pill.active {
  background: var(--color-primary, #8C6D3F);
  border-color: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.tab-count {
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(140, 109, 63, 0.14);
  color: inherit;
  padding: 1px 7px;
  border-radius: 999px;
}

.tab-pill.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

.notif-list-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.loading-notif {
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-secondary, #EFE1C6);
  border-top-color: var(--color-primary, #8C6D3F);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

.notif-items {
  display: flex;
  flex-direction: column;
}

.notif-item {
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item:hover {
  background: var(--color-canvas, #FFFBF2);
}

.notif-item.unread {
  background: rgba(140, 109, 63, 0.06);
  border-left: 4px solid var(--color-primary, #8C6D3F);
}

.notif-icon-col {
  flex-shrink: 0;
}

.icon-bubble {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  background: #F4EAD5;
}

.icon-bubble.success {
  background: #DCFCE7;
}

.icon-bubble.danger {
  background: #FEE2E2;
}

.icon-bubble.request {
  background: #FEF3C7;
}

.icon-bubble.trip {
  background: #E0F2FE;
}

.icon-bubble.chat {
  background: #EDE9FE;
}

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.type-tag {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
  background: #EFE1C6;
  color: #5C4728;
}

.type-tag.success {
  background: #DCFCE7;
  color: #166534;
}

.type-tag.danger {
  background: #FEE2E2;
  color: #991B1B;
}

.type-tag.request {
  background: #FEF3C7;
  color: #92400E;
}

.type-tag.trip {
  background: #E0F2FE;
  color: #0369A1;
}

.type-tag.chat {
  background: #EDE9FE;
  color: #5B21B6;
}

.notif-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary, #8C6D3F);
  display: inline-block;
}

.title-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notif-time {
  font-size: 0.74rem;
  color: var(--color-text-muted, #7A6A55);
  white-space: nowrap;
}

.btn-delete-notif {
  background: none;
  border: none;
  color: var(--color-text-muted, #7A6A55);
  font-size: 1.15rem;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s, background 0.15s;
}

.btn-delete-notif:hover {
  opacity: 1;
  background: rgba(192, 57, 43, 0.1);
  color: #C0392B;
}

.notif-text {
  font-size: 0.86rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.5;
  margin-bottom: 10px;
}

.notif-footer-row {
  display: flex;
  align-items: center;
}

.notif-action-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  text-decoration: none;
}

.notif-action-link:hover {
  text-decoration: underline;
}

.empty-notif {
  padding: 64px 20px;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
}

.empty-icon {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.empty-notif h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.empty-notif p {
  font-size: 0.86rem;
  max-width: 420px;
  margin: 0 auto;
}
</style>
