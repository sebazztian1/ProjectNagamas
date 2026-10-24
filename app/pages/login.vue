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
        <div class="brand-badge">DBB_LUXE</div>
        <h1 class="auth-title">Masuk ke Akun</h1>
        <p class="auth-subtitle">Masukkan username atau nomor WhatsApp dan kata sandi Anda untuk mengakses akun.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="identifier">Username atau No. WhatsApp</label>
          <div class="input-wrap">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              id="identifier" 
              v-model="form.identifier"
              type="text" 
              placeholder="Contoh: sitirahma atau 081234567890" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <div class="label-row">
            <label for="password">Kata Sandi</label>
            <a href="#" @click.prevent="forgotPassword" class="forgot-link">Lupa kata sandi?</a>
          </div>
          <div class="input-wrap">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              id="password" 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="••••••••" 
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

        <div class="remember-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.rememberMe" />
            <span>Ingat saya di perangkat ini</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading">Memproses...</span>
          <span v-else>Masuk Sekarang</span>
        </button>

        <div class="bottom-switch">
          Belum memiliki akun? 
          <NuxtLink to="/register" class="switch-link">Daftar sekarang</NuxtLink>
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
  title: 'Masuk | dbb_luxe'
})

const route = useRoute()
const { login } = useAuth()
const { showToast } = useToast()

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  identifier: '',
  password: '',
  rememberMe: true
})

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const user = await login({
      identifier: form.identifier,
      password: form.password
    })

    showToast('Berhasil Masuk', `Selamat datang kembali, ${user.username}!`, 'success')

    // Role-based redirection
    if (user.role === 'admin' || user.role === 'staff') {
      navigateTo('/admin')
    } else if (route.query.redirect && typeof route.query.redirect === 'string') {
      navigateTo(route.query.redirect)
    } else {
      navigateTo('/')
    }
  } catch (err: any) {
    const message = err?.data?.message || err?.message || 'Username / No. WhatsApp atau kata sandi tidak cocok'
    errorMessage.value = message
    showToast('Gagal Masuk', message, 'warning')
  } finally {
    isLoading.value = false
  }
}

const forgotPassword = () => {
  showToast('Reset Password', 'Silakan hubungi customer service dbb_luxe untuk bantuan reset kata sandi akun Anda.', 'info')
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #FFFBF2;
}

.auth-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #EFE1C6;
  max-width: 440px;
  width: 100%;
  padding: 36px 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
}

.card-top {
  margin-bottom: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #7A6A55;
  text-decoration: none;
  transition: color 0.15s;
}

.back-link:hover {
  color: #2B2116;
}

.auth-header {
  margin-bottom: 24px;
}

.brand-badge {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #2B2116;
  background: var(--color-secondary, #EFE1C6);
  color: var(--color-primary, #8C6D3F);
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text, #2B2116);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted, #7A6A55);
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
  color: var(--color-text, #2B2116);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 0.78rem;
  color: var(--color-text-muted, #7A6A55);
  text-decoration: none;
}

.forgot-link:hover {
  color: var(--color-primary, #8C6D3F);
  text-decoration: underline;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted, #7A6A55);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary, #EFE1C6);
  background: #ffffff;
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  outline: none;
  transition: border-color 0.2s;
}

.input-wrap input:focus {
  border-color: var(--color-primary, #8C6D3F);
  box-shadow: 0 0 0 3px rgba(140, 109, 63, 0.12);
}

.toggle-eye {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 0.75rem;
  color: var(--color-text-muted, #7A6A55);
  font-weight: 600;
  cursor: pointer;
}

.remember-row {
  display: flex;
  align-items: center;
  margin-top: -2px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
}

.checkbox-label input {
  accent-color: var(--color-primary, #8C6D3F);
  width: 15px;
  height: 15px;
}

.submit-btn {
  margin-top: 6px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #6F5530);
}

.submit-btn:disabled {
  background: var(--color-secondary, #EFE1C6);
  cursor: not-allowed;
}

.bottom-switch {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted, #7A6A55);
  margin-top: 8px;
}

.switch-link {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
  text-decoration: underline;
}
</style>
