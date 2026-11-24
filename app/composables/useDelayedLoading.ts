import { onMounted, onScopeDispose, ref, watch } from 'vue'

export function useDelayedLoading(loading: () => boolean) {
  const visible = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let shownAt = 0
  onMounted(() => {
    watch(loading, busy => {
      clearTimeout(timer)
      if (busy && !visible.value) {
        timer = setTimeout(() => {
          shownAt = Date.now()
          visible.value = true
        }, 180)
      } else if (!busy && visible.value) {
        timer = setTimeout(() => { visible.value = false }, Math.max(0, 300 - (Date.now() - shownAt)))
      }
    }, { immediate: true, flush: 'sync' })
  })
  onScopeDispose(() => clearTimeout(timer))
  return visible
}
