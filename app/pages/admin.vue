<template>
  <div class="admin-wrapper">
    <!-- Admin Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <NuxtLink to="/" class="brand-link">
          <div class="brand-logo-icon">N</div>
          <div class="brand-text-group">
            <span class="brand-name">NAGAMAS</span>
            <span class="admin-tag">Admin Panel</span>
          </div>
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">MENU UTAMA</div>

        <!-- 1. Ringkasan (Overview) -->
        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="7" height="9" x="3" y="3" rx="1"></rect>
            <rect width="7" height="5" x="14" y="3" rx="1"></rect>
            <rect width="7" height="9" x="14" y="12" rx="1"></rect>
            <rect width="7" height="5" x="3" y="16" rx="1"></rect>
          </svg>
          <span>Ringkasan</span>
        </button>

        <!-- 2. Pengontrolan Stok -->
        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'stock' }"
          @click="activeTab = 'stock'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.29 7 12 12 20.71 7"></polyline>
            <line x1="12" y1="22" x2="12" y2="12"></line>
          </svg>
          <span>Pengontrolan Stok</span>
          <span v-if="criticalStockCount > 0" class="item-badge badge-warning" title="Perlu restock">
            {{ criticalStockCount }}
          </span>
          <span v-else class="item-badge">{{ inventoryList.length }}</span>
        </button>

        <!-- 3. Orders (Pesanan) -->
        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'orders' }"
          @click="activeTab = 'orders'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Orders (Pesanan)</span>
          <span v-if="pendingOrdersCount > 0" class="item-badge badge-orders">
            {{ pendingOrdersCount }}
          </span>
        </button>

        <!-- 4. Notifikasi Chat -->
        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'chats' }"
          @click="activeTab = 'chats'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Notifikasi Chat</span>
          <span v-if="unreadChatsCount > 0" class="item-badge badge-chat">
            {{ unreadChatsCount }}
          </span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink to="/" class="back-shop-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Lihat Katalog Toko</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="admin-main">
      <!-- Top Bar -->
      <header class="admin-topbar">
        <div class="topbar-title">
          <h2>{{ sectionTitle }}</h2>
          <span class="breadcrumb">Admin / {{ sectionTitle }}</span>
        </div>

        <div class="topbar-right">
          <!-- Chat Notification Bell / Dropdown -->
          <div class="notif-dropdown-wrapper">
            <button 
              class="topbar-icon-btn" 
              :class="{ active: showChatDropdown }"
              @click="showChatDropdown = !showChatDropdown" 
              title="Notifikasi Chat Masuk"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span v-if="unreadChatsCount > 0" class="topbar-notif-badge">
                {{ unreadChatsCount }}
              </span>
            </button>

            <!-- Dropdown Popover -->
            <div v-if="showChatDropdown" class="notif-popover">
              <div class="notif-popover-header">
                <h4>Notifikasi Chat Pengguna</h4>
                <span class="notif-count-label">{{ unreadChatsCount }} belum dibaca</span>
              </div>
              <div class="notif-popover-list">
                <div 
                  v-for="chat in chatList.slice(0, 4)" 
                  :key="chat.id"
                  class="notif-item"
                  :class="{ unread: chat.unreadCount > 0 }"
                  @click="openChatFromDropdown(chat)"
                >
                  <div class="notif-avatar">{{ chat.customerName.charAt(0) }}</div>
                  <div class="notif-content">
                    <div class="notif-row">
                      <span class="notif-name">{{ chat.customerName }}</span>
                      <span class="notif-time">{{ chat.lastMessageTime }}</span>
                    </div>
                    <p class="notif-text">{{ chat.lastMessage }}</p>
                    <span v-if="chat.relatedProduct" class="notif-product-tag">
                      Produk: {{ chat.relatedProduct.name }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="notif-popover-footer">
                <button class="view-all-chats-btn" @click="goToChatsTab">
                  Buka Semua Chat & Percakapan &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- Admin Profile -->
          <div class="admin-profile">
            <div class="avatar">A</div>
            <div class="profile-info">
              <span class="name">Admin Nagamas</span>
              <span class="role">Super Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard View Content -->
      <div class="admin-body">

        <!-- ======================================================== -->
        <!-- 1. TAB RINGKASAN (OVERVIEW) -->
        <!-- ======================================================== -->
        <div v-if="activeTab === 'overview'" class="tab-pane">
          <!-- 4 Core Metric KPI Cards -->
          <div class="kpi-grid">
            <!-- KPI 1: Orders Menunggu Tindakan -->
            <div class="kpi-card clickable" @click="activeTab = 'orders'">
              <div class="kpi-icon orders-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Orders Perlu Diproses</span>
                <span class="kpi-val">{{ pendingOrdersCount }} Pesanan</span>
                <span class="kpi-sub highlight-blue">{{ newOrdersCount }} Baru &bull; {{ processingOrdersCount }} Diproses</span>
              </div>
              <div class="kpi-arrow">&rarr;</div>
            </div>

            <!-- KPI 2: Notifikasi Chat Belum Dibalas -->
            <div class="kpi-card clickable" @click="activeTab = 'chats'">
              <div class="kpi-icon chat-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Chat Belum Dibalas</span>
                <span class="kpi-val">{{ unreadChatsCount }} Pesan</span>
                <span class="kpi-sub" :class="unreadChatsCount > 0 ? 'highlight-amber' : 'positive'">
                  {{ unreadChatsCount > 0 ? 'Butuh respon segera' : 'Semua pesan terbalas' }}
                </span>
              </div>
              <div class="kpi-arrow">&rarr;</div>
            </div>

            <!-- KPI 3: Stok Menipis (Peringatan) -->
            <div class="kpi-card clickable" @click="filterStockByStatus('menipis')">
              <div class="kpi-icon warning-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Stok Menipis (&le; 10 unit)</span>
                <span class="kpi-val">{{ lowStockCount }} SKU</span>
                <span class="kpi-sub warning">Perlu penambahan stok</span>
              </div>
              <div class="kpi-arrow">&rarr;</div>
            </div>

            <!-- KPI 4: Stok Habis (Out of Stock) -->
            <div class="kpi-card clickable" @click="filterStockByStatus('habis')">
              <div class="kpi-icon danger-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Stok Habis (Kosong)</span>
                <span class="kpi-val">{{ outOfStockCount }} SKU</span>
                <span class="kpi-sub danger">Tidak bisa diorder pelanggan</span>
              </div>
              <div class="kpi-arrow">&rarr;</div>
            </div>
          </div>

          <!-- Dual Widgets: Recent Orders & Incoming Chats -->
          <div class="overview-dual-grid">
            <!-- Widget 1: Orders Menunggu Diproses -->
            <div class="panel-box">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <div class="panel-indicator bg-amber"></div>
                  <h3>Pesanan Terbaru Menunggu Tindakan</h3>
                </div>
                <button class="panel-action-link" @click="activeTab = 'orders'">
                  Kelola Orders &rarr;
                </button>
              </div>

              <div class="orders-feed">
                <div 
                  v-for="order in pendingOrdersList.slice(0, 4)" 
                  :key="order.id"
                  class="order-feed-item"
                >
                  <div class="order-feed-main">
                    <div class="order-feed-top">
                      <span class="order-code-badge">{{ order.orderCode }}</span>
                      <span class="status-chip" :class="order.status.toLowerCase()">
                        {{ order.status }}
                      </span>
                      <span class="feed-time">{{ order.createdAt }}</span>
                    </div>

                    <div class="order-feed-customer">
                      <strong>{{ order.customerName }}</strong> &bull; {{ order.customerPhone }}
                    </div>

                    <div class="order-feed-items">
                      <span v-for="(it, idx) in order.items" :key="it.id">
                        {{ it.name }} ({{ it.quantity }}x){{ idx < order.items.length - 1 ? ', ' : '' }}
                      </span>
                    </div>
                  </div>

                  <div class="order-feed-actions">
                    <span class="feed-price">{{ formatPrice(order.totalAmount) }}</span>
                    <button 
                      v-if="order.status === 'Baru'" 
                      class="btn-mini btn-action-primary"
                      @click="processOrder(order)"
                    >
                      Proses Pesanan
                    </button>
                    <button 
                      v-else-if="order.status === 'Diproses'" 
                      class="btn-mini btn-action-ship"
                      @click="openShipModal(order)"
                    >
                      Kirim Pesanan
                    </button>
                    <button class="btn-mini" @click="openOrderDetail(order)">
                      Detail
                    </button>
                  </div>
                </div>

                <div v-if="pendingOrdersList.length === 0" class="empty-feed">
                  <p>Semua pesanan telah diproses atau dikirim.</p>
                </div>
              </div>
            </div>

            <!-- Widget 2: Notifikasi Chat Terbaru -->
            <div class="panel-box">
              <div class="panel-header">
                <div class="panel-title-wrap">
                  <div class="panel-indicator bg-emerald"></div>
                  <h3>Pesan Chat Masuk dari Pelanggan</h3>
                </div>
                <button class="panel-action-link" @click="activeTab = 'chats'">
                  Buka Ruang Chat &rarr;
                </button>
              </div>

              <div class="chat-feed">
                <div 
                  v-for="chat in chatList.slice(0, 4)" 
                  :key="chat.id"
                  class="chat-feed-item"
                  :class="{ unread: chat.unreadCount > 0 }"
                  @click="selectChatAndNavigate(chat)"
                >
                  <div class="chat-feed-avatar">
                    {{ chat.customerName.charAt(0) }}
                    <span v-if="chat.unreadCount > 0" class="online-dot"></span>
                  </div>

                  <div class="chat-feed-body">
                    <div class="chat-feed-head">
                      <span class="chat-customer-name">{{ chat.customerName }}</span>
                      <span class="chat-time-tag">{{ chat.lastMessageTime }}</span>
                    </div>
                    <p class="chat-preview-text">{{ chat.lastMessage }}</p>
                    <div class="chat-meta-row">
                      <span v-if="chat.relatedProduct" class="product-inquiry-pill">
                        Tanya: {{ chat.relatedProduct.name }}
                      </span>
                      <span class="chat-status-pill" :class="chat.status">
                        {{ chat.status === 'unread' ? 'Belum Dibalas' : 'Terbalas' }}
                      </span>
                    </div>
                  </div>

                  <button class="btn-mini btn-reply" @click.stop="selectChatAndNavigate(chat)">
                    Balas
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Widget 3: Peringatan Pengontrolan Stok Kritis -->
          <div class="panel-box mt-6">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <div class="panel-indicator bg-rose"></div>
                <h3>Peringatan Kontrol Stok (Habis & Menipis)</h3>
              </div>
              <button class="panel-action-link" @click="activeTab = 'stock'">
                Lihat Semua Pengontrolan Stok &rarr;
              </button>
            </div>

            <div class="stock-alerts-grid">
              <div 
                v-for="prod in criticalStockList" 
                :key="prod.id"
                class="stock-alert-card"
                :class="{ 'is-out': prod.stockCount === 0 }"
              >
                <img :src="prod.image" :alt="prod.name" class="alert-prod-img" />
                <div class="alert-prod-info">
                  <div class="alert-prod-name">{{ prod.name }}</div>
                  <div class="alert-prod-cat">{{ prod.category }} &bull; ID: {{ prod.id }}</div>
                  <div class="alert-stock-bar-wrap">
                    <div 
                      class="alert-stock-bar" 
                      :style="{ width: Math.min(100, (prod.stockCount / 15) * 100) + '%' }"
                      :class="prod.stockCount === 0 ? 'bar-red' : 'bar-amber'"
                    ></div>
                  </div>
                  <div class="alert-stock-text">
                    <span v-if="prod.stockCount === 0" class="badge-stock-zero">STOK HABIS (0 unit)</span>
                    <span v-else class="badge-stock-low">Sisa {{ prod.stockCount }} unit (Batas min: 10)</span>
                  </div>
                </div>

                <div class="alert-prod-actions">
                  <button class="btn-mini btn-add-stock" @click="quickAddStock(prod, 10)">
                    +10 Stok
                  </button>
                  <button class="btn-mini" @click="openAdjustStockModal(prod)">
                    Sesuaikan
                  </button>
                </div>
              </div>

              <div v-if="criticalStockList.length === 0" class="empty-feed p-4">
                <p>Seluruh stok produk berada dalam kondisi aman (&gt; 10 unit).</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- 2. TAB PENGONTROLAN STOK (STOCK CONTROL) -->
        <!-- ======================================================== -->
        <div v-else-if="activeTab === 'stock'" class="tab-pane">
          <!-- Mini Stats Bar -->
          <div class="stock-stat-ribbon">
            <div class="stat-ribbon-item">
              <span class="ribbon-label">Total SKU Produk</span>
              <span class="ribbon-val">{{ inventoryList.length }}</span>
            </div>
            <div class="stat-ribbon-item text-green">
              <span class="ribbon-label">Stok Aman (&gt;10)</span>
              <span class="ribbon-val">{{ safeStockCount }}</span>
            </div>
            <div class="stat-ribbon-item text-amber">
              <span class="ribbon-label">Stok Menipis (1-10)</span>
              <span class="ribbon-val">{{ lowStockCount }}</span>
            </div>
            <div class="stat-ribbon-item text-red">
              <span class="ribbon-label">Stok Habis (0)</span>
              <span class="ribbon-val">{{ outOfStockCount }}</span>
            </div>
          </div>

          <!-- Toolbar Actions -->
          <div class="toolbar-actions">
            <div class="toolbar-left">
              <div class="search-input-wrap">
                <svg class="input-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  v-model="stockSearch" 
                  placeholder="Cari nama produk / ID SKU..." 
                  class="filter-input with-icon"
                />
              </div>

              <div class="filter-pills-row">
                <button 
                  class="pill-btn" 
                  :class="{ active: stockStatusFilter === 'all' }"
                  @click="stockStatusFilter = 'all'"
                >
                  Semua ({{ inventoryList.length }})
                </button>
                <button 
                  class="pill-btn" 
                  :class="{ active: stockStatusFilter === 'aman' }"
                  @click="stockStatusFilter = 'aman'"
                >
                  Aman ({{ safeStockCount }})
                </button>
                <button 
                  class="pill-btn warning" 
                  :class="{ active: stockStatusFilter === 'menipis' }"
                  @click="stockStatusFilter = 'menipis'"
                >
                  Menipis ({{ lowStockCount }})
                </button>
                <button 
                  class="pill-btn danger" 
                  :class="{ active: stockStatusFilter === 'habis' }"
                  @click="stockStatusFilter = 'habis'"
                >
                  Habis ({{ outOfStockCount }})
                </button>
              </div>
            </div>

            <div class="toolbar-right">
              <button class="btn-outline" @click="showStockHistoryModal = true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="9"></circle>
                </svg>
                <span>Riwayat Log Stok</span>
              </button>
              <button class="btn-primary" @click="showAddProductModal = true">
                + Tambah SKU Baru
              </button>
            </div>
          </div>

          <!-- Stock Table -->
          <div class="panel-box">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Produk / SKU</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Batas Min.</th>
                    <th>Status Stok</th>
                    <th class="text-center">Pengontrolan Cepat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="prod in filteredStockList" :key="prod.id">
                    <td>
                      <div class="product-cell">
                        <img :src="prod.image" :alt="prod.name" class="prod-thumb" />
                        <div>
                          <div class="prod-name">{{ prod.name }}</div>
                          <span class="prod-id">SKU: {{ prod.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="category-pill-admin">{{ prod.category }}</span>
                    </td>
                    <td class="font-bold">{{ formatPrice(prod.price) }}</td>
                    <td>
                      <span class="text-muted-sm font-semibold">10 unit</span>
                    </td>
                    <td>
                      <span 
                        v-if="prod.stockCount === 0" 
                        class="status-chip chip-habis"
                      >
                        Habis (Out of Stock)
                      </span>
                      <span 
                        v-else-if="prod.stockCount <= 10" 
                        class="status-chip chip-menipis"
                      >
                        Menipis (Sisa {{ prod.stockCount }})
                      </span>
                      <span 
                        v-else 
                        class="status-chip chip-aman"
                      >
                        Aman ({{ prod.stockCount }} unit)
                      </span>
                    </td>
                    <!-- Quick Increment/Decrement Controls -->
                    <td class="text-center">
                      <div class="quick-stock-stepper">
                        <button 
                          class="stepper-btn btn-minus" 
                          :disabled="prod.stockCount <= 0"
                          @click="stepStock(prod, -1)" 
                          title="Kurangi 1 unit"
                        >
                          &minus;
                        </button>
                        <span class="stepper-val" :class="{ 'zero': prod.stockCount === 0 }">
                          {{ prod.stockCount }}
                        </span>
                        <button 
                          class="stepper-btn btn-plus" 
                          @click="stepStock(prod, 1)" 
                          title="Tambah 1 unit"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <div class="action-btn-row">
                        <button 
                          class="btn-mini btn-action-adjust" 
                          @click="openAdjustStockModal(prod)"
                          title="Buka form penyesuaian stok masuk / keluar / opname"
                        >
                          Sesuaikan Stok
                        </button>
                        <button 
                          class="btn-mini danger" 
                          @click="deleteProduct(prod.id)"
                          title="Hapus produk"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredStockList.length === 0">
                    <td colspan="7" class="empty-table-cell">
                      Tidak ada produk yang cocok dengan pencarian atau filter status stok.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- 3. TAB ORDERS (PESANAN PELANGGAN) -->
        <!-- ======================================================== -->
        <div v-else-if="activeTab === 'orders'" class="tab-pane">
          <!-- Toolbar Filter & Search -->
          <div class="toolbar-actions">
            <div class="toolbar-left">
              <div class="search-input-wrap">
                <svg class="input-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  v-model="orderSearch" 
                  placeholder="Cari no. order, nama pelanggan, no WA..." 
                  class="filter-input with-icon"
                />
              </div>

              <div class="filter-pills-row">
                <button 
                  v-for="st in ['Semua', 'Baru', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan']" 
                  :key="st"
                  class="pill-btn"
                  :class="{ active: orderFilterStatus === st }"
                  @click="orderFilterStatus = st"
                >
                  {{ st }}
                </button>
              </div>
            </div>
          </div>

          <!-- Orders Table -->
          <div class="panel-box">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No. Order & Waktu</th>
                    <th>Pelanggan</th>
                    <th>Barang Dipesan</th>
                    <th>Total & Bayar</th>
                    <th>Status Pesanan</th>
                    <th>Pengiriman</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in filteredOrders" :key="order.id">
                    <td>
                      <div class="order-code-cell">
                        <span class="font-bold text-dark">{{ order.orderCode }}</span>
                        <span class="date-cell">{{ order.createdAt }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="customer-info-cell">
                        <div class="customer-name font-bold">{{ order.customerName }}</div>
                        <span class="user-email-text">{{ order.customerPhone }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="order-items-snippet">
                        <div v-for="item in order.items" :key="item.id" class="item-line">
                          <span class="item-name-bold">{{ item.name }}</span>
                          <span class="item-qty">&times; {{ item.quantity }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="price-cell">
                        <span class="font-bold text-dark">{{ formatPrice(order.totalAmount) }}</span>
                        <span class="pay-method-tag">{{ order.paymentMethod }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-chip" :class="order.status.toLowerCase()">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>
                      <div v-if="order.trackingNumber" class="shipping-info-cell">
                        <span class="courier-name">{{ order.shippingCourier }}</span>
                        <code class="tracking-no">{{ order.trackingNumber }}</code>
                      </div>
                      <span v-else class="text-muted-sm">&minus;</span>
                    </td>
                    <td>
                      <div class="action-btn-row">
                        <!-- Step Status Action -->
                        <button 
                          v-if="order.status === 'Baru'"
                          class="btn-mini btn-action-primary"
                          @click="processOrder(order)"
                          title="Ubah status ke Diproses"
                        >
                          Proses
                        </button>
                        <button 
                          v-else-if="order.status === 'Diproses'"
                          class="btn-mini btn-action-ship"
                          @click="openShipModal(order)"
                          title="Kirim dan masukkan no resi"
                        >
                          Kirim (Resi)
                        </button>
                        <button 
                          v-else-if="order.status === 'Dikirim'"
                          class="btn-mini btn-action-finish"
                          @click="completeOrder(order)"
                          title="Tandai pesanan selesai diterima"
                        >
                          Selesaikan
                        </button>

                        <button class="btn-mini" @click="openOrderDetail(order)">
                          Detail
                        </button>
                        <a 
                          :href="getWhatsAppOrderUrl(order)" 
                          target="_blank" 
                          rel="noopener" 
                          class="btn-mini btn-wa-chat" 
                          title="Hubungi Pelanggan via WhatsApp"
                        >
                          WA
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredOrders.length === 0">
                    <td colspan="7" class="empty-table-cell">
                      Tidak ada data pesanan yang sesuai dengan filter.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- 4. TAB NOTIFIKASI CHAT (CUSTOMER CHATS) -->
        <!-- ======================================================== -->
        <div v-else-if="activeTab === 'chats'" class="tab-pane">
          <div class="chat-workspace-card">
            <!-- Left: Chat List -->
            <div class="chat-sidebar-panel">
              <div class="chat-sidebar-header">
                <h3>Daftar Percakapan</h3>
                <span class="chat-unread-count-pill">{{ unreadChatsCount }} Baru</span>
              </div>

              <!-- Chat Search & Filter -->
              <div class="chat-sidebar-search">
                <input 
                  type="text" 
                  v-model="chatSearch" 
                  placeholder="Cari chat pelanggan..." 
                  class="filter-input-sm"
                />
              </div>

              <div class="chat-filter-tabs">
                <button 
                  class="chat-filter-btn" 
                  :class="{ active: chatStatusFilter === 'all' }"
                  @click="chatStatusFilter = 'all'"
                >
                  Semua
                </button>
                <button 
                  class="chat-filter-btn" 
                  :class="{ active: chatStatusFilter === 'unread' }"
                  @click="chatStatusFilter = 'unread'"
                >
                  Belum Dibalas
                </button>
                <button 
                  class="chat-filter-btn" 
                  :class="{ active: chatStatusFilter === 'replied' }"
                  @click="chatStatusFilter = 'replied'"
                >
                  Terbalas
                </button>
              </div>

              <!-- Conversations List -->
              <div class="chat-conversations-list">
                <div 
                  v-for="chat in filteredChats" 
                  :key="chat.id"
                  class="chat-convo-item"
                  :class="{ active: selectedChat?.id === chat.id, unread: chat.unreadCount > 0 }"
                  @click="selectChat(chat)"
                >
                  <div class="convo-avatar">
                    {{ chat.customerName.charAt(0) }}
                    <span v-if="chat.unreadCount > 0" class="unread-dot"></span>
                  </div>

                  <div class="convo-body">
                    <div class="convo-top">
                      <span class="convo-name">{{ chat.customerName }}</span>
                      <span class="convo-time">{{ chat.lastMessageTime }}</span>
                    </div>

                    <p class="convo-last-msg">{{ chat.lastMessage }}</p>

                    <div class="convo-badges">
                      <span v-if="chat.relatedProduct" class="badge-related-prod">
                        {{ chat.relatedProduct.name }}
                      </span>
                      <span v-if="chat.unreadCount > 0" class="convo-unread-pill">
                        {{ chat.unreadCount }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="filteredChats.length === 0" class="empty-feed p-6">
                  <p>Tidak ada percakapan yang cocok.</p>
                </div>
              </div>
            </div>

            <!-- Right: Active Chat Window -->
            <div class="chat-window-panel">
              <template v-if="selectedChat">
                <!-- Chat Window Header -->
                <div class="chat-window-header">
                  <div class="chat-window-user">
                    <div class="window-avatar">{{ selectedChat.customerName.charAt(0) }}</div>
                    <div>
                      <div class="window-name">{{ selectedChat.customerName }}</div>
                      <div class="window-phone">No. WA: {{ selectedChat.customerPhone }}</div>
                    </div>
                  </div>

                  <div class="chat-window-actions">
                    <span 
                      class="status-chip" 
                      :class="selectedChat.status === 'unread' ? 'chip-menipis' : 'chip-aman'"
                    >
                      {{ selectedChat.status === 'unread' ? 'Menunggu Balasan Admin' : 'Sudah Dibalas' }}
                    </span>
                    <a 
                      :href="'https://wa.me/' + selectedChat.customerPhone.replace(/^0/, '62')" 
                      target="_blank" 
                      rel="noopener"
                      class="btn-mini btn-wa-direct"
                    >
                      Buka di WhatsApp
                    </a>
                  </div>
                </div>

                <!-- Related Product Preview Card (if inquiring product) -->
                <div v-if="selectedChat.relatedProduct" class="chat-product-context-bar">
                  <img :src="selectedChat.relatedProduct.image" :alt="selectedChat.relatedProduct.name" class="context-img" />
                  <div class="context-details">
                    <span class="context-label">Pelanggan menanyakan produk:</span>
                    <div class="context-title">{{ selectedChat.relatedProduct.name }}</div>
                    <div class="context-meta">
                      <span class="context-price">{{ formatPrice(selectedChat.relatedProduct.price) }}</span>
                      &bull;
                      <span 
                        class="context-stock"
                        :class="selectedChat.relatedProduct.stockCount > 0 ? 'text-green' : 'text-red'"
                      >
                        {{ selectedChat.relatedProduct.stockCount > 0 
                          ? 'Stok Gudang: ' + selectedChat.relatedProduct.stockCount + ' unit' 
                          : 'Stok Kosong (Habis)' }}
                      </span>
                    </div>
                  </div>
                  <button class="btn-mini" @click="checkProductInStock(selectedChat.relatedProduct.id)">
                    Cek di Stok
                  </button>
                </div>

                <!-- Messages Stream -->
                <div class="chat-messages-stream" ref="messageContainer">
                  <div class="chat-date-separator">
                    <span>Hari Ini</span>
                  </div>

                  <div 
                    v-for="msg in selectedChat.messages" 
                    :key="msg.id"
                    class="message-bubble-row"
                    :class="msg.sender === 'admin' ? 'bubble-admin-row' : 'bubble-user-row'"
                  >
                    <div class="message-bubble" :class="msg.sender === 'admin' ? 'admin' : 'user'">
                      <div class="bubble-sender-name">{{ msg.sender === 'admin' ? 'Admin Nagamas' : selectedChat.customerName }}</div>
                      <p class="bubble-text">{{ msg.text }}</p>
                      <span class="bubble-time">{{ msg.timestamp }}</span>
                    </div>
                  </div>
                </div>

                <!-- Quick Reply Suggestions -->
                <div class="quick-replies-row">
                  <span class="quick-label">Template Jawaban Cepat:</span>
                  <button 
                    v-for="(qr, idx) in quickReplies" 
                    :key="idx"
                    class="quick-reply-pill"
                    @click="applyQuickReply(qr)"
                  >
                    {{ qr }}
                  </button>
                </div>

                <!-- Chat Input Form -->
                <form @submit.prevent="sendAdminReply" class="chat-input-bar">
                  <input 
                    v-model="replyText" 
                    type="text" 
                    placeholder="Tulis balasan untuk pelanggan..." 
                    class="chat-text-input" 
                    required 
                  />
                  <button type="submit" class="btn-send-reply">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    <span>Kirim Balasan</span>
                  </button>
                </form>
              </template>

              <div v-else class="chat-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h4>Pilih percakapan dari daftar di sebelah kiri</h4>
                <p>Klik salah satu percakapan untuk melihat pertanyaan pelanggan dan membalas pesan.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 1: SESUAIKAN STOK (STOCK ADJUSTMENT) -->
    <!-- ======================================================== -->
    <div v-if="showAdjustStockModal && adjustingProduct" class="modal-backdrop" @click.self="showAdjustStockModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>Penyesuaian Stok</h3>
            <span class="modal-subtitle">{{ adjustingProduct.name }} (SKU: {{ adjustingProduct.id }})</span>
          </div>
          <button class="close-btn" @click="showAdjustStockModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleSaveStockAdjustment" class="modal-form">
          <div class="stock-current-box">
            <span>Stok Saat Ini:</span>
            <strong class="text-xl font-bold">{{ adjustingProduct.stockCount }} unit</strong>
          </div>

          <div class="form-group">
            <label>Tipe Penyesuaian Stok</label>
            <select v-model="adjustForm.type" required>
              <option value="masuk">+ Stok Masuk (Restock Gudang / Kiriman Pabrik)</option>
              <option value="keluar">&minus; Stok Keluar (Penjualan Offline / Sample)</option>
              <option value="rusak">&minus; Barang Rusak / Reject QC</option>
              <option value="opname">= Koreksi Selisih Opname Fisik</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ adjustForm.type === 'opname' ? 'Jumlah Stok Fisik Baru (Unit)' : 'Jumlah Perubahan Unit' }}</label>
            <input 
              v-model.number="adjustForm.amount" 
              type="number" 
              :min="adjustForm.type === 'opname' ? 0 : 1" 
              placeholder="Contoh: 10" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Catatan / Alasan Penyesuaian</label>
            <input 
              v-model="adjustForm.reason" 
              type="text" 
              placeholder="Contoh: Penerimaan restock batch 2 atau barang retur" 
              required 
            />
          </div>

          <div class="stock-preview-box">
            <span>Estimasi Stok Baru:</span>
            <span class="preview-val font-bold">
              {{ computedNewStockPreview }} unit
            </span>
          </div>

          <div class="modal-btn-row">
            <button type="button" class="btn-outline" @click="showAdjustStockModal = false">Batal</button>
            <button type="submit" class="btn-primary">Simpan & Perbarui Stok</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: RIWAYAT LOG PENYESUAIAN STOK (AUDIT TRAIL) -->
    <!-- ======================================================== -->
    <div v-if="showStockHistoryModal" class="modal-backdrop" @click.self="showStockHistoryModal = false">
      <div class="modal-card modal-large">
        <div class="modal-header">
          <div>
            <h3>Riwayat Log Penyesuaian Stok</h3>
            <span class="modal-subtitle">Audit trail seluruh perubahan kuantitas stok produk di sistem</span>
          </div>
          <button class="close-btn" @click="showStockHistoryModal = false">&times;</button>
        </div>

        <div class="table-wrap max-h-400">
          <table class="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Produk</th>
                <th>Tipe</th>
                <th>Perubahan</th>
                <th>Stok Akhir</th>
                <th>Alasan / Keterangan</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in stockAdjustmentsList" :key="log.id">
                <td class="date-cell">{{ log.date }}</td>
                <td class="font-bold">{{ log.productName }}</td>
                <td>
                  <span class="type-tag" :class="log.type">
                    {{ formatAdjustmentType(log.type) }}
                  </span>
                </td>
                <td class="font-bold" :class="log.changeAmount > 0 ? 'text-green' : 'text-red'">
                  {{ log.changeAmount > 0 ? '+' + log.changeAmount : log.changeAmount }} unit
                </td>
                <td class="font-bold">{{ log.newStock }} unit</td>
                <td class="items-cell">{{ log.reason }}</td>
                <td><span class="operator-badge">{{ log.operator }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer-btn">
          <button class="btn-primary" @click="showStockHistoryModal = false">Tutup</button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 3: DETAIL PESANAN LENGKAP -->
    <!-- ======================================================== -->
    <div v-if="selectedOrder" class="modal-backdrop" @click.self="selectedOrder = null">
      <div class="modal-card modal-medium">
        <div class="modal-header">
          <div>
            <h3>Detail Pesanan #{{ selectedOrder.orderCode }}</h3>
            <span class="modal-subtitle">Waktu: {{ selectedOrder.createdAt }}</span>
          </div>
          <button class="close-btn" @click="selectedOrder = null">&times;</button>
        </div>

        <div class="order-detail-content">
          <div class="detail-section">
            <h4>Data Pembeli & Pengiriman</h4>
            <div class="detail-grid-2">
              <div>
                <span class="text-muted-sm">Nama Pembeli:</span>
                <div class="font-bold">{{ selectedOrder.customerName }}</div>
              </div>
              <div>
                <span class="text-muted-sm">No. WhatsApp:</span>
                <div class="font-bold">{{ selectedOrder.customerPhone }}</div>
              </div>
            </div>
            <div class="mt-2">
              <span class="text-muted-sm">Alamat Lengkap:</span>
              <div class="font-medium text-dark">{{ selectedOrder.customerAddress }}</div>
            </div>
            <div v-if="selectedOrder.notes" class="order-notes-box mt-2">
              <strong>Catatan Pembeli:</strong> {{ selectedOrder.notes }}
            </div>
          </div>

          <div class="detail-section">
            <h4>Barang yang Dipesan</h4>
            <div class="items-summary-list">
              <div v-for="it in selectedOrder.items" :key="it.id" class="item-summary-row">
                <img v-if="it.image" :src="it.image" :alt="it.name" class="it-thumb" />
                <div class="it-info">
                  <div class="it-name">{{ it.name }}</div>
                  <span class="text-muted-sm">{{ formatPrice(it.price) }} &times; {{ it.quantity }} unit</span>
                </div>
                <div class="it-subtotal font-bold">
                  {{ formatPrice(it.price * it.quantity) }}
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Rincian Pembayaran & Status</h4>
            <div class="detail-row">
              <span>Metode Pembayaran:</span>
              <strong>{{ selectedOrder.paymentMethod }}</strong>
            </div>
            <div class="detail-row">
              <span>Status Pesanan:</span>
              <span class="status-chip" :class="selectedOrder.status.toLowerCase()">
                {{ selectedOrder.status }}
              </span>
            </div>
            <div v-if="selectedOrder.trackingNumber" class="detail-row">
              <span>No. Resi Pengiriman:</span>
              <strong>{{ selectedOrder.shippingCourier }} &minus; {{ selectedOrder.trackingNumber }}</strong>
            </div>
            <div class="detail-row total-row">
              <span class="font-bold text-lg">Total Pembayaran:</span>
              <strong class="font-bold text-lg text-green">{{ formatPrice(selectedOrder.totalAmount) }}</strong>
            </div>
          </div>

          <div class="modal-btn-row">
            <a 
              :href="getWhatsAppOrderUrl(selectedOrder)" 
              target="_blank" 
              rel="noopener" 
              class="btn-outline btn-wa"
            >
              Hubungi via WhatsApp
            </a>
            <button class="btn-primary" @click="selectedOrder = null">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 4: INPUT NO RESI PENGIRIMAN -->
    <!-- ======================================================== -->
    <div v-if="showShipModal && shippingOrder" class="modal-backdrop" @click.self="showShipModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>Kirim Pesanan #{{ shippingOrder.orderCode }}</h3>
            <span class="modal-subtitle">Tujuan: {{ shippingOrder.customerName }}</span>
          </div>
          <button class="close-btn" @click="showShipModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleConfirmShip" class="modal-form">
          <div class="form-group">
            <label>Jasa Ekspedisi / Kurir</label>
            <select v-model="shipForm.courier" required>
              <option value="JNE Reguler">JNE Reguler</option>
              <option value="JNE YES">JNE YES (Yakin Esok Sampai)</option>
              <option value="J&T Express">J&T Express</option>
              <option value="SiCepat BEST">SiCepat BEST</option>
              <option value="AnterAja Regular">AnterAja Regular</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nomor Resi Pengiriman (Airway Bill)</label>
            <input 
              v-model="shipForm.trackingNumber" 
              type="text" 
              placeholder="Contoh: JNENAG-9988231" 
              required 
            />
          </div>

          <div class="modal-btn-row">
            <button type="button" class="btn-outline" @click="showShipModal = false">Batal</button>
            <button type="submit" class="btn-primary">Kirimkan Pesanan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 5: TAMBAH SKU / PRODUK BARU -->
    <!-- ======================================================== -->
    <div v-if="showAddProductModal" class="modal-backdrop" @click.self="showAddProductModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3>Tambah SKU / Produk Baru</h3>
            <span class="modal-subtitle">Daftarkan item produk baru ke dalam sistem kontrol stok</span>
          </div>
          <button class="close-btn" @click="showAddProductModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleAddProduct" class="modal-form">
          <div class="form-group">
            <label>Nama Produk</label>
            <input v-model="newProduct.name" type="text" placeholder="Contoh: Minimalist Canvas Tote" required />
          </div>

          <div class="form-group">
            <label>Kategori</label>
            <select v-model="newProduct.category" required>
              <option value="tas">Tas & Backpack</option>
              <option value="pakaian">Pakaian & Baju</option>
              <option value="outerwear">Outerwear & Jaket</option>
              <option value="aksesoris">Aksesoris & Topi</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Harga Jual (Rp)</label>
              <input v-model.number="newProduct.price" type="number" placeholder="250000" required />
            </div>
            <div class="form-group">
              <label>Stok Awal Gudang</label>
              <input v-model.number="newProduct.stockCount" type="number" placeholder="15" required />
            </div>
          </div>

          <div class="form-group">
            <label>URL Gambar Produk</label>
            <input v-model="newProduct.image" type="url" placeholder="https://images.unsplash.com/..." required />
          </div>

          <div class="form-group">
            <label>Deskripsi Singkat</label>
            <textarea v-model="newProduct.description" rows="2" placeholder="Deskripsi ringkas produk..."></textarea>
          </div>

          <div class="modal-btn-row">
            <button type="button" class="btn-outline" @click="showAddProductModal = false">Batal</button>
            <button type="submit" class="btn-primary">Simpan SKU</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import type { Product } from '../types/product'
import type { AdminOrder, CustomerChat, StockAdjustment } from '../types/admin'
import { mockProducts } from '../data/mockProducts'
import { 
  mockAdminOrders, 
  mockCustomerChats, 
  mockStockAdjustments, 
  mockQuickReplies 
} from '../data/mockAdminData'
import { useToast } from '../composables/useToast'

useHead({
  title: 'Dashboard Admin | Nagamas'
})

const { showToast } = useToast()

// Active Navigation Tab: 'overview' | 'stock' | 'orders' | 'chats'
const activeTab = ref<'overview' | 'stock' | 'orders' | 'chats'>('overview')

// Dynamic Section Title
const sectionTitle = computed(() => {
  switch (activeTab.value) {
    case 'stock': return 'Pengontrolan Stok'
    case 'orders': return 'Orders (Pesanan Pelanggan)'
    case 'chats': return 'Notifikasi Chat Pengguna'
    case 'overview':
    default:
      return 'Ringkasan Dashboard'
  }
})

// Master State Data
const inventoryList = ref<Product[]>([...mockProducts])
const ordersList = ref<AdminOrder[]>([...mockAdminOrders])
const chatList = ref<CustomerChat[]>([...mockCustomerChats])
const stockAdjustmentsList = ref<StockAdjustment[]>([...mockStockAdjustments])
const quickReplies = ref<string[]>([...mockQuickReplies])

// Top Bar Dropdown
const showChatDropdown = ref(false)

// Search and Filter States
const stockSearch = ref('')
const stockStatusFilter = ref<'all' | 'aman' | 'menipis' | 'habis'>('all')

const orderSearch = ref('')
const orderFilterStatus = ref<string>('Semua')

const chatSearch = ref('')
const chatStatusFilter = ref<'all' | 'unread' | 'replied'>('all')
const selectedChat = ref<CustomerChat | null>(chatList.value[0] || null)
const replyText = ref('')
const messageContainer = ref<HTMLElement | null>(null)

// Modals
const showAdjustStockModal = ref(false)
const adjustingProduct = ref<Product | null>(null)
const adjustForm = reactive({
  type: 'masuk' as 'masuk' | 'keluar' | 'rusak' | 'opname',
  amount: 10,
  reason: ''
})

const showStockHistoryModal = ref(false)
const showAddProductModal = ref(false)
const selectedOrder = ref<AdminOrder | null>(null)

const showShipModal = ref(false)
const shippingOrder = ref<AdminOrder | null>(null)
const shipForm = reactive({
  courier: 'JNE Reguler',
  trackingNumber: ''
})

const newProduct = reactive({
  name: '',
  category: 'tas',
  price: 250000,
  stockCount: 15,
  image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  description: ''
})

// ========================================================
// COMPUTED METRICS
// ========================================================
const unreadChatsCount = computed(() => {
  return chatList.value.reduce((sum, c) => sum + c.unreadCount, 0)
})

const pendingOrdersList = computed(() => {
  return ordersList.value.filter(o => o.status === 'Baru' || o.status === 'Diproses')
})

const pendingOrdersCount = computed(() => pendingOrdersList.value.length)
const newOrdersCount = computed(() => ordersList.value.filter(o => o.status === 'Baru').length)
const processingOrdersCount = computed(() => ordersList.value.filter(o => o.status === 'Diproses').length)

const safeStockCount = computed(() => inventoryList.value.filter(p => p.stockCount > 10).length)
const lowStockCount = computed(() => inventoryList.value.filter(p => p.stockCount > 0 && p.stockCount <= 10).length)
const outOfStockCount = computed(() => inventoryList.value.filter(p => p.stockCount === 0).length)
const criticalStockCount = computed(() => lowStockCount.value + outOfStockCount.value)

const criticalStockList = computed(() => {
  return inventoryList.value.filter(p => p.stockCount <= 10)
})

// ========================================================
// FILTERED LISTS
// ========================================================
const filteredStockList = computed(() => {
  let list = inventoryList.value

  if (stockStatusFilter.value === 'aman') {
    list = list.filter(p => p.stockCount > 10)
  } else if (stockStatusFilter.value === 'menipis') {
    list = list.filter(p => p.stockCount > 0 && p.stockCount <= 10)
  } else if (stockStatusFilter.value === 'habis') {
    list = list.filter(p => p.stockCount === 0)
  }

  if (stockSearch.value.trim()) {
    const q = stockSearch.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
  }

  return list
})

const filteredOrders = computed(() => {
  let list = ordersList.value

  if (orderFilterStatus.value !== 'Semua') {
    list = list.filter(o => o.status === orderFilterStatus.value)
  }

  if (orderSearch.value.trim()) {
    const q = orderSearch.value.toLowerCase()
    list = list.filter(o => 
      o.orderCode.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q) || 
      o.customerPhone.includes(q)
    )
  }

  return list
})

const filteredChats = computed(() => {
  let list = chatList.value

  if (chatStatusFilter.value === 'unread') {
    list = list.filter(c => c.unreadCount > 0 || c.status === 'unread')
  } else if (chatStatusFilter.value === 'replied') {
    list = list.filter(c => c.status === 'replied')
  }

  if (chatSearch.value.trim()) {
    const q = chatSearch.value.toLowerCase()
    list = list.filter(c => 
      c.customerName.toLowerCase().includes(q) || 
      c.lastMessage.toLowerCase().includes(q)
    )
  }

  return list
})

const computedNewStockPreview = computed(() => {
  if (!adjustingProduct.value) return 0
  const curr = adjustingProduct.value.stockCount
  if (adjustForm.type === 'masuk') return curr + (adjustForm.amount || 0)
  if (adjustForm.type === 'keluar' || adjustForm.type === 'rusak') return Math.max(0, curr - (adjustForm.amount || 0))
  if (adjustForm.type === 'opname') return Math.max(0, adjustForm.amount || 0)
  return curr
})

// ========================================================
// METHODS & ACTIONS
// ========================================================
const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const formatAdjustmentType = (type: string) => {
  switch (type) {
    case 'masuk': return 'Stok Masuk'
    case 'keluar': return 'Stok Keluar'
    case 'rusak': return 'Barang Rusak'
    case 'opname': return 'Koreksi Opname'
    default: return type
  }
}

// Navigation helpers
const filterStockByStatus = (st: 'aman' | 'menipis' | 'habis') => {
  stockStatusFilter.value = st
  activeTab.value = 'stock'
}

const goToChatsTab = () => {
  showChatDropdown.value = false
  activeTab.value = 'chats'
}

const openChatFromDropdown = (chat: CustomerChat) => {
  showChatDropdown.value = false
  selectChat(chat)
  activeTab.value = 'chats'
}

const selectChatAndNavigate = (chat: CustomerChat) => {
  selectChat(chat)
  activeTab.value = 'chats'
}

const selectChat = (chat: CustomerChat) => {
  selectedChat.value = chat
  if (chat.unreadCount > 0) {
    chat.unreadCount = 0
  }
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const checkProductInStock = (prodId: string) => {
  stockSearch.value = prodId
  stockStatusFilter.value = 'all'
  activeTab.value = 'stock'
}

// Stock Control actions
const stepStock = (prod: Product, step: number) => {
  const oldVal = prod.stockCount
  const newVal = Math.max(0, oldVal + step)
  prod.stockCount = newVal
  prod.inStock = newVal > 0

  // Auto record log
  const log: StockAdjustment = {
    id: `adj-${Date.now().toString().slice(-4)}`,
    productId: prod.id,
    productName: prod.name,
    type: step > 0 ? 'masuk' : 'keluar',
    changeAmount: step,
    previousStock: oldVal,
    newStock: newVal,
    reason: step > 0 ? 'Penambahan cepat (+1) via kontrol admin' : 'Pengurangan cepat (-1) via kontrol admin',
    date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    operator: 'Admin Nagamas'
  }
  stockAdjustmentsList.value.unshift(log)

  showToast('Stok Diperbarui', `${prod.name} sekarang memiliki stok ${newVal} unit.`, 'success')
}

const quickAddStock = (prod: Product, amount: number) => {
  const oldVal = prod.stockCount
  const newVal = oldVal + amount
  prod.stockCount = newVal
  prod.inStock = true

  const log: StockAdjustment = {
    id: `adj-${Date.now().toString().slice(-4)}`,
    productId: prod.id,
    productName: prod.name,
    type: 'masuk',
    changeAmount: amount,
    previousStock: oldVal,
    newStock: newVal,
    reason: `Quick restock +${amount} unit`,
    date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    operator: 'Admin Nagamas'
  }
  stockAdjustmentsList.value.unshift(log)

  showToast('Stok Ditambahkan', `Berhasil menambah ${amount} unit ke ${prod.name}.`, 'success')
}

const openAdjustStockModal = (prod: Product) => {
  adjustingProduct.value = prod
  adjustForm.type = 'masuk'
  adjustForm.amount = 10
  adjustForm.reason = 'Penerimaan restock barang dari workshop'
  showAdjustStockModal.value = true
}

const handleSaveStockAdjustment = () => {
  if (!adjustingProduct.value) return
  const prod = adjustingProduct.value
  const prev = prod.stockCount
  const next = computedNewStockPreview.value
  const change = next - prev

  prod.stockCount = next
  prod.inStock = next > 0

  const log: StockAdjustment = {
    id: `adj-${Date.now().toString().slice(-4)}`,
    productId: prod.id,
    productName: prod.name,
    type: adjustForm.type,
    changeAmount: change,
    previousStock: prev,
    newStock: next,
    reason: adjustForm.reason || 'Penyesuaian stok reguler',
    date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    operator: 'Admin Nagamas'
  }
  stockAdjustmentsList.value.unshift(log)

  showAdjustStockModal.value = false
  showToast('Penyesuaian Berhasil', `Stok ${prod.name} diperbarui menjadi ${next} unit.`, 'success')
}

const deleteProduct = (id: string) => {
  inventoryList.value = inventoryList.value.filter(p => p.id !== id)
  showToast('Produk Dihapus', 'Item produk telah dihapus dari sistem pengontrolan stok.', 'info')
}

const handleAddProduct = () => {
  const prod: Product = {
    id: `prod-0${inventoryList.value.length + 1}`,
    name: newProduct.name,
    category: newProduct.category,
    price: newProduct.price,
    stockCount: newProduct.stockCount,
    inStock: newProduct.stockCount > 0,
    image: newProduct.image,
    description: newProduct.description,
    rating: 5.0,
    reviewsCount: 0,
    specifications: {}
  }
  inventoryList.value.unshift(prod)

  // Log creation
  stockAdjustmentsList.value.unshift({
    id: `adj-${Date.now().toString().slice(-4)}`,
    productId: prod.id,
    productName: prod.name,
    type: 'masuk',
    changeAmount: prod.stockCount,
    previousStock: 0,
    newStock: prod.stockCount,
    reason: 'Pendaftaran SKU & stok awal produk baru',
    date: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    operator: 'Admin Nagamas'
  })

  showAddProductModal.value = false
  showToast('SKU Ditambahkan', `Produk ${prod.name} berhasil ditambahkan ke inventaris stok.`, 'success')
  newProduct.name = ''
}

// Orders actions
const processOrder = (order: AdminOrder) => {
  order.status = 'Diproses'
  showToast('Pesanan Diproses', `Order #${order.orderCode} sedang disiapkan dan dikemas.`, 'success')
}

const openShipModal = (order: AdminOrder) => {
  shippingOrder.value = order
  shipForm.courier = 'JNE Reguler'
  shipForm.trackingNumber = `JNENAG-${Math.floor(1000000 + Math.random() * 9000000)}`
  showShipModal.value = true
}

const handleConfirmShip = () => {
  if (!shippingOrder.value) return
  shippingOrder.value.status = 'Dikirim'
  shippingOrder.value.shippingCourier = shipForm.courier
  shippingOrder.value.trackingNumber = shipForm.trackingNumber

  showShipModal.value = false
  showToast('Pesanan Dikirim', `Order #${shippingOrder.value.orderCode} telah diserahkan ke ${shipForm.courier}.`, 'success')
}

const completeOrder = (order: AdminOrder) => {
  order.status = 'Selesai'
  showToast('Pesanan Selesai', `Order #${order.orderCode} telah sukses diselesaikan.`, 'success')
}

const openOrderDetail = (order: AdminOrder) => {
  selectedOrder.value = order
}

const getWhatsAppOrderUrl = (order: AdminOrder) => {
  const phone = order.customerPhone.replace(/^0/, '62')
  const text = encodeURIComponent(
    `Halo kak ${order.customerName}, kami dari Admin Nagamas perihal pesanan #${order.orderCode} status saat ini: ${order.status}. Apakah ada hal yang bisa kami bantu?`
  )
  return `https://wa.me/${phone}?text=${text}`
}

// Chat actions
const applyQuickReply = (text: string) => {
  replyText.value = text
}

const sendAdminReply = () => {
  if (!selectedChat.value || !replyText.value.trim()) return

  const now = new Date()
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  selectedChat.value.messages.push({
    id: `m-${Date.now()}`,
    sender: 'admin',
    text: replyText.value.trim(),
    timestamp: timeStr
  })

  selectedChat.value.lastMessage = replyText.value.trim()
  selectedChat.value.lastMessageTime = 'Baru saja'
  selectedChat.value.status = 'replied'
  selectedChat.value.unreadCount = 0

  const sentTo = selectedChat.value.customerName
  replyText.value = ''

  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })

  showToast('Balasan Terkirim', `Pesan berhasil dikirimkan ke ${sentTo}.`, 'success')
}
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* ========================================================= */
/* SIDEBAR */
/* ========================================================= */
.admin-sidebar {
  width: 260px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 50;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-brand {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.brand-text-group {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
}

.admin-tag {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.sidebar-nav {
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
}

.nav-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 1px;
  padding: 0 12px 10px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.nav-item.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  flex-shrink: 0;
}

.item-badge {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 7px;
  border-radius: 10px;
}

.nav-item.active .item-badge {
  background: #0f172a;
  color: #ffffff;
}

.item-badge.badge-orders {
  background: #3b82f6;
  color: #ffffff;
}

.item-badge.badge-chat {
  background: #10b981;
  color: #ffffff;
}

.item-badge.badge-warning {
  background: #f59e0b;
  color: #ffffff;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.back-shop-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.15s;
}

.back-shop-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

/* ========================================================= */
/* TOPBAR */
/* ========================================================= */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
}

.topbar-title h2 {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

.breadcrumb {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
  display: block;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notif-dropdown-wrapper {
  position: relative;
}

.topbar-icon-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.topbar-icon-btn:hover, .topbar-icon-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.topbar-notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

/* Notification Popover */
.notif-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.15);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  z-index: 100;
  animation: popoverFadeIn 0.2s ease-out;
}

@keyframes popoverFadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.notif-popover-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-popover-header h4 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

.notif-count-label {
  font-size: 0.72rem;
  color: #ef4444;
  font-weight: 700;
}

.notif-popover-list {
  max-height: 280px;
  overflow-y: auto;
}

.notif-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f8fafc;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.notif-item:hover {
  background: #f1f5f9;
}

.notif-item.unread {
  background: #f0fdf4;
}

.notif-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  margin-bottom: 2px;
}

.notif-name {
  font-weight: 700;
  color: #0f172a;
}

.notif-time {
  color: #94a3b8;
  font-size: 0.7rem;
}

.notif-text {
  margin: 0;
  font-size: 0.76rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-product-tag {
  font-size: 0.68rem;
  color: #2563eb;
  font-weight: 600;
  display: inline-block;
  margin-top: 3px;
}

.notif-popover-footer {
  padding: 10px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
  background: #f8fafc;
}

.view-all-chats-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  background: #0f172a;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-info .name {
  font-size: 0.84rem;
  font-weight: 700;
  color: #0f172a;
}

.profile-info .role {
  font-size: 0.7rem;
  color: #64748b;
}

/* ========================================================= */
/* BODY & KPI GRID */
/* ========================================================= */
.admin-body {
  padding: 28px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
  position: relative;
}

.kpi-card.clickable {
  cursor: pointer;
}

.kpi-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.kpi-arrow {
  margin-left: auto;
  color: #cbd5e1;
  font-size: 1.1rem;
  font-weight: 700;
  transition: transform 0.2s;
}

.kpi-card.clickable:hover .kpi-arrow {
  color: #0f172a;
  transform: translateX(4px);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.orders-bg { background: #eff6ff; color: #2563eb; }
.chat-bg { background: #ecfdf5; color: #059669; }
.warning-bg { background: #fffbeb; color: #d97706; }
.danger-bg { background: #fef2f2; color: #dc2626; }

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
}

.kpi-sub {
  font-size: 0.72rem;
  color: #64748b;
}

.kpi-sub.highlight-blue { color: #2563eb; font-weight: 600; }
.kpi-sub.highlight-amber { color: #d97706; font-weight: 700; }
.kpi-sub.positive { color: #059669; font-weight: 600; }
.kpi-sub.warning { color: #d97706; font-weight: 600; }
.kpi-sub.danger { color: #dc2626; font-weight: 700; }

/* ========================================================= */
/* DUAL GRID & FEEDS */
/* ========================================================= */
.overview-dual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.panel-box {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.bg-amber { background: #f59e0b; }
.bg-emerald { background: #10b981; }
.bg-rose { background: #ef4444; }

.panel-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.panel-action-link {
  background: none;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  transition: color 0.15s;
}

.panel-action-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Orders Feed */
.orders-feed {
  display: flex;
  flex-direction: column;
}

.order-feed-item {
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  transition: background 0.15s;
}

.order-feed-item:hover {
  background: #f8fafc;
}

.order-feed-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.order-code-badge {
  font-weight: 800;
  font-size: 0.8rem;
  color: #0f172a;
}

.feed-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.order-feed-customer {
  font-size: 0.8rem;
  color: #334155;
  margin-bottom: 3px;
}

.order-feed-items {
  font-size: 0.74rem;
  color: #64748b;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-feed-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.feed-price {
  font-weight: 800;
  font-size: 0.86rem;
  color: #0f172a;
}

/* Chat Feed */
.chat-feed {
  display: flex;
  flex-direction: column;
}

.chat-feed-item {
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.chat-feed-item:hover {
  background: #f8fafc;
}

.chat-feed-item.unread {
  background: #f0fdf4;
}

.chat-feed-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.86rem;
  position: relative;
  flex-shrink: 0;
}

.online-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.chat-feed-body {
  flex: 1;
  min-width: 0;
}

.chat-feed-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.chat-customer-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.chat-time-tag {
  font-size: 0.7rem;
  color: #94a3b8;
}

.chat-preview-text {
  margin: 0;
  font-size: 0.78rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.product-inquiry-pill {
  font-size: 0.68rem;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.chat-status-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.chat-status-pill.unread {
  background: #fee2e2;
  color: #b91c1c;
}

.chat-status-pill.replied {
  background: #dcfce7;
  color: #15803d;
}

.btn-reply {
  background: #0f172a;
  color: #ffffff;
  border: none;
}

/* Critical Stock Alerts */
.stock-alerts-grid {
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.stock-alert-card {
  border: 1px solid #fed7aa;
  background: #fffaf0;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stock-alert-card.is-out {
  border-color: #fca5a5;
  background: #fef2f2;
}

.alert-prod-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}

.alert-prod-info {
  flex: 1;
  min-width: 0;
}

.alert-prod-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-prod-cat {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 4px;
}

.alert-stock-bar-wrap {
  width: 100%;
  height: 5px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.alert-stock-bar {
  height: 100%;
}

.bar-red { background: #dc2626; }
.bar-amber { background: #f59e0b; }

.badge-stock-zero {
  color: #dc2626;
  font-size: 0.72rem;
  font-weight: 800;
}

.badge-stock-low {
  color: #b45309;
  font-size: 0.72rem;
  font-weight: 700;
}

.alert-prod-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.btn-add-stock {
  background: #0f172a;
  color: #ffffff;
  border: none;
}

/* ========================================================= */
/* STOCK CONTROL TAB */
/* ========================================================= */
.stock-stat-ribbon {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.stat-ribbon-item {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
}

.ribbon-label {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 600;
}

.ribbon-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin-top: 4px;
}

.text-green .ribbon-val { color: #16a34a; }
.text-amber .ribbon-val { color: #d97706; }
.text-red .ribbon-val { color: #dc2626; }

/* Quick Stock Stepper */
.quick-stock-stepper {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.stepper-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.stepper-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-val {
  padding: 0 10px;
  font-weight: 800;
  font-size: 0.86rem;
  color: #0f172a;
  min-width: 32px;
  text-align: center;
}

.stepper-val.zero {
  color: #dc2626;
}

/* ========================================================= */
/* CHAT TAB WORKSPACE */
/* ========================================================= */
.chat-workspace-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 600px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.chat-sidebar-panel {
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.chat-sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-sidebar-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.chat-unread-count-pill {
  font-size: 0.72rem;
  font-weight: 800;
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 10px;
}

.chat-sidebar-search {
  padding: 10px 14px;
}

.filter-input-sm {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.82rem;
  outline: none;
}

.chat-filter-tabs {
  display: flex;
  padding: 0 14px 10px 14px;
  gap: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.chat-filter-btn {
  flex: 1;
  padding: 5px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 0.74rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.chat-filter-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.chat-conversations-list {
  flex: 1;
  overflow-y: auto;
}

.chat-convo-item {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.chat-convo-item:hover {
  background: #f1f5f9;
}

.chat-convo-item.active {
  background: #ffffff;
  border-left: 4px solid #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.chat-convo-item.unread {
  background: #f0fdf4;
}

.convo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  position: relative;
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.convo-body {
  flex: 1;
  min-width: 0;
}

.convo-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.convo-name {
  font-size: 0.84rem;
  font-weight: 700;
  color: #0f172a;
}

.convo-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.convo-last-msg {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.convo-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.badge-related-prod {
  font-size: 0.68rem;
  color: #2563eb;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.convo-unread-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: #ef4444;
  color: #ffffff;
  padding: 1px 6px;
  border-radius: 10px;
}

/* Chat Right Window */
.chat-window-panel {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  height: 100%;
}

.chat-window-header {
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
}

.chat-window-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.window-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.window-phone {
  font-size: 0.72rem;
  color: #64748b;
}

.chat-window-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-wa-direct {
  background: #25d366;
  color: #ffffff;
  border: none;
  font-weight: 700;
  text-decoration: none;
}

/* Product Context Bar */
.chat-product-context-bar {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.context-img {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
}

.context-details {
  flex: 1;
}

.context-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
}

.context-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.context-meta {
  font-size: 0.74rem;
  display: flex;
  gap: 6px;
}

.context-price { font-weight: 700; color: #0f172a; }
.context-stock { font-weight: 700; }

/* Messages Stream */
.chat-messages-stream {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fdfdfd;
}

.chat-date-separator {
  text-align: center;
  margin: 8px 0;
}

.chat-date-separator span {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.message-bubble-row {
  display: flex;
  width: 100%;
}

.bubble-user-row {
  justify-content: flex-start;
}

.bubble-admin-row {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.84rem;
  line-height: 1.4;
  position: relative;
}

.message-bubble.user {
  background: #f1f5f9;
  color: #0f172a;
  border-bottom-left-radius: 4px;
}

.message-bubble.admin {
  background: #0f172a;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.bubble-sender-name {
  font-size: 0.68rem;
  font-weight: 700;
  margin-bottom: 3px;
  opacity: 0.8;
}

.bubble-text {
  margin: 0;
}

.bubble-time {
  display: block;
  text-align: right;
  font-size: 0.66rem;
  margin-top: 4px;
  opacity: 0.7;
}

/* Quick Replies */
.quick-replies-row {
  padding: 8px 20px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
}

.quick-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
}

.quick-reply-pill {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 0.74rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-reply-pill:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

/* Chat Input Bar */
.chat-input-bar {
  padding: 14px 20px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  gap: 10px;
}

.chat-text-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.86rem;
  outline: none;
}

.chat-text-input:focus {
  border-color: #0f172a;
}

.btn-send-reply {
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-send-reply:hover {
  opacity: 0.9;
}

.chat-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}

.chat-empty-state h4 {
  margin: 12px 0 4px 0;
  font-size: 1rem;
  color: #0f172a;
}

.chat-empty-state p {
  margin: 0;
  font-size: 0.84rem;
}

/* ========================================================= */
/* DATA TABLES & COMMON STYLING */
/* ========================================================= */
.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  text-align: left;
}

.data-table th {
  background: #f8fafc;
  padding: 12px 18px;
  font-weight: 700;
  color: #475569;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.text-dark { color: #0f172a; }
.text-green { color: #16a34a; }
.text-red { color: #dc2626; }
.text-muted-sm { font-size: 0.75rem; color: #94a3b8; }

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prod-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  background: #f1f5f9;
}

.prod-name {
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
}

.prod-id {
  font-size: 0.72rem;
  color: #94a3b8;
}

.category-pill-admin {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Status Chips */
.status-chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-chip.baru { background: #fef3c7; color: #b45309; }
.status-chip.diproses { background: #e0f2fe; color: #0369a1; }
.status-chip.dikirim { background: #f3e8ff; color: #6b21a8; }
.status-chip.selesai { background: #dcfce7; color: #15803d; }
.status-chip.dibatalkan { background: #fee2e2; color: #b91c1c; }

.status-chip.chip-aman { background: #dcfce7; color: #15803d; }
.status-chip.chip-menipis { background: #fef3c7; color: #b45309; }
.status-chip.chip-habis { background: #fee2e2; color: #b91c1c; }

.order-code-cell {
  display: flex;
  flex-direction: column;
}

.customer-info-cell {
  display: flex;
  flex-direction: column;
}

.order-items-snippet {
  max-width: 220px;
  line-height: 1.3;
}

.item-line {
  font-size: 0.78rem;
}

.item-name-bold {
  font-weight: 600;
  color: #1e293b;
}

.item-qty {
  color: #64748b;
  font-weight: 700;
}

.price-cell {
  display: flex;
  flex-direction: column;
}

.pay-method-tag {
  font-size: 0.7rem;
  color: #64748b;
}

.shipping-info-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.courier-name {
  font-size: 0.74rem;
  font-weight: 700;
  color: #0f172a;
}

.tracking-no {
  font-size: 0.7rem;
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 4px;
  color: #475569;
}

/* Toolbar */
.toolbar-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  min-width: 260px;
}

.input-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.85rem;
  outline: none;
}

.filter-input.with-icon {
  padding-left: 36px;
}

.filter-input:focus {
  border-color: #0f172a;
}

.filter-pills-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.pill-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.btn-primary {
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-outline {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}

.btn-outline:hover {
  background: #f8fafc;
}

.btn-mini {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 0.74rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}

.btn-mini:hover {
  background: #e2e8f0;
}

.btn-action-primary {
  background: #0f172a;
  color: #ffffff;
  border: none;
}

.btn-action-ship {
  background: #7c3aed;
  color: #ffffff;
  border: none;
}

.btn-action-finish {
  background: #16a34a;
  color: #ffffff;
  border: none;
}

.btn-action-adjust {
  background: #2563eb;
  color: #ffffff;
  border: none;
}

.btn-wa-chat {
  background: #dcfce7;
  color: #15803d;
  border-color: #86efac;
}

.btn-mini.danger {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fef2f2;
}

.btn-mini.danger:hover {
  background: #fee2e2;
}

.action-btn-row {
  display: flex;
  gap: 6px;
}

.empty-feed {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.empty-table-cell {
  text-align: center;
  padding: 36px 18px;
  color: #94a3b8;
  font-size: 0.88rem;
}

.mt-6 { margin-top: 24px; }
.mt-2 { margin-top: 8px; }

/* ========================================================= */
/* MODALS */
/* ========================================================= */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 14px;
  max-width: 480px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.2s ease-out;
}

.modal-card.modal-medium {
  max-width: 580px;
}

.modal-card.modal-large {
  max-width: 780px;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.modal-subtitle {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 2px;
  display: block;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #94a3b8;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  outline: none;
  font-family: inherit;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: #0f172a;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stock-current-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-preview-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #166534;
}

.preview-val {
  font-size: 1.15rem;
}

.modal-btn-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* Order Detail Content in Modal */
.order-detail-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 75vh;
  overflow-y: auto;
}

.detail-section {
  border: 1px solid #f1f5f9;
  background: #fafafa;
  border-radius: 10px;
  padding: 14px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 0.84rem;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.order-notes-box {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.78rem;
  color: #92400e;
}

.items-summary-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-summary-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
}

.it-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.it-info {
  flex: 1;
}

.it-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  margin-bottom: 6px;
  color: #475569;
}

.detail-row.total-row {
  border-top: 1px dashed #cbd5e1;
  padding-top: 8px;
  margin-top: 8px;
}

.btn-wa {
  color: #15803d;
  border-color: #86efac;
}

.max-h-400 {
  max-height: 400px;
  overflow-y: auto;
}

.modal-footer-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.type-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.type-tag.masuk { background: #dcfce7; color: #15803d; }
.type-tag.keluar { background: #fef3c7; color: #b45309; }
.type-tag.rusak { background: #fee2e2; color: #b91c1c; }
.type-tag.opname { background: #e0f2fe; color: #0369a1; }

.operator-badge {
  font-size: 0.72rem;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
}

/* ========================================================= */
/* RESPONSIVE */
/* ========================================================= */
@media (max-width: 1024px) {
  .overview-dual-grid {
    grid-template-columns: 1fr;
  }
  .chat-workspace-card {
    grid-template-columns: 280px 1fr;
  }
}

@media (max-width: 840px) {
  .admin-sidebar {
    width: 72px;
  }
  .sidebar-brand .admin-tag, 
  .brand-name, 
  .nav-item span, 
  .nav-section-title, 
  .sidebar-footer span,
  .brand-text-group {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
  .item-badge {
    display: none;
  }
  .chat-workspace-card {
    grid-template-columns: 1fr;
  }
  .chat-sidebar-panel {
    max-height: 250px;
  }
}
</style>
