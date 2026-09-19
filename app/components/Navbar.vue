<template>
  <header class="simple-navbar">
    <div class="nav-wrapper">
      <!-- Logo / Title -->
      <NuxtLink to="/" class="brand">
        <span class="brand-title">Nagamas</span>
        <span class="brand-badge">Catalogue</span>
      </NuxtLink>

      <!-- Search Input -->
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          :value="searchQuery" 
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          placeholder="Cari tas, baju, aksesoris..."
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

      <!-- Auth & Admin Navigation -->
      <div class="nav-right">
        <!-- Live Chat Customer Service button -->
        <button class="nav-chat-btn" @click="openChat" title="Chat dengan Customer Service">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Chat CS</span>
          <span v-if="customerUnreadCount > 0" class="nav-chat-badge">{{ customerUnreadCount }}</span>
        </button>

        <!-- Admin Dashboard shortcut link -->
        <NuxtLink to="/admin" class="nav-admin-link" title="Buka Dashboard Admin">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1"></rect>
            <rect width="7" height="5" x="14" y="3" rx="1"></rect>
            <rect width="7" height="9" x="14" y="12" rx="1"></rect>
            <rect width="7" height="5" x="3" y="16" rx="1"></rect>
          </svg>
          <span>Admin</span>
        </NuxtLink>

        <!-- Logged in State -->
        <div v-if="currentUser" class="user-menu">
          <div class="user-pill" :title="currentUser.email">
            <span class="user-avatar">{{ currentUser.name.charAt(0).toUpperCase() }}</span>
            <span class="user-name">{{ currentUser.name }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" title="Keluar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
import { useCustomerChat } from '../composables/useCustomerChat'

defineProps<{
  searchQuery?: string
}>()

defineEmits<{
  (e: 'update:searchQuery', val: string): void
}>()

const { currentUser, logout } = useAuth()
const { showToast } = useToast()
const { openChat, customerUnreadCount } = useCustomerChat()

const handleLogout = () => {
  logout()
  showToast('Keluar Akun', 'Anda telah keluar dari akun.', 'info')
}
</script>

<style scoped>
.simple-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 20px;
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
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.brand-badge {
  font-size: 0.72rem;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.search-wrap {
  flex: 1;
  max-width: 420px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-field {
  width: 100%;
  padding: 8px 32px 8px 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
}

.search-field:focus {
  background: #ffffff;
  border-color: #0f172a;
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.1rem;
}

/* Nav Right */
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-admin-link {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
}

.nav-admin-link:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.nav-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.nav-chat-btn:hover {
  background: #15803d;
  color: #ffffff;
  border-color: #15803d;
}

.nav-chat-badge {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 8px;
}

/* Auth Actions */
.auth-btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-auth-link {
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-auth-link.login {
  color: #0f172a;
  background: #f1f5f9;
}

.nav-auth-link.login:hover {
  background: #e2e8f0;
}

.nav-auth-link.register {
  color: #ffffff;
  background: #0f172a;
}

.nav-auth-link.register:hover {
  background: #334155;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 6px;
  background: #f1f5f9;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.user-avatar {
  width: 26px;
  height: 26px;
  background: #0f172a;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

@media (max-width: 640px) {
  .nav-auth-link {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>
