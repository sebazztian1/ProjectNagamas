import { onMounted, onBeforeUnmount } from 'vue'

const STOCK_SYNC_CHANNEL = 'dbb_product_stock_sync'
const STOCK_SYNC_STORAGE_KEY = 'dbb_product_stock_sync'

export function notifyProductStockChanged(productId?: number) {
  if (import.meta.server) return

  const payload = {
    productId: productId ?? null,
    ts: Date.now()
  }

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(STOCK_SYNC_CHANNEL)
      ch.postMessage(payload)
      ch.close()
    }
  } catch {
    // Ignore BroadcastChannel errors on unsupported contexts
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STOCK_SYNC_STORAGE_KEY, JSON.stringify(payload))
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function useProductStockSync(
  onRefresh: () => void | Promise<void>,
  pollIntervalMs = 15000
) {
  let channel: BroadcastChannel | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let isRunning = false
  let lastRunAt = 0

  const triggerRefresh = async () => {
    const now = Date.now()
    if (isRunning || now - lastRunAt < 400) return
    isRunning = true
    lastRunAt = now
    try {
      await onRefresh()
    } catch {
      // Ignore transient refresh failures
    } finally {
      isRunning = false
    }
  }

  const onStorage = (e: StorageEvent) => {
    if (e.key === STOCK_SYNC_STORAGE_KEY) {
      triggerRefresh()
    }
  }

  const onFocus = () => {
    triggerRefresh()
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      triggerRefresh()
    }
  }

  onMounted(() => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(STOCK_SYNC_CHANNEL)
        channel.onmessage = () => {
          triggerRefresh()
        }
      }
    } catch {
      // Ignore unsupported BroadcastChannel
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibilityChange)

    if (pollIntervalMs > 0) {
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          triggerRefresh()
        }
      }, pollIntervalMs)
    }
  })

  onBeforeUnmount(() => {
    if (channel) {
      channel.close()
      channel = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  })
}
