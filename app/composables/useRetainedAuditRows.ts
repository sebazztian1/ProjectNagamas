import { computed, ref, watchEffect } from 'vue'

// Advance the server's cutoff while a table, preview, or download stays open.
export function useRetainedAuditRows<T extends { createdAt: string }>(source: () => T[], window: () => string | undefined) {
  const tick = ref(0)
  let anchor = 0
  let lastCutoff: string | undefined
  const rows = computed(() => {
    const cutoff = window()
    if (lastCutoff !== cutoff) {
      lastCutoff = cutoff
      anchor = Date.now()
    }
    const bound = Date.parse(cutoff ?? '') + Math.max(0, Date.now() - anchor)
    void tick.value
    return source().filter(row => Date.parse(row.createdAt) >= bound)
  })
  if (import.meta.client) watchEffect(cleanup => {
    const values = rows.value
    if (!values.length) return
    const earliest = values.reduce((min, row) => Math.min(min, Date.parse(row.createdAt)), Infinity)
    const delay = earliest - Date.parse(lastCutoff!) - (Date.now() - anchor) + 1
    const timer = setTimeout(() => tick.value++, Math.max(1, Math.min(2147483647, delay)))
    cleanup(() => clearTimeout(timer))
  })
  return rows
}
