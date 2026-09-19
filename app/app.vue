<template>
  <div class="app-root">
    <!-- Navbar Component (Rendered for Customer Pages) -->
    <Navbar v-if="!isAdminRoute" />

    <!-- Active Route Page View -->
    <NuxtPage />

    <!-- Floating Customer to Admin Live Chat Mockup Widget -->
    <CustomerChatWidget v-if="!isAdminRoute" />

    <!-- Global Toast Notifications -->
    <ToastNotification :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Navbar from './components/Navbar.vue'
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
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #0f172a;
  background-color: #f8fafc;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #f8fafc;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
