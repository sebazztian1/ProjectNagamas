<template>
  <div class="customer-chat-widget">
    <!-- Floating Launcher Button -->
    <button 
      class="chat-launcher-btn" 
      :class="{ 'is-open': isChatOpen }"
      @click="toggleChat"
      title="Chat dengan Admin Nagamas"
      aria-label="Buka Chat dengan Admin"
    >
      <div class="launcher-icon-wrap">
        <svg v-if="!isChatOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <span v-if="!isChatOpen" class="launcher-text">Chat Admin</span>
      <span v-if="!isChatOpen" class="online-indicator"></span>
      <span v-if="customerUnreadCount > 0 && !isChatOpen" class="launcher-unread-badge">
        {{ customerUnreadCount }}
      </span>
    </button>

    <!-- Chat Window Popup -->
    <div v-if="isChatOpen" class="chat-window-card">
      <!-- Window Header -->
      <div class="chat-header">
        <div class="header-agent-info">
          <div class="agent-avatar-wrap">
            <div class="agent-avatar">N</div>
            <span class="agent-online-dot"></span>
          </div>
          <div>
            <div class="agent-name-row">
              <span class="agent-name">Admin Support Nagamas</span>
              <span class="verified-tag">&#10003;</span>
            </div>
            <span class="agent-status">Online &bull; Siap Membantu</span>
          </div>
        </div>

        <div class="header-controls">
          <button class="header-btn" @click="closeChat" title="Tutup Chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Attached Product Inquiry Context (if present) -->
      <div v-if="attachedProduct" class="attached-product-banner">
        <img :src="attachedProduct.image" :alt="attachedProduct.name" class="attached-thumb" />
        <div class="attached-details">
          <span class="attached-tag">Menanyakan Produk Ini:</span>
          <div class="attached-title">{{ attachedProduct.name }}</div>
          <div class="attached-meta">
            <span class="attached-price">{{ formatPrice(attachedProduct.price) }}</span>
            &bull;
            <span :class="attachedProduct.stockCount > 0 ? 'text-green' : 'text-red'">
              {{ attachedProduct.stockCount > 0 ? `Stok: ${attachedProduct.stockCount} unit` : 'Stok Habis' }}
            </span>
          </div>
        </div>
        <button class="remove-attached-btn" @click="removeAttachedProduct" title="Hapus produk">
          &times;
        </button>
      </div>

      <!-- Messages Stream -->
      <div class="chat-body" ref="messagesBody">
        <div class="welcome-box">
          <p class="welcome-heading">&#128075; Selamat datang di Live Chat Nagamas!</p>
          <p class="welcome-sub">Silakan tanyakan seputar stok produk, rekomendasi ukuran, proses pengiriman, atau status pesanan Anda.</p>
        </div>

        <div class="date-chip">
          <span>Hari Ini</span>
        </div>

        <!-- Chat Bubble List -->
        <div 
          v-for="msg in customerMessages" 
          :key="msg.id"
          class="chat-bubble-wrapper"
          :class="msg.sender === 'user' ? 'user-msg' : 'admin-msg'"
        >
          <div class="chat-bubble">
            <span v-if="msg.sender === 'admin'" class="bubble-sender-label">Admin Nagamas</span>
            <p class="bubble-text">{{ msg.text }}</p>
            <div class="bubble-footer">
              <span class="bubble-time">{{ msg.timestamp }}</span>
              <span v-if="msg.sender === 'user'" class="check-status">&#10003;&#10003;</span>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isAdminTyping" class="chat-bubble-wrapper admin-msg">
          <div class="chat-bubble typing-bubble">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-label">Admin sedang mengetik...</span>
          </div>
        </div>
      </div>

      <!-- Quick Suggestion Question Chips -->
      <div class="quick-questions-wrapper">
        <button 
          v-for="(q, idx) in quickQuestions" 
          :key="idx"
          class="quick-q-btn"
          @click="selectQuickQuestion(q)"
        >
          {{ q }}
        </button>
      </div>

      <!-- Input Bar Form -->
      <form @submit.prevent="handleSubmitMessage" class="chat-footer">
        <div class="input-row">
          <input 
            v-model="inputText" 
            type="text" 
            placeholder="Tulis pesan ke admin..." 
            class="chat-input"
            ref="inputField"
          />
          <button 
            type="submit" 
            class="send-btn" 
            :disabled="!inputText.trim()"
            title="Kirim Pesan"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="footer-help-note">
          <span>Official Customer Service Nagamas</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useCustomerChat } from '../composables/useCustomerChat'
import { useToast } from '../composables/useToast'

const {
  isChatOpen,
  customerUnreadCount,
  attachedProduct,
  isAdminTyping,
  customerMessages,
  toggleChat,
  closeChat,
  removeAttachedProduct,
  sendCustomerMessage
} = useCustomerChat()

const { showToast } = useToast()

const inputText = ref('')
const messagesBody = ref<HTMLElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)

const quickQuestions = [
  '📦 Apakah produk ini ready stok?',
  '🚚 Berapa lama estimasi pengiriman?',
  '💳 Metode pembayaran apa saja yang tersedia?',
  '👕 Bagaimana panduan ukuran / size chart?'
]

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesBody.value) {
      messagesBody.value.scrollTop = messagesBody.value.scrollHeight
    }
  })
}

watch(customerMessages, () => {
  scrollToBottom()
}, { deep: true })

watch(isAdminTyping, () => {
  scrollToBottom()
})

watch(isChatOpen, (open) => {
  if (open) {
    scrollToBottom()
    nextTick(() => {
      inputField.value?.focus()
    })
  }
})

// If user attached a product, pre-populate question if input is empty
watch(attachedProduct, (prod) => {
  if (prod && !inputText.value) {
    inputText.value = `Halo admin, mau tanya apakah produk ${prod.name} ready stok?`
  }
})

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const selectQuickQuestion = (question: string) => {
  inputText.value = question
  handleSubmitMessage()
}

const handleSubmitMessage = () => {
  if (!inputText.value.trim()) return
  const text = inputText.value
  inputText.value = ''

  sendCustomerMessage(text, (reply) => {
    showToast('Pesan dari Admin Nagamas', reply.slice(0, 70) + '...', 'info')
  })

  scrollToBottom()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.customer-chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ========================================================= */
/* LAUNCHER BUTTON */
/* ========================================================= */
.chat-launcher-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 30px;
  padding: 12px 20px 12px 14px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.chat-launcher-btn:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.35);
}

.chat-launcher-btn.is-open {
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  justify-content: center;
  background: #334155;
}

.launcher-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.launcher-text {
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
  animation: pulseGreen 2s infinite;
}

@keyframes pulseGreen {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.launcher-unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

/* ========================================================= */
/* CHAT WINDOW */
/* ========================================================= */
.chat-window-card {
  position: fixed;
  bottom: 84px;
  right: 24px;
  width: 380px;
  max-width: calc(100vw - 32px);
  height: 540px;
  max-height: calc(100vh - 110px);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: chatPopup 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10000;
}

@keyframes chatPopup {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.chat-header {
  background: #0f172a;
  color: #ffffff;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar-wrap {
  position: relative;
}

.agent-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.agent-online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #0f172a;
}

.agent-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.agent-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: #ffffff;
}

.verified-tag {
  font-size: 0.65rem;
  background: #38bdf8;
  color: #0f172a;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.agent-status {
  font-size: 0.72rem;
  color: #94a3b8;
  display: block;
}

.header-controls {
  display: flex;
  align-items: center;
}

.header-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Attached Product Banner */
.attached-product-banner {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.attached-thumb {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.attached-details {
  flex: 1;
  min-width: 0;
}

.attached-tag {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 600;
  display: block;
}

.attached-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attached-meta {
  font-size: 0.72rem;
  display: flex;
  gap: 6px;
}

.attached-price {
  font-weight: 700;
  color: #0f172a;
}

.text-green { color: #16a34a; font-weight: 600; }
.text-red { color: #dc2626; font-weight: 600; }

.remove-attached-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.remove-attached-btn:hover {
  color: #ef4444;
}

/* Chat Body Stream */
.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8fafc;
}

.welcome-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.welcome-heading {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.welcome-sub {
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.date-chip {
  text-align: center;
  margin: 4px 0;
}

.date-chip span {
  font-size: 0.68rem;
  color: #94a3b8;
  background: #e2e8f0;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
}

/* Message Bubbles */
.chat-bubble-wrapper {
  display: flex;
  width: 100%;
}

.user-msg {
  justify-content: flex-end;
}

.admin-msg {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.84rem;
  line-height: 1.4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.user-msg .chat-bubble {
  background: #0f172a;
  color: #ffffff;
  border-bottom-right-radius: 3px;
}

.admin-msg .chat-bubble {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 3px;
}

.bubble-sender-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 2px;
}

.bubble-text {
  margin: 0;
  white-space: pre-line;
  word-break: break-word;
}

.bubble-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.bubble-time {
  font-size: 0.65rem;
  opacity: 0.7;
}

.check-status {
  font-size: 0.68rem;
  color: #38bdf8;
  font-weight: 800;
}

/* Typing Bubble */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.typing-label {
  font-size: 0.72rem;
  color: #64748b;
  font-style: italic;
}

/* Quick Question Chips */
.quick-questions-wrapper {
  padding: 8px 14px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  white-space: nowrap;
}

.quick-q-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 5px 10px;
  font-size: 0.72rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 600;
}

.quick-q-btn:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

/* Footer Input */
.chat-footer {
  padding: 10px 14px 12px 14px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.84rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}

.chat-input:focus {
  border-color: #0f172a;
}

.send-btn {
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #1e293b;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.footer-help-note {
  display: flex;
  justify-content: center;
  font-size: 0.65rem;
  color: #94a3b8;
}

@media (max-width: 480px) {
  .customer-chat-widget {
    bottom: 16px;
    right: 16px;
  }
  .chat-window-card {
    right: 16px;
    bottom: 74px;
    width: calc(100vw - 32px);
    height: 480px;
  }
}
</style>
