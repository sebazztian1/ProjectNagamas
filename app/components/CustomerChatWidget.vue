<template>
  <div class="dbb-chat-root">
    <!-- Edge-Docked Launcher Bubble -->
    <button
      ref="launcherBtn"
      type="button"
      class="dbb-chat-launcher"
      :class="{
        'is-open': isChatOpen,
        'is-peeking': isPeeking && !isChatOpen
      }"
      :inert="isChatOpen"
      :aria-hidden="isChatOpen ? 'true' : 'false'"
      :aria-expanded="isChatOpen ? 'true' : 'false'"
      aria-controls="dbb-chat-popup"
      :aria-label="launcherAriaLabel"
      @click="handleLauncherClick"
    >
      <span class="launcher-circle">
        <!-- Chat Icon (Closed) -->
        <svg
          v-if="!isChatOpen"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <!-- Close X Icon (Open) -->
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>

        <span class="launcher-online-dot" aria-hidden="true"></span>

        <span
          v-if="customerUnreadCount > 0 && !isChatOpen"
          class="launcher-unread-badge"
          aria-hidden="true"
        >
          {{ customerUnreadCount > 9 ? '9+' : customerUnreadCount }}
        </span>
      </span>

      <span class="launcher-label">Tanya Admin</span>
    </button>

    <!-- Non-Modal Floating Popup -->
    <div
      id="dbb-chat-popup"
      role="dialog"
      aria-label="Chat dengan Admin dbb_luxe"
      class="dbb-chat-popup"
      :class="{ 'is-open': isChatOpen }"
      :inert="!isChatOpen"
      :aria-hidden="!isChatOpen ? 'true' : 'false'"
    >
      <!-- 1. Header -->
      <header class="chat-header">
        <div class="header-agent-info">
          <div class="agent-avatar-wrap">
            <div class="agent-avatar" aria-hidden="true">D</div>
            <span class="agent-online-dot" aria-hidden="true"></span>
          </div>
          <div class="agent-text-wrap">
            <div class="agent-name-row">
              <span class="agent-name">Admin Support dbb_luxe</span>
              <span class="verified-tag" aria-hidden="true">&#10003;</span>
            </div>
            <span class="agent-status">Online &bull; Siap Membantu</span>
          </div>
        </div>

        <button
          type="button"
          class="header-close-btn"
          aria-label="Tutup chat admin"
          title="Tutup Chat"
          @click="handleCloseChat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <!-- 2. Message List -->
      <div
        ref="messagesBody"
        class="chat-body"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div class="welcome-box">
          <p class="welcome-heading">&#128075; Selamat datang di Live Chat dbb_luxe!</p>
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
            <span v-if="msg.sender === 'admin'" class="bubble-sender-label">Admin dbb_luxe</span>

            <!-- Shared Product Card (Ready Stock / Jastip Product) -->
            <NuxtLink
              v-if="msg.product"
              :to="msg.product.productType === 'jastip' && msg.product.tripSlug ? `/jastip/${msg.product.tripSlug}/${msg.product.slug}` : `/ready/${msg.product.slug}`"
              class="bubble-product-card"
            >
              <img v-if="msg.product.imageUrl" :src="msg.product.imageUrl" :alt="msg.product.name" class="bubble-prod-img" />
              <div class="bubble-prod-info">
                <span class="bubble-prod-badge" :class="msg.product.productType === 'jastip' ? 'is-jastip' : 'is-ready'">
                  {{ msg.product.productType === 'jastip' ? 'Produk Jastip' : 'Produk Tersedia' }}
                </span>
                <strong>{{ msg.product.name }}</strong>
                <span>{{ formatPrice(msg.product.price) }}</span>
              </div>
            </NuxtLink>

            <!-- Shared Jastip Trip Card -->
            <NuxtLink
              v-if="msg.trip && !msg.product"
              :to="`/jastip/${msg.trip.slug}`"
              class="bubble-product-card"
            >
              <img v-if="msg.trip.coverImageUrl" :src="msg.trip.coverImageUrl" :alt="msg.trip.title" class="bubble-prod-img" />
              <div v-else class="bubble-prod-icon" aria-hidden="true">&#9992;&#65039;</div>
              <div class="bubble-prod-info">
                <span class="bubble-prod-badge is-jastip">
                  Jastip &bull; {{ msg.trip.country }}
                </span>
                <strong>{{ msg.trip.title }}</strong>
                <span>{{ msg.trip.status === 'open' ? 'Open PO' : 'Tutup PO' }}{{ msg.trip.cityOrArea ? ` • ${msg.trip.cityOrArea}` : '' }}</span>
              </div>
            </NuxtLink>

            <!-- Shared Product Request Card -->
            <NuxtLink
              v-if="msg.productRequest"
              to="/request"
              class="bubble-product-card"
            >
              <img v-if="msg.productRequest.referenceImageUrl" :src="msg.productRequest.referenceImageUrl" :alt="msg.productRequest.productName" class="bubble-prod-img" />
              <div v-else class="bubble-prod-icon" aria-hidden="true">&#128203;</div>
              <div class="bubble-prod-info">
                <span class="bubble-prod-badge is-request">
                  Request &bull; {{ formatRequestStatus(msg.productRequest.status) }}
                </span>
                <strong>{{ msg.productRequest.productName }}</strong>
                <span v-if="msg.productRequest.quotedPrice">{{ formatPrice(msg.productRequest.quotedPrice) }}</span>
                <span v-else>{{ msg.productRequest.tripTitle || 'Request Barang Kustom' }}</span>
              </div>
            </NuxtLink>

            <a v-if="msg.imageUrl" :href="msg.imageUrl" target="_blank" rel="noopener" class="bubble-img-link">
              <img :src="msg.imageUrl" alt="Lampiran gambar" class="bubble-img" />
            </a>

            <p v-if="msg.text" class="bubble-text">{{ msg.text }}</p>
            <div class="bubble-footer">
              <span class="bubble-time">{{ msg.timestamp }}</span>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isAdminTyping" class="chat-bubble-wrapper admin-msg">
          <div class="chat-bubble typing-bubble">
            <div class="typing-dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="typing-label">Admin sedang mengetik...</span>
          </div>
        </div>
      </div>

      <!-- 3. Picker Drawer (Ready Products / Jastip / Product Requests) -->
      <div v-if="activePickerMode" class="product-picker-drawer">
        <div class="picker-header">
          <div class="picker-title-row">
            <strong v-if="activePickerMode === 'ready'">Pilih Produk Tersedia</strong>
            <strong v-else-if="activePickerMode === 'jastip'">Pilih Jastip</strong>
            <strong v-else-if="activePickerMode === 'request'">Pilih Request Produk Diajukan</strong>
            <span class="picker-count">{{ currentPickerCountLabel }}</span>
          </div>
          <button
            type="button"
            class="picker-close-btn"
            aria-label="Tutup daftar pilihan"
            @click="activePickerMode = null"
          >
            &times;
          </button>
        </div>

        <div class="picker-controls">
          <div v-if="activePickerMode === 'jastip'" class="picker-tabs">
            <button
              type="button"
              class="picker-tab"
              :class="{ active: jastipSubTab === 'trips' }"
              @click="jastipSubTab = 'trips'"
            >
              Jadwal Trip Jastip
            </button>
            <button
              type="button"
              class="picker-tab"
              :class="{ active: jastipSubTab === 'products' }"
              @click="jastipSubTab = 'products'"
            >
              Katalog Produk Jastip
            </button>
          </div>
          <input
            v-model="pickerSearch"
            type="text"
            class="picker-search-input"
            :placeholder="pickerSearchPlaceholder"
          />
        </div>

        <!-- Drawer Content: Ready Stock Products -->
        <div v-if="activePickerMode === 'ready'" class="picker-list">
          <div v-if="isLoadingProducts" class="picker-empty">
            Memuat daftar produk tersedia...
          </div>
          <div v-else-if="filteredReadyProducts.length === 0" class="picker-empty">
            Tidak ada produk tersedia yang cocok.
          </div>
          <button
            v-else
            v-for="prod in filteredReadyProducts"
            :key="prod.id"
            type="button"
            class="picker-product-item"
            @click="handleSelectProduct(prod)"
          >
            <img :src="prod.image" :alt="prod.name" class="picker-prod-thumb" loading="lazy" />
            <div class="picker-prod-info">
              <div class="picker-prod-badges">
                <span class="picker-badge badge-ready">Ready Stock</span>
                <span class="picker-trip-name">{{ prod.category }}</span>
              </div>
              <div class="picker-prod-name">{{ prod.name }}</div>
              <div class="picker-prod-price">{{ formatPrice(prod.price) }}</div>
            </div>
            <span class="picker-select-action">Pilih &rarr;</span>
          </button>
        </div>

        <!-- Drawer Content: Jastip (Trips or Jastip Products) -->
        <div v-else-if="activePickerMode === 'jastip'" class="picker-list">
          <template v-if="jastipSubTab === 'trips'">
            <div v-if="isLoadingTrips" class="picker-empty">
              Memuat jadwal trip jastip...
            </div>
            <div v-else-if="filteredTrips.length === 0" class="picker-empty">
              Tidak ada jadwal jastip yang cocok.
            </div>
            <button
              v-else
              v-for="trip in filteredTrips"
              :key="trip.id"
              type="button"
              class="picker-product-item"
              @click="handleSelectTrip(trip)"
            >
              <img v-if="trip.coverImageUrl" :src="trip.coverImageUrl" :alt="trip.title" class="picker-prod-thumb" loading="lazy" />
              <div v-else class="picker-prod-thumb picker-thumb-fallback">{{ trip.flag || '✈️' }}</div>
              <div class="picker-prod-info">
                <div class="picker-prod-badges">
                  <span class="picker-badge badge-jastip">{{ trip.country }}</span>
                  <span class="picker-trip-name">{{ trip.status === 'open' ? 'Open PO' : 'Tutup PO' }}</span>
                </div>
                <div class="picker-prod-name">{{ trip.title }}</div>
                <div class="picker-prod-price">Sisa Kuota: {{ trip.quotaRemaining }} slot</div>
              </div>
              <span class="picker-select-action">Pilih &rarr;</span>
            </button>
          </template>

          <template v-else>
            <div v-if="isLoadingProducts" class="picker-empty">
              Memuat katalog produk jastip...
            </div>
            <div v-else-if="filteredJastipProducts.length === 0" class="picker-empty">
              Tidak ada produk jastip yang cocok.
            </div>
            <button
              v-else
              v-for="prod in filteredJastipProducts"
              :key="prod.id"
              type="button"
              class="picker-product-item"
              @click="handleSelectProduct(prod)"
            >
              <img :src="prod.image" :alt="prod.name" class="picker-prod-thumb" loading="lazy" />
              <div class="picker-prod-info">
                <div class="picker-prod-badges">
                  <span class="picker-badge badge-jastip">Jastip</span>
                  <span v-if="prod.trip?.title" class="picker-trip-name">{{ prod.trip.title }}</span>
                </div>
                <div class="picker-prod-name">{{ prod.name }}</div>
                <div class="picker-prod-price">{{ formatPrice(prod.price) }}</div>
              </div>
              <span class="picker-select-action">Pilih &rarr;</span>
            </button>
          </template>
        </div>

        <!-- Drawer Content: Submitted Product Requests -->
        <div v-else-if="activePickerMode === 'request'" class="picker-list">
          <div v-if="isLoadingRequests" class="picker-empty">
            Memuat riwayat request produk Anda...
          </div>
          <div v-else-if="filteredRequests.length === 0" class="picker-empty">
            Belum ada request produk yang diajukan.
          </div>
          <button
            v-else
            v-for="req in filteredRequests"
            :key="req.id"
            type="button"
            class="picker-product-item"
            @click="handleSelectRequest(req)"
          >
            <img v-if="req.referenceImageUrl" :src="req.referenceImageUrl" :alt="req.productName" class="picker-prod-thumb" loading="lazy" />
            <div v-else class="picker-prod-thumb picker-thumb-fallback">&#128203;</div>
            <div class="picker-prod-info">
              <div class="picker-prod-badges">
                <span class="picker-badge badge-request">{{ formatRequestStatus(req.status) }}</span>
                <span class="picker-trip-name">{{ req.tripTitle }}</span>
              </div>
              <div class="picker-prod-name">{{ req.productName }}</div>
              <div class="picker-prod-price">
                {{ req.quotedPrice ? formatPrice(req.quotedPrice) : 'Menunggu Penawaran Harga' }}
              </div>
            </div>
            <span class="picker-select-action">Pilih &rarr;</span>
          </button>
        </div>
      </div>

      <!-- Attached Inquiry Context Banner (Product / Jastip / Request) -->
      <div v-if="attachedProduct" class="attached-product-banner">
        <img v-if="attachedProduct.image" :src="attachedProduct.image" :alt="attachedProduct.name" class="attached-thumb" />
        <div v-else class="attached-thumb picker-thumb-fallback">
          {{ attachedProduct.kind === 'jastip_trip' ? (attachedProduct.flag || '✈️') : '📋' }}
        </div>
        <div class="attached-details">
          <div class="attached-tag-row">
            <span class="attached-tag">Terlampir:</span>
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
          <div class="attached-title">{{ attachedProduct.name }}</div>
          <div class="attached-meta">
            <span v-if="attachedProduct.price" class="attached-price">{{ formatPrice(attachedProduct.price) }}</span>
            <span v-else-if="attachedProduct.quotedPrice" class="attached-price">{{ formatPrice(attachedProduct.quotedPrice) }}</span>
            <span v-else-if="attachedProduct.country" class="attached-price">{{ attachedProduct.country }} &bull; {{ attachedProduct.status === 'open' ? 'Open PO' : 'Tutup PO' }}</span>
            <span v-else-if="attachedProduct.status" class="attached-price">Status: {{ formatRequestStatus(attachedProduct.status) }}</span>
          </div>
        </div>
        <button
          type="button"
          class="remove-attached-btn"
          aria-label="Batal melampirkan item ini"
          title="Hapus lampiran"
          @click="removeAttachedProduct"
        >
          &times;
        </button>
      </div>

      <!-- 4. Input Row & 5. Footer -->
      <form class="chat-footer" @submit.prevent="handleSubmitMessage">
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

        <div class="input-row">
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="sr-only"
            tabindex="-1"
            @change="handleWidgetImageUpload"
          />
          <button
            type="button"
            class="attach-btn"
            :class="{ 'is-open': isPlusMenuOpen }"
            aria-label="Buka menu lampiran"
            :aria-expanded="isPlusMenuOpen ? 'true' : 'false'"
            title="Lampirkan Gambar, Produk, Jastip, atau Request"
            :disabled="isUploadingImage"
            @click="togglePlusMenu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <label for="dbb-chat-input" class="sr-only">Tulis pesan ke admin</label>
          <input
            id="dbb-chat-input"
            ref="inputField"
            v-model="inputText"
            type="text"
            placeholder="Tulis pesan ke admin..."
            class="chat-input"
            autocomplete="off"
          />

          <button
            type="submit"
            class="send-btn"
            :disabled="!canSubmit"
            aria-label="Kirim pesan"
            title="Kirim Pesan"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        <div class="footer-help-note">
          <span>Official Customer Service dbb_luxe</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useCustomerChat } from '../composables/useCustomerChat'
import { useToast } from '../composables/useToast'

const {
  isChatOpen,
  customerUnreadCount,
  attachedProduct,
  isAdminTyping,
  customerMessages,
  loadCustomerRoom,
  toggleChat,
  closeChat,
  attachProductToChat,
  attachTripToChat,
  attachRequestToChat,
  openChatWithProduct,
  removeAttachedProduct,
  sendCustomerMessage
} = useCustomerChat()

const { showToast } = useToast()

const inputText = ref('')
const isUploadingImage = ref(false)
const isPeeking = ref(false)

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

const launcherBtn = ref<HTMLButtonElement | null>(null)
const messagesBody = ref<HTMLElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

let peekStartTimer: ReturnType<typeof setTimeout> | null = null
let peekEndTimer: ReturnType<typeof setTimeout> | null = null

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
    const res = await $fetch<any[]>('/api/products', {
      query: { inStockOnly: 'true' }
    })
    availableProducts.value = (res || []).filter((p) => p.inStock !== false)
  } catch (err) {
    // Abaikan jika gagal memuat
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
  } catch (err) {
    // Abaikan jika gagal memuat
  } finally {
    isLoadingTrips.value = false
  }
}

const loadSubmittedRequests = async () => {
  isLoadingRequests.value = true
  try {
    const res = await $fetch<any[]>('/api/requests')
    submittedRequests.value = res || []
  } catch (err) {
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

const canSubmit = computed(() => {
  return Boolean(inputText.value.trim() || attachedProduct.value)
})

const launcherAriaLabel = computed(() => {
  if (isChatOpen.value) {
    return 'Tutup chat admin'
  }
  if (customerUnreadCount.value > 0) {
    return `Buka chat admin, ${customerUnreadCount.value} pesan baru`
  }
  return 'Buka chat admin'
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesBody.value) {
      messagesBody.value.scrollTop = messagesBody.value.scrollHeight
    }
  })
}

const handleLauncherClick = async () => {
  await toggleChat()
}

const handleCloseChat = () => {
  activePickerMode.value = null
  isPlusMenuOpen.value = false
  closeChat()
  nextTick(() => {
    launcherBtn.value?.focus()
  })
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isChatOpen.value) {
    e.preventDefault()
    if (isPlusMenuOpen.value) {
      isPlusMenuOpen.value = false
    } else if (activePickerMode.value) {
      activePickerMode.value = null
    } else {
      handleCloseChat()
    }
  }
}

const handleCustomOpenEvent = (e: Event) => {
  const customEvent = e as CustomEvent
  if (customEvent.detail?.product) {
    openChatWithProduct(customEvent.detail.product)
  } else {
    if (!isChatOpen.value) toggleChat()
  }
}

watch(customerMessages, () => {
  scrollToBottom()
}, { deep: true })

watch(isAdminTyping, () => {
  scrollToBottom()
})

watch(isChatOpen, (open) => {
  if (open) {
    isPeeking.value = false
    scrollToBottom()
    nextTick(() => {
      inputField.value?.focus()
    })
  } else {
    activePickerMode.value = null
    isPlusMenuOpen.value = false
  }
})

const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const handleSubmitMessage = async () => {
  if (!canSubmit.value) return
  const text = inputText.value
  inputText.value = ''

  await sendCustomerMessage(text, (reply) => {
    showToast('Pesan dari Admin dbb_luxe', reply.slice(0, 70) + '...', 'info')
  })

  scrollToBottom()
}

const handleWidgetImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploadingImage.value = true
  try {
    const fd = new FormData()
    fd.append('folder', 'chat')
    fd.append('file', file)

    const uploaded = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: fd
    })

    if (uploaded?.url) {
      await sendCustomerMessage(inputText.value.trim(), undefined, {
        messageType: 'image',
        imageUrl: uploaded.url
      })
      inputText.value = ''
      scrollToBottom()
    }
  } catch (err: any) {
    showToast('Gagal Upload', err?.data?.message || 'Gagal mengunggah gambar', 'warning')
  } finally {
    isUploadingImage.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('dbb-chat:open', handleCustomOpenEvent as EventListener)

  // Gentle peek after 1.2s on first load (unless reduced motion is preferred)
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (!prefersReducedMotion && !isChatOpen.value) {
    peekStartTimer = setTimeout(() => {
      if (!isChatOpen.value) {
        isPeeking.value = true
        peekEndTimer = setTimeout(() => {
          isPeeking.value = false
        }, 2000)
      }
    }, 1200)
  }

  await loadCustomerRoom()
  scrollToBottom()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('dbb-chat:open', handleCustomOpenEvent as EventListener)
  if (peekStartTimer) clearTimeout(peekStartTimer)
  if (peekEndTimer) clearTimeout(peekEndTimer)
})
</script>

<style scoped>
/* =========================================================
   DESIGN TOKENS (DESIGN_CHAT.md)
   ========================================================= */
.dbb-chat-root {
  --brown: #2a1d14;
  --brown-2: #3b2a1d;
  --gold: #c9a46a;
  --gold-2: #e3c58f;
  --cream: #fdf8f1;
  --line: #eadfce;
  --text: #2a1d14;
  --muted: #6b5d50;
  --green: #2fbf71;

  font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  z-index: 9999;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* =========================================================
   3. LAUNCHER (DOCKED TAB ON RIGHT EDGE)
   ========================================================= */
.dbb-chat-launcher {
  position: fixed;
  right: 0;
  top: 60%;
  min-height: 56px;
  padding: 6px 18px 6px 6px;
  padding-right: calc(18px + env(safe-area-inset-right, 0px));
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--brown-2), var(--brown));
  color: var(--cream);
  border: 1px solid rgba(201, 164, 106, 0.45);
  border-right: none;
  border-radius: 28px 0 0 28px;
  box-shadow: -4px 8px 24px rgba(42, 29, 20, 0.28);
  cursor: pointer;
  z-index: 10001;
/* Resting: only the 44px icon circle area is visible; label is tucked off-screen */
  transform: translateX(calc(100% - 58px));
  transition:
    opacity 200ms ease,
    transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 200ms ease;
}

.dbb-chat-launcher:hover,
.dbb-chat-launcher:focus-visible,
.dbb-chat-launcher.is-peeking {
  transform: translateX(0);
}

/* When docked panel is open, hide the floating launcher bubble */
.dbb-chat-launcher.is-open {
  opacity: 0;
  pointer-events: none;
  transform: translateX(100%);
}

.dbb-chat-launcher:focus-visible {
  outline: 3px solid var(--gold-2);
  outline-offset: 2px;
}

.launcher-circle {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--gold);
  background: var(--brown);
  color: var(--gold-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 150ms ease, color 150ms ease;
}

.dbb-chat-launcher:hover .launcher-circle {
  border-color: var(--gold-2);
  color: #ffffff;
}

.launcher-online-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--green);
  border: 2px solid var(--brown);
}

.launcher-unread-badge {
  position: absolute;
  top: -5px;
  left: -5px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #d92d20;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--brown);
  line-height: 1;
}

.launcher-label {
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  color: var(--cream);
}

/* =========================================================
   4. DOCKED SIDE PANEL (FULL-HEIGHT RIGHT DOCK)
   ========================================================= */
.dbb-chat-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  height: 100dvh;
  background: var(--cream);
  color: var(--text);
  border-left: 1px solid var(--line);
  border-radius: 0;
  box-shadow: -8px 0 32px rgba(42, 29, 20, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10000;

  /* Closed state: tucked off-screen to the right */
  pointer-events: none;
  transform: translateX(100%);
  transition: transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dbb-chat-popup.is-open {
  pointer-events: auto;
  transform: translateX(0);
}

/* 1. Header */
.chat-header {
  background: linear-gradient(135deg, var(--brown-2), var(--brown));
  color: #ffffff;
  padding: 12px 14px 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(201, 164, 106, 0.25);
  flex-shrink: 0;
}

.header-agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.agent-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-2), var(--gold));
  color: var(--brown);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.agent-online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 11px;
  height: 11px;
  background: var(--green);
  border-radius: 50%;
  border: 2px solid var(--brown);
}

.agent-text-wrap {
  min-width: 0;
  flex: 1;
}

.agent-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.agent-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verified-tag {
  font-size: 0.65rem;
  background: var(--gold);
  color: var(--brown);
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  flex-shrink: 0;
}

.agent-status {
  font-size: 0.74rem;
  color: var(--gold-2);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-close-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(201, 164, 106, 0.3);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, border-color 150ms ease;
}

.header-close-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: var(--gold-2);
}

.header-close-btn:focus-visible {
  outline: 3px solid var(--gold-2);
  outline-offset: 2px;
}

/* Attached Product Banner */
.attached-product-banner {
  background: #ffffff;
  border-top: 1px solid var(--line);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.attached-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--line);
}

.attached-details {
  flex: 1;
  min-width: 0;
}

.attached-tag-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.attached-tag {
  font-size: 0.68rem;
  color: var(--muted);
  font-weight: 600;
}

.attached-type-pill {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: uppercase;
}

.attached-type-pill.is-jastip {
  background: var(--brown);
  color: var(--gold-2);
}

.attached-type-pill.is-request {
  background: #fef3c7;
  color: #92400e;
}

.attached-type-pill.is-ready {
  background: var(--line);
  color: var(--brown);
}

.attached-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attached-meta {
  font-size: 0.72rem;
  display: flex;
  gap: 6px;
  align-items: center;
}

.attached-price {
  font-weight: 700;
  color: var(--text);
}

.text-green {
  color: #15803d;
  font-weight: 600;
}

.text-red {
  color: #b91c1c;
  font-weight: 600;
}

.remove-attached-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.remove-attached-btn:hover {
  color: #b91c1c;
  background: rgba(0, 0, 0, 0.04);
}

/* 2. Message List */
.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--cream);
}

.welcome-box {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 12px 14px;
}

.welcome-heading {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
}

.welcome-sub {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.45;
  margin: 0;
}

.date-chip {
  text-align: center;
  margin: 2px 0;
}

.date-chip span {
  font-size: 0.7rem;
  color: var(--text);
  background: var(--line);
  padding: 3px 12px;
  border-radius: 999px;
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
  border-radius: 16px;
  font-size: 0.85rem;
  line-height: 1.45;
  box-shadow: 0 1px 3px rgba(42, 29, 20, 0.05);
}

.user-msg .chat-bubble {
  background: var(--brown);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.admin-msg .chat-bubble {
  background: #ffffff;
  color: var(--text);
  border: 1px solid var(--line);
  border-bottom-left-radius: 4px;
}

.bubble-sender-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 3px;
}

.bubble-text {
  margin: 0;
  white-space: pre-line;
  word-break: break-word;
}

.bubble-product-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--cream);
  color: var(--text);
  padding: 7px 9px;
  border-radius: 10px;
  text-decoration: none;
  margin-bottom: 6px;
  border: 1px solid var(--line);
}

.bubble-prod-img {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.bubble-prod-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  font-size: 0.75rem;
}

.bubble-prod-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.bubble-prod-badge.is-jastip {
  background: var(--brown);
  color: var(--gold-2) !important;
}

.bubble-prod-badge.is-ready {
  background: var(--line);
  color: var(--brown);
}

.bubble-prod-info strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: var(--text);
}

.bubble-prod-info span {
  color: var(--brown);
  font-weight: 700;
}

.bubble-img-link {
  display: block;
  margin-bottom: 6px;
}

.bubble-img {
  max-width: 190px;
  max-height: 190px;
  border-radius: 10px;
  object-fit: cover;
}

.bubble-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.bubble-time {
  font-size: 0.68rem;
}

.user-msg .bubble-time {
  color: rgba(253, 248, 241, 0.78);
}

.admin-msg .bubble-time {
  color: var(--muted);
}

.check-status {
  font-size: 0.68rem;
  color: var(--gold-2);
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
  background: var(--muted);
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
  font-size: 0.74rem;
  color: var(--muted);
  font-style: italic;
}

/* 3. Product Picker Bar & Drawer */
.product-picker-bar {
  background: var(--cream);
  border-top: 1px solid var(--line);
  padding: 8px 14px;
  flex-shrink: 0;
}

.open-product-picker-btn {
  width: 100%;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid var(--line);
  color: var(--text);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}

.open-product-picker-btn:hover,
.open-product-picker-btn.is-active {
  background: var(--brown);
  color: #ffffff;
  border-color: var(--brown);
}

.product-picker-drawer {
  background: #ffffff;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  max-height: 320px;
  flex-shrink: 0;
  box-shadow: 0 -4px 16px rgba(42, 29, 20, 0.08);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid var(--line);
}

.picker-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text);
}

.picker-count {
  font-size: 0.7rem;
  color: var(--muted);
  background: var(--cream);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--line);
}

.picker-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--cream);
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.picker-controls {
  padding: 8px 14px;
  background: var(--cream);
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-tabs {
  display: flex;
  gap: 6px;
}

.picker-tab {
  flex: 1;
  padding: 5px 8px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.picker-tab.active {
  background: var(--brown);
  color: #ffffff;
  border-color: var(--brown);
}

.picker-search-input {
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 0.76rem;
  outline: none;
}

.picker-search-input:focus {
  border-color: var(--gold);
}

.picker-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.picker-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}

.picker-product-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #ffffff;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;
}

.picker-product-item:hover {
  background: var(--cream);
  border-color: var(--gold);
}

.picker-prod-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--line);
}

.picker-thumb-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  font-size: 1.2rem;
}

.bubble-prod-icon {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid var(--line);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.bubble-prod-badge.is-request {
  background: #fef3c7;
  color: #92400e !important;
}

.picker-prod-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.picker-prod-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.picker-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.picker-badge.badge-jastip {
  background: var(--brown);
  color: var(--gold-2);
}

.picker-badge.badge-request {
  background: #fef3c7;
  color: #92400e;
}

.picker-badge.badge-ready {
  background: var(--line);
  color: var(--brown);
}

.picker-trip-name {
  font-size: 0.66rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-prod-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-prod-price {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--brown);
}

.picker-select-action {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--brown);
  background: var(--cream);
  border: 1px solid var(--line);
  padding: 4px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.picker-product-item:hover .picker-select-action {
  background: var(--brown);
  color: #ffffff;
  border-color: var(--brown);
}

/* 4. Input Row & 5. Footer */
.chat-footer {
  position: relative;
  padding: 10px 14px 12px;
  background: #ffffff;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.plus-action-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 14px;
  width: 268px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 10px 28px rgba(42, 29, 20, 0.16);
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 50;
}

.plus-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 150ms ease;
}

.plus-menu-item:hover {
  background: var(--cream);
}

.plus-menu-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--cream);
  border: 1px solid var(--line);
  color: var(--brown);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}

.plus-menu-item:hover .plus-menu-icon {
  background: var(--brown);
  color: var(--gold-2);
  border-color: var(--brown);
}

.plus-menu-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.plus-menu-text strong {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.25;
}

.plus-menu-text small {
  font-size: 0.68rem;
  color: var(--muted);
  line-height: 1.25;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attach-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--cream);
  border: 1px solid var(--line);
  color: var(--brown);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 150ms ease, color 150ms ease, background 150ms ease, transform 200ms ease;
}

.attach-btn:hover:not(:disabled) {
  border-color: var(--gold);
  color: var(--brown);
  background: #f5ebd9;
}

.attach-btn.is-open {
  background: var(--brown);
  color: var(--gold-2);
  border-color: var(--brown);
  transform: rotate(45deg);
}

.attach-btn:focus-visible {
  outline: 2px solid var(--brown);
  outline-offset: 2px;
}

.chat-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--cream);
  color: var(--text);
  /* 16px font prevents iOS Safari auto-zoom */
  font-size: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.chat-input::placeholder {
  color: var(--muted);
}

.chat-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 164, 106, 0.35);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--gold);
  color: var(--brown);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, transform 150ms ease;
}

.send-btn:hover:not(:disabled) {
  background: var(--gold-2);
  transform: scale(1.05);
}

.send-btn:focus-visible {
  outline: 2px solid var(--brown);
  outline-offset: 2px;
}

.send-btn:disabled {
  background: #e6dccd;
  color: var(--muted);
  cursor: not-allowed;
  transform: none;
}

.footer-help-note {
  display: flex;
  justify-content: center;
  font-size: 0.68rem;
  color: var(--muted);
}

/* =========================================================
   RESPONSIVE BREAKPOINTS (Phones & Landscape Phones)
   ========================================================= */
@media (max-width: 480px) {
  .dbb-chat-launcher {
    top: auto;
    bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  }

  /* On phones, hide launcher when open so header X closes */
  .dbb-chat-launcher.is-open {
    right: 0;
    opacity: 0;
    pointer-events: none;
  }

  .dbb-chat-popup {
    width: 100%;
    height: 100dvh;
    border-left: none;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */
@media (prefers-reduced-motion: reduce) {
  .dbb-chat-launcher,
  .dbb-chat-popup,
  .send-btn {
    transition: opacity 150ms ease !important;
  }
}
</style>
