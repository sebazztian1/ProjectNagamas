<template>
  <div class="chat-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Live Chat</span>
      </div>

      <div class="chat-box-card">
        <!-- Main Chat Area (Satu Ruang Chat Umum per Customer) -->
        <div class="chat-conversation">
          <!-- Header -->
          <div class="chat-conv-header">
            <div class="header-left">
              <div class="admin-avatar">D</div>
              <div>
                <strong class="header-title">Admin Support dbb_luxe</strong>
                <span class="admin-status">&bull; Online</span>
              </div>
            </div>
          </div>

          <!-- Attached Product Preview Banner -->
          <div v-if="attachedProduct" class="attached-banner">
            <img :src="attachedProduct.image" :alt="attachedProduct.name" class="attached-img" />
            <div class="attached-info">
              <span class="attached-label">Menanyakan Produk:</span>
              <strong class="attached-name">{{ attachedProduct.name }}</strong>
              <span class="attached-price">{{ formatRupiah(attachedProduct.price) }}</span>
            </div>
            <button type="button" class="btn-remove-attached" @click="removeAttachedProduct">&times;</button>
          </div>

          <!-- Message History -->
          <div ref="messagesContainer" class="messages-flow">
            <div v-if="customerMessages.length === 0" class="empty-chat">
              <p>Belum ada percakapan. Silakan kirim pesan atau tanyakan produk kepada Admin dbb_luxe.</p>
            </div>

            <div
              v-for="msg in customerMessages"
              :key="msg.id"
              class="message-bubble-row"
              :class="{ 'is-me': msg.sender === 'user' }"
            >
              <div class="bubble">
                <!-- Shared Product Card inside Chat -->
                <NuxtLink
                  v-if="msg.product"
                  :to="msg.product.productType === 'jastip' && msg.product.tripSlug ? `/jastip/${msg.product.tripSlug}/${msg.product.slug}` : `/ready/${msg.product.slug}`"
                  class="msg-product-card"
                >
                  <img
                    v-if="msg.product.imageUrl"
                    :src="msg.product.imageUrl"
                    :alt="msg.product.name"
                    class="msg-prod-img"
                  />
                  <div class="msg-prod-meta">
                    <span class="msg-prod-type">{{ msg.product.productType === 'jastip' ? 'Jastip' : 'Ready Stock' }}</span>
                    <strong class="msg-prod-title">{{ msg.product.name }}</strong>
                    <span class="msg-prod-price">{{ formatRupiah(msg.product.price) }}</span>
                  </div>
                </NuxtLink>

                <!-- Shared Image Attachment -->
                <a v-if="msg.imageUrl" :href="msg.imageUrl" target="_blank" rel="noopener" class="msg-img-wrap">
                  <img :src="msg.imageUrl" alt="Lampiran chat" class="msg-img" />
                </a>

                <p v-if="msg.text">{{ msg.text }}</p>
                <span class="msg-time">{{ msg.timestamp }}</span>
              </div>
            </div>
          </div>

          <!-- Product Picker Drawer -->
          <div v-if="isProductPickerOpen" class="chat-product-picker">
            <div class="picker-top">
              <strong>Pilih Produk Tersedia ({{ filteredPickerProducts.length }})</strong>
              <button type="button" class="btn-close-picker" @click="isProductPickerOpen = false">&times;</button>
            </div>
            <div class="picker-filters">
              <button type="button" :class="{ active: pickerTypeFilter === 'all' }" @click="pickerTypeFilter = 'all'">Semua</button>
              <button type="button" :class="{ active: pickerTypeFilter === 'ready' }" @click="pickerTypeFilter = 'ready'">Ready Stock</button>
              <button type="button" :class="{ active: pickerTypeFilter === 'jastip' }" @click="pickerTypeFilter = 'jastip'">Jastip</button>
              <input v-model="pickerSearch" type="text" placeholder="Cari produk..." class="picker-search" />
            </div>
            <div class="picker-items">
              <div v-if="isLoadingProducts" class="picker-empty">Memuat daftar produk...</div>
              <div v-else-if="filteredPickerProducts.length === 0" class="picker-empty">Tidak ada produk tersedia.</div>
              <button
                v-else
                v-for="prod in filteredPickerProducts"
                :key="prod.id"
                type="button"
                class="picker-item-row"
                @click="handleSelectProduct(prod)"
              >
                <img :src="prod.image" :alt="prod.name" class="picker-thumb" />
                <div class="picker-meta">
                  <span class="picker-type" :class="prod.productType === 'jastip' ? 'is-jastip' : 'is-ready'">
                    {{ prod.productType === 'jastip' ? 'Jastip' : 'Ready Stock' }}
                  </span>
                  <strong>{{ prod.name }}</strong>
                  <span>{{ formatRupiah(prod.price) }}</span>
                </div>
                <span class="picker-choose">Pilih &rarr;</span>
              </button>
            </div>
          </div>

          <!-- Input Bar -->
          <form @submit.prevent="handleSend" class="chat-input-bar">
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style="display: none"
              @change="handleFileSelect"
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
            <button
              type="button"
              class="btn-attach btn-pick-prod"
              :class="{ active: isProductPickerOpen }"
              title="Pilih Produk Ready / Jastip"
              @click="toggleProductPicker"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Produk</span>
            </button>
            <input
              v-model="inputMessage"
              type="text"
              placeholder="Tulis pesan atau pertanyaan ke admin..."
            />
            <button type="submit" class="btn-send" :disabled="isSending || (!inputMessage.trim() && !attachedProduct)">
              {{ isSending ? '...' : 'Kirim' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useCustomerChat } from '../../composables/useCustomerChat'
import { useToast } from '../../composables/useToast'

definePageMeta({
  middleware: 'auth'
})

const { currentUser } = useAuth()
const {
  customerMessages,
  attachedProduct,
  loadCustomerRoom,
  attachProductToChat,
  removeAttachedProduct,
  sendCustomerMessage
} = useCustomerChat()

const { showToast } = useToast()

const inputMessage = ref('')
const isSending = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const isProductPickerOpen = ref(false)
const isLoadingProducts = ref(false)
const availableProducts = ref<any[]>([])
const pickerTypeFilter = ref<'all' | 'ready' | 'jastip'>('all')
const pickerSearch = ref('')

const filteredPickerProducts = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  return availableProducts.value.filter((p) => {
    if (pickerTypeFilter.value !== 'all' && p.productType !== pickerTypeFilter.value) {
      return false
    }
    if (q) {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.trip?.title?.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const toggleProductPicker = async () => {
  isProductPickerOpen.value = !isProductPickerOpen.value
  if (isProductPickerOpen.value && availableProducts.value.length === 0 && !isLoadingProducts.value) {
    isLoadingProducts.value = true
    try {
      const res = await $fetch<any[]>('/api/products', { query: { inStockOnly: 'true' } })
      availableProducts.value = (res || []).filter((p) => p.inStock !== false)
    } finally {
      isLoadingProducts.value = false
    }
  }
}

const handleSelectProduct = (prod: any) => {
  attachProductToChat(prod)
  isProductPickerOpen.value = false
}

const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID')

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(customerMessages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(async () => {
  if (currentUser.value?.role === 'admin' || currentUser.value?.role === 'staff') {
    await navigateTo('/admin/chat')
    return
  }
  await loadCustomerRoom()
  scrollToBottom()
})

const handleSend = async () => {
  if (!inputMessage.value.trim() && !attachedProduct.value) return
  isSending.value = true
  try {
    const text = inputMessage.value
    inputMessage.value = ''
    await sendCustomerMessage(text)
    scrollToBottom()
  } finally {
    isSending.value = false
  }
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

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
      await sendCustomerMessage(inputMessage.value.trim(), undefined, {
        messageType: 'image',
        imageUrl: uploaded.url
      })
      inputMessage.value = ''
      scrollToBottom()
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
.chat-page {
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

.chat-box-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 620px;
  box-shadow: var(--shadow-sm);
}

.chat-conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  background: var(--color-canvas, #FFFBF2);
}

.chat-conv-header {
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.header-title {
  display: block;
  font-size: 0.92rem;
  color: var(--color-text, #2B2116);
}

.admin-status {
  font-size: 0.75rem;
  color: #10B981;
  font-weight: 700;
}

.attached-banner {
  background: #FFFDF8;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.attached-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
}

.attached-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.attached-label {
  font-size: 0.68rem;
  color: var(--color-text-muted, #7A6A55);
}

.attached-name {
  font-size: 0.84rem;
  color: var(--color-text, #2B2116);
}

.attached-price {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
}

.btn-remove-attached {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

.messages-flow {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-chat {
  margin: auto;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.88rem;
  max-width: 360px;
}

.message-bubble-row {
  display: flex;
  justify-content: flex-start;
}

.message-bubble-row.is-me {
  justify-content: flex-end;
}

.bubble {
  max-width: 68%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  line-height: 1.45;
}

.message-bubble-row.is-me .bubble {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
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
  width: 46px;
  height: 46px;
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
  font-size: 0.64rem;
  font-weight: 700;
  color: #8C6D3F;
  text-transform: uppercase;
}

.msg-prod-title {
  font-size: 0.8rem;
  color: #2B2116;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-prod-price {
  font-size: 0.76rem;
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.btn-pick-prod.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.chat-product-picker {
  background: #ffffff;
  border-top: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  flex-direction: column;
  max-height: 280px;
}

.picker-top {
  padding: 10px 18px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.btn-close-picker {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-muted, #7A6A55);
}

.picker-filters {
  padding: 8px 18px;
  background: #FFFDF8;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.picker-filters button {
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

.picker-filters button.active {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border-color: var(--color-primary, #8C6D3F);
}

.picker-search {
  flex: 1;
  min-width: 140px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.78rem;
  outline: none;
}

.picker-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-empty {
  padding: 16px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
}

.picker-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.picker-item-row:hover {
  background: #FFFDF8;
  border-color: var(--color-primary, #8C6D3F);
}

.picker-thumb {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.picker-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 0.78rem;
}

.picker-type {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 999px;
  align-self: flex-start;
  margin-bottom: 2px;
}

.picker-type.is-jastip {
  background: #2a1d14;
  color: #e3c58f;
}

.picker-type.is-ready {
  background: #EFE1C6;
  color: #2B2116;
}

.picker-meta strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text, #2B2116);
}

.picker-meta span {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.picker-choose {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary, #8C6D3F);
  flex-shrink: 0;
}

.chat-input-bar input[type="text"] {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  outline: none;
}

.chat-input-bar input[type="text"]:focus {
  border-color: var(--color-primary, #8C6D3F);
}

.btn-send {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-send:hover:not(:disabled) {
  background: var(--color-primary-hover, #6F5530);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
