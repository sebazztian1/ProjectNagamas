<template>
  <div class="chat-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Pesan & Live Chat</span>
      </div>

      <div class="chat-box-card">
        <!-- Sidebar Room List -->
        <div class="chat-sidebar">
          <div class="sidebar-header">
            <h3>Pesan Masuk (Inbox)</h3>
            <span class="cs-badge">Admin Online</span>
          </div>

          <div class="room-list">
            <div 
              v-for="room in chatRooms" 
              :key="room.id"
              class="room-item"
              :class="{ active: activeRoom.id === room.id }"
              @click="activeRoom = room"
            >
              <div class="room-avatar">{{ room.productName.charAt(0) }}</div>
              <div class="room-info">
                <div class="room-title-row">
                  <span class="room-title">{{ room.productName }}</span>
                  <span class="room-time">{{ room.lastTime }}</span>
                </div>
                <p class="room-last-msg">{{ room.lastMessage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Chat Area -->
        <div class="chat-conversation">
          <!-- Active Header with Product Preview -->
          <div class="chat-conv-header">
            <div class="product-preview-chip">
              <span class="badge-topic">Topik Produk:</span>
              <strong>{{ activeRoom.productName }}</strong>
            </div>
            <span class="admin-status">&bull; Admin dbb_luxe Sedang Aktif</span>
          </div>

          <!-- Message History -->
          <div class="messages-flow">
            <div 
              v-for="(msg, i) in activeRoom.messages" 
              :key="i"
              class="message-bubble-row"
              :class="{ 'is-me': msg.sender === 'me' }"
            >
              <div class="bubble">
                <p>{{ msg.text }}</p>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
            </div>
          </div>

          <!-- Input Bar -->
          <form @submit.prevent="sendMessage" class="chat-input-bar">
            <button type="button" class="btn-attach" title="Kirim gambar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
            </button>
            <input 
              v-model="inputMessage" 
              type="text" 
              placeholder="Tulis pesan atau pertanyaan ke admin..." 
              required 
            />
            <button type="submit" class="btn-send">
              Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputMessage = ref('')

const chatRooms = ref([
  {
    id: 'room-1',
    productName: 'SK-II Facial Treatment Essence',
    lastTime: '10:30',
    lastMessage: 'Halo kak, stok di toko Jakarta ready 12 pcs ya!',
    messages: [
      { sender: 'me', text: 'Halo admin, apakah produk SK-II ini asli beli di Jepang?', time: '10:28' },
      { sender: 'admin', text: 'Halo kak, betul 100% original dari Don Quijote Shinjuku Tokyo ya kak. Di struk ada serial number dan barcode resminya.', time: '10:30' }
    ]
  },
  {
    id: 'room-2',
    productName: 'Tokyo Banana Box of 8',
    lastTime: 'Kemarin',
    lastMessage: 'Expired date sampai akhir bulan depan kak.',
    messages: [
      { sender: 'me', text: 'Kak, Tokyo Banana exp datenya sampai kapan?', time: 'Kemarin' },
      { sender: 'admin', text: 'Expired date sampai akhir bulan depan kak, kami baru ambil fresh dari Tokyo Station.', time: 'Kemarin' }
    ]
  }
])

const activeRoom = ref(chatRooms.value[0])

const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  activeRoom.value.messages.push({
    sender: 'me',
    text: inputMessage.value,
    time: 'Baru saja'
  })

  const userText = inputMessage.value
  inputMessage.value = ''

  // Mock auto response from admin
  setTimeout(() => {
    activeRoom.value.messages.push({
      sender: 'admin',
      text: 'Terima kasih pertanyaannya kak! Tim admin kami sedang mengecek detail pesanan Anda.',
      time: 'Baru saja'
    })
  }, 1200)
}
</script>

<style scoped>
.chat-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 1040px;
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

.chat-box-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 600px;
}

/* Sidebar */
.chat-sidebar {
  border-right: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.sidebar-header {
  padding: 18px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
}

.cs-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: #DCFCE7;
  color: #166534;
  padding: 3px 8px;
  border-radius: 20px;
}

.room-list {
  overflow-y: auto;
  flex: 1;
}

.room-item {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.room-item:hover {
  background: var(--color-canvas, #F4F6F8);
}

.room-item.active {
  background: var(--color-secondary, #E4E7EB);
}

.room-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.room-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-time {
  font-size: 0.7rem;
  color: var(--color-text-muted, #64748B);
}

.room-last-msg {
  font-size: 0.78rem;
  color: var(--color-text-muted, #64748B);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Conversation Area */
.chat-conversation {
  display: flex;
  flex-direction: column;
  background: var(--color-canvas, #F4F6F8);
}

.chat-conv-header {
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-preview-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
}

.badge-topic {
  font-size: 0.72rem;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.admin-status {
  font-size: 0.75rem;
  color: #10B981;
  font-weight: 700;
}

.messages-flow {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-bubble-row {
  display: flex;
  justify-content: flex-start;
}

.message-bubble-row.is-me {
  justify-content: flex-end;
}

.bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  line-height: 1.45;
}

.message-bubble-row.is-me .bubble {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.msg-time {
  display: block;
  font-size: 0.68rem;
  margin-top: 4px;
  text-align: right;
  opacity: 0.75;
}

.chat-input-bar {
  padding: 14px 20px;
  background: #ffffff;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  gap: 10px;
}

.btn-attach {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--color-text-muted, #64748B);
  cursor: pointer;
}

.chat-input-bar input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  outline: none;
}

.chat-input-bar input:focus {
  border-color: var(--color-primary, #4A5D73);
}

.btn-send {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-send:hover {
  background: var(--color-primary-hover, #384759);
}

@media (max-width: 768px) {
  .chat-box-card {
    grid-template-columns: 1fr;
  }
  .chat-sidebar {
    display: none;
  }
}
</style>
