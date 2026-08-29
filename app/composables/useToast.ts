import type { Toast } from '../types/product'

export const useToast = () => {
  const toasts = useState<Toast[]>('app_toasts', () => [])

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    toasts.value.push({ id, title, message, type })
    setTimeout(() => {
      removeToast(id)
    }, 3500)
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    showToast,
    removeToast
  }
}
