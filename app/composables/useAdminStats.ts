export interface AdminStatsData {
  openTripsCount: number
  openTrips: any[]
  pendingOrdersCount: number
  pendingOrders: any[]
  pendingRequestsCount: number
  unreadChatCount: number
  unreadChatRoomsCount: number
  customersCount: number
  totalOmzet: number
  totalItemsSold: number
}

export const useAdminStats = () => {
  const stats = useState<AdminStatsData>('admin_stats_state', () => ({
    openTripsCount: 0,
    openTrips: [],
    pendingOrdersCount: 0,
    pendingOrders: [],
    pendingRequestsCount: 0,
    unreadChatCount: 0,
    unreadChatRoomsCount: 0,
    customersCount: 0,
    totalOmzet: 0,
    totalItemsSold: 0
  }))

  const pending = useState<boolean>('admin_stats_pending', () => false)

  const fetchAdminStats = async (silent = true) => {
    if (!silent) pending.value = true
    try {
      const res = await $fetch<AdminStatsData>('/api/admin/stats')
      if (res) {
        stats.value = res
      }
    } catch (err) {
      // Non-blocking
    } finally {
      if (!silent) pending.value = false
    }
  }

  const setUnreadChatStats = (unreadMessages: number, unreadRooms?: number) => {
    stats.value = {
      ...stats.value,
      unreadChatCount: Math.max(0, unreadMessages),
      unreadChatRoomsCount:
        unreadRooms !== undefined
          ? Math.max(0, unreadRooms)
          : stats.value.unreadChatRoomsCount
    }
  }

  return {
    stats,
    pending,
    fetchAdminStats,
    setUnreadChatStats
  }
}

