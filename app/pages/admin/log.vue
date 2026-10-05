<template>
  <div class="admin-audit-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Audit Log Aktivitas</h1>
        <p class="page-subtitle">Rekam jejak tindakan admin dalam memverifikasi transfer, mengubah status trip jastip, dan input penawaran harga.</p>
      </div>
    </div>

    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Pengguna / Admin</th>
            <th>Aksi</th>
            <th>Entitas / Target</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id">
            <td class="col-time">{{ l.time }}</td>
            <td>
              <span class="user-chip">{{ l.user }}</span>
            </td>
            <td>
              <span class="action-tag" :class="l.type">{{ l.action }}</span>
            </td>
            <td>
              <strong>{{ l.target }}</strong>
            </td>
            <td>{{ l.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const logs = ref([
  { id: '1', time: '02 Okt 2026 14:00', user: 'Admin Master', action: 'Update Status', type: 'update', target: 'Order JST-20261002-001', detail: 'Status diubah ke Sedang Dibelikan di Tokyo' },
  { id: '2', time: '02 Okt 2026 11:15', user: 'Admin Master', action: 'Kirim Quote', type: 'quote', target: 'Request #req-01', detail: 'Penawaran harga Rp 420.000 dikirim ke Siti Rahmawati' },
  { id: '3', time: '02 Okt 2026 09:40', user: 'Admin Master', action: 'Verifikasi Lunas', type: 'verify', target: 'Order JST-20261002-001', detail: 'Mutasi BCA Rp 430.147 terverifikasi valid' },
  { id: '4', time: '01 Okt 2026 09:00', user: 'Admin Master', action: 'Buka Trip Baru', type: 'trip', target: 'Trip Jepang Autumn', detail: 'Jadwal trip baru dipublikasikan (Open PO)' }
])
</script>

<style scoped>
.admin-audit-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
}

.table-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  overflow-x: auto;
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

.col-time {
  white-space: nowrap;
  font-size: 0.8rem;
  color: var(--color-text-muted, #7A6A55);
}

.user-chip {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.76rem;
  font-weight: 600;
}

.action-tag {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 700;
}

.action-tag.verify {
  background: #DCFCE7;
  color: #166534;
}

.action-tag.update {
  background: #F3E6CC;
  color: #6F5530;
}

.action-tag.quote {
  background: #FEF3C7;
  color: #92400E;
}

.action-tag.trip {
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
}
</style>
