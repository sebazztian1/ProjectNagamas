<template>
  <div class="app-root">
    <!-- Navbar Component (Rendered for Customer & Public Pages) -->
    <Navbar v-if="!isAdminRoute" />

    <!-- Active Route Page View -->
    <main class="content-wrapper">
      <NuxtPage />
    </main>

    <!-- Footer for Customer & Public Pages -->
    <Footer v-if="!isAdminRoute" />

    <!-- Floating Customer to Admin Live Chat Mockup Widget -->
    <CustomerChatWidget v-if="!isAdminRoute" />

    <!-- Global Toast Notifications -->
    <ToastNotification :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import CustomerChatWidget from './components/CustomerChatWidget.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useToast } from './composables/useToast'

const route = useRoute()
const { toasts, removeToast } = useToast()

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})
</script>

<style>
:root {
  /* Slate Blue & Cloud Grey Theme Tokens */
  --color-primary: #4A5D73;
  --color-primary-hover: #384759;
  --color-primary-light: #EBF0F5;
  --color-secondary: #E4E7EB;
  --color-secondary-dark: #CBD2D9;
  
  --color-canvas: #F4F6F8;
  --color-surface: #FFFFFF;
  --color-text: #1E293B;
  --color-text-muted: #64748B;
  
  /* Status & Indicators */
  --color-ready: #059669;
  --color-ready-bg: #DCFCE7;
  --color-jastip: #4A5D73;
  --color-jastip-bg: #E4E7EB;
  --color-warning: #D97706;
  --color-warning-bg: #FEF3C7;
  --color-danger: #DC2626;
  --color-danger-bg: #FEE2E2;

  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--color-text);
  background-color: var(--color-canvas);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
}

/* Common UI Helpers */
a {
  color: inherit;
}
</style>
