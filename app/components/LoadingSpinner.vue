<script setup lang="ts">
defineProps<{ fullscreen?: boolean }>()
</script>

<template>
  <span class="indicator" :class="{ screen: fullscreen }" role="status" aria-live="polite">
    <i aria-hidden="true" />{{ fullscreen ? 'Memuat...' : 'Memproses...' }}
  </span>
</template>

<style scoped>
.indicator { display: inline-flex; align-items: center; justify-content: center; gap: .55em; }
i { width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 1.2s linear infinite; }
.screen { position: fixed; inset: 0; z-index: 9999; color: #74583b; background: #fffbf2; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { i { animation: none; } }
</style>
