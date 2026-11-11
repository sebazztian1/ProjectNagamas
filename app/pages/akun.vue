<template>
  <div class="account-page">
    <div class="page-container">
      <div class="breadcrumb">
        <NuxtLink to="/">Beranda</NuxtLink>
        <span>/</span>
        <span class="active">Profil Akun Saya</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Pengaturan Akun</h1>
        <p class="page-subtitle">Kelola informasi data diri, nomor WhatsApp, dan kata sandi akun Anda.</p>
      </div>

      <!-- Admin / Staff Access Banner -->
      <div v-if="currentUser?.role === 'admin' || currentUser?.role === 'staff'" class="admin-access-box">
        <div class="admin-access-header">
          <div>
            <div class="admin-badge">Hak Akses {{ userRoleLabel }}</div>
            <h2 class="admin-access-title">Panel Admin</h2>
            <p class="admin-access-subtitle">Kelola produk, trip, pesanan, dan pembayaran.</p>
          </div>
          <NuxtLink to="/admin" class="btn-to-admin">
            Masuk ke Panel Admin
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </div>

        <div class="admin-shortcuts">
          <NuxtLink to="/admin/produk" class="shortcut-pill">Kelola Produk</NuxtLink>
          <NuxtLink to="/admin/kategori" class="shortcut-pill">Kategori</NuxtLink>
          <NuxtLink to="/admin/trip" class="shortcut-pill">Jadwal Jastip</NuxtLink>
          <NuxtLink to="/admin/order" class="shortcut-pill">Pesanan &amp; Verifikasi</NuxtLink>
          <NuxtLink to="/admin/chat" class="shortcut-pill">Live Chat</NuxtLink>
          <NuxtLink to="/admin/request" class="shortcut-pill">Request Masuk</NuxtLink>
          <NuxtLink to="/admin/pengaturan" class="shortcut-pill">Pengaturan Toko</NuxtLink>
        </div>
      </div>

      <div class="account-layout">
        <!-- Profile Card -->
        <div class="card-box">
          <h3 class="card-title">Informasi Pribadi</h3>

          <form @submit.prevent="saveProfile" class="acc-form">
            <div class="avatar-row">
              <div class="user-avatar-circle">
                {{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div>
                <strong>@{{ user.username || 'pengguna' }}</strong>
                <span class="role-badge">{{ userRoleLabel }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Username Akun:</label>
              <input v-model="user.username" type="text" disabled class="input-disabled" />
              <span class="field-hint">Username tidak dapat diubah.</span>
            </div>

            <div class="form-group">
              <label>Nomor WhatsApp (Aktif untuk Konfirmasi & Notifikasi):</label>
              <input v-model="user.phone" type="tel" placeholder="Contoh: 081234567890" required />
              <span class="field-hint">Untuk login dan info status titipan.</span>
            </div>

            <button type="submit" class="btn-save" :disabled="isSavingProfile">
              {{ isSavingProfile ? 'Menyimpan...' : 'Simpan Nomor WhatsApp' }}
            </button>
          </form>
        </div>

        <!-- Security / Password Card -->
        <div class="card-box">
          <h3 class="card-title">Keamanan & Kata Sandi</h3>

          <form @submit.prevent="handleChangePassword" class="acc-form">
            <div class="form-group">
              <label>Kata Sandi Saat Ini:</label>
              <div class="input-wrap">
                <input
                  v-model="pass.current"
                  :type="showPassCurrent ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  class="toggle-eye"
                  :aria-label="showPassCurrent ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showPassCurrent = !showPassCurrent"
                >
                  {{ showPassCurrent ? 'Sembunyikan' : 'Tampilkan' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Kata Sandi Baru:</label>
              <div class="input-wrap">
                <input
                  v-model="pass.newPass"
                  :type="showPassNew ? 'text' : 'password'"
                  placeholder="Minimal 8 karakter (angka/simbol)"
                  minlength="8"
                  maxlength="128"
                  required
                />
                <button
                  type="button"
                  class="toggle-eye"
                  :aria-label="showPassNew ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showPassNew = !showPassNew"
                >
                  {{ showPassNew ? 'Sembunyikan' : 'Tampilkan' }}
                </button>
              </div>
              <span class="field-hint">
                Minimal 8 karakter dengan minimal 1 angka atau simbol
              </span>
            </div>

            <div class="form-group">
              <label>Konfirmasi Kata Sandi Baru:</label>
              <div class="input-wrap">
                <input
                  v-model="pass.confirmPass"
                  :type="showPassConfirm ? 'text' : 'password'"
                  placeholder="Ulangi kata sandi baru"
                  minlength="8"
                  maxlength="128"
                  required
                />
                <button
                  type="button"
                  class="toggle-eye"
                  :aria-label="showPassConfirm ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showPassConfirm = !showPassConfirm"
                >
                  {{ showPassConfirm ? 'Sembunyikan' : 'Tampilkan' }}
                </button>
              </div>
            </div>

            <button type="submit" class="btn-change-pass" :disabled="isChangingPassword">
              {{ isChangingPassword ? 'Memperbarui...' : 'Ubah Kata Sandi' }}
            </button>
          </form>

          <!-- Recovery Code Section -->
          <div class="recovery-box-section">
            <div class="recovery-box-head">
              <div>
                <strong class="recovery-section-title">Kode Pemulihan Akun</strong>
                <p class="recovery-section-desc">
                  Dipakai untuk mereset kata sandi jika Anda lupa. Kode ini dapat digunakan berkali-kali.
                </p>
              </div>
            </div>

            <div class="code-view-card">
              <span class="code-text-mono" role="text">{{ recoveryData.code || 'Memuat...' }}</span>
              <button type="button" class="btn-copy-mini" @click="copyAccountRecoveryCode">
                {{ copyCodeSuccess ? '✓ Tersalin' : 'Salin Kode' }}
              </button>
            </div>

            <div class="shuffle-control-row">
              <button
                type="button"
                class="btn-shuffle"
                :disabled="!recoveryData.canShuffle || isShuffling"
                @click="shuffleRecoveryCode"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                <span>{{ isShuffling ? 'Mengacak...' : 'Acak Ulang Kode (Shuffle)' }}</span>
              </button>

              <span v-if="!recoveryData.canShuffle" class="shuffle-wait-badge">
                ⏳ Dapat diacak ulang dalam {{ recoveryData.remainingHours }} jam lagi (Jeda 3 hari)
              </span>
              <span v-else class="shuffle-ready-badge">
                ✓ Siap diacak ulang
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Profil Akun Saya | dbb_luxe'
})

const { currentUser, updateProfile, changePassword: submitChangePassword } = useAuth()
const { showToast } = useToast()

const user = ref({
  username: '',
  phone: ''
})

const pass = ref({
  current: '',
  newPass: '',
  confirmPass: ''
})

const showPassCurrent = ref(false)
const showPassNew = ref(false)
const showPassConfirm = ref(false)

const isSavingProfile = ref(false)
const isChangingPassword = ref(false)

const recoveryData = ref({
  code: '',
  canShuffle: false,
  remainingHours: 72,
  remainingDays: 3
})
const isShuffling = ref(false)
const copyCodeSuccess = ref(false)

const loadRecoveryCode = async () => {
  try {
    const res = await $fetch<{
      recoveryCode: string
      canShuffle: boolean
      nextAvailableInHours: number
      nextAvailableInDays: number
    }>('/api/auth/recovery-code')

    recoveryData.value = {
      code: res.recoveryCode,
      canShuffle: res.canShuffle,
      remainingHours: res.nextAvailableInHours,
      remainingDays: res.nextAvailableInDays
    }
  } catch {
    // Ignore error
  }
}

const copyAccountRecoveryCode = async () => {
  if (!recoveryData.value.code) return
  try {
    await navigator.clipboard.writeText(recoveryData.value.code)
    copyCodeSuccess.value = true
    showToast('Kode Disalin', 'Kode pemulihan Anda berhasil disalin.', 'success')
    setTimeout(() => {
      copyCodeSuccess.value = false
    }, 2500)
  } catch {
    showToast('Kode Pemulihan', recoveryData.value.code, 'info')
  }
}

const shuffleRecoveryCode = async () => {
  if (!recoveryData.value.canShuffle) return
  if (!confirm('Yakin ingin mengacak ulang kode pemulihan akun Anda? Kode lama akan langsung tidak berlaku.')) return

  isShuffling.value = true
  try {
    const res = await $fetch<{
      success: boolean
      message: string
      recoveryCode: string
      canShuffle: boolean
      nextAvailableInHours: number
      nextAvailableInDays: number
    }>('/api/auth/recovery-code', {
      method: 'POST'
    })

    recoveryData.value = {
      code: res.recoveryCode,
      canShuffle: res.canShuffle,
      remainingHours: res.nextAvailableInHours,
      remainingDays: res.nextAvailableInDays
    }
    showToast('Kode Diacak Ulang', 'Kode pemulihan baru berhasil dibuat.', 'success')
  } catch (err: any) {
    showToast('Gagal Mengacak Kode', err?.data?.message || 'Terjadi kesalahan.', 'warning')
  } finally {
    isShuffling.value = false
  }
}

const userRoleLabel = computed(() => {
  if (currentUser.value?.role === 'admin') return 'Administrator Toko'
  if (currentUser.value?.role === 'staff') return 'Staff Operasional'
  return 'Customer Terdaftar'
})

const populateUserData = () => {
  if (currentUser.value) {
    user.value.username = currentUser.value.username || ''
    user.value.phone = currentUser.value.phone_number || ''
  }
}

onMounted(() => {
  populateUserData()
  loadRecoveryCode()
})

watch(currentUser, () => {
  populateUserData()
}, { immediate: true })

const saveProfile = async () => {
  isSavingProfile.value = true
  try {
    const updated = await updateProfile({
      phone_number: user.value.phone
    })
    showToast('Profil Diperbarui', 'Nomor WhatsApp Anda berhasil disimpan.', 'success')
    user.value.phone = updated.phone_number || ''
  } catch (err: any) {
    const message = err?.data?.message || err?.message || 'Gagal menyimpan profil.'
    showToast('Gagal Simpan', message, 'warning')
  } finally {
    isSavingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (!pass.value.current) {
    showToast('Kata Sandi Saat Ini Wajib Diisi', 'Silakan masukkan kata sandi Anda saat ini.', 'warning')
    return
  }

  if (pass.value.newPass !== pass.value.confirmPass) {
    showToast('Kata Sandi Tidak Cocok', 'Konfirmasi kata sandi baru tidak sama.', 'warning')
    return
  }

  const p = pass.value.newPass
  const len = Array.from(p).length
  if (len < 8) {
    showToast('Kata Sandi Terlalu Pendek', 'Kata sandi minimal 8 karakter.', 'warning')
    return
  }

  if (len > 128) {
    showToast('Kata Sandi Terlalu Panjang', 'Kata sandi maksimal 128 karakter.', 'warning')
    return
  }

  if (!/[^a-zA-Z\s]/.test(p)) {
    showToast('Kata Sandi Kurang Kuat', 'Minimal 1 angka atau simbol.', 'warning')
    return
  }

  if (pass.value.current === p) {
    showToast('Kata Sandi Sama', 'Tidak boleh sama dengan kata sandi lama.', 'warning')
    return
  }

  isChangingPassword.value = true
  try {
    await submitChangePassword({
      currentPassword: pass.value.current,
      newPassword: pass.value.newPass,
      confirmPassword: pass.value.confirmPass
    })

    showToast('Kata Sandi Diperbarui', 'Kata sandi akun Anda berhasil diubah.', 'success')
    pass.value.current = ''
    pass.value.newPass = ''
    pass.value.confirmPass = ''
    showPassCurrent.value = false
    showPassNew.value = false
    showPassConfirm.value = false
  } catch (err: any) {
    const message = err?.data?.message || err?.message || 'Gagal mengubah kata sandi.'
    showToast('Gagal Ubah Sandi', message, 'warning')
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<style scoped>
.account-page {
  padding: 30px 20px 60px;
}

.page-container {
  max-width: 960px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #7A6A55);
}

.admin-access-box {
  background: #FCF9F2;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 22px 24px;
  margin-bottom: 28px;
}

.admin-access-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 16px;
  border-bottom: 1px solid #EAE0CE;
}

.admin-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8C6D3F;
  background: #F1E5D1;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}

.admin-access-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.admin-access-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 0;
}

.btn-to-admin {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-to-admin:hover {
  background: var(--color-primary-hover, #6F5530);
}

.admin-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.shortcut-pill {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text, #2B2116);
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  padding: 6px 12px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.15s;
}

.shortcut-pill:hover {
  background: #F1E5D1;
  border-color: #8C6D3F;
  color: #8C6D3F;
}

.account-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.card-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  border-radius: 12px;
  padding: 24px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #EFE1C6);
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.user-avatar-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
}

.role-badge {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
  margin-top: 2px;
}

.acc-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text, #2B2116);
}

.form-group input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  outline: none;
}

.form-group input:focus {
  border-color: var(--color-primary, #8C6D3F);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-wrap input {
  width: 100%;
  padding-right: 86px;
  box-sizing: border-box;
}

.toggle-eye {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  padding: 6px 10px;
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 700;
  cursor: pointer;
  border-radius: 4px;
}

.toggle-eye:hover {
  color: var(--color-text, #2B2116);
}

.input-disabled {
  background: var(--color-canvas, #FFFBF2);
  color: #A8957A;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #7A6A55);
}

.btn-save, .btn-change-pass {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.15s;
}

.btn-save:hover, .btn-change-pass:hover {
  background: var(--color-primary-hover, #6F5530);
}

/* Recovery Code Section in Account Settings */
.recovery-box-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1.5px dashed var(--color-secondary, #EFE1C6);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recovery-section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  display: block;
}

.recovery-section-desc {
  font-size: 0.8rem;
  color: var(--color-text-muted, #7A6A55);
  margin: 2px 0 0;
  line-height: 1.4;
}

.code-view-card {
  background: #FFFDF8;
  border: 1.5px dashed var(--color-primary, #8C6D3F);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.code-text-mono {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-family: monospace;
  color: var(--color-primary, #8C6D3F);
  user-select: all;
}

.btn-copy-mini {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #EFE1C6);
  color: var(--color-text, #2B2116);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-copy-mini:hover {
  background: #FFFBF2;
  border-color: var(--color-primary, #8C6D3F);
}

.shuffle-control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-shuffle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFBF2;
  border: 1.5px solid var(--color-primary, #8C6D3F);
  color: var(--color-primary, #8C6D3F);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-shuffle:hover:not(:disabled) {
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
}

.btn-shuffle:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  border-color: #CBB99E;
  color: #7A6A55;
  background: #FAF7F2;
}

.shuffle-wait-badge {
  font-size: 0.76rem;
  color: #854D0E;
  background: #FEF9C3;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.shuffle-ready-badge {
  font-size: 0.76rem;
  color: #166534;
  background: #DCFCE7;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
}

@media (max-width: 800px) {
  .account-layout {
    grid-template-columns: 1fr;
  }
}
</style>
