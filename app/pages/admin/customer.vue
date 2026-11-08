<template>
  <div class="admin-customers-page">
    <div class="page-head">
      <h1 class="page-title">Pelanggan</h1>
      <button class="btn-refresh" @click="fetchCustomers" :disabled="pending">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin-icon': pending }">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
        <span>Refresh</span>
      </button>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari username atau no. WhatsApp..."
          @input="handleSearchInput"
        />
        <button v-if="searchQuery" type="button" class="clear-search" @click="searchQuery = ''">&times;</button>
      </div>
      <div class="count-tag">
        {{ filteredCustomers.length }} Pelanggan
      </div>
    </div>

    <div class="table-card">
      <div v-if="pending && customerList.length === 0" class="empty-state">
        Memuat...
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>No. WhatsApp</th>
            <th>Total Order</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody v-if="filteredCustomers.length > 0">
          <tr v-for="c in filteredCustomers" :key="c.id">
            <td class="col-user">
              <div class="avatar">{{ (c.username || 'U').charAt(0).toUpperCase() }}</div>
              <strong>@{{ c.username }}</strong>
            </td>
            <td>{{ c.phone }}</td>
            <td>
              <span class="order-count-badge">{{ c.totalOrders || 0 }} Pesanan</span>
            </td>
            <td>
              <span class="active-badge" :class="{ inactive: !c.isActive }">
                {{ c.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="4" class="empty-state">
              {{ searchQuery.trim() ? 'Pelanggan tidak ditemukan.' : 'Belum ada data pelanggan.' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '../../composables/useToast'
import { useAdminStats } from '../../composables/useAdminStats'

const { showToast } = useToast()
const { fetchAdminStats } = useAdminStats()

const customerList = ref<any[]>([])
const pending = ref(true)
const searchQuery = ref('')

const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement | null
  if (target) {
    searchQuery.value = target.value
  }
}

const fetchCustomers = async () => {
  pending.value = true
  try {
    const data = await $fetch<any[]>('/api/admin/customers')
    customerList.value = data || []
    fetchAdminStats(true)
  } catch (err: any) {
    showToast('Gagal Memuat', err?.data?.message || 'Gagal memuat daftar pelanggan', 'warning')
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})

const normalizePhoneDigits = (val: string) => {
  const digits = (val || '').replace(/\D/g, '')
  if (digits.startsWith('62')) return '0' + digits.slice(2)
  return digits
}

const filteredCustomers = computed(() => {
  const rawQuery = searchQuery.value.trim().toLowerCase()
  if (!rawQuery) return customerList.value

  const cleanUsernameQuery = rawQuery.replace(/^@/, '')
  const rawDigits = rawQuery.replace(/\D/g, '')
  const normalizedQueryDigits = normalizePhoneDigits(rawQuery)

  return customerList.value.filter(c => {
    const uname = (c.username || '').toLowerCase()
    const phoneRaw = (c.phone || '').toLowerCase()
    const phoneDigits = (c.phone || '').replace(/\D/g, '')
    const normalizedCustomerPhone = normalizePhoneDigits(c.phone || '')

    const matchUsername = uname.includes(cleanUsernameQuery)
    const matchPhoneRaw = phoneRaw.includes(rawQuery)
    const matchPhoneDigits =
      rawDigits.length > 0 &&
      (phoneDigits.includes(rawDigits) || normalizedCustomerPhone.includes(normalizedQueryDigits))

    return matchUsername || matchPhoneRaw || matchPhoneDigits
  })
})
</script>

<style scoped>
.admin-customers-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 0;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 15px;
  background: #FFFFFF;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: #5C4930;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  border-color: #D8B978;
  background: #FFFBF2;
  color: #2B2116;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8E7B62;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 9px 32px 9px 36px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: var(--color-canvas, #FFFBF2);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary, #8C6D3F);
  background: #ffffff;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #8E7B62;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}

.count-tag {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted, #7A6A55);
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow-x: auto;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
  font-size: 0.85rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--color-canvas, #FFFBF2);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted, #7A6A55);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  color: var(--color-text, #2B2116);
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
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.82rem;
}

.order-count-badge {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
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

.active-badge.inactive {
  background: #FEE2E2;
  color: #991B1B;
}
</style>
