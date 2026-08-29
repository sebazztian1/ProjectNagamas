<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Top Brand / Back Link -->
      <div class="card-top">
        <NuxtLink to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Kembali ke Katalog
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="auth-header">
        <div class="brand-badge">NAGAMAS</div>
        <h1 class="auth-title">Daftar Akun Baru</h1>
        <p class="auth-subtitle">Daftarkan akun untuk mendapatkan update katalog terbaru dan promo spesial.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="reg-name">Nama Lengkap</label>
          <div class="input-wrap">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              id="reg-name" 
              v-model="form.name"
              type="text" 
              placeholder="Contoh: Budi Santoso" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email">Alamat Email</label>
          <div class="input-wrap">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <input 
              id="reg-email" 
              v-model="form.email"
              type="email" 
              placeholder="nama@email.com" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-phone">Nomor WhatsApp</label>
          <div class="input-wrap">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <input 
              id="reg-phone" 
              v-model="form.phone"
              type="tel" 
              placeholder="08123456789" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">Kata Sandi</label>
          <div class="input-wrap">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              id="reg-password" 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Minimal 6 karakter" 
              minlength="6"
              required 
            />
            <button 
              type="button" 
              class="toggle-eye" 
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Sembunyikan' : 'Lihat' }}
            </button>
          </div>
        </div>

        <div class="terms-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.agreeTerms" required />
            <span>Saya menyetujui Syarat & Ketentuan Layanan</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading">Mendaftarkan...</span>
          <span v-else>Daftar Sekarang</span>
        </button>

        <div class="bottom-switch">
          Sudah memiliki akun? 
          <NuxtLink to="/login" class="switch-link">Masuk di sini</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

useHead({
  title: 'Daftar Akun | Nagamas Catalogue'
})

const { login } = useAuth()
const { showToast } = useToast()

const showPassword = ref(false)
const isLoading = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  agreeTerms: true
})

const handleRegister = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    
    login({
      name: form.name,
      email: form.email,
      phone: form.phone
    })

    showToast('Pendaftaran Berhasil', `Akun Anda berhasil dibuat. Selamat datang, ${form.name}!`, 'success')
    navigateTo('/')
  }, 600)
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f8fafc;
}

.auth-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  max-width: 460px;
  width: 100%;
  padding: 36px 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
}

.card-top {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: color 0.15s;
}

.back-link:hover {
  color: #0f172a;
}

.auth-header {
  margin-bottom: 24px;
}

.brand-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #0f172a;
  background: #f1f5f9;
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.45;
}

.auth-form {
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
  font-weight: 600;
  color: #334155;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;
}

.input-wrap input:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
}

.toggle-eye {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.terms-row {
  display: flex;
  align-items: center;
  margin-top: -2px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #475569;
  cursor: pointer;
}

.checkbox-label input {
  accent-color: #0f172a;
  width: 15px;
  height: 15px;
}

.submit-btn {
  margin-top: 6px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.bottom-switch {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 8px;
}

.switch-link {
  color: #0f172a;
  font-weight: 700;
  text-decoration: underline;
}
</style>
