<template>
  <div class="admin-wrapper">
    <!-- Admin Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <NuxtLink to="/" class="brand-link">
          <span class="brand-name">NAGAMAS</span>
          <span class="admin-tag">Admin Panel</span>
        </NuxtLink>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">MENU UTAMA</div>

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
          <span>Ringkasan (Overview)</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'inventory' }"
          @click="activeTab = 'inventory'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.29 7 12 12 20.71 7"></polyline>
            <line x1="12" y1="22" x2="12" y2="12"></line>
          </svg>
          <span>Inventaris Produk</span>
          <span class="item-badge">{{ inventoryList.length }}</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'users' }"
          @click="activeTab = 'users'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Daftar Pengguna</span>
          <span class="item-badge">{{ userList.length }}</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'sales' }"
          @click="activeTab = 'sales'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Penjualan (Sales)</span>
          <span class="item-badge sales">{{ salesList.length }}</span>
        </button>

        <button 
          class="nav-item" 
          :class="{ active: activeTab === 'purchases' }"
          @click="activeTab = 'purchases'"
        >
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          <span>Pembelian (Restock)</span>
          <span class="item-badge purchase">{{ purchasesList.length }}</span>
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

        <!-- 1. OVERVIEW TAB -->
        <div v-if="activeTab === 'overview'" class="tab-pane">
          <!-- Metric KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon sales-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total Penjualan</span>
                <span class="kpi-val">{{ formatPrice(totalSalesAmount) }}</span>
                <span class="kpi-sub positive">+18.4% dari bulan lalu</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon purchase-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total Pembelian (Restock)</span>
                <span class="kpi-val">{{ formatPrice(totalPurchaseCost) }}</span>
                <span class="kpi-sub">{{ purchasesList.length }} Purchase Orders</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon users-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Total Pengguna</span>
                <span class="kpi-val">{{ userList.length }} User</span>
                <span class="kpi-sub positive">5 Pengguna Aktif</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon inventory-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div class="kpi-info">
                <span class="kpi-label">Inventaris Produk</span>
                <span class="kpi-val">{{ inventoryList.length }} Item</span>
                <span class="kpi-sub warning">1 Produk Habis (Restock)</span>
              </div>
            </div>
          </div>

          <!-- Dual Tables Preview -->
          <div class="overview-tables-grid">
            <!-- Recent Sales -->
            <div class="panel-box">
              <div class="panel-header">
                <h3>Penjualan Terbaru</h3>
                <button class="panel-action-link" @click="activeTab = 'sales'">Lihat Semua</button>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>No. Order</th>
                      <th>Pelanggan</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in salesList.slice(0, 4)" :key="order.id">
                      <td class="font-bold">{{ order.orderCode }}</td>
                      <td>{{ order.customerName }}</td>
                      <td class="font-bold">{{ formatPrice(order.totalAmount) }}</td>
                      <td>
                        <span class="status-chip" :class="order.status.toLowerCase().replace(/\s+/g, '-')">
                          {{ order.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Restock -->
            <div class="panel-box">
              <div class="panel-header">
                <h3>Pengadaan & Restock Terbaru</h3>
                <button class="panel-action-link" @click="activeTab = 'purchases'">Lihat Semua</button>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>No. PO</th>
                      <th>Supplier</th>
                      <th>Biaya</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="po in purchasesList.slice(0, 4)" :key="po.id">
                      <td class="font-bold">{{ po.poCode }}</td>
                      <td>{{ po.supplierName }}</td>
                      <td class="font-bold">{{ formatPrice(po.totalCost) }}</td>
                      <td>
                        <span class="status-chip" :class="po.status.toLowerCase().replace(/\s+/g, '-')">
                          {{ po.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. INVENTARIS PRODUK TAB -->
        <div v-else-if="activeTab === 'inventory'" class="tab-pane">
          <div class="toolbar-actions">
            <div class="search-input-wrap">
              <input 
                type="text" 
                v-model="inventorySearch" 
                placeholder="Cari nama produk / kategori..." 
                class="filter-input"
              />
            </div>
            <button class="btn-primary" @click="showAddProductModal = true">
              + Tambah Produk Baru
            </button>
          </div>

          <div class="panel-box">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga Jual</th>
                    <th>Stok</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="prod in filteredInventory" :key="prod.id">
                    <td>
                      <div class="product-cell">
                        <img :src="prod.image" :alt="prod.name" class="prod-thumb" />
                        <div>
                          <div class="prod-name">{{ prod.name }}</div>
                          <span class="prod-id">ID: {{ prod.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="category-pill-admin">{{ prod.category }}</span></td>
                    <td class="font-bold">{{ formatPrice(prod.price) }}</td>
                    <td>
                      <span class="stock-num" :class="{ 'zero-stock': prod.stockCount === 0 }">
                        {{ prod.stockCount }} unit
                      </span>
                    </td>
                    <td>
                      <span class="status-chip" :class="prod.inStock ? 'selesai' : 'dibatalkan'">
                        {{ prod.inStock ? 'Tersedia' : 'Habis' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-btn-row">
                        <button class="btn-mini" @click="quickEditStock(prod)" title="Tambah Stok">+ Stok</button>
                        <button class="btn-mini danger" @click="deleteProduct(prod.id)" title="Hapus">Hapus</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. LIST USERS TAB -->
        <div v-else-if="activeTab === 'users'" class="tab-pane">
          <div class="toolbar-actions">
            <div class="search-input-wrap">
              <input 
                type="text" 
                v-model="userSearch" 
                placeholder="Cari pengguna (nama, email, no hp)..." 
                class="filter-input"
              />
            </div>
            <button class="btn-primary" @click="showAddUserModal = true">
              + Tambah Pengguna
            </button>
          </div>

          <div class="panel-box">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nama & Email</th>
                    <th>No. WhatsApp</th>
                    <th>Role</th>
                    <th>Bergabung</th>
                    <th>Status</th>
                    <th>Total Order</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar-sm">{{ user.name.charAt(0) }}</div>
                        <div>
                          <div class="user-fullname">{{ user.name }}</div>
                          <span class="user-email-text">{{ user.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ user.phone }}</td>
                    <td>
                      <span class="role-chip" :class="user.role.toLowerCase()">{{ user.role }}</span>
                    </td>
                    <td>{{ user.joinDate }}</td>
                    <td>
                      <span class="status-chip" :class="user.status === 'Active' ? 'selesai' : 'dibatalkan'">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="font-bold">{{ user.totalOrders }} order</td>
                    <td>
                      <button class="btn-mini" @click="toggleUserStatus(user)">
                        {{ user.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 4. PENJUALAN (SALES) TAB -->
        <div v-else-if="activeTab === 'sales'" class="tab-pane">
          <div class="toolbar-actions">
            <div class="search-input-wrap">
              <input 
                type="text" 
                v-model="salesSearch" 
                placeholder="Cari no. order / nama pelanggan..." 
                class="filter-input"
              />
            </div>
            <div class="filter-pills-row">
              <button 
                v-for="st in ['Semua', 'Selesai', 'Diproses', 'Menunggu Pembayaran', 'Dibatalkan']" 
                :key="st"
                class="pill-btn"
                :class="{ active: salesFilterStatus === st }"
                @click="salesFilterStatus = st"
              >
                {{ st }}
              </button>
            </div>
          </div>

          <div class="panel-box">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Pelanggan</th>
                    <th>Item Pesanan</th>
                    <th>Metode Bayar</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Waktu Transaksi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in filteredSales" :key="order.id">
                    <td class="font-bold">{{ order.orderCode }}</td>
                    <td>
                      <div>{{ order.customerName }}</div>
                      <span class="user-email-text">{{ order.customerPhone }}</span>
                    </td>
                    <td class="items-cell">{{ order.items }}</td>
                    <td>{{ order.paymentMethod }}</td>
                    <td class="font-bold text-success">{{ formatPrice(order.totalAmount) }}</td>
                    <td>
                      <span class="status-chip" :class="order.status.toLowerCase().replace(/\s+/g, '-')">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="date-cell">{{ order.createdAt }}</td>
                    <td>
                      <button class="btn-mini" @click="openOrderDetail(order)">Detail</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 5. PEMBELIAN (RESTOCK / PURCHASES) TAB -->
        <div v-else-if="activeTab === 'purchases'" class="tab-pane">
          <div class="toolbar-actions">
            <div class="search-input-wrap">
              <input 
                type="text" 
                v-model="purchaseSearch" 
                placeholder="Cari no. PO / supplier..." 
                class="filter-input"
              />
            </div>
            <button class="btn-primary" @click="showAddPoModal = true">
              + Buat PO Pembelian Baru
            </button>
          </div>

          <div class="panel-box">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>No. PO</th>
                    <th>Supplier</th>
                    <th>Item & Material Pengadaan</th>
                    <th>Jumlah</th>
                    <th>Total Biaya</th>
                    <th>Status</th>
                    <th>Tanggal Order</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="po in filteredPurchases" :key="po.id">
                    <td class="font-bold">{{ po.poCode }}</td>
                    <td>{{ po.supplierName }}</td>
                    <td class="items-cell">{{ po.items }}</td>
                    <td class="font-bold">{{ po.quantity }} Unit/Roll</td>
                    <td class="font-bold text-danger">{{ formatPrice(po.totalCost) }}</td>
                    <td>
                      <span class="status-chip" :class="po.status.toLowerCase().replace(/\s+/g, '-')">
                        {{ po.status }}
                      </span>
                    </td>
                    <td>{{ po.orderDate }}</td>
                    <td>
                      <button 
                        v-if="po.status !== 'Diterima'" 
                        class="btn-mini"
                        @click="markPoReceived(po)"
                      >
                        Terima Barang
                      </button>
                      <span v-else class="text-muted-sm">Selesai</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL: Tambah Produk Baru -->
    <div v-if="showAddProductModal" class="modal-backdrop" @click.self="showAddProductModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Tambah Produk Baru</h3>
          <button class="close-btn" @click="showAddProductModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleAddProduct" class="modal-form">
          <div class="form-group">
            <label>Nama Produk</label>
            <input v-model="newProduct.name" type="text" placeholder="Contoh: Canvas Backpack 20L" required />
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
              <label>Stok Awal</label>
              <input v-model.number="newProduct.stockCount" type="number" placeholder="10" required />
            </div>
          </div>
          <div class="form-group">
            <label>URL Gambar</label>
            <input v-model="newProduct.image" type="url" placeholder="https://images.unsplash.com/..." required />
          </div>
          <div class="form-group">
            <label>Deskripsi Singkat</label>
            <textarea v-model="newProduct.description" rows="2" placeholder="Deskripsi produk..."></textarea>
          </div>
          <button type="submit" class="btn-primary w-full">Simpan Produk</button>
        </form>
      </div>
    </div>

    <!-- MODAL: Tambah Pengguna Baru -->
    <div v-if="showAddUserModal" class="modal-backdrop" @click.self="showAddUserModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Tambah Pengguna</h3>
          <button class="close-btn" @click="showAddUserModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleAddUser" class="modal-form">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="newUser.name" type="text" placeholder="Nama Lengkap" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="newUser.email" type="email" placeholder="nama@email.com" required />
          </div>
          <div class="form-group">
            <label>No. WhatsApp</label>
            <input v-model="newUser.phone" type="tel" placeholder="08123456789" required />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="newUser.role" required>
              <option value="Customer">Customer</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" class="btn-primary w-full">Simpan Pengguna</button>
        </form>
      </div>
    </div>

    <!-- MODAL: Buat PO Pembelian -->
    <div v-if="showAddPoModal" class="modal-backdrop" @click.self="showAddPoModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Buat Purchase Order (PO) Pembelian</h3>
          <button class="close-btn" @click="showAddPoModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleAddPo" class="modal-form">
          <div class="form-group">
            <label>Nama Supplier</label>
            <input v-model="newPo.supplierName" type="text" placeholder="PT Supplier..." required />
          </div>
          <div class="form-group">
            <label>Nama Barang / Material</label>
            <input v-model="newPo.items" type="text" placeholder="Kain Cotton 24s / Kulit Sapi" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Jumlah (Quantity)</label>
              <input v-model.number="newPo.quantity" type="number" placeholder="50" required />
            </div>
            <div class="form-group">
              <label>Total Biaya (Rp)</label>
              <input v-model.number="newPo.totalCost" type="number" placeholder="5000000" required />
            </div>
          </div>
          <button type="submit" class="btn-primary w-full">Buat Purchase Order</button>
        </form>
      </div>
    </div>

    <!-- MODAL: Detail Pesanan Penjualan -->
    <div v-if="selectedOrder" class="modal-backdrop" @click.self="selectedOrder = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Detail Pesanan #{{ selectedOrder.orderCode }}</h3>
          <button class="close-btn" @click="selectedOrder = null">&times;</button>
        </div>
        <div class="order-detail-content">
          <div class="detail-row">
            <span>Pelanggan:</span>
            <strong>{{ selectedOrder.customerName }}</strong>
          </div>
          <div class="detail-row">
            <span>No. WhatsApp:</span>
            <strong>{{ selectedOrder.customerPhone }}</strong>
          </div>
          <div class="detail-row">
            <span>Item:</span>
            <strong>{{ selectedOrder.items }}</strong>
          </div>
          <div class="detail-row">
            <span>Metode Bayar:</span>
            <strong>{{ selectedOrder.paymentMethod }}</strong>
          </div>
          <div class="detail-row">
            <span>Total Pembayaran:</span>
            <strong class="text-success font-bold">{{ formatPrice(selectedOrder.totalAmount) }}</strong>
          </div>
          <div class="detail-row">
            <span>Status:</span>
            <span class="status-chip" :class="selectedOrder.status.toLowerCase().replace(/\s+/g, '-')">
              {{ selectedOrder.status }}
            </span>
          </div>
          <button class="btn-primary w-full mt-4" @click="selectedOrder = null">Tutup</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Product } from '../types/product'
import type { AdminUser, SaleOrder, PurchaseOrder } from '../types/admin'
import { mockProducts } from '../data/mockProducts'
import { mockUsers, mockSales, mockPurchases } from '../data/mockAdminData'
import { useToast } from '../composables/useToast'

useHead({
  title: 'Dashboard Admin | Nagamas'
})

const { showToast } = useToast()

// Active Navigation Tab
const activeTab = ref<'overview' | 'inventory' | 'users' | 'sales' | 'purchases'>('overview')

// Dynamic Section Title
const sectionTitle = computed(() => {
  switch (activeTab.value) {
    case 'inventory': return 'Inventaris Produk'
    case 'users': return 'Daftar Pengguna'
    case 'sales': return 'Data Penjualan'
    case 'purchases': return 'Pengadaan & Pembelian (Restock)'
    case 'overview':
    default:
      return 'Ringkasan Dashboard'
  }
})

// State Data
const inventoryList = ref<Product[]>([...mockProducts])
const userList = ref<AdminUser[]>([...mockUsers])
const salesList = ref<SaleOrder[]>([...mockSales])
const purchasesList = ref<PurchaseOrder[]>([...mockPurchases])

// Filter & Search states
const inventorySearch = ref('')
const userSearch = ref('')
const salesSearch = ref('')
const salesFilterStatus = ref('Semua')
const purchaseSearch = ref('')

// Modals
const showAddProductModal = ref(false)
const showAddUserModal = ref(false)
const showAddPoModal = ref(false)
const selectedOrder = ref<SaleOrder | null>(null)

// Form states
const newProduct = reactive({
  name: '',
  category: 'tas',
  price: 0,
  stockCount: 10,
  image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  description: ''
})

const newUser = reactive({
  name: '',
  email: '',
  phone: '',
  role: 'Customer' as 'Customer' | 'Staff' | 'Admin'
})

const newPo = reactive({
  supplierName: '',
  items: '',
  quantity: 10,
  totalCost: 0
})

// Computed KPI Calculations
const totalSalesAmount = computed(() => {
  return salesList.value
    .filter(s => s.status === 'Selesai' || s.status === 'Diproses')
    .reduce((sum, order) => sum + order.totalAmount, 0)
})

const totalPurchaseCost = computed(() => {
  return purchasesList.value.reduce((sum, po) => sum + po.totalCost, 0)
})

// Filtered Lists
const filteredInventory = computed(() => {
  if (!inventorySearch.value.trim()) return inventoryList.value
  const q = inventorySearch.value.toLowerCase()
  return inventoryList.value.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
})

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return userList.value
  const q = userSearch.value.toLowerCase()
  return userList.value.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q))
})

const filteredSales = computed(() => {
  let list = salesList.value
  if (salesFilterStatus.value !== 'Semua') {
    list = list.filter(s => s.status === salesFilterStatus.value)
  }
  if (salesSearch.value.trim()) {
    const q = salesSearch.value.toLowerCase()
    list = list.filter(s => s.orderCode.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q))
  }
  return list
})

const filteredPurchases = computed(() => {
  if (!purchaseSearch.value.trim()) return purchasesList.value
  const q = purchaseSearch.value.toLowerCase()
  return purchasesList.value.filter(p => p.poCode.toLowerCase().includes(q) || p.supplierName.toLowerCase().includes(q))
})

// Actions
const formatPrice = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const handleAddProduct = () => {
  const prod: Product = {
    id: `prod-00${inventoryList.value.length + 1}`,
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
  showAddProductModal.value = false
  showToast('Sukses', `Produk ${prod.name} berhasil ditambahkan!`, 'success')
  newProduct.name = ''
}

const quickEditStock = (prod: Product) => {
  prod.stockCount += 5
  prod.inStock = true
  showToast('Stok Diperbarui', `Stok ${prod.name} ditambah 5 unit.`, 'success')
}

const deleteProduct = (id: string) => {
  inventoryList.value = inventoryList.value.filter(p => p.id !== id)
  showToast('Dihapus', 'Produk berhasil dihapus dari inventaris.', 'info')
}

const handleAddUser = () => {
  const user: AdminUser = {
    id: `usr-00${userList.value.length + 1}`,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    status: 'Active',
    joinDate: 'Hari Ini',
    totalOrders: 0
  }
  userList.value.unshift(user)
  showAddUserModal.value = false
  showToast('Pengguna Ditambahkan', `Akun ${user.name} berhasil didaftarkan.`, 'success')
}

const toggleUserStatus = (user: AdminUser) => {
  user.status = user.status === 'Active' ? 'Inactive' : 'Active'
  showToast('Status Diubah', `Status ${user.name} sekarang: ${user.status}`, 'info')
}

const handleAddPo = () => {
  const po: PurchaseOrder = {
    id: `po-00${purchasesList.value.length + 1}`,
    poCode: `PO-2026-009${purchasesList.value.length + 1}`,
    supplierName: newPo.supplierName,
    items: newPo.items,
    quantity: newPo.quantity,
    totalCost: newPo.totalCost,
    status: 'Menunggu Konfirmasi',
    orderDate: 'Hari Ini'
  }
  purchasesList.value.unshift(po)
  showAddPoModal.value = false
  showToast('PO Dibuat', `Purchase Order ${po.poCode} berhasil dibuat.`, 'success')
}

const markPoReceived = (po: PurchaseOrder) => {
  po.status = 'Diterima'
  showToast('Barang Diterima', `PO ${po.poCode} telah diterima dan stok ditambahkan.`, 'success')
}

const openOrderDetail = (order: SaleOrder) => {
  selectedOrder.value = order
}
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #0f172a;
}

/* Sidebar */
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
}

.sidebar-brand {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1px;
}

.admin-tag {
  font-size: 0.65rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
}

.sidebar-nav {
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
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
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.15s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-item.active {
  background: #ffffff;
  color: #0f172a;
}

.nav-icon {
  flex-shrink: 0;
}

.item-badge {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  padding: 1px 6px;
  border-radius: 10px;
}

.nav-item.active .item-badge {
  background: #0f172a;
  color: #ffffff;
}

.item-badge.sales { background: #10b981; color: #ffffff; }
.item-badge.purchase { background: #3b82f6; color: #ffffff; }

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
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

/* Main Area */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-title h2 {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}

.breadcrumb {
  font-size: 0.75rem;
  color: #94a3b8;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #0f172a;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-info .name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.profile-info .role {
  font-size: 0.7rem;
  color: #64748b;
}

/* Content Pane */
.admin-body {
  padding: 28px;
}

/* KPI Grid */
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
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sales-bg { background: #ecfdf5; color: #059669; }
.purchase-bg { background: #eff6ff; color: #2563eb; }
.users-bg { background: #f5f3ff; color: #7c3aed; }
.inventory-bg { background: #fffbeb; color: #d97706; }

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.kpi-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
}

.kpi-sub {
  font-size: 0.72rem;
  color: #64748b;
}

.kpi-sub.positive { color: #059669; font-weight: 600; }
.kpi-sub.warning { color: #dc2626; font-weight: 600; }

/* Tables Grid */
.overview-tables-grid {
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
}

/* Data Table */
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
  font-size: 0.75rem;
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

.font-bold { font-weight: 700; color: #0f172a; }
.text-success { color: #059669; }
.text-danger { color: #dc2626; }
.text-muted-sm { font-size: 0.75rem; color: #94a3b8; }

/* Custom Cells */
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
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
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

.stock-num.zero-stock {
  color: #dc2626;
  font-weight: 700;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-sm {
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
}

.user-fullname {
  font-weight: 600;
  color: #0f172a;
}

.user-email-text {
  font-size: 0.75rem;
  color: #94a3b8;
}

.items-cell {
  max-width: 200px;
  line-height: 1.35;
  font-size: 0.8rem;
}

.date-cell {
  font-size: 0.78rem;
  color: #64748b;
}

/* Status Chips */
.status-chip {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

.status-chip.selesai, .status-chip.diterima, .status-chip.active {
  background: #dcfce7;
  color: #15803d;
}

.status-chip.diproses, .status-chip.dikirim {
  background: #e0f2fe;
  color: #0369a1;
}

.status-chip.menunggu-pembayaran, .status-chip.menunggu-konfirmasi {
  background: #fef3c7;
  color: #b45309;
}

.status-chip.dibatalkan, .status-chip.inactive {
  background: #fee2e2;
  color: #b91c1c;
}

.role-chip {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.role-chip.admin { background: #0f172a; color: #ffffff; }
.role-chip.staff { background: #3b82f6; color: #ffffff; }
.role-chip.customer { background: #f1f5f9; color: #475569; }

/* Toolbar Actions */
.toolbar-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input-wrap {
  flex: 1;
  max-width: 360px;
}

.filter-input {
  width: 100%;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.85rem;
  outline: none;
}

.filter-input:focus {
  border-color: #0f172a;
}

.filter-pills-row {
  display: flex;
  gap: 6px;
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
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-mini {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
}

.btn-mini:hover {
  background: #e2e8f0;
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

.w-full { width: 100%; }
.mt-4 { margin-top: 16px; }

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
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
  max-width: 460px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
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
  font-weight: 600;
  color: #334155;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 9px 12px;
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

.order-detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #475569;
}

@media (max-width: 900px) {
  .admin-sidebar {
    width: 70px;
  }
  .sidebar-brand .admin-tag, .brand-name, .nav-item span, .nav-section-title, .sidebar-footer span {
    display: none;
  }
  .overview-tables-grid {
    grid-template-columns: 1fr;
  }
}
</style>
