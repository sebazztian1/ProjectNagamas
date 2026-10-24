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
            <label for="login-identifier">Username atau No. WhatsApp</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                id="login-identifier" 
                v-model="loginForm.identifier"
                type="text" 
                placeholder="Contoh: sitirahma atau 081234567890" 
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
            <p>Daftarkan akun cukup dengan username dan nomor WhatsApp Anda.</p>
          </div>

          <div class="form-group">
            <label for="modal-reg-username">Username</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                id="modal-reg-username" 
                v-model="registerForm.username"
                type="text" 
                placeholder="Contoh: sitirahma" 
                minlength="3"
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="modal-reg-phone">Nomor WhatsApp</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <input 
                id="modal-reg-phone" 
                v-model="registerForm.phone"
                type="tel" 
                placeholder="Contoh: 081234567890" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="modal-reg-pass">Kata Sandi</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                id="modal-reg-pass" 
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Minimal 6 karakter" 
                minlength="6"
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="modal-reg-confirm-pass">Konfirmasi Kata Sandi</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                id="modal-reg-confirm-pass" 
                v-model="registerForm.confirmPassword"
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Ulangi kata sandi Anda" 
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
import { useAuth } from '../composables/useAuth'

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
  (e: 'loginSuccess', user: { username: string; phone_number: string }): void
  (e: 'toast', payload: { title: string; message: string; type: 'success' | 'info' | 'warning' }): void
}>()

const { login, register } = useAuth()

const currentTab = ref<'login' | 'register'>(props.initialTab)
const showPassword = ref(false)
const isLoading = ref(false)

const loginForm = reactive({
  identifier: '',
  password: '',
  rememberMe: true
})

const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: true
})

const handleLogin = async () => {
  isLoading.value = true
  try {
    const user = await login({
      identifier: loginForm.identifier,
      password: loginForm.password
    })

    emit('loginSuccess', {
      username: user.username,
      phone_number: user.phone_number
    })
    emit('toast', {
      title: 'Berhasil Masuk',
      message: `Selamat datang kembali, ${user.username}!`,
      type: 'success'
    })
    emit('close')
  } catch (err: any) {
    const message = err?.data?.message || err?.message || 'Username / No. WhatsApp atau kata sandi tidak cocok'
    emit('toast', {
      title: 'Gagal Masuk',
      message,
      type: 'warning'
    })
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    emit('toast', {
      title: 'Kata Sandi Tidak Cocok',
      message: 'Konfirmasi kata sandi harus sama dengan kata sandi baru.',
      type: 'warning'
    })
    return
  }

  isLoading.value = true
  try {
    const user = await register({
      username: registerForm.username,
      phone_number: registerForm.phone,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword
    })

    emit('loginSuccess', {
      username: user.username,
      phone_number: user.phone_number
    })
    emit('toast', {
      title: 'Pendaftaran Berhasil',
      message: `Akun Anda berhasil dibuat. Selamat datang, ${user.username}!`,
      type: 'success'
    })
    emit('close')
  } catch (err: any) {
    const message = err?.data?.message || err?.message || 'Gagal mendaftar akun'
    emit('toast', {
      title: 'Pendaftaran Gagal',
      message,
      type: 'warning'
    })
  } finally {
    isLoading.value = false
  }
}

const forgotPassword = () => {
  emit('toast', {
    title: 'Lupa Kata Sandi',
    message: 'Silakan hubungi customer service dbb_luxe untuk bantuan reset kata sandi akun Anda.',
    type: 'info'
  })
}
</script>

<style scoped>
.auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 20, 12, 0.65);
  backdrop-filter: blur(6px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-modal {
  background: #ffffff;
  border-radius: var(--radius-md, 16px);
  border: 1px solid var(--brand-primary, #EFE1C6);
  max-width: 440px;
  width: 100%;
  position: relative;
  box-shadow: var(--shadow-lg, 0 20px 48px rgba(43, 33, 22, 0.18));
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-primary, #EFE1C6);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--brand-accent, #8C6D3F);
  z-index: 10;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--brand-accent, #8C6D3F);
  color: #FFFBF2;
}

/* Tabs */
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--brand-primary, #EFE1C6);
  background: var(--brand-neutral, #FFFBF2);
}

.tab-btn {
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-muted, #7A6A55);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--brand-accent, #8C6D3F);
}

.tab-btn.active {
  background: #ffffff;
  color: var(--brand-accent, #8C6D3F);
  border-bottom-color: var(--brand-accent, #8C6D3F);
}

/* Body */
.auth-body {
  padding: 28px 24px 24px;
}

.form-header {
  margin-bottom: 20px;
}

.form-header h3 {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.4rem;
  color: var(--color-text, #2B2116);
  margin-bottom: 4px;
}

.form-header p {
  font-size: 0.85rem;
  color: var(--color-text-muted, #7A6A55);
  line-height: 1.5;
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
  color: var(--brand-accent, #8C6D3F);
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
  color: var(--brand-secondary, #D8B978);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 11px 14px 11px 38px;
  border-radius: 8px;
  border: 1px solid var(--brand-primary, #EFE1C6);
  background: #ffffff;
  font-size: 0.88rem;
  color: var(--color-text, #2B2116);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrap input:focus {
  border-color: var(--brand-secondary, #D8B978);
  box-shadow: 0 0 0 3px rgba(216, 185, 120, 0.25);
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
  margin-top: 2px;
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
  accent-color: var(--brand-accent, #8C6D3F);
  width: 15px;
  height: 15px;
}

.submit-btn {
  margin-top: 10px;
  background: var(--brand-accent, #8C6D3F);
  color: #FFFBF2;
  border: 1px solid var(--brand-secondary, #D8B978);
  border-radius: var(--radius-full, 999px);
  padding: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #73572E);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -2px rgba(140, 109, 63, 0.35);
}

.submit-btn:disabled {
  background: var(--brand-primary, #EFE1C6);
  color: var(--color-text-muted, #7A6A55);
  cursor: not-allowed;
}

.switch-prompt {
  text-align: center;
  font-size: 0.82rem;
  color: var(--color-text-muted, #7A6A55);
  margin-top: 8px;
}

.switch-link {
  background: none;
  border: none;
  color: var(--brand-accent, #8C6D3F);
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 0.82rem;
}

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
