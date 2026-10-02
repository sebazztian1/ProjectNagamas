<template>
  <div class="admin-chat-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Live Chat & Notifikasi Masuk</h1>
        <p class="page-subtitle">Balas pertanyaan calon pembeli seputar detail produk, stok fisik toko Jakarta, maupun request trip luar negeri.</p>
      </div>
    </div>

    <div class="chat-inbox-card">
      <!-- Conversation List -->
      <div class="inbox-sidebar">
        <div class="inbox-search">
          <input v-model="search" type="text" placeholder="Cari nama customer..." />
        </div>

        <div class="customer-room-list">
          <div 
            v-for="c in customers" 
            :key="c.id"
            class="cust-room-item"
            :class="{ active: activeCust.id === c.id }"
            @click="activeCust = c"
          >
            <div class="cust-avatar">{{ c.name.charAt(0) }}</div>
            <div class="cust-meta">
              <div class="cust-top">
                <span class="cust-name">{{ c.name }}</span>
                <span class="cust-time">{{ c.time }}</span>
              </div>
              <p class="cust-preview">{{ c.lastMsg }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Conversation Area -->
      <div class="inbox-conversation">
        <div class="conv-header">
          <div class="user-info">
            <strong>{{ activeCust.name }}</strong>
            <span class="user-phone">{{ activeCust.phone }}</span>
          </div>
          <span class="active-badge">&bull; Sesi Chat Aktif</span>
        </div>

        <!-- Chat Stream -->
        <div class="chat-bubbles-area">
          <div 
            v-for="(m, i) in activeCust.messages" 
            :key="i"
            class="bubble-row"
            :class="{ 'admin-reply': m.sender === 'admin' }"
          >
            <div class="chat-bubble">
              <span class="sender-name">{{ m.sender === 'admin' ? 'Admin dbb_luxe' : activeCust.name }}</span>
              <p>{{ m.text }}</p>
              <span class="time-stamp">{{ m.time }}</span>
            </div>
          </div>
        </div>

        <!-- Reply Input Bar -->
        <form @submit.prevent="sendAdminReply" class="admin-input-bar">
          <input v-model="replyText" type="text" placeholder="Ketik balasan admin ke customer..." required />
          <button type="submit" class="btn-reply">Kirim Balasan</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')
const replyText = ref('')

const customers = ref([
  {
    id: 'c-1',
    name: 'Siti Rahmawati',
    phone: '0812-3456-7890',
    time: '10:30',
    lastMsg: 'Apakah produk SK-II ini asli beli di Jepang?',
    messages: [
      { sender: 'customer', text: 'Halo admin, apakah produk SK-II ini asli beli di Jepang?', time: '10:28' },
      { sender: 'admin', text: 'Halo kak Siti! Betul 100% original dari Don Quijote Tokyo ya, struk resmi toko akan kami sertakan.', time: '10:30' }
    ]
  },
  {
    id: 'c-2',
    name: 'Budi Santoso',
    phone: '0819-8765-4321',
    time: '09:12',
    lastMsg: 'Kak kalau titip sepatu Onitsuka Tiger bisa?',
    messages: [
      { sender: 'customer', text: 'Kak kalau titip sepatu Onitsuka Tiger size 42 di trip Jepang nanti bisa?', time: '09:10' },
      { sender: 'admin', text: 'Bisa banget kak Budi! Silakan submit di menu Request Titip Produk ya, nanti kami cek harga store Jepangnya.', time: '09:12' }
    ]
  }
])

const activeCust = ref(customers.value[0])

const sendAdminReply = () => {
  if (!replyText.value.trim()) return

  activeCust.value.messages.push({
    sender: 'admin',
    text: replyText.value,
    time: 'Baru saja'
  })
  replyText.value = ''
}
</script>

<style scoped>
.admin-chat-page {
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

.chat-inbox-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 600px;
  overflow: hidden;
}

.inbox-sidebar {
  border-right: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  flex-direction: column;
}

.inbox-search {
  padding: 14px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.inbox-search input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.82rem;
  outline: none;
}

.customer-room-list {
  overflow-y: auto;
  flex: 1;
}

.cust-room-item {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.cust-room-item:hover {
  background: var(--color-canvas, #F4F6F8);
}

.cust-room-item.active {
  background: var(--color-secondary, #E4E7EB);
}

.cust-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary, #4A5D73);
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
  color: var(--color-text, #1E293B);
}

.cust-time {
  font-size: 0.7rem;
  color: var(--color-text-muted, #64748B);
}

.cust-preview {
  font-size: 0.76rem;
  color: var(--color-text-muted, #64748B);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Conversation */
.inbox-conversation {
  display: flex;
  flex-direction: column;
  background: var(--color-canvas, #F4F6F8);
}

.conv-header {
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info strong {
  display: block;
  font-size: 0.95rem;
  color: var(--color-text, #1E293B);
}

.user-phone {
  font-size: 0.75rem;
  color: var(--color-text-muted, #64748B);
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
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
}

.bubble-row.admin-reply .chat-bubble {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.sender-name {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.8;
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
  border-top: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  gap: 10px;
}

.admin-input-bar input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  outline: none;
}

.btn-reply {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
