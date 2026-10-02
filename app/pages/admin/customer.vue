<template>
  <div class="admin-customers-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Daftar Pelanggan (Customer)</h1>
        <p class="page-subtitle">Daftar pengguna terdaftar yang pernah melakukan transaksi jastip maupun ready stock di dbb_luxe.</p>
      </div>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Username</th>
            <th>No. WhatsApp</th>
            <th>Total Order</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in customerList" :key="c.id">
            <td class="col-user">
              <div class="avatar">{{ c.name.charAt(0) }}</div>
              <strong>{{ c.name }}</strong>
            </td>
            <td>@{{ c.username }}</td>
            <td>{{ c.phone }}</td>
            <td>
              <span class="order-count-badge">{{ c.totalOrders }} Pesanan</span>
            </td>
            <td>
              <span class="active-badge">Aktif</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const customerList = ref([
  { id: '1', name: 'Siti Rahmawati', username: 'sitirahma', phone: '0812-3456-7890', totalOrders: 3 },
  { id: '2', name: 'Budi Santoso', username: 'budisantoso', phone: '0819-8765-4321', totalOrders: 1 },
  { id: '3', name: 'Dewi Lestari', username: 'dewiles', phone: '0857-1122-3344', totalOrders: 5 },
  { id: '4', name: 'Reza Pratama', username: 'rezapratama', phone: '0813-9988-7766', totalOrders: 2 }
])
</script>

<style scoped>
.admin-customers-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #64748B);
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-canvas, #F4F6F8);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #64748B);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  color: var(--color-text, #1E293B);
  vertical-align: middle;
}

.col-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
}

.order-count-badge {
  background: var(--color-secondary, #E4E7EB);
  color: var(--color-primary, #4A5D73);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.75rem;
}

.active-badge {
  background: #DCFCE7;
  color: #166534;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
}
</style>
