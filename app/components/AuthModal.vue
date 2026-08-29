<template>
  <div class="auth-backdrop" @click.self="$emit('close')">
    <div class="auth-modal" role="dialog" aria-modal="true">
      <!-- Close button -->
      <button class="close-btn" @click="$emit('close')" aria-label="Tutup">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Header Tabs -->
      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'login' }"
          @click="currentTab = 'login'"
        >
          Masuk
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'register' }"
          @click="currentTab = 'register'"
        >
          Daftar Akun
        </button>
      </div>

      <!-- Form Body -->
      <div class="auth-body">
        <!-- LOGIN FORM -->
        <form v-if="currentTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-header">
            <h3>Selamat Datang Kembali</h3>
            <p>Masuk ke akun Anda untuk pengalaman belanja yang lebih personal.</p>
          </div>

          <div class="form-group">
            <label for="login-email">Email atau No. WhatsApp</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <input 
                id="login-email" 
                v-model="loginForm.email"
                type="text" 
                placeholder="nama@email.com" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="login-pass">Kata Sandi</label>
              <a href="#" @click.prevent="forgotPassword" class="forgot-link">Lupa sandi?</a>
            </div>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                id="login-pass" 
                v-model="loginForm.password"
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
              <input type="checkbox" v-model="loginForm.rememberMe" />
              <span>Ingat saya di perangkat ini</span>
            </label>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Memproses...</span>
            <span v-else>Masuk Sekarang</span>
          </button>

          <div class="switch-prompt">
            Belum punya akun? 
            <button type="button" class="switch-link" @click="currentTab = 'register'">Daftar gratis</button>
          </div>
        </form>

        <!-- REGISTER FORM -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-header">
            <h3>Buat Akun Baru</h3>
            <p>Daftarkan akun untuk mendapatkan info katalog terbaru dan promo khusus.</p>
          </div>

          <div class="form-group">
            <label for="reg-name">Nama Lengkap</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                id="reg-name" 
                v-model="registerForm.name"
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
                v-model="registerForm.email"
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
                v-model="registerForm.phone"
                type="tel" 
                placeholder="08123456789" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="reg-pass">Kata Sandi</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                id="reg-pass" 
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Minimal 6 karakter" 
                minlength="6"
                required 
              />
            </div>
          </div>

          <div class="remember-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="registerForm.agreeTerms" required />
              <span>Saya menyetujui Syarat & Ketentuan Layanan</span>
            </label>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Mendaftarkan...</span>
            <span v-else>Daftar Sekarang</span>
          </button>

          <div class="switch-prompt">
            Sudah memiliki akun? 
            <button type="button" class="switch-link" @click="currentTab = 'login'">Masuk di sini</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = withDefaults(
  defineProps<{
    initialTab?: 'login' | 'register'
  }>(),
  {
    initialTab: 'login'
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'loginSuccess', user: { name: string; email: string }): void
  (e: 'toast', payload: { title: string; message: string; type: 'success' | 'info' | 'warning' }): void
}>()

const currentTab = ref<'login' | 'register'>(props.initialTab)
const showPassword = ref(false)
const isLoading = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: true
})

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  agreeTerms: true
})

const handleLogin = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    const username = loginForm.email.split('@')[0] || 'Pengguna'
    const capitalized = username.charAt(0).toUpperCase() + username.slice(1)
    
    emit('loginSuccess', {
      name: capitalized,
      email: loginForm.email
    })
    emit('toast', {
      title: 'Berhasil Masuk',
      message: `Selamat datang kembali, ${capitalized}!`,
      type: 'success'
    })
    emit('close')
  }, 600)
}

const handleRegister = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    emit('loginSuccess', {
      name: registerForm.name,
      email: registerForm.email
    })
    emit('toast', {
      title: 'Pendaftaran Berhasil',
      message: `Akun Anda berhasil dibuat. Selamat datang, ${registerForm.name}!`,
      type: 'success'
    })
    emit('close')
  }, 600)
}

const forgotPassword = () => {
  emit('toast', {
    title: 'Lupa Kata Sandi',
    message: 'Tautan reset sandi telah dikirimkan ke email/nomor Anda.',
    type: 'info'
  })
}
</script>

<style scoped>
.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-modal {
  background: #ffffff;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  z-index: 10;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #0f172a;
  color: #ffffff;
}

/* Tabs */
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-btn {
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  background: #ffffff;
  color: #0f172a;
  border-bottom-color: #0f172a;
}

/* Body */
.auth-body {
  padding: 24px;
}

.form-header {
  margin-bottom: 20px;
}

.form-header h3 {
  font-size: 1.25rem;
  color: #0f172a;
  margin-bottom: 4px;
}

.form-header p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 0.78rem;
  color: #64748b;
  text-decoration: none;
}

.forgot-link:hover {
  color: #0f172a;
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

.remember-row {
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
}

.checkbox-label input {
  accent-color: #0f172a;
  width: 15px;
  height: 15px;
}

.submit-btn {
  margin-top: 8px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.9rem;
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

.switch-prompt {
  text-align: center;
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 6px;
}

.switch-link {
  background: none;
  border: none;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 0.82rem;
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
