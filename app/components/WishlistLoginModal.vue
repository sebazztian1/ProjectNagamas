<template>
  <div v-if="showLoginPrompt" class="modal-backdrop" @click.self="showLoginPrompt = false">
    <div class="wishlist-modal-box" role="dialog" aria-modal="true">
      <button class="close-btn" @click="showLoginPrompt = false" aria-label="Tutup">
        &times;
      </button>

      <div class="modal-body">
        <div class="icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#D32F2F" stroke="#D32F2F" stroke-width="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>

        <h3 class="modal-title">Simpan Wishlist Permanen</h3>
        <p class="modal-desc">
          Barang incaran berhasil disimpan sementara di browser ini. Masuk ke akun <strong>dbb_luxe</strong> Anda agar daftar favorit tersimpan permanen dan dapat diakses dari perangkat mana pun.
        </p>

        <div class="modal-actions">
          <NuxtLink to="/login" class="btn-primary-auth" @click="showLoginPrompt = false">
            Masuk ke Akun
          </NuxtLink>
          <NuxtLink to="/register" class="btn-secondary-auth" @click="showLoginPrompt = false">
            Daftar Akun Baru
          </NuxtLink>
          <button class="btn-guest-continue" @click="showLoginPrompt = false">
            Lanjut Belanja Sebagai Tamu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWishlist } from '../composables/useWishlist'

const { showLoginPrompt } = useWishlist()
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.wishlist-modal-box {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 45px rgba(43, 33, 22, 0.25);
  border: 1px solid rgba(140, 109, 63, 0.2);
  position: relative;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #7A6A55;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.15s;
}

.close-btn:hover {
  color: #2B2116;
  background: rgba(43, 33, 22, 0.06);
}

.modal-body {
  padding: 32px 28px 28px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #FFF1F0;
  border: 1px solid #FFCCC7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: heartPulse 1.8s infinite;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #2B2116;
  margin: 0 0 10px;
}

.modal-desc {
  font-size: 0.88rem;
  line-height: 1.5;
  color: #7A6A55;
  margin: 0 0 24px;
}

.modal-desc strong {
  color: #8C6D3F;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.btn-primary-auth {
  display: block;
  text-align: center;
  background: #8C6D3F;
  color: #ffffff;
  padding: 11px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(140, 109, 63, 0.25);
  transition: all 0.2s;
}

.btn-primary-auth:hover {
  background: #73572E;
  transform: translateY(-1px);
}

.btn-secondary-auth {
  display: block;
  text-align: center;
  background: #FAF8F4;
  border: 1px solid rgba(140, 109, 63, 0.3);
  color: #8C6D3F;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.15s;
}

.btn-secondary-auth:hover {
  background: #EFE1C6;
}

.btn-guest-continue {
  background: transparent;
  border: none;
  color: #9E8E7A;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px;
  transition: color 0.15s;
}

.btn-guest-continue:hover {
  color: #2B2116;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes heartPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
</style>
