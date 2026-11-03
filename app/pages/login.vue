<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Back Link -->
      <div class="card-top">
        <NuxtLink to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Kembali ke Katalog
        </NuxtLink>
      </div>

      <!-- State A: Normal Login -->
      <div v-if="!showForgotFlow">
        <div class="auth-header">
          <h1 class="auth-title">Masuk</h1>
        </div>

        <!-- Generic Error Alert (design-password_spec.md Section 4 & 12) -->
        <div v-if="loginError" class="login-error-banner" role="alert">
          {{ loginError }}
        </div>

        <form class="auth-form" novalidate @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="field-identifier">
              Username atau nomor HP <span class="req-tag">(wajib)</span>
            </label>
            <div class="input-wrap">
              <input
                id="field-identifier"
                v-model="form.identifier"
                type="text"
                autocomplete="username"
                placeholder="Username atau nomor HP"
                required
                :aria-invalid="!!loginError"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="field-login-password">
                Kata sandi <span class="req-tag">(wajib)</span>
              </label>
              <button type="button" class="forgot-link-btn" @click="showForgotFlow = true">
                Lupa kata sandi?
              </button>
            </div>
            <div class="input-wrap">
              <input
                id="field-login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Kata sandi akun Anda"
                required
                :aria-invalid="!!loginError"
              />
              <button
                type="button"
                class="toggle-eye"
                :aria-pressed="showPassword"
                :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Memproses…</span>
            <span v-else>Masuk</span>
          </button>

          <div class="bottom-switch">
            Belum punya akun?
            <NuxtLink to="/register" class="switch-link">Daftar</NuxtLink>
          </div>
        </form>
      </div>

      <!-- State B: Password Reset Flow (Recovery Code / Admin Assist - Section 7 & 8) -->
      <div v-else class="reset-flow">
        <div class="auth-header">
          <h1 class="auth-title">Pemulihan Akun</h1>
          <p class="auth-subtitle">
            Masukkan username atau nomor HP, kode pemulihan, dan kata sandi baru.
          </p>
        </div>

        <div v-if="resetSuccess" class="reset-success-box" role="status">
          <strong>✓ Kata sandi berhasil diubah</strong>
          <p>Kode pemulihan baru Anda:</p>
          <div class="code-box-mini">{{ newRecoveryCode }}</div>
          <p class="code-save-hint">Simpan kode baru ini untuk keperluan pemulihan berikutnya.</p>
          <button type="button" class="submit-btn" @click="returnToLogin">
            Masuk dengan Kata Sandi Baru
          </button>
        </div>

        <form v-else class="auth-form" novalidate @submit.prevent="handleResetPassword">
          <div v-if="resetError" class="login-error-banner" role="alert">
            {{ resetError }}
          </div>

          <div class="form-group">
            <label for="field-reset-identifier">
              Username atau nomor HP <span class="req-tag">(wajib)</span>
            </label>
            <div class="input-wrap">
              <input
                id="field-reset-identifier"
                v-model="resetForm.identifier"
                type="text"
                placeholder="Username atau nomor HP terdaftar"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="field-recovery-code">
              Kode pemulihan <span class="req-tag">(wajib)</span>
            </label>
            <div class="input-wrap">
              <input
                id="field-recovery-code"
                v-model="resetForm.recoveryCode"
                type="text"
                placeholder="Contoh: K7M2-9QXD-4TPA"
                required
              />
            </div>
            <span class="field-hint">12 karakter yang diberikan saat pendaftaran akun.</span>
          </div>

          <div class="form-group">
            <label for="field-new-password">
              Kata sandi baru <span class="req-tag">(wajib)</span>
            </label>
            <div class="input-wrap">
              <input
                id="field-new-password"
                v-model="resetForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Minimal 12 karakter"
                required
              />
              <button
                type="button"
                class="toggle-eye"
                :aria-pressed="showNewPassword"
                @click="showNewPassword = !showNewPassword"
              >
                {{ showNewPassword ? 'Sembunyikan' : 'Tampilkan' }}
              </button>
            </div>
            <span class="field-hint">Minimal 12 karakter. Boleh pakai kalimat.</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="isResetting">
            <span v-if="isResetting">Memproses…</span>
            <span v-else>Ubah Kata Sandi</span>
          </button>

          <!-- Backup Reset: Admin Assisted -->
          <div class="admin-assist-card">
            <strong>Tidak punya kode pemulihan?</strong>
            <p>Hubungi admin melalui chat WhatsApp resmi toko untuk konfirmasi data pesanan Anda.</p>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20dbb_luxe,%20saya%20memerlukan%20bantuan%20reset%20kata%20sandi%20akun."
              target="_blank"
              rel="noopener noreferrer"
              class="btn-wa-assist"
            >
              💬 Hubungi Admin via WhatsApp
            </a>
          </div>

          <div class="bottom-switch">
            <button type="button" class="btn-cancel-reset" @click="showForgotFlow = false">
              &larr; Kembali ke halaman Masuk
            </button>
          </div>
        </form>
      </div>
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
const showNewPassword = ref(false)
const isLoading = ref(false)
const loginError = ref('')

const showForgotFlow = ref(false)
const isResetting = ref(false)
const resetError = ref('')
const resetSuccess = ref(false)
const newRecoveryCode = ref('')

const form = reactive({
  identifier: '',
  password: ''
})

const resetForm = reactive({
  identifier: '',
  recoveryCode: '',
  newPassword: ''
})

const handleLogin = async () => {
  loginError.value = ''
  if (!form.identifier.trim() || !form.password) {
    loginError.value = 'Username atau kata sandi salah'
    return
  }

  isLoading.value = true
  try {
    const user = await login({
      identifier: form.identifier.trim(),
      password: form.password
    })

    showToast('Berhasil Masuk', `Selamat datang kembali, ${user.username}!`, 'success')

    if (user.role === 'admin' || user.role === 'staff') {
      navigateTo('/admin')
    } else if (route.query.redirect && typeof route.query.redirect === 'string') {
      navigateTo(route.query.redirect)
    } else {
      navigateTo('/')
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Username atau kata sandi salah'
    loginError.value = msg
    showToast('Gagal Masuk', msg, 'warning')
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  resetError.value = ''
  if (!resetForm.identifier.trim() || !resetForm.recoveryCode.trim() || !resetForm.newPassword) {
    resetError.value = 'Harap lengkapi semua kolom.'
    return
  }

  isResetting.value = true
  try {
    const res = await $fetch<{
      success: boolean
      message: string
      newRecoveryCode: string
    }>('/api/auth/reset-password', {
      method: 'POST',
      body: {
        identifier: resetForm.identifier.trim(),
        recoveryCode: resetForm.recoveryCode.trim(),
        newPassword: resetForm.newPassword
      }
    })

    resetSuccess.value = true
    newRecoveryCode.value = res.newRecoveryCode
    showToast('Kata Sandi Diubah', 'Kata sandi berhasil diubah. Silakan catat kode pemulihan baru Anda.', 'success')
  } catch (err: any) {
    resetError.value = err?.data?.message || 'Kode pemulihan tidak cocok'
    showToast('Gagal Reset', resetError.value, 'warning')
  } finally {
    isResetting.value = false
  }
}

const returnToLogin = () => {
  showForgotFlow.value = false
  resetSuccess.value = false
  form.identifier = resetForm.identifier
  form.password = ''
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100dvh - 80px);
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
  padding: 36px 30px;
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
}

.back-link:hover {
  color: #2B2116;
}

.auth-header {
  margin-bottom: 24px;
}

.auth-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: #2B2116;
  margin: 0 0 6px;
  letter-spacing: -0.3px;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: #7A6A55;
  margin: 0;
  line-height: 1.45;
}

.login-error-banner {
  background: #FEF2F2;
  border: 1.5px solid #DC2626;
  color: #991B1B;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 18px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #221A11;
}

.req-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: #8C6D3F;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: #7A6A55;
  cursor: pointer;
  padding: 0;
}

.forgot-link-btn:hover {
  color: #8C6D3F;
  text-decoration: underline;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1.5px solid #9E8C72;
  font-size: 1rem;
  color: #221A11;
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input-wrap input:focus {
  border-color: #8C6D3F;
  box-shadow: 0 0 0 3px rgba(140, 109, 63, 0.28);
}

.input-wrap input[aria-invalid="true"] {
  border-color: #DC2626;
}

.toggle-eye {
  position: absolute;
  right: 6px;
  min-width: 44px;
  min-height: 44px;
  background: none;
  border: none;
  padding: 8px 10px;
  font-size: 0.8rem;
  color: #7A6A55;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-eye:hover {
  color: #2B2116;
}

.field-hint {
  font-size: 0.8rem;
  color: #5C4E3C;
  line-height: 1.4;
}

.submit-btn {
  width: 100%;
  min-height: 48px;
  background: var(--color-primary, #8C6D3F);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover, #6F5530);
}

.submit-btn:disabled {
  background: #EFE1C6;
  color: #9C8C77;
  cursor: not-allowed;
}

.bottom-switch {
  text-align: center;
  font-size: 0.88rem;
  color: #7A6A55;
  margin-top: 4px;
}

.switch-link {
  color: var(--color-primary, #8C6D3F);
  font-weight: 700;
  text-decoration: underline;
}

/* Reset Flow */
.reset-flow {
  display: flex;
  flex-direction: column;
}

.reset-success-box {
  background: #F0FDF4;
  border: 1.5px solid #22C55E;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  color: #15803D;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reset-success-box strong {
  font-size: 1.1rem;
}

.code-box-mini {
  background: #ffffff;
  border: 2px dashed #15803D;
  border-radius: 8px;
  padding: 12px;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  font-family: monospace;
}

.code-save-hint {
  font-size: 0.8rem;
  color: #4B5563;
  margin: 0;
}

.admin-assist-card {
  margin-top: 6px;
  background: #FFFDF8;
  border: 1px solid #EFE1C6;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.82rem;
  color: #7A6A55;
  line-height: 1.45;
  text-align: center;
}

.admin-assist-card strong {
  display: block;
  color: #2B2116;
  margin-bottom: 4px;
}

.btn-wa-assist {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 14px;
  background: #25D366;
  color: #ffffff;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.82rem;
}

.btn-cancel-reset {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  color: #8C6D3F;
  cursor: pointer;
}

.btn-cancel-reset:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .auth-page {
    padding: 20px 12px 60px;
  }

  .auth-card {
    border: none;
    box-shadow: none;
    padding: 20px 10px;
  }
}
</style>
