import { useAuth } from './useAuth'

export interface CustomerNotification {
  id: string
  userId: number
  type: string
  title: string
  body: string
  linkUrl: string
  isRead: boolean
  createdAt: string
}

export const useNotifications = () => {
  const { currentUser } = useAuth()

  const notifications = useState<CustomerNotification[]>('customer_notifications', () => [])
  const unreadCount = useState<number>('customer_notifications_unread', () => 0)
  const pending = useState<boolean>('customer_notifications_pending', () => false)

  const fetchNotifications = async (silent = false) => {
    if (!currentUser.value || currentUser.value.role === 'admin' || currentUser.value.role === 'staff') {
      notifications.value = []
      unreadCount.value = 0
      return
    }

    if (!silent) {
      pending.value = true
    }

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const res = await $fetch<{ notifications: CustomerNotification[]; unreadCount: number }>(
        '/api/notifications',
        { headers }
      )
      notifications.value = res?.notifications || []
      unreadCount.value = Number(res?.unreadCount || 0)
    } catch {
      // Ignore network/auth errors silently
    } finally {
      if (!silent) {
        pending.value = false
      }
    }
  }

  const markAsRead = async (id: string) => {
    const target = notifications.value.find((n) => n.id === id)
    if (target && !target.isRead) {
      target.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    try {
      const res = await $fetch<{ success: boolean; unreadCount: number }>('/api/notifications/read', {
        method: 'PATCH',
        body: { id }
      })
      if (res && typeof res.unreadCount === 'number') {
        unreadCount.value = res.unreadCount
      }
    } catch {
      // Non-blocking
    }
  }

  const markAllAsRead = async () => {
    notifications.value.forEach((n) => {
      n.isRead = true
    })
    unreadCount.value = 0

    try {
      await $fetch('/api/notifications/read', {
        method: 'PATCH',
        body: { all: true }
      })
    } catch {
      // Non-blocking
    }
  }

  const deleteNotification = async (id: string) => {
    const idx = notifications.value.findIndex((n) => n.id === id)
    if (idx !== -1) {
      const removed = notifications.value[idx]
      notifications.value.splice(idx, 1)
      if (removed && !removed.isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }

    try {
      const res = await $fetch<{ success: boolean; unreadCount: number }>(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      if (res && typeof res.unreadCount === 'number') {
        unreadCount.value = res.unreadCount
      }
    } catch {
      // Non-blocking
    }
  }

  const clearReadNotifications = async () => {
    notifications.value = notifications.value.filter((n) => !n.isRead)
    try {
      const res = await $fetch<{ success: boolean; unreadCount: number }>('/api/notifications/read', {
        method: 'DELETE'
      })
      if (res && typeof res.unreadCount === 'number') {
        unreadCount.value = res.unreadCount
      }
    } catch {
      // Non-blocking
    }
  }

  const resetNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    pending,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    resetNotifications
  }
}

