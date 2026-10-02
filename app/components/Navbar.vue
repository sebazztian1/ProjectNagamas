<template>
  <header class="simple-navbar">
    <div class="nav-wrapper">
      <!-- Logo / Title -->
      <NuxtLink to="/" class="brand">
        <span class="brand-title">dbb_luxe</span>
        <span class="brand-badge">Jastip & Ready</span>
      </NuxtLink>

      <!-- Center Navigation Links -->
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link" active-class="active" exact>Beranda</NuxtLink>
        <NuxtLink to="/ready" class="nav-link" active-class="active">Ready Stock</NuxtLink>
        <NuxtLink to="/jastip" class="nav-link" active-class="active">Jadwal Jastip</NuxtLink>
        <NuxtLink to="/request" class="nav-link" active-class="active">Request Titip</NuxtLink>
      </nav>

      <!-- Search Input -->
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          :value="searchQuery" 
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          placeholder="Cari barang ready atau jastip..."
          class="search-field"
        />
        <button 
          v-if="searchQuery" 
          class="clear-btn"
          @click="$emit('update:searchQuery', '')"
        >
          &times;
        </button>
      </div>

      <!-- Auth & Action Navigation -->
      <div class="nav-right">
        <!-- Wishlist Link -->
        <NuxtLink to="/wishlist" class="nav-icon-link" title="Wishlist Saya">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="badge-bubble">2</span>
        </NuxtLink>

        <!-- Orders Link -->
        <NuxtLink to="/orders" class="nav-icon-link" title="Pesanan Saya">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </NuxtLink>

        <!-- Notification Link -->
        <NuxtLink to="/notifikasi" class="nav-icon-link" title="Notifikasi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="badge-bubble alert">1</span>
        </NuxtLink>

        <!-- Live Chat Customer Service button -->
        <NuxtLink to="/chat" class="nav-chat-btn" title="Chat dengan Customer Service">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Chat</span>
        </NuxtLink>

        <!-- Admin Dashboard shortcut link -->
        <NuxtLink to="/admin" class="nav-admin-link" title="Buka Dashboard Admin">
          <span>Admin</span>
        </NuxtLink>

        <!-- Logged in State -->
        <div v-if="currentUser" class="user-menu">
          <NuxtLink to="/akun" class="user-pill" :title="currentUser.email">
            <span class="user-avatar">{{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}</span>
            <span class="user-name">{{ currentUser.name || currentUser.username }}</span>
          </NuxtLink>
          <button class="logout-btn" @click="handleLogout" title="Keluar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- Guest State: Links to /login or /register -->
        <div v-else class="auth-btn-group">
          <NuxtLink to="/login" class="nav-auth-link login">
            Masuk
          </NuxtLink>
          <NuxtLink to="/register" class="nav-auth-link register">
            Daftar
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

defineProps<{
  searchQuery?: string
}>()

defineEmits<{
  (e: 'update:searchQuery', val: string): void
}>()

const { currentUser, logout } = useAuth()
const { showToast } = useToast()

const handleLogout = () => {
  logout()
  showToast({
    title: 'Berhasil Keluar',
    message: 'Anda telah keluar dari akun.',
    type: 'info'
  })
}
</script>

<style scoped>
.simple-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.nav-wrapper {
  max-width: 1240px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
  letter-spacing: -0.5px;
}

.brand-badge {
  font-size: 0.7rem;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
}

.nav-link {
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748B);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.15s;
}

.nav-link:hover {
  color: var(--color-primary, #4A5D73);
  background: var(--color-secondary, #E4E7EB);
}

.nav-link.active {
  color: #ffffff;
  background: var(--color-primary, #4A5D73);
}

.search-wrap {
  flex: 1;
  max-width: 280px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted, #64748B);
  pointer-events: none;
}

.search-field {
  width: 100%;
  padding: 8px 30px 8px 34px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  background: var(--color-canvas, #F4F6F8);
  font-size: 0.84rem;
  color: var(--color-text, #1E293B);
  outline: none;
  transition: all 0.2s;
}

.search-field:focus {
  background: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--color-text-muted, #64748B);
  cursor: pointer;
  font-size: 1rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-icon-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: var(--color-primary, #4A5D73);
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  text-decoration: none;
  transition: all 0.15s;
}

.nav-icon-link:hover {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary-hover, #384759);
}

.badge-bubble {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.badge-bubble.alert {
  background: var(--color-warning, #D97706);
}

.nav-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s;
}

.nav-chat-btn:hover {
  background: #166534;
  color: #ffffff;
}

.nav-admin-link {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  color: var(--color-text-muted, #64748B);
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
}

.nav-admin-link:hover {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-color: var(--color-primary, #4A5D73);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 5px;
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.15s;
}

.user-pill:hover {
  border-color: var(--color-primary, #4A5D73);
}

.user-avatar {
  width: 26px;
  height: 26px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text, #1E293B);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  background: none;
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 6px;
  border-radius: 8px;
  color: var(--color-text-muted, #64748B);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.logout-btn:hover {
  background: #FEE2E2;
  color: #DC2626;
  border-color: #FCA5A5;
}

.auth-btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-auth-link {
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 8px;
  transition: all 0.15s;
}

.nav-auth-link.login {
  color: var(--color-primary, #4A5D73);
  border: 1px solid var(--color-secondary, #E4E7EB);
  background: #ffffff;
}

.nav-auth-link.login:hover {
  background: var(--color-secondary, #E4E7EB);
}

.nav-auth-link.register {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: 1px solid var(--color-primary, #4A5D73);
}

.nav-auth-link.register:hover {
  background: var(--color-primary-hover, #384759);
}

@media (max-width: 992px) {
  .nav-links {
    display: none;
  }
}
</style>
