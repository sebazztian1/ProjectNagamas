<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
    <!-- Thin announcement strip -->
    <div class="announce-bar">
      <span>DBB LUXURY BRANDED PARTNER</span>
    </div>

    <div class="nav-wrapper">
      <!-- Left: Mobile toggle + Brand -->
      <div class="nav-left">
        <button class="icon-btn mobile-only" aria-label="Buka menu" @click="mobileOpen = !mobileOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>

        <NuxtLink to="/" class="brand" aria-label="dbb_luxe beranda">
          <span class="brand-title">dbb<span class="brand-dot">_</span>luxe</span>
          <span class="brand-tagline">Jastip &amp; Ready Stock</span>
        </NuxtLink>
      </div>

      <!-- Center: Primary navigation -->
      <nav class="nav-links" aria-label="Navigasi utama">
        <NuxtLink to="/" class="nav-link" exact-active-class="active">Beranda</NuxtLink>
        <NuxtLink to="/ready" class="nav-link" active-class="active">Ready Stock</NuxtLink>
        <NuxtLink to="/jastip" class="nav-link" active-class="active">Jadwal Jastip</NuxtLink>
        <NuxtLink to="/request" class="nav-link" active-class="active">Request</NuxtLink>
      </nav>

      <!-- Right: Compact icon actions -->
      <div class="nav-right">
        <button class="icon-btn" :class="{ active: searchOpen }" aria-label="Cari" @click="toggleSearch">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <NuxtLink to="/wishlist" class="icon-btn" title="Wishlist">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span v-if="wishlistCount > 0" class="dot-badge">{{ wishlistCount }}</span>
        </NuxtLink>

        <NuxtLink to="/notifikasi" class="icon-btn hide-sm" title="Notifikasi">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="dot-badge">1</span>
        </NuxtLink>

        <NuxtLink to="/orders" class="icon-btn" title="Pesanan Saya">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </NuxtLink>

        <span class="nav-divider hide-sm"></span>

        <!-- Logged in -->
        <div v-if="currentUser" class="user-menu">
          <NuxtLink v-if="currentUser.role === 'admin' || currentUser.role === 'staff'" to="/admin" class="btn-text hide-sm" style="font-weight: 700; color: var(--color-primary);">
            Panel Admin
          </NuxtLink>
          <NuxtLink to="/akun" class="user-pill" :title="'@' + currentUser.username + ' (' + currentUser.phone_number + ')'">
            <span class="user-avatar">{{ currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U' }}</span>
            <span class="user-name hide-sm">@{{ currentUser.username }}</span>
          </NuxtLink>
          <button class="icon-btn hide-sm" title="Keluar" @click="handleLogout">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <!-- Guest -->
        <div v-else class="auth-group">
          <NuxtLink to="/login" class="btn-text hide-sm">Masuk</NuxtLink>
          <NuxtLink to="/register" class="btn-solid">Daftar</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Collapsible search panel -->
    <transition name="slide">
      <div v-if="searchOpen" class="search-panel">
        <div class="search-inner">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref="searchInput"
            :value="searchQuery"
            type="search"
            class="search-field"
            placeholder="Cari produk ready stock atau jastip…"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            @keydown.esc="searchOpen = false"
          />
          <button class="search-close" aria-label="Tutup pencarian" @click="searchOpen = false">Tutup</button>
        </div>
      </div>
    </transition>

    <!-- Mobile drawer -->
    <transition name="slide">
      <nav v-if="mobileOpen" class="mobile-menu" aria-label="Navigasi mobile" @click="mobileOpen = false">
        <NuxtLink to="/">Beranda</NuxtLink>
        <NuxtLink to="/ready">Ready Stock</NuxtLink>
        <NuxtLink to="/jastip">Jadwal Jastip</NuxtLink>
        <NuxtLink to="/request">Request Titip</NuxtLink>
        <NuxtLink to="/notifikasi">Notifikasi</NuxtLink>
        <NuxtLink to="/chat">Live Chat</NuxtLink>
        <NuxtLink v-if="!currentUser" to="/login">Masuk</NuxtLink>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'
import { useWishlist } from '../composables/useWishlist'

defineProps<{
  searchQuery?: string
}>()

defineEmits<{
  (e: 'update:searchQuery', val: string): void
}>()

const { currentUser, logout } = useAuth()
const { showToast } = useToast()
const { wishlistCount } = useWishlist()
const route = useRoute()

const searchOpen = ref(false)
const mobileOpen = ref(false)
const isScrolled = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

const toggleSearch = async () => {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick()
    searchInput.value?.focus()
  }
}

const onScroll = () => {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(() => route.path, () => {
  mobileOpen.value = false
  searchOpen.value = false
})

const handleLogout = async () => {
  await logout()
  showToast('Berhasil Keluar', 'Anda telah keluar dari akun.', 'info')
  navigateTo('/')
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 251, 242, 0.92);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.site-header.is-scrolled {
  border-bottom-color: var(--color-border);
  box-shadow: 0 6px 20px -16px rgba(43, 33, 22, 0.35);
}

.announce-bar {
  background: var(--brand-primary);
  color: var(--brand-accent);
  text-align: center;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 7px 16px;
}

.nav-wrapper {
  max-width: 1240px;
  margin: 0 auto;
  padding: 16px 28px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 28px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  line-height: 1;
}

.brand-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 0.01em;
}

.brand-dot {
  color: var(--brand-secondary);
}

.brand-tagline {
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* Center links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  position: relative;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-muted);
  padding: 6px 0;
  transition: color 0.2s;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  border-radius: 2px;
  background: var(--brand-secondary);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}

.nav-link.active {
  color: var(--brand-accent);
  font-weight: 600;
}

/* Right actions */
.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.icon-btn:hover,
.icon-btn.active {
  background: var(--brand-primary);
  color: var(--brand-accent);
}

.dot-badge {
  position: absolute;
  top: 5px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--brand-accent);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px var(--brand-neutral);
}

.nav-divider {
  width: 1px;
  height: 22px;
  background: var(--color-border);
  margin: 0 8px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.2s;
}

.user-pill:hover {
  background: var(--brand-primary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.user-name {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-text);
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-text {
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  padding: 9px 14px;
  border-radius: 999px;
  transition: background 0.2s;
}

.btn-text:hover {
  background: var(--brand-primary);
}

.btn-solid {
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
  background: var(--brand-accent);
  padding: 9px 20px;
  border-radius: 999px;
  transition: background 0.2s, transform 0.2s;
}

.btn-solid:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

/* Search panel */
.search-panel {
  border-top: 1px solid var(--color-border);
  background: var(--brand-neutral);
}

.search-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 42px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-field {
  flex: 1;
  padding: 13px 18px 13px 48px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fff;
  font-size: 0.95rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-field:focus {
  border-color: var(--brand-secondary);
  box-shadow: 0 0 0 4px rgba(216, 185, 120, 0.25);
}

.search-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* Mobile drawer */
.mobile-menu {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
  padding: 8px 24px 16px;
  background: var(--brand-neutral);
}

.mobile-menu a {
  text-decoration: none;
  padding: 12px 0;
  font-weight: 500;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.mobile-menu a:last-child {
  border-bottom: none;
}

.mobile-only {
  display: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 960px) {
  .nav-links {
    display: none;
  }
  .nav-wrapper {
    grid-template-columns: 1fr auto;
  }
  .mobile-only {
    display: inline-flex;
  }
}

@media (max-width: 560px) {
  .hide-sm {
    display: none !important;
  }
  .nav-wrapper {
    padding: 12px 16px;
  }
  .brand-title {
    font-size: 1.45rem;
  }
  .brand-tagline {
    display: none;
  }
}
</style>
