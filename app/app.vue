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
    <CustomerChatWidget v-if="showChatWidget" />

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

const isAuthRoute = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

const showChatWidget = computed(() => {
  return !isAdminRoute.value && !isAuthRoute.value && route.path !== '/chat'
})
</script>

<style>
:root {
  /* ===== dbb_luxe Requested Exact Palette ===== */
  --brand-primary: #EFE1C6;    /* 1. Primary (HEX EFE1C6) - Warm cream surface / card soft fill */
  --brand-secondary: #D8B978;  /* 2. Secondary (HEX D8B978) - Warm champagne gold highlight / active border */
  --brand-accent: #8C6D3F;     /* 3. Accent (HEX 8C6D3F) - Deep bronze / cognac primary action */
  --brand-neutral: #FFFBF2;    /* 4. Neutral/White (HEX FFFBF2) - Warm ivory page canvas */

  /* ===== Functional tokens for clean & proper UI ===== */
  --color-primary: var(--brand-accent);
  --color-primary-hover: #73572E;
  --color-primary-light: #F7EEDC;
  --color-secondary: var(--brand-primary);
  --color-secondary-dark: var(--brand-secondary);
  --color-gold: var(--brand-secondary);

  --color-canvas: var(--brand-neutral);
  --color-surface: #FFFFFF;
  --color-surface-subtle: #FDF9F0;
  --color-border: #EFE1C6;
  --color-border-hover: #D8B978;
  --color-text: #2B2116;
  --color-text-muted: #7A6A55;
  --color-text-light: #9E8C76;

  /* Status & Indicators (harmonized with warm palette) */
  --color-ready: #3B6E48;
  --color-ready-bg: #EAEFE7;
  --color-jastip: var(--brand-accent);
  --color-jastip-bg: #F5EBD8;
  --color-warning: #9C6818;
  --color-warning-bg: #FDF4E5;
  --color-danger: #A33A2A;
  --color-danger-bg: #FBECE8;

  /* Elevation & shapes: rounder, smoother, cleaner */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  
  --shadow-subtle: 0 2px 10px rgba(140, 109, 63, 0.04);
  --shadow-sm: 0 4px 16px -2px rgba(140, 109, 63, 0.06);
  --shadow-md: 0 10px 30px -6px rgba(140, 109, 63, 0.10);
  --shadow-lg: 0 20px 48px -12px rgba(140, 109, 63, 0.16);

  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Cormorant Garamond', Georgia, serif;

  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-canvas);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-text);
  font-size: 15px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Elegant display headings with proper breathing room */
h1, h2,
.page-title,
.section-title,
.trip-title,
.order-heading {
  font-family: var(--font-display);
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  color: var(--color-text);
  line-height: 1.2;
}

h1, .page-title { 
  font-size: clamp(2.1rem, 3.2vw, 2.75rem) !important; 
  margin-bottom: 8px;
}

h2, .section-title { 
  font-size: clamp(1.75rem, 2.5vw, 2.3rem) !important; 
  margin-bottom: 6px;
}

h3, h4 {
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.page-subtitle,
.section-desc {
  color: var(--color-text-muted);
  line-height: 1.75 !important;
  max-width: 680px;
  font-size: 0.95rem;
}

/* Page containers with proper breathing room */
.page-header {
  margin-bottom: 40px !important;
}

.breadcrumb {
  margin-bottom: 24px !important;
  letter-spacing: 0.02em;
  font-size: 0.86rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb a {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb a:hover {
  color: var(--brand-accent);
}

.breadcrumb .active {
  color: var(--brand-accent);
  font-weight: 600;
}

button, input, select, textarea {
  font-family: inherit;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--brand-secondary);
  outline-offset: 2px;
}

::selection {
  background: var(--brand-secondary);
  color: #2B2116;
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
}

a {
  color: inherit;
}

img {
  max-width: 100%;
  display: block;
}
</style>
