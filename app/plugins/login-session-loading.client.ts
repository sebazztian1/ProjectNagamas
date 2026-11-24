import { createApp, h, nextTick, watch } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useDelayedLoading } from '../composables/useDelayedLoading'

export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    const { isInitialized } = useAuth()
    if (isInitialized.value || !/\/login\/?$/.test(location.pathname)) return
    const host = document.createElement('div')
    document.body.appendChild(host)
    const overlay = createApp({
      setup() {
        const visible = useDelayedLoading(() => !isInitialized.value)
        watch(() => isInitialized.value && !visible.value, done => {
          if (done) nextTick(() => { overlay.unmount(); host.remove() })
        })
        return () => visible.value ? h(LoadingSpinner, { fullscreen: true, 'aria-busy': true }) : null
      }
    })
    overlay.mount(host)
  }
})
