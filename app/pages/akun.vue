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
        <p class="page-subtitle">Kelola informasi data diri, nomor WhatsApp untuk notifikasi jastip, dan kata sandi akun Anda.</p>
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
              <span class="field-hint">Username digunakan sebagai identitas akun Anda untuk masuk (login) dan tidak dapat diubah.</span>
            </div>

            <div class="form-group">
              <label>Nomor WhatsApp (Aktif untuk Konfirmasi & Notifikasi):</label>
              <input v-model="user.phone" type="tel" placeholder="Contoh: 081234567890" required />
              <span class="field-hint">Nomor ini dapat digunakan untuk masuk ke akun Anda serta menerima info status titipan jastip.</span>
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
              <input v-model="pass.current" type="password" placeholder="••••••••" required />
            </div>

            <div class="form-group">
              <label>Kata Sandi Baru:</label>
              <input v-model="pass.newPass" type="password" placeholder="Minimal 6 karakter" minlength="6" required />
            </div>

            <div class="form-group">
              <label>Konfirmasi Kata Sandi Baru:</label>
              <input v-model="pass.confirmPass" type="password" placeholder="Ulangi kata sandi baru" minlength="6" required />
            </div>

            <button type="submit" class="btn-change-pass" :disabled="isChangingPassword">
              {{ isChangingPassword ? 'Memperbarui...' : 'Ubah Kata Sandi' }}
            </button>
          </form>
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

const isSavingProfile = ref(false)
const isChangingPassword = ref(false)

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
  if (pass.value.newPass !== pass.value.confirmPass) {
    showToast('Kata Sandi Tidak Cocok', 'Konfirmasi kata sandi baru tidak sama.', 'warning')
    return
  }

  if (pass.value.newPass.length < 6) {
    showToast('Kata Sandi Terlalu Pendek', 'Kata sandi baru minimal 6 karakter.', 'warning')
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

@media (max-width: 800px) {
  .account-layout {
    grid-template-columns: 1fr;
  }
}
</style>
