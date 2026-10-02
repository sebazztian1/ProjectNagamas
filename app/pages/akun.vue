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
                {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div>
                <strong>{{ user.name }}</strong>
                <span class="role-badge">Customer Terdaftar</span>
              </div>
            </div>

            <div class="form-group">
              <label>Nama Lengkap:</label>
              <input v-model="user.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Username:</label>
              <input v-model="user.username" type="text" disabled class="input-disabled" />
              <span class="field-hint">Username tidak dapat diubah setelah terdaftar.</span>
            </div>

            <div class="form-group">
              <label>Nomor WhatsApp (Aktif untuk Konfirmasi):</label>
              <input v-model="user.phone" type="tel" required />
            </div>

            <button type="submit" class="btn-save">
              Simpan Perubahan Profil
            </button>
          </form>
        </div>

        <!-- Security / Password Card -->
        <div class="card-box">
          <h3 class="card-title">Keamanan & Kata Sandi</h3>

          <form @submit.prevent="changePassword" class="acc-form">
            <div class="form-group">
              <label>Kata Sandi Saat Ini:</label>
              <input v-model="pass.current" type="password" placeholder="••••••••" required />
            </div>

            <div class="form-group">
              <label>Kata Sandi Baru:</label>
              <input v-model="pass.newPass" type="password" placeholder="Minimal 8 karakter" required />
            </div>

            <div class="form-group">
              <label>Konfirmasi Kata Sandi Baru:</label>
              <input v-model="pass.confirmPass" type="password" placeholder="Ulangi kata sandi baru" required />
            </div>

            <button type="submit" class="btn-change-pass">
              Ubah Kata Sandi
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const user = ref({
  name: 'Siti Rahmawati',
  username: 'sitirahma',
  phone: '0812-3456-7890'
})

const pass = ref({
  current: '',
  newPass: '',
  confirmPass: ''
})

const saveProfile = () => {
  showToast({
    title: 'Profil Diperbarui',
    message: 'Data nama dan nomor WhatsApp Anda berhasil disimpan.',
    type: 'success'
  })
}

const changePassword = () => {
  if (pass.value.newPass !== pass.value.confirmPass) {
    showToast({
      title: 'Kata Sandi Tidak Cocok',
      message: 'Konfirmasi kata sandi baru tidak sama.',
      type: 'warning'
    })
    return
  }

  showToast({
    title: 'Kata Sandi Diperbarui',
    message: 'Kata sandi akun Anda berhasil diubah.',
    type: 'success'
  })
  pass.value.current = ''
  pass.value.newPass = ''
  pass.value.confirmPass = ''
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
  color: var(--color-text-muted, #64748B);
  margin-bottom: 20px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
}

.breadcrumb .active {
  color: var(--color-primary, #4A5D73);
  font-weight: 700;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.92rem;
  color: var(--color-text-muted, #64748B);
}

.account-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.card-box {
  background: #ffffff;
  border: 1px solid var(--color-secondary, #E4E7EB);
  border-radius: 12px;
  padding: 24px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text, #1E293B);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-secondary, #E4E7EB);
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
  background: var(--color-primary, #4A5D73);
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
  color: var(--color-text-muted, #64748B);
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
  color: var(--color-text, #1E293B);
}

.form-group input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #E4E7EB);
  font-size: 0.88rem;
  color: var(--color-text, #1E293B);
  outline: none;
}

.form-group input:focus {
  border-color: var(--color-primary, #4A5D73);
}

.input-disabled {
  background: var(--color-canvas, #F4F6F8);
  color: #94A3B8;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted, #64748B);
}

.btn-save, .btn-change-pass {
  background: var(--color-primary, #4A5D73);
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
  background: var(--color-primary-hover, #384759);
}

@media (max-width: 800px) {
  .account-layout {
    grid-template-columns: 1fr;
  }
}
</style>
