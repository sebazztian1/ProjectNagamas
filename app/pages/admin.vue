<template>
  <div class="admin-wrapper">
    <!-- Admin Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <NuxtLink to="/admin" class="brand-link">
          <div class="brand-logo-icon">D</div>
          <div class="brand-text-group">
            <span class="brand-name">DBB_LUXE</span>
            <span class="admin-tag">Admin Panel Jastip</span>
          </div>
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">NAVIGASI UTAMA</div>

        <!-- 1. Ringkasan -->
        <NuxtLink to="/admin" class="nav-item" active-class="active" exact>
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1"></rect>
            <rect width="7" height="5" x="14" y="3" rx="1"></rect>
            <rect width="7" height="9" x="14" y="12" rx="1"></rect>
            <rect width="7" height="5" x="3" y="16" rx="1"></rect>
          </svg>
          <span>Dashboard Ringkasan</span>
        </NuxtLink>

        <!-- 2. Produk -->
        <NuxtLink to="/admin/produk" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <span>Kelola Produk (Ready & Jastip)</span>
        </NuxtLink>

        <!-- 3. Jadwal Jastip (Trip) -->
        <NuxtLink to="/admin/trip" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
          </svg>
          <span>Jadwal Jastip (Trip)</span>
          <span class="badge-count">3 Trip</span>
        </NuxtLink>

        <!-- 4. Pesanan & Verifikasi -->
        <NuxtLink to="/admin/order" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Pesanan & Verifikasi</span>
          <span class="badge-count warning">2 Baru</span>
        </NuxtLink>

        <!-- 5. Live Chat Admin -->
        <NuxtLink to="/admin/chat" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Live Chat Admin</span>
        </NuxtLink>

        <!-- 6. Request Produk -->
        <NuxtLink to="/admin/request" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span>Request Produk & Quote</span>
        </NuxtLink>

        <div class="nav-section-title">PENGATURAN & AUDIT</div>

        <!-- 7. Pelanggan -->
        <NuxtLink to="/admin/customer" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Daftar Pelanggan</span>
        </NuxtLink>

        <!-- 8. Pengaturan Toko -->
        <NuxtLink to="/admin/pengaturan" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span>Pengaturan Toko & Rekening</span>
        </NuxtLink>

        <!-- 9. Audit Log -->
        <NuxtLink to="/admin/log" class="nav-item" active-class="active">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Audit Log Aktivitas</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink to="/" class="back-shop-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Buka Toko Publik</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Slot -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <span class="role-chip">Admin Master</span>
          <span class="store-status">&bull; Toko Sedang Buka</span>
        </div>

        <div class="topbar-right">
          <NuxtLink to="/admin/chat" class="icon-btn-round" title="Chat CS">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </NuxtLink>

          <div class="admin-user-pill">
            <span class="avatar-letter">A</span>
            <span class="user-label">Admin dbb_luxe</span>
          </div>
        </div>
      </header>

      <!-- Child Pages injected here -->
      <div class="admin-page-content">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--color-canvas, #F4F6F8);
}

.admin-sidebar {
  width: 270px;
  background: #ffffff;
  border-right: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 20px 22px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-logo-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.15rem;
}

.brand-name {
  display: block;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary, #4A5D73);
  letter-spacing: -0.5px;
}

.admin-tag {
  font-size: 0.7rem;
  color: var(--color-text-muted, #64748B);
  font-weight: 600;
}

.sidebar-nav {
  padding: 16px 12px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94A3B8;
  padding: 12px 10px 6px;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748B);
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--color-canvas, #F4F6F8);
  color: var(--color-primary, #4A5D73);
}

.nav-item.active {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
}

.badge-count {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 2px 7px;
  border-radius: 10px;
}

.nav-item.active .badge-count {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.badge-count.warning {
  background: #FEE2E2;
  color: #DC2626;
}

.sidebar-footer {
  padding: 14px 16px;
  border-top: 1px solid var(--color-secondary, #E4E7EB);
}

.back-shop-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-primary, #4A5D73);
  transition: all 0.15s;
}

.back-shop-btn:hover {
  background: var(--color-secondary, #E4E7EB);
}

/* Admin Main Area */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  background: #ffffff;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  padding: 12px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 40;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-chip {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  font-size: 0.74rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.store-status {
  font-size: 0.78rem;
  color: #10B981;
  font-weight: 700;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn-round {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary, #4A5D73);
  text-decoration: none;
}

.admin-user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-letter {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

.user-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.admin-page-content {
  padding: 28px;
  flex: 1;
}
</style>
