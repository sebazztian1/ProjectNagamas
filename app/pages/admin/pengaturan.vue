<template>
  <div class="admin-settings-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Pengaturan Toko & Rekening Bank</h1>
        <p class="page-subtitle">Atur nomor rekening tujuan transfer manual, gambar QRIS statis, kurs harian, dan kebijakan toko dbb_luxe.</p>
      </div>
      <button class="btn-save-all" @click="saveSettings">Simpan Seluruh Pengaturan</button>
    </div>

    <div class="settings-grid">
      <!-- Section 1: Bank Accounts & QRIS -->
      <div class="settings-card">
        <h3 class="card-head">Rekening Pembayaran & QRIS</h3>

        <div class="bank-config-list">
          <div v-for="b in banks" :key="b.id" class="bank-config-box">
            <div class="b-head">
              <strong>{{ b.bankName }}</strong>
              <label class="toggle-switch">
                <input type="checkbox" v-model="b.isActive" />
                <span>Aktif</span>
              </label>
            </div>
            <div class="f-group">
              <label>Nomor Rekening:</label>
              <input v-model="b.accountNumber" type="text" />
            </div>
            <div class="f-group">
              <label>Atas Nama Pemilik:</label>
              <input v-model="b.accountHolder" type="text" />
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Jastip Operational Defaults -->
      <div class="settings-card">
        <h3 class="card-head">Parameter Operasional Jastip</h3>

        <div class="settings-form">
          <div class="f-group">
            <label>Batas Waktu Pembayaran Transfer:</label>
            <select v-model="settings.paymentDuration">
              <option value="24">24 Jam (Rekomendasi Jastip)</option>
              <option value="12">12 Jam (Trip Cepat / Flash PO)</option>
              <option value="48">48 Jam</option>
            </select>
          </div>

          <div class="f-group">
            <label>Default Fee Jastip per Item (IDR):</label>
            <input v-model.number="settings.defaultFee" type="number" />
            <span class="hint">Biaya jasa titip standar jika tidak ditentukan di trip.</span>
          </div>

          <div class="f-group">
            <label>Nomor WhatsApp Customer Service:</label>
            <input v-model="settings.waNumber" type="tel" />
          </div>

          <div class="f-group">
            <label>Status Toko:</label>
            <select v-model="settings.storeStatus">
              <option value="open">Buka Normal (Menerima Order Ready & PO)</option>
              <option value="trip_mode">Trip Mode (Admin Sedang Belanja di Luar Negeri)</option>
              <option value="closed">Tutup Sementara</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockBankAccounts, type BankAccount } from '../../data/mockJastipData'
import { useToast } from '../../composables/useToast'

const { showToast } = useToast()
const banks = ref<BankAccount[]>([...mockBankAccounts])

const settings = ref({
  paymentDuration: '24',
  defaultFee: 35000,
  waNumber: '0812-9876-5432',
  storeStatus: 'open'
})

const saveSettings = () => {
  showToast({
    title: 'Pengaturan Disimpan',
    message: 'Rekening bank dan parameter toko berhasil diperbarui.',
    type: 'success'
  })
}
</script>

<style scoped>
.admin-settings-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
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

.btn-save-all {
  background: var(--color-primary, #4A5D73);
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 22px;
}

.card-head {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
}

.bank-config-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bank-config-box {
  background: var(--color-canvas, #F4F6F8);
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.b-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted, #64748B);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.f-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.f-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text, #1E293B);
}

.f-group input, .f-group select {
  padding: 9px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.85rem;
  outline: none;
  background: #ffffff;
}

.hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

@media (max-width: 860px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
