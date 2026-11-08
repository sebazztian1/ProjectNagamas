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

      <!-- Registration Form -->
      <div class="auth-header">
        <h1 class="auth-title">Buat Akun</h1>
      </div>

      <!-- Error Summary (role="alert") -->
      <div v-if="errorSummaryList.length > 0" ref="errorSummaryRef" class="error-summary-box" role="alert" tabindex="-1">
        <strong>Mohon periksa kembali data berikut:</strong>
        <ul>
          <li v-for="err in errorSummaryList" :key="err.field">
            <a :href="`#field-${err.field}`" @click.prevent="focusField(err.field)">{{ err.message }}</a>
          </li>
        </ul>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleRegister">
        <!-- Field 1: Username -->
        <div class="form-group">
          <label for="field-username">
            Username <span class="req-tag">(wajib)</span>
          </label>
          <div class="input-wrap">
            <input
              id="field-username"
              v-model="form.username"
              type="text"
              autocomplete="username"
              maxlength="20"
              placeholder="cth: sitirahma_99"
              :aria-invalid="!!fieldErrors.username"
              :aria-describedby="fieldErrors.username ? 'err-username' : 'hint-username'"
              @input="handleUsernameInput"
              @blur="handleUsernameBlur"
            />
            <span v-if="isCheckingUsername" class="input-spinner" aria-hidden="true">…</span>
          </div>
          <span id="hint-username" class="field-hint">
            3-20 karakter: huruf, angka, titik, atau garis bawah
          </span>
          <span
            v-if="usernameAvailableMsg"
            class="field-success"
            aria-live="polite"
          >
            ✓ {{ usernameAvailableMsg }}
          </span>
          <span
            v-if="fieldErrors.username"
            id="err-username"
            class="field-error"
            aria-live="polite"
          >
            {{ fieldErrors.username }}
          </span>
        </div>

        <!-- Field 2: Nomor HP -->
        <div class="form-group">
          <label for="field-phone">
            Nomor HP <span class="req-tag">(wajib)</span>
          </label>
          <div class="phone-input-wrap">
            <span class="phone-prefix" aria-hidden="true">+62</span>
            <input
              id="field-phone"
              v-model="form.phone"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="81234567890"
              :aria-invalid="!!fieldErrors.phone"
              :aria-describedby="fieldErrors.phone ? 'err-phone' : 'hint-phone'"
              @blur="validateField('phone')"
            />
          </div>
          <span id="hint-phone" class="field-hint">
            Contoh: 081234567890. Dipakai admin untuk menghubungi Anda
          </span>
          <span v-if="fieldErrors.phone" id="err-phone" class="field-error">
            {{ fieldErrors.phone }}
          </span>
        </div>

        <!-- Field 3: Kata Sandi -->
        <div class="form-group">
          <label for="field-password">
            Kata sandi <span class="req-tag">(wajib)</span>
          </label>
          <div class="input-wrap">
            <input
              id="field-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              maxlength="128"
              placeholder="Minimal 8 karakter (angka/simbol)"
              :aria-invalid="!!fieldErrors.password"
              :aria-describedby="fieldErrors.password ? 'err-password' : 'hint-password'"
              @blur="validateField('password')"
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
          <span id="hint-password" class="field-hint">
            Minimal 8 karakter dengan minimal 1 angka atau simbol
          </span>
          <span v-if="fieldErrors.password" id="err-password" class="field-error">
            {{ fieldErrors.password }}
          </span>
        </div>

        <div class="sticky-btn-wrap">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading">Mendaftarkan…</span>
            <span v-else>Daftar</span>
          </button>
        </div>

        <div class="bottom-switch">
          Sudah punya akun?
          <NuxtLink to="/login" class="switch-link">Masuk</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

useHead({
  title: 'Buat Akun | dbb_luxe'
})

const { fetchUser } = useAuth()
const { showToast } = useToast()

const showPassword = ref(false)
const isLoading = ref(false)
const isCheckingUsername = ref(false)
const usernameAvailableMsg = ref('')

const errorSummaryRef = ref<HTMLElement | null>(null)

const form = reactive({
  username: '',
  phone: '',
  password: ''
})

const fieldErrors = reactive<Record<string, string>>({
  username: '',
  phone: '',
  password: ''
})

// Username check with 400ms debounce
let usernameTimer: ReturnType<typeof setTimeout> | null = null

const handleUsernameInput = () => {
  usernameAvailableMsg.value = ''
  if (usernameTimer) clearTimeout(usernameTimer)

  const val = form.username.trim()
  if (!val) {
    fieldErrors.username = ''
    return
  }

  usernameTimer = setTimeout(() => {
    checkUsernameAvailability(val)
  }, 400)
}

const handleUsernameBlur = () => {
  validateField('username')
  const val = form.username.trim()
  if (val.length >= 3 && !fieldErrors.username) {
    checkUsernameAvailability(val)
  }
}

const checkUsernameAvailability = async (u: string) => {
  isCheckingUsername.value = true
  try {
    const res = await $fetch<{ available: boolean; message?: string }>('/api/auth/check-username', {
      query: { username: u }
    })
    if (!res.available) {
      fieldErrors.username = res.message || 'Username sudah dipakai, coba yang lain'
      usernameAvailableMsg.value = ''
    } else {
      fieldErrors.username = ''
      usernameAvailableMsg.value = res.message || 'Username tersedia'
    }
  } catch (err: any) {
    fieldErrors.username = err?.data?.message || 'Username tidak tersedia'
    usernameAvailableMsg.value = ''
  } finally {
    isCheckingUsername.value = false
  }
}

const validateField = (field: string): boolean => {
  if (field === 'username') {
    const val = form.username.trim()
    if (!val) {
      fieldErrors.username = 'Username wajib diisi'
      return false
    }
    if (val.length < 3 || val.length > 20 || !/^[a-zA-Z0-9._]+$/.test(val)) {
      fieldErrors.username = 'Gunakan huruf, angka, titik, atau garis bawah (3-20 karakter)'
      return false
    }
    if (/^[._]/.test(val) || /[._]$/.test(val)) {
      fieldErrors.username = 'Username tidak boleh diawali atau diakhiri titik atau garis bawah'
      return false
    }
    if (/[._]{2,}/.test(val)) {
      fieldErrors.username = 'Username tidak boleh memuat dua tanda khusus berurutan'
      return false
    }
    if (/^\d+$/.test(val)) {
      fieldErrors.username = 'Username tidak boleh hanya terdiri dari angka'
      return false
    }
    if (/\d{8,}/.test(val)) {
      fieldErrors.username = 'Username tidak boleh memuat deretan nomor telepon'
      return false
    }
    fieldErrors.username = ''
    return true
  }

  if (field === 'phone') {
    const cleaned = form.phone.trim().replace(/[\s\-\(\)\.]/g, '')
    if (!cleaned) {
      fieldErrors.phone = 'Nomor HP wajib diisi'
      return false
    }
    const pattern = /^(\+62|62|0)?8[1-9][0-9]{6,11}$/
    if (!pattern.test(cleaned)) {
      fieldErrors.phone = 'Masukkan nomor HP Indonesia yang valid'
      return false
    }
    fieldErrors.phone = ''
    return true
  }

  if (field === 'password') {
    const p = form.password
    if (!p) {
      fieldErrors.password = 'Kata sandi wajib diisi'
      return false
    }
    const len = Array.from(p).length
    if (len < 8) {
      fieldErrors.password = 'Kata sandi minimal 8 karakter'
      return false
    }
    if (len > 128) {
      fieldErrors.password = 'Kata sandi maksimal 128 karakter'
      return false
    }
    if (!/[^a-zA-Z\s]/.test(p)) {
      fieldErrors.password = 'Kata sandi harus mengandung minimal 1 angka atau simbol'
      return false
    }
    fieldErrors.password = ''
    return true
  }

  return true
}

const validateAll = (): boolean => {
  const f1 = validateField('username')
  const f2 = validateField('phone')
  const f3 = validateField('password')
  return f1 && f2 && f3 && !fieldErrors.username
}

const errorSummaryList = computed(() => {
  const list: { field: string; message: string }[] = []
  if (fieldErrors.username) list.push({ field: 'username', message: fieldErrors.username })
  if (fieldErrors.phone) list.push({ field: 'phone', message: fieldErrors.phone })
  if (fieldErrors.password) list.push({ field: 'password', message: fieldErrors.password })
  return list
})

const focusField = (field: string) => {
  const el = document.getElementById(`field-${field}`)
  if (el) {
    el.focus()
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const handleRegister = async () => {
  if (!validateAll()) {
    await nextTick()
    const firstInvalid = errorSummaryList.value[0]?.field
    if (firstInvalid) {
      focusField(firstInvalid)
    } else {
      errorSummaryRef.value?.focus()
    }
    return
  }

  isLoading.value = true
  try {
    await $fetch<{
      success: boolean
      recoveryCode?: string
      user: any
    }>('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.username.trim(),
        phone: form.phone.trim(),
        password: form.password
      }
    })

    await fetchUser()
    showToast('Pendaftaran Berhasil', 'Akun Anda berhasil dibuat. Selamat datang!', 'success')
    navigateTo('/')
  } catch (err: any) {
    const message = err?.data?.message || err?.message || 'Gagal mendaftarkan akun. Periksa data Anda.'
    showToast('Pendaftaran Gagal', message, 'warning')
    if (message.includes('Username')) {
      fieldErrors.username = message
      focusField('username')
    } else if (message.includes('Nomor')) {
      fieldErrors.phone = message
      focusField('phone')
    } else if (message.includes('Kata sandi')) {
      fieldErrors.password = message
      focusField('password')
    }
  } finally {
    isLoading.value = false
  }
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
  margin-bottom: 20px;
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

.error-summary-box {
  background: #FEF2F2;
  border: 1.5px solid #DC2626;
  color: #991B1B;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 0.86rem;
}

.error-summary-box strong {
  display: block;
  margin-bottom: 6px;
}

.error-summary-box ul {
  margin: 0;
  padding-left: 18px;
}

.error-summary-box a {
  color: #991B1B;
  font-weight: 700;
  text-decoration: underline;
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

.input-spinner {
  position: absolute;
  right: 14px;
  color: #8C6D3F;
  font-weight: 800;
}

/* Phone input with fixed +62 prefix label */
.phone-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #9E8C72;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  min-height: 48px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.phone-input-wrap:focus-within {
  border-color: #8C6D3F;
  box-shadow: 0 0 0 3px rgba(140, 109, 63, 0.28);
}

.phone-prefix {
  padding: 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #5C4E3C;
  background: #F7EEDC;
  min-height: 48px;
  display: flex;
  align-items: center;
  border-right: 1.5px solid #9E8C72;
  user-select: none;
}

.phone-input-wrap input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: none;
  font-size: 1rem;
  color: #221A11;
  outline: none;
  background: transparent;
  box-sizing: border-box;
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

.field-success {
  font-size: 0.82rem;
  font-weight: 700;
  color: #166534;
}

.field-error {
  font-size: 0.84rem;
  font-weight: 700;
  color: #B91C1C;
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

@media (max-width: 600px) {
  .auth-page {
    padding: 20px 12px 90px;
  }

  .auth-card {
    border: none;
    box-shadow: none;
    padding: 20px 10px;
  }

  .sticky-btn-wrap {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ffffff;
    border-top: 1px solid #EFE1C6;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
    z-index: 100;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  }
}
</style>
