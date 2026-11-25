<template>
  <div class="admin-settings-page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Pengaturan Toko</h1>
        <p class="page-subtitle">Perubahan rekening bank dan parameter di sini langsung berlaku pada halaman Checkout &amp; Pembayaran customer.</p>
      </div>
      <button type="button" class="btn-save-all" :disabled="pending || isSaving" @click="saveSettings">
        {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
      </button>
    </div>

    <div v-if="pending && banks.length === 0" class="settings-loading">
      Memuat pengaturan toko...
    </div>

    <div v-else class="settings-grid">
      <!-- Section 1: Bank Account -->
      <div class="settings-card">
        <div class="card-head-row">
          <div>
            <h3 class="card-head-title">Rekening Pembayaran Toko</h3>
            <p class="card-head-sub">Rekening yang aktif akan tampil sebagai rekening tujuan resmi saat customer checkout &amp; bayar.</p>
          </div>
          <button type="button" class="btn-add-bank" @click="addBankAccount">
            + Tambah Rekening
          </button>
        </div>

        <div class="bank-config-list">
          <div v-for="(b, idx) in banks" :key="b.localKey" class="bank-config-box" :class="{ inactive: !b.isActive }">
            <div class="b-head">
              <div class="b-head-left">
                <strong>Rekening #{{ idx + 1 }}</strong>
                <span class="b-status-pill" :class="{ active: b.isActive }">
                  {{ b.isActive ? 'Aktif' : 'Nonaktif' }}
                </span>
              </div>
              <div class="b-head-actions">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="b.isActive" />
                  <span>Aktif</span>
                </label>
                <button
                  type="button"
                  class="btn-remove-bank"
                  :disabled="banks.length <= 1 || b.paymentsCount > 0"
                  :title="b.paymentsCount > 0 ? 'Dipakai di riwayat transaksi — nonaktifkan saja' : (banks.length <= 1 ? 'Minimal 1 rekening harus tersedia' : 'Hapus rekening ini')"
                  @click="removeBankAccount(idx)"
                >
                  Hapus
                </button>
              </div>
            </div>

            <div class="f-group">
              <label>Nama Bank / E-Wallet:</label>
              <input v-model="b.bankName" type="text" maxlength="50" placeholder="Contoh: BCA, Mandiri, BNI" />
            </div>
            <div class="f-group">
              <label>Nomor Rekening:</label>
              <input v-model="b.accountNumber" type="text" maxlength="30" placeholder="Contoh: 8830-192-888" />
            </div>
            <div class="f-group">
              <label>Atas Nama Pemilik:</label>
              <input v-model="b.accountHolder" type="text" maxlength="100" placeholder="Contoh: DBB LUXE INDONESIA" />
            </div>
            <p v-if="b.paymentsCount > 0" class="bank-locked-hint">
              Sudah tercatat pada {{ b.paymentsCount }} riwayat pembayaran — nonaktifkan jika tidak digunakan lagi.
            </p>
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
            <span class="hint">Dipakai saat admin menyetujui (ACC) pesanan dan ditampilkan di ringkasan checkout.</span>
          </div>

          <div class="f-group">
            <label>Default Fee Jastip per Item (IDR):</label>
            <IdrPriceInput v-model="settings.defaultFee" min="0" placeholder="Contoh: 35.000" />
            <span class="hint">Biaya jasa titip standar jika tidak ditentukan di trip.</span>
          </div>

          <div class="f-group">
            <label>Nomor WhatsApp Customer Service:</label>
            <input v-model="settings.waNumber" type="tel" maxlength="40" />
          </div>

          <div class="f-group">
            <label>Status Toko:</label>
            <select v-model="settings.storeStatus">
              <option value="open">Buka Normal (Menerima Order Ready &amp; PO)</option>
              <option value="trip_mode">Trip Mode (Admin Sedang Belanja di Luar Negeri)</option>
              <option value="closed">Tutup Sementara (Menutup Pengajuan Checkout Baru)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '../../composables/useToast'

interface EditableBankAccount {
  id?: number
  localKey: string
  bankName: string
  accountNumber: string
  accountHolder: string
  isActive: boolean
  paymentsCount: number
}

interface StoreSettingsForm {
  paymentDuration: '12' | '24' | '48'
  defaultFee: number
  waNumber: string
  storeStatus: 'open' | 'trip_mode' | 'closed'
}

const { showToast } = useToast()

const { data: settingsData, pending } = await useFetch<{
  banks: Array<{
    id: number
    bankName: string
    accountNumber: string
    accountHolder: string
    isActive: boolean
    paymentsCount?: number
  }>
  settings: StoreSettingsForm
}>('/api/admin/settings')

const banks = ref<EditableBankAccount[]>([])
const deletedBankIds = ref<number[]>([])
const isSaving = ref(false)

const settings = ref<StoreSettingsForm>({
  paymentDuration: '24',
  defaultFee: 35000,
  waNumber: '0812-9876-5432',
  storeStatus: 'open'
})

let localSeq = 0
const mapBanksToEditable = (list: Array<{
  id?: number
  bankName: string
  accountNumber: string
  accountHolder: string
  isActive: boolean
  paymentsCount?: number
}>): EditableBankAccount[] => {
  return list.map((b) => ({
    id: b.id,
    localKey: b.id ? `bank-${b.id}` : `new-${++localSeq}`,
    bankName: b.bankName || '',
    accountNumber: b.accountNumber || '',
    accountHolder: b.accountHolder || '',
    isActive: Boolean(b.isActive),
    paymentsCount: Number(b.paymentsCount || 0)
  }))
}

watch(
  settingsData,
  (val) => {
    if (!val) return
    banks.value = mapBanksToEditable(val.banks || [])
    deletedBankIds.value = []
    if (val.settings) {
      settings.value = {
        paymentDuration: val.settings.paymentDuration || '24',
        defaultFee: Number(val.settings.defaultFee ?? 35000),
        waNumber: val.settings.waNumber || '0812-9876-5432',
        storeStatus: val.settings.storeStatus || 'open'
      }
    }
  },
  { immediate: true }
)

const addBankAccount = () => {
  banks.value.push({
    localKey: `new-${++localSeq}`,
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    isActive: true,
    paymentsCount: 0
  })
}

const removeBankAccount = (index: number) => {
  if (banks.value.length <= 1) return
  const target = banks.value[index]
  if (!target || target.paymentsCount > 0) return
  if (target.id && !deletedBankIds.value.includes(target.id)) {
    deletedBankIds.value.push(target.id)
  }
  banks.value.splice(index, 1)
}

const saveSettings = async () => {
  if (banks.value.length === 0) {
    showToast('Rekening Diperlukan', 'Minimal harus ada 1 rekening bank toko.', 'warning')
    return
  }

  for (let i = 0; i < banks.value.length; i++) {
    const b = banks.value[i]
    if (!b.bankName.trim() || !b.accountNumber.trim() || !b.accountHolder.trim()) {
      showToast(
        'Data Rekening Belum Lengkap',
        `Lengkapi nama bank, nomor rekening, dan pemilik pada Rekening #${i + 1}.`,
        'warning'
      )
      return
    }
  }

  if (!banks.value.some(b => b.isActive)) {
    showToast(
      'Minimal 1 Rekening Aktif',
      'Aktifkan minimal 1 rekening bank agar customer dapat melakukan pembayaran.',
      'warning'
    )
    return
  }

  isSaving.value = true
  try {
    const res = await $fetch<{
      success: boolean
      banks: Array<{
        id: number
        bankName: string
        accountNumber: string
        accountHolder: string
        isActive: boolean
        paymentsCount?: number
      }>
      settings: StoreSettingsForm
    }>('/api/admin/settings', {
      method: 'PUT',
      body: {
        banks: banks.value.map(b => ({
          id: b.id,
          bankName: b.bankName.trim(),
          accountNumber: b.accountNumber.trim(),
          accountHolder: b.accountHolder.trim(),
          isActive: b.isActive
        })),
        deletedBankIds: deletedBankIds.value,
        settings: settings.value
      }
    })

    banks.value = mapBanksToEditable(res.banks || [])
    deletedBankIds.value = []
    if (res.settings) {
      settings.value = { ...res.settings }
    }

    showToast('Pengaturan Disimpan', 'Rekening bank dan parameter toko berhasil diperbarui.', 'success')
  } catch (err: any) {
    showToast('Gagal Menyimpan', err?.data?.message || 'Gagal menyimpan pengaturan toko.', 'warning')
  } finally {
    isSaving.value = false
  }
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
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
}

.btn-save-all {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save-all:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.settings-loading {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 36px;
  text-align: center;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 600;
}

.card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.card-head-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin: 0 0 4px;
}

.card-head-sub {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
  line-height: 1.4;
}

.btn-add-bank {
  background: #FAF5EC;
  border: 1px solid #D8B978;
  color: #6F5530;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-add-bank:hover {
  background: #F4E9D2;
  border-color: var(--color-primary, #8C6D3F);
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settings-card {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px;
  min-width: 0;
}

.card-head {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.bank-config-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bank-config-box {
  background: var(--color-canvas, #FFFBF2);
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bank-config-box.inactive {
  opacity: 0.72;
  background: #F9F7F3;
}

.b-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.b-head-left,
.b-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.b-status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #E5E7EB;
  color: #4B5563;
}

.b-status-pill.active {
  background: #DCFCE7;
  color: #166534;
}

.btn-remove-bank {
  background: #ffffff;
  border: 1px solid #FECACA;
  color: #B91C1C;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-remove-bank:hover:not(:disabled) {
  background: #FEF2F2;
}

.btn-remove-bank:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bank-locked-hint {
  margin: 0;
  font-size: 0.72rem;
  color: #92400E;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
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
  color: var(--color-text, #2B2116);
}

.f-group input, .f-group select {
  padding: 9px 12px;
  border-radius: 6px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.85rem;
  outline: none;
  background: #ffffff;
}

.hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

@media (max-width: 860px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page-head {
    align-items: stretch;
  }

  .btn-save-all {
    width: 100%;
    text-align: center;
  }

  .settings-card {
    padding: 16px;
  }

  .b-head {
    flex-wrap: wrap;
    gap: 8px;
  }

  .f-group input,
  .f-group select {
    width: 100%;
    min-width: 0;
    font-size: 1rem;
  }
}
</style>
