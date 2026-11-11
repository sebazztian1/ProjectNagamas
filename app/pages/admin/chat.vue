<template>
  <div class="admin-chat-page">
    <div class="page-head">
      <h1 class="page-title">Live Chat Pelanggan</h1>
      <button class="btn-refresh" @click="refreshChat" :disabled="isRefreshing">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': isRefreshing }">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
        <span>Refresh</span>
      </button>
    </div>

    <div class="chat-inbox-card">
      <!-- Conversation List -->
      <div class="inbox-sidebar">
        <div class="inbox-search">
          <input v-model="search" type="text" placeholder="Cari username / no. WhatsApp..." />
        </div>

        <div class="customer-room-list">
          <div v-if="filteredRooms.length === 0" class="empty-rooms">
            Belum ada ruang percakapan.
          </div>

          <div
            v-for="r in filteredRooms"
            :key="r.id"
            class="cust-room-item"
            :class="{ active: activeRoom?.id === r.id }"
            @click="selectRoom(r)"
          >
            <div class="cust-avatar">{{ r.customerUsername.charAt(0).toUpperCase() }}</div>
            <div class="cust-meta">
              <div class="cust-top">
                <span class="cust-name">@{{ r.customerUsername }}</span>
                <span class="cust-time">{{ formatRoomTime(r.updatedAt) }}</span>
              </div>
              <div class="cust-bottom">
                <p class="cust-preview">{{ r.lastMessage || 'Belum ada pesan' }}</p>
                <span v-if="r.unreadAdminCount > 0" class="unread-pill">{{ r.unreadAdminCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Conversation Area -->
      <div v-if="activeRoom" class="inbox-conversation">
        <div class="conv-header">
          <div class="user-info">
            <strong>@{{ activeRoom.customerUsername }}</strong>
            <span class="user-phone">{{ activeRoom.customerPhone }}</span>
          </div>
          <span class="active-badge">&bull; Realtime Aktif</span>
        </div>

        <!-- Chat Stream -->
        <div ref="messagesArea" class="chat-bubbles-area">
          <div v-if="messages.length === 0" class="empty-stream">
            Belum ada pesan pada ruang chat ini.
          </div>

          <div
            v-for="m in messages"
            :key="m.id"
            class="bubble-row"
            :class="{ 'admin-reply': m.senderRole === 'admin' || m.senderRole === 'staff' }"
          >
            <div class="chat-bubble">
              <span class="sender-name">
                {{ m.senderRole === 'admin' || m.senderRole === 'staff' ? 'Admin' : '@' + activeRoom.customerUsername }}
              </span>

              <!-- Shared Product Card -->
              <NuxtLink
                v-if="m.product"
                :to="m.product.productType === 'jastip' && m.product.tripSlug ? `/jastip/${m.product.tripSlug}/${m.product.slug}` : `/ready/${m.product.slug}`"
                target="_blank"
                class="msg-product-card"
              >
                <img v-if="m.product.imageUrl" :src="m.product.imageUrl" :alt="m.product.name" class="msg-prod-img" />
                <div class="msg-prod-meta">
                  <span class="msg-prod-type">{{ m.product.productType === 'jastip' ? 'Produk Jastip' : 'Produk Tersedia' }}</span>
                  <strong class="msg-prod-title">{{ m.product.name }}</strong>
                  <span class="msg-prod-price">{{ formatRupiah(m.product.price) }}</span>
                </div>
              </NuxtLink>

              <!-- Shared Jastip Trip Card -->
              <NuxtLink
                v-if="m.trip && !m.product"
                :to="`/jastip/${m.trip.slug}`"
                target="_blank"
                class="msg-product-card"
              >
                <img v-if="m.trip.coverImageUrl" :src="m.trip.coverImageUrl" :alt="m.trip.title" class="msg-prod-img" />
                <div class="msg-prod-meta">
                  <span class="msg-prod-type">Trip Jastip &bull; {{ m.trip.country }}</span>
                  <strong class="msg-prod-title">{{ m.trip.title }}</strong>
                  <span class="msg-prod-price">{{ m.trip.status === 'open' ? 'Open PO' : 'Tutup PO' }}</span>
                </div>
              </NuxtLink>

              <!-- Shared Product Request Card -->
              <NuxtLink
                v-if="m.productRequest"
                to="/admin/request"
                class="msg-product-card"
              >
                <img v-if="m.productRequest.referenceImageUrl" :src="m.productRequest.referenceImageUrl" :alt="m.productRequest.productName" class="msg-prod-img" />
                <div class="msg-prod-meta">
                  <span class="msg-prod-type">Request Produk &bull; {{ m.productRequest.status }}</span>
                  <strong class="msg-prod-title">{{ m.productRequest.productName }}</strong>
                  <span class="msg-prod-price">
                    {{ m.productRequest.quotedPrice ? formatRupiah(m.productRequest.quotedPrice) : (m.productRequest.tripTitle || 'Menunggu Penawaran') }}
                  </span>
                </div>
              </NuxtLink>

              <!-- Shared Image -->
              <a v-if="m.imageUrl" :href="m.imageUrl" target="_blank" rel="noopener" class="msg-img-wrap">
                <img :src="m.imageUrl" alt="Lampiran" class="msg-img" />
              </a>

              <p v-if="m.content">{{ m.content }}</p>
              <span class="time-stamp">{{ formatMsgTime(m.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Reply Input Bar -->
        <form @submit.prevent="sendAdminReply" class="admin-input-bar">
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style="display: none"
            @change="handleAdminImageUpload"
          />
          <button
            type="button"
            class="btn-attach"
            title="Kirim gambar"
            :disabled="isUploading"
            @click="fileInput?.click()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
          </button>
          <input
            v-model="replyText"
            type="text"
            placeholder="Ketik balasan admin ke customer..."
          />
          <button type="submit" class="btn-reply" :disabled="isSending || !replyText.trim()">
            {{ isSending ? '...' : 'Kirim Balasan' }}
          </button>
        </form>
      </div>

      <div v-else class="inbox-empty-placeholder">
        <p>Pilih percakapan untuk membalas.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Ably from 'ably'
import { useToast } from '../../composables/useToast'
import { useAdminStats } from '../../composables/useAdminStats'

definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const { showToast } = useToast()
const { setUnreadChatStats, fetchAdminStats } = useAdminStats()

const search = ref('')
const replyText = ref('')
const isSending = ref(false)
const isUploading = ref(false)
const isRefreshing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const messagesArea = ref<HTMLElement | null>(null)

const rooms = ref<any[]>([])
const activeRoom = ref<any | null>(null)
const messages = ref<any[]>([])

let ablyClient: Ably.Realtime | null = null
let inboxChannel: Ably.RealtimeChannel | null = null
let activeRoomChannel: Ably.RealtimeChannel | null = null

const filteredRooms = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rooms.value
  const cleanUser = q.replace(/^@/, '')
  const digits = q.replace(/\D/g, '')
  return rooms.value.filter(r => {
    const matchUser = r.customerUsername?.toLowerCase().includes(cleanUser)
    const matchPhone = r.customerPhone?.toLowerCase().includes(q)
    const matchPhoneDigits = digits.length > 0 && (r.customerPhone || '').replace(/\D/g, '').includes(digits)
    const matchMsg = r.lastMessage?.toLowerCase().includes(q)
    return matchUser || matchPhone || matchPhoneDigits || matchMsg
  })
})

const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID')

const formatMsgTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const formatRoomTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

const syncAdminUnreadBadge = () => {
  const totalUnreadMessages = rooms.value.reduce((acc, r) => acc + Number(r.unreadAdminCount || 0), 0)
  const totalUnreadRooms = rooms.value.filter(r => Number(r.unreadAdminCount || 0) > 0).length
  setUnreadChatStats(totalUnreadMessages, totalUnreadRooms)
}

const subscribeToRoom = async (roomId: number) => {
  if (!ablyClient) return
  try {
    if (activeRoomChannel) {
      activeRoomChannel.unsubscribe()
    }
    activeRoomChannel = ablyClient.channels.get(`chat:room-${roomId}`)
    await activeRoomChannel.subscribe('new-message', (msg) => {
      const incoming = msg.data
      if (!messages.value.some(m => String(m.id) === String(incoming.id))) {
        messages.value.push(incoming)
        scrollToBottom()
      }
      if (incoming.senderRole === 'customer') {
        $fetch('/api/chat/read', { method: 'POST', body: { roomId } })
          .then(() => {
            const idx = rooms.value.findIndex(r => r.id === roomId)
            if (idx !== -1) {
              rooms.value[idx].unreadAdminCount = 0
            }
            syncAdminUnreadBadge()
          })
          .catch(() => {})
      }
    })
  } catch (err) {
    // Non-blocking
  }
}

const selectRoom = async (roomItem: any) => {
  try {
    const res = await $fetch<{ room: any; messages: any[] }>('/api/chat/room', {
      query: { roomId: roomItem.id }
    })
    if (res?.room) {
      activeRoom.value = res.room
      messages.value = res.messages || []
      const idx = rooms.value.findIndex(r => r.id === res.room.id)
      if (idx !== -1) {
        rooms.value[idx].unreadAdminCount = 0
      }
      syncAdminUnreadBadge()
      scrollToBottom()
      await subscribeToRoom(res.room.id)
    }
  } catch (err: any) {
    showToast('Gagal Memuat', err?.data?.message || 'Gagal membuka percakapan', 'warning')
  }
}

const fetchRooms = async () => {
  try {
    const list = await $fetch<any[]>('/api/chat/rooms')
    rooms.value = list || []
    syncAdminUnreadBadge()

    // Check if ?userId=... was passed from /admin/request or /admin/customer
    const targetUserId = route.query.userId ? Number(route.query.userId) : null
    if (targetUserId && !isNaN(targetUserId)) {
      const res = await $fetch<{ room: any; messages: any[] }>('/api/chat/room', {
        query: { customerId: targetUserId }
      })
      if (res?.room) {
        const existIdx = rooms.value.findIndex(r => r.id === res.room.id)
        if (existIdx === -1) {
          rooms.value.unshift(res.room)
        } else {
          rooms.value[existIdx].unreadAdminCount = 0
        }
        activeRoom.value = res.room
        messages.value = res.messages || []
        syncAdminUnreadBadge()
        scrollToBottom()
        await subscribeToRoom(res.room.id)
        return
      }
    }

    if (rooms.value.length > 0 && !activeRoom.value) {
      await selectRoom(rooms.value[0])
    }
  } catch (err) {
    // Non-blocking
  }
}

const refreshChat = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await fetchRooms()
    if (activeRoom.value) {
      await selectRoom(activeRoom.value)
    }
    await fetchAdminStats(true)
  } finally {
    isRefreshing.value = false
  }
}

const initAblyAdmin = async () => {
  if (import.meta.server) return
  try {
    ablyClient = new Ably.Realtime({
      authUrl: '/api/chat/token'
    })
    inboxChannel = ablyClient.channels.get('chat:admin-inbox')
    await inboxChannel.subscribe('room-updated', (event) => {
      const updated = event.data
      const existingIdx = rooms.value.findIndex(r => r.id === updated.id)
      if (existingIdx !== -1) {
        const isCurrentActive = activeRoom.value?.id === updated.id
        rooms.value[existingIdx] = {
          ...rooms.value[existingIdx],
          lastMessage: updated.lastMessage,
          unreadAdminCount: isCurrentActive ? 0 : updated.unreadAdminCount,
          updatedAt: updated.updatedAt
        }
        // Move updated room to top
        const [moved] = rooms.value.splice(existingIdx, 1)
        rooms.value.unshift(moved)
      } else {
        rooms.value.unshift(updated)
      }

      syncAdminUnreadBadge()

      if (updated.latestMessage?.senderRole === 'customer' && activeRoom.value?.id !== updated.id) {
        showToast(
          `Pesan Baru dari @${updated.customerUsername}`,
          updated.lastMessage || 'Mengirim pesan baru',
          'info'
        )
      }
    })
  } catch (err) {
    // Ably belum dikonfigurasi
  }
}

onMounted(async () => {
  await initAblyAdmin()
  await fetchRooms()
})

onBeforeUnmount(() => {
  activeRoomChannel?.unsubscribe()
  inboxChannel?.unsubscribe()
  ablyClient?.close()
})

const sendAdminReply = async () => {
  if (!replyText.value.trim() || !activeRoom.value) return
  isSending.value = true
  try {
    const text = replyText.value.trim()
    replyText.value = ''
    const sent = await $fetch<any>('/api/chat/send', {
      method: 'POST',
      body: {
        roomId: activeRoom.value.id,
        messageType: 'text',
        content: text
      }
    })
    if (!messages.value.some(m => String(m.id) === String(sent.id))) {
      messages.value.push(sent)
      scrollToBottom()
    }
  } catch (err: any) {
    showToast('Gagal Mengirim', err?.data?.message || 'Gagal mengirim balasan', 'warning')
  } finally {
    isSending.value = false
  }
}

const handleAdminImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !activeRoom.value) return

  isUploading.value = true
  try {
    const fd = new FormData()
    fd.append('folder', 'chat')
    fd.append('file', file)

    const uploaded = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: fd
    })

    if (uploaded?.url) {
      const sent = await $fetch<any>('/api/chat/send', {
        method: 'POST',
        body: {
          roomId: activeRoom.value.id,
          messageType: 'image',
          imageUrl: uploaded.url,
          content: replyText.value.trim() || null
        }
      })
      replyText.value = ''
      if (!messages.value.some(m => String(m.id) === String(sent.id))) {
        messages.value.push(sent)
        scrollToBottom()
      }
    }
  } catch (err: any) {
    showToast('Gagal Upload', err?.data?.message || 'Gagal mengunggah gambar', 'warning')
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<style scoped>
.admin-chat-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
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
  white-space: nowrap;
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

.chat-inbox-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 620px;
  overflow: hidden;
}

.inbox-sidebar {
  border-right: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  flex-direction: column;
}

.inbox-search {
  padding: 14px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.inbox-search input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.82rem;
  outline: none;
  box-sizing: border-box;
}

.customer-room-list {
  overflow-y: auto;
  flex: 1;
}

.empty-rooms {
  padding: 32px 16px;
  text-align: center;
  font-size: 0.84rem;
  color: var(--color-text-muted, #7A6A55);
}

.cust-room-item {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.cust-room-item:hover {
  background: var(--color-canvas, #FFFBF2);
}

.cust-room-item.active {
  background: var(--color-secondary, #EFE1C6);
}

.cust-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.cust-meta {
  flex: 1;
  min-width: 0;
}

.cust-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.cust-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.cust-time {
  font-size: 0.7rem;
  color: var(--color-text-muted, #7A6A55);
}

.cust-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.cust-preview {
  font-size: 0.76rem;
  color: var(--color-text-muted, #7A6A55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.unread-pill {
  background: var(--color-danger, #A33A2A);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.inbox-conversation {
  display: flex;
  flex-direction: column;
  background: var(--color-canvas, #FFFBF2);
  height: 100%;
  overflow: hidden;
}

.inbox-empty-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.9rem;
  background: var(--color-canvas, #FFFBF2);
}

.conv-header {
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info strong {
  display: block;
  font-size: 0.95rem;
  color: var(--color-text, #2B2116);
}

.user-phone {
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
}

.active-badge {
  font-size: 0.75rem;
  color: #10B981;
  font-weight: 700;
}

.chat-bubbles-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-stream {
  margin: auto;
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.86rem;
}

.bubble-row {
  display: flex;
  justify-content: flex-start;
}

.bubble-row.admin-reply {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 65%;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
}

.bubble-row.admin-reply .chat-bubble {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.sender-name {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.8;
}

.msg-product-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 251, 242, 0.95);
  color: #2B2116;
  text-decoration: none;
  margin-bottom: 8px;
  border: 1px solid #EFE1C6;
}

.msg-prod-img {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.msg-prod-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.msg-prod-type {
  font-size: 0.62rem;
  font-weight: 700;
  color: #8C6D3F;
  text-transform: uppercase;
}

.msg-prod-title {
  font-size: 0.78rem;
  color: #2B2116;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-prod-price {
  font-size: 0.74rem;
  font-weight: 700;
  color: #8C6D3F;
}

.msg-img-wrap {
  display: block;
  margin-bottom: 6px;
}

.msg-img {
  max-width: 220px;
  max-height: 220px;
  border-radius: 8px;
  object-fit: cover;
}

.time-stamp {
  display: block;
  font-size: 0.65rem;
  text-align: right;
  margin-top: 4px;
  opacity: 0.75;
}

.admin-input-bar {
  padding: 14px 20px;
  background: #ffffff;
  border-top: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  gap: 10px;
}

.btn-attach {
  background: none;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

.admin-input-bar input[type="text"] {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  outline: none;
}

.btn-reply {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-reply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
