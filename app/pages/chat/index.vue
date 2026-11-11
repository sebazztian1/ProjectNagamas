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

          <!-- Attached Inquiry Context Banner -->
          <div v-if="attachedProduct" class="attached-banner">
            <img v-if="attachedProduct.image" :src="attachedProduct.image" :alt="attachedProduct.name" class="attached-img" />
            <div v-else class="attached-img picker-thumb-fallback">
              {{ attachedProduct.kind === 'jastip_trip' ? (attachedProduct.flag || '✈️') : '📋' }}
            </div>
            <div class="attached-info">
              <div class="attached-tag-row">
                <span class="attached-label">Terlampir:</span>
                <span
                  class="attached-type-pill"
                  :class="{
                    'is-jastip': attachedProduct.kind === 'jastip_trip' || attachedProduct.productType === 'jastip',
                    'is-request': attachedProduct.kind === 'request',
                    'is-ready': attachedProduct.kind === 'product' && attachedProduct.productType !== 'jastip'
                  }"
                >
                  <template v-if="attachedProduct.kind === 'jastip_trip'">Trip Jastip</template>
                  <template v-else-if="attachedProduct.kind === 'request'">Request Produk</template>
                  <template v-else-if="attachedProduct.productType === 'jastip'">Produk Jastip</template>
                  <template v-else>Produk Tersedia</template>
                </span>
              </div>
              <strong class="attached-name">{{ attachedProduct.name }}</strong>
              <span v-if="attachedProduct.price" class="attached-price">{{ formatRupiah(attachedProduct.price) }}</span>
              <span v-else-if="attachedProduct.quotedPrice" class="attached-price">{{ formatRupiah(attachedProduct.quotedPrice) }}</span>
              <span v-else-if="attachedProduct.country" class="attached-price">{{ attachedProduct.country }} &bull; {{ attachedProduct.status === 'open' ? 'Open PO' : 'Tutup PO' }}</span>
              <span v-else-if="attachedProduct.status" class="attached-price">Status: {{ formatRequestStatus(attachedProduct.status) }}</span>
            </div>
            <button type="button" class="btn-remove-attached" title="Hapus lampiran" @click="removeAttachedProduct">&times;</button>
          </div>

          <!-- Message History -->
          <div ref="messagesContainer" class="messages-flow">
            <div v-if="customerMessages.length === 0" class="empty-chat">
              <p>Belum ada percakapan. Silakan kirim pesan atau tanyakan produk kepada Admin.</p>
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
                    <span class="msg-prod-type">{{ msg.product.productType === 'jastip' ? 'Produk Jastip' : 'Produk Tersedia' }}</span>
                    <strong class="msg-prod-title">{{ msg.product.name }}</strong>
                    <span class="msg-prod-price">{{ formatRupiah(msg.product.price) }}</span>
                  </div>
                </NuxtLink>

                <!-- Shared Jastip Trip Card -->
                <NuxtLink
                  v-if="msg.trip && !msg.product"
                  :to="`/jastip/${msg.trip.slug}`"
                  class="msg-product-card"
                >
                  <img
                    v-if="msg.trip.coverImageUrl"
                    :src="msg.trip.coverImageUrl"
                    :alt="msg.trip.title"
                    class="msg-prod-img"
                  />
                  <div v-else class="msg-prod-img picker-thumb-fallback">&#9992;&#65039;</div>
                  <div class="msg-prod-meta">
                    <span class="msg-prod-type">Trip Jastip &bull; {{ msg.trip.country }}</span>
                    <strong class="msg-prod-title">{{ msg.trip.title }}</strong>
                    <span class="msg-prod-price">{{ msg.trip.status === 'open' ? 'Open PO' : 'Tutup PO' }}{{ msg.trip.cityOrArea ? ` • ${msg.trip.cityOrArea}` : '' }}</span>
                  </div>
                </NuxtLink>

                <!-- Shared Product Request Card -->
                <NuxtLink
                  v-if="msg.productRequest"
                  to="/request"
                  class="msg-product-card"
                >
                  <img
                    v-if="msg.productRequest.referenceImageUrl"
                    :src="msg.productRequest.referenceImageUrl"
                    :alt="msg.productRequest.productName"
                    class="msg-prod-img"
                  />
                  <div v-else class="msg-prod-img picker-thumb-fallback">&#128203;</div>
                  <div class="msg-prod-meta">
                    <span class="msg-prod-type">Request Produk &bull; {{ formatRequestStatus(msg.productRequest.status) }}</span>
                    <strong class="msg-prod-title">{{ msg.productRequest.productName }}</strong>
                    <span class="msg-prod-price">
                      {{ msg.productRequest.quotedPrice ? formatRupiah(msg.productRequest.quotedPrice) : (msg.productRequest.tripTitle || 'Request Kustom') }}
                    </span>
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

          <!-- Picker Drawer (Ready Products / Jastip / Product Requests) -->
          <div v-if="activePickerMode" class="chat-product-picker">
            <div class="picker-top">
              <div class="picker-title-group">
                <strong v-if="activePickerMode === 'ready'">Pilih Produk Tersedia</strong>
                <strong v-else-if="activePickerMode === 'jastip'">Pilih Jastip</strong>
                <strong v-else-if="activePickerMode === 'request'">Pilih Request Produk Diajukan</strong>
                <span class="picker-count-badge">{{ currentPickerCountLabel }}</span>
              </div>
              <button type="button" class="btn-close-picker" @click="activePickerMode = null">&times;</button>
            </div>

            <div class="picker-filters">
              <template v-if="activePickerMode === 'jastip'">
                <button type="button" :class="{ active: jastipSubTab === 'trips' }" @click="jastipSubTab = 'trips'">
                  Jadwal Trip Jastip
                </button>
                <button type="button" :class="{ active: jastipSubTab === 'products' }" @click="jastipSubTab = 'products'">
                  Katalog Produk Jastip
                </button>
              </template>
              <input v-model="pickerSearch" type="text" :placeholder="pickerSearchPlaceholder" class="picker-search" />
            </div>

            <!-- Ready Stock Products -->
            <div v-if="activePickerMode === 'ready'" class="picker-items">
              <div v-if="isLoadingProducts" class="picker-empty">Memuat daftar produk tersedia...</div>
              <div v-else-if="filteredReadyProducts.length === 0" class="picker-empty">Tidak ada produk tersedia yang cocok.</div>
              <button
                v-else
                v-for="prod in filteredReadyProducts"
                :key="prod.id"
                type="button"
                class="picker-item-row"
                @click="handleSelectProduct(prod)"
              >
                <img :src="prod.image" :alt="prod.name" class="picker-thumb" />
                <div class="picker-meta">
                  <div class="picker-badge-row">
                    <span class="picker-type is-ready">Ready Stock</span>
                    <span class="picker-sub-tag">{{ prod.category }}</span>
                  </div>
                  <strong>{{ prod.name }}</strong>
                  <span>{{ formatRupiah(prod.price) }}</span>
                </div>
                <span class="picker-choose">Pilih &rarr;</span>
              </button>
            </div>

            <!-- Jastip (Trips or Jastip Products) -->
            <div v-else-if="activePickerMode === 'jastip'" class="picker-items">
              <template v-if="jastipSubTab === 'trips'">
                <div v-if="isLoadingTrips" class="picker-empty">Memuat jadwal trip jastip...</div>
                <div v-else-if="filteredTrips.length === 0" class="picker-empty">Tidak ada jadwal jastip yang cocok.</div>
                <button
                  v-else
                  v-for="trip in filteredTrips"
                  :key="trip.id"
                  type="button"
                  class="picker-item-row"
                  @click="handleSelectTrip(trip)"
                >
                  <img v-if="trip.coverImageUrl" :src="trip.coverImageUrl" :alt="trip.title" class="picker-thumb" />
                  <div v-else class="picker-thumb picker-thumb-fallback">{{ trip.flag || '✈️' }}</div>
                  <div class="picker-meta">
                    <div class="picker-badge-row">
                      <span class="picker-type is-jastip">{{ trip.country }}</span>
                      <span class="picker-sub-tag">{{ trip.status === 'open' ? 'Open PO' : 'Tutup PO' }}</span>
                    </div>
                    <strong>{{ trip.title }}</strong>
                    <span>Sisa Kuota: {{ trip.quotaRemaining }} slot</span>
                  </div>
                  <span class="picker-choose">Pilih &rarr;</span>
                </button>
              </template>

              <template v-else>
                <div v-if="isLoadingProducts" class="picker-empty">Memuat katalog produk jastip...</div>
                <div v-else-if="filteredJastipProducts.length === 0" class="picker-empty">Tidak ada produk jastip yang cocok.</div>
                <button
                  v-else
                  v-for="prod in filteredJastipProducts"
                  :key="prod.id"
                  type="button"
                  class="picker-item-row"
                  @click="handleSelectProduct(prod)"
                >
                  <img :src="prod.image" :alt="prod.name" class="picker-thumb" />
                  <div class="picker-meta">
                    <div class="picker-badge-row">
                      <span class="picker-type is-jastip">Jastip</span>
                      <span v-if="prod.trip?.title" class="picker-sub-tag">{{ prod.trip.title }}</span>
                    </div>
                    <strong>{{ prod.name }}</strong>
                    <span>{{ formatRupiah(prod.price) }}</span>
                  </div>
                  <span class="picker-choose">Pilih &rarr;</span>
                </button>
              </template>
            </div>

            <!-- Submitted Product Requests -->
            <div v-else-if="activePickerMode === 'request'" class="picker-items">
              <div v-if="isLoadingRequests" class="picker-empty">Memuat riwayat request produk Anda...</div>
              <div v-else-if="filteredRequests.length === 0" class="picker-empty">Belum ada request produk yang diajukan.</div>
              <button
                v-else
                v-for="req in filteredRequests"
                :key="req.id"
                type="button"
                class="picker-item-row"
                @click="handleSelectRequest(req)"
              >
                <img v-if="req.referenceImageUrl" :src="req.referenceImageUrl" :alt="req.productName" class="picker-thumb" />
                <div v-else class="picker-thumb picker-thumb-fallback">&#128203;</div>
                <div class="picker-meta">
                  <div class="picker-badge-row">
                    <span class="picker-type is-request">{{ formatRequestStatus(req.status) }}</span>
                    <span class="picker-sub-tag">{{ req.tripTitle }}</span>
                  </div>
                  <strong>{{ req.productName }}</strong>
                  <span>{{ req.quotedPrice ? formatRupiah(req.quotedPrice) : 'Menunggu Penawaran Harga' }}</span>
                </div>
                <span class="picker-choose">Pilih &rarr;</span>
              </button>
            </div>
          </div>

          <!-- Input Bar -->
          <form @submit.prevent="handleSend" class="chat-input-bar">
            <!-- Floating "+" Action Menu -->
            <div v-if="isPlusMenuOpen" class="plus-action-menu" role="menu">
              <button type="button" class="plus-menu-item" role="menuitem" @click="triggerUploadImage">
                <span class="plus-menu-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </span>
                <span class="plus-menu-text">
                  <strong>Upload Image</strong>
                  <small>Kirim foto dari perangkat</small>
                </span>
              </button>

              <button type="button" class="plus-menu-item" role="menuitem" @click="openPickerMode('ready')">
                <span class="plus-menu-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </span>
                <span class="plus-menu-text">
                  <strong>Pilih Produk Tersedia</strong>
                  <small>Tanyakan produk Ready Stock</small>
                </span>
              </button>

              <button type="button" class="plus-menu-item" role="menuitem" @click="openPickerMode('jastip')">
                <span class="plus-menu-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
                  </svg>
                </span>
                <span class="plus-menu-text">
                  <strong>Pilih Jastip</strong>
                  <small>Pilih jadwal trip atau produk jastip</small>
                </span>
              </button>

              <button type="button" class="plus-menu-item" role="menuitem" @click="openPickerMode('request')">
                <span class="plus-menu-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
                    <path d="M9 14h6"></path>
                    <path d="M9 10h6"></path>
                  </svg>
                </span>
                <span class="plus-menu-text">
                  <strong>Pilih Request Produk</strong>
                  <small>Pilih request yang telah diajukan</small>
                </span>
              </button>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style="display: none"
              @change="handleFileSelect"
            />
            <button
              type="button"
              class="btn-plus-attach"
              :class="{ 'is-open': isPlusMenuOpen }"
              title="Lampirkan Gambar, Produk, Jastip, atau Request"
              :disabled="isUploading"
              @click="togglePlusMenu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <input
              ref="inputField"
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
  attachTripToChat,
  attachRequestToChat,
  removeAttachedProduct,
  sendCustomerMessage
} = useCustomerChat()

const { showToast } = useToast()

const inputMessage = ref('')
const isSending = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const isPlusMenuOpen = ref(false)
const activePickerMode = ref<'ready' | 'jastip' | 'request' | null>(null)
const jastipSubTab = ref<'trips' | 'products'>('trips')
const pickerSearch = ref('')

const isLoadingProducts = ref(false)
const isLoadingTrips = ref(false)
const isLoadingRequests = ref(false)

const availableProducts = ref<any[]>([])
const availableTrips = ref<any[]>([])
const submittedRequests = ref<any[]>([])

const filteredReadyProducts = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  return availableProducts.value.filter((p) => {
    if (p.productType !== 'ready') return false
    if (q) {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const filteredJastipProducts = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  return availableProducts.value.filter((p) => {
    if (p.productType !== 'jastip') return false
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

const filteredTrips = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  return availableTrips.value.filter((t) => {
    if (q) {
      return (
        t.title?.toLowerCase().includes(q) ||
        t.country?.toLowerCase().includes(q) ||
        t.cityOrArea?.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const filteredRequests = computed(() => {
  const q = pickerSearch.value.trim().toLowerCase()
  return submittedRequests.value.filter((r) => {
    if (q) {
      return (
        r.productName?.toLowerCase().includes(q) ||
        r.tripTitle?.toLowerCase().includes(q) ||
        r.targetCountry?.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const currentPickerCountLabel = computed(() => {
  if (activePickerMode.value === 'ready') {
    return `${filteredReadyProducts.value.length} produk`
  }
  if (activePickerMode.value === 'jastip') {
    return jastipSubTab.value === 'trips'
      ? `${filteredTrips.value.length} trip`
      : `${filteredJastipProducts.value.length} produk`
  }
  if (activePickerMode.value === 'request') {
    return `${filteredRequests.value.length} request`
  }
  return ''
})

const pickerSearchPlaceholder = computed(() => {
  if (activePickerMode.value === 'ready') return 'Cari produk ready stock...'
  if (activePickerMode.value === 'jastip') {
    return jastipSubTab.value === 'trips' ? 'Cari negara atau jadwal trip jastip...' : 'Cari produk katalog jastip...'
  }
  return 'Cari request produk yang telah diajukan...'
})

const formatRequestStatus = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'Menunggu',
    reviewed: 'Ditinjau',
    quoted: 'Ada Penawaran',
    accepted: 'Disetujui',
    available: 'Tersedia',
    rejected: 'Ditolak'
  }
  return status ? map[status] || status : 'Menunggu'
}

const loadAvailableProducts = async () => {
  if (availableProducts.value.length > 0 || isLoadingProducts.value) return
  isLoadingProducts.value = true
  try {
    const res = await $fetch<any[]>('/api/products', { query: { inStockOnly: 'true' } })
    availableProducts.value = (res || []).filter((p) => p.inStock !== false)
  } finally {
    isLoadingProducts.value = false
  }
}

const loadAvailableTrips = async () => {
  if (availableTrips.value.length > 0 || isLoadingTrips.value) return
  isLoadingTrips.value = true
  try {
    const res = await $fetch<any[]>('/api/trips')
    availableTrips.value = res || []
  } finally {
    isLoadingTrips.value = false
  }
}

const loadSubmittedRequests = async () => {
  isLoadingRequests.value = true
  try {
    const res = await $fetch<any[]>('/api/requests')
    submittedRequests.value = res || []
  } catch {
    submittedRequests.value = []
  } finally {
    isLoadingRequests.value = false
  }
}

const togglePlusMenu = () => {
  isPlusMenuOpen.value = !isPlusMenuOpen.value
}

const triggerUploadImage = () => {
  isPlusMenuOpen.value = false
  activePickerMode.value = null
  fileInput.value?.click()
}

const openPickerMode = async (mode: 'ready' | 'jastip' | 'request') => {
  isPlusMenuOpen.value = false
  pickerSearch.value = ''
  if (activePickerMode.value === mode) {
    activePickerMode.value = null
    return
  }
  activePickerMode.value = mode
  if (mode === 'ready') {
    await loadAvailableProducts()
  } else if (mode === 'jastip') {
    await Promise.all([loadAvailableTrips(), loadAvailableProducts()])
  } else if (mode === 'request') {
    await loadSubmittedRequests()
  }
}

const handleSelectProduct = (prod: any) => {
  attachProductToChat(prod)
  activePickerMode.value = null
  isPlusMenuOpen.value = false
  nextTick(() => {
    inputField.value?.focus()
  })
}

const handleSelectTrip = (trip: any) => {
  attachTripToChat(trip)
  activePickerMode.value = null
  isPlusMenuOpen.value = false
  nextTick(() => {
    inputField.value?.focus()
  })
}

const handleSelectRequest = (req: any) => {
  attachRequestToChat(req)
  activePickerMode.value = null
  isPlusMenuOpen.value = false
  nextTick(() => {
    inputField.value?.focus()
  })
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
  if (!currentUser.value) {
    await navigateTo('/register')
    return
  }
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
  position: relative;
  padding: 14px 20px;
  background: #ffffff;
  border-top: 1px solid var(--color-secondary, #EFE1C6);
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-plus-attach {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F4EAD5;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: #5C4728;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.btn-plus-attach:hover:not(:disabled) {
  background: #EFE1C6;
  color: #2B2116;
}

.btn-plus-attach.is-open {
  background: #2B2116;
  color: #FFFBF2;
  border-color: #2B2116;
}

.btn-plus-attach svg {
  transition: transform 0.2s ease;
}

.btn-plus-attach.is-open svg {
  transform: rotate(45deg);
}

.plus-action-menu {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 20px;
  width: 270px;
  background: #FFFFFF;
  border: 1px solid #DFC89E;
  border-radius: 14px;
  box-shadow: 0 12px 32px -6px rgba(43, 33, 22, 0.22);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 50;
}

.plus-menu-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 9px 11px;
  border: none;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.plus-menu-item:hover {
  background: #F7EFE0;
}

.plus-menu-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #F4EAD5;
  color: #7A5C2E;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plus-menu-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.plus-menu-text strong {
  font-size: 0.82rem;
  font-weight: 700;
  color: #2B2116;
  line-height: 1.25;
}

.plus-menu-text small {
  font-size: 0.7rem;
  color: #7A6A55;
  line-height: 1.25;
}

.attached-tag-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.attached-type-pill {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 999px;
}

.attached-type-pill.is-ready {
  background: #EFE1C6;
  color: #2B2116;
}

.attached-type-pill.is-jastip {
  background: #2A1D14;
  color: #E3C58F;
}

.attached-type-pill.is-request {
  background: #E6D5B8;
  color: #5C421C;
}

.picker-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.picker-count-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: #7A5C2E;
  background: #EFE1C6;
  padding: 2px 8px;
  border-radius: 999px;
}

.picker-thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #EFE1C6;
  color: #5C4728;
  font-size: 1.2rem;
}

.picker-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.picker-sub-tag {
  font-size: 0.68rem;
  color: var(--color-text-muted, #7A6A55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-type.is-request {
  background: #E6D5B8;
  color: #5C421C;
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
