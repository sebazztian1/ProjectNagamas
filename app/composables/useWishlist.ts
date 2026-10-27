import { ref, computed } from 'vue'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export interface WishlistItem {
  wishlistId?: number
  productId: number
  name: string
  slug: string
  productType: 'ready' | 'jastip'
  category: string
  price: number
  originalPrice?: number | null
  stockStatus: string
  image: string
  isAvailable: boolean
  availabilityReason: string
  trip?: {
    id: number
    title: string
    slug: string
    country: string
    flag: string
    status: string
    closeDate: string
  } | null
  addedAt?: string
}

export const useWishlist = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const wishlistProductIds = useState<number[]>('wishlist_product_ids', () => [])
  const wishlistItems = useState<WishlistItem[]>('wishlist_items', () => [])
  const isWishlistLoaded = useState<boolean>('wishlist_loaded', () => false)
  const showLoginPrompt = useState<boolean>('wishlist_login_prompt', () => false)
  const isToggling = ref(false)

  const wishlistCount = computed(() => wishlistProductIds.value.length)

  const isWishlisted = (productId: number | string): boolean => {
    const id = Number(productId)
    return wishlistProductIds.value.includes(id)
  }

  // Load from Server or Local Storage
  const fetchWishlist = async () => {
    try {
      if (isAuthenticated.value) {
        // Authenticated: fetch from API
        const res = await $fetch<{
          success: boolean
          wishlistCount: number
          productIds: number[]
          items: WishlistItem[]
        }>('/api/wishlist')

        wishlistProductIds.value = res.productIds || []
        wishlistItems.value = res.items || []
      } else {
        // Guest: load from localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('dbb_guest_wishlist')
          if (stored) {
            try {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed)) {
                wishlistProductIds.value = parsed.map(Number).filter(n => !isNaN(n))
              }
            } catch {
              wishlistProductIds.value = []
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    } finally {
      isWishlistLoaded.value = true
    }
  }

  // Save guest wishlist to localStorage
  const saveGuestStorage = (ids: number[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dbb_guest_wishlist', JSON.stringify(ids))
    }
  }

  // Toggle Love / Wishlist on any product
  const toggleWishlist = async (product: { id: number | string; name: string }) => {
    const id = Number(product.id)
    if (!id || isNaN(id)) return

    const wasWishlisted = isWishlisted(id)

    if (isAuthenticated.value) {
      // User is logged in: direct DB sync
      try {
        isToggling.value = true
        if (wasWishlisted) {
          // Remove
          await $fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
          wishlistProductIds.value = wishlistProductIds.value.filter(pid => pid !== id)
          wishlistItems.value = wishlistItems.value.filter(item => item.productId !== id)
          showToast('Dihapus dari Wishlist', `"${product.name}" dihapus dari favorit.`, 'info')
        } else {
          // Add
          await $fetch('/api/wishlist', {
            method: 'POST',
            body: { productId: id }
          })
          if (!wishlistProductIds.value.includes(id)) {
            wishlistProductIds.value.push(id)
          }
          showToast('Disimpan ke Wishlist', `"${product.name}" berhasil disimpan ke favorit.`, 'success')
        }
      } catch (err: any) {
        showToast('Gagal', err?.data?.message || 'Terjadi kesalahan sistem.', 'error')
      } finally {
        isToggling.value = false
      }
    } else {
      // Guest mode
      if (wasWishlisted) {
        wishlistProductIds.value = wishlistProductIds.value.filter(pid => pid !== id)
        saveGuestStorage(wishlistProductIds.value)
        showToast('Dihapus dari Wishlist', `"${product.name}" dihapus dari favorit.`, 'info')
      } else {
        if (!wishlistProductIds.value.includes(id)) {
          wishlistProductIds.value.push(id)
        }
        saveGuestStorage(wishlistProductIds.value)
        showToast('Disimpan Sementara', `"${product.name}" disimpan ke favorit di perangkat ini.`, 'success')

        // Trigger login warning modal so guest knows they should login
        showLoginPrompt.value = true
      }
    }
  }

  // Remove directly by product ID
  const removeWishlist = async (productId: number | string) => {
    const id = Number(productId)
    if (!id || isNaN(id)) return

    if (isAuthenticated.value) {
      try {
        await $fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Error removing wishlist item:', err)
      }
    }

    wishlistProductIds.value = wishlistProductIds.value.filter(pid => pid !== id)
    wishlistItems.value = wishlistItems.value.filter(item => item.productId !== id)

    if (!isAuthenticated.value) {
      saveGuestStorage(wishlistProductIds.value)
    }

    showToast('Dihapus', 'Barang berhasil dihapus dari Wishlist.', 'info')
  }

  // Sync guest wishlist into authenticated user account
  const syncGuestWishlist = async () => {
    if (typeof window === 'undefined' || !isAuthenticated.value) return

    const stored = localStorage.getItem('dbb_guest_wishlist')
    if (!stored) return

    try {
      const guestIds = JSON.parse(stored)
      if (Array.isArray(guestIds) && guestIds.length > 0) {
        const res = await $fetch<{ success: boolean; productIds: number[] }>('/api/wishlist/sync', {
          method: 'POST',
          body: { productIds: guestIds }
        })
        localStorage.removeItem('dbb_guest_wishlist')
        if (res?.productIds) {
          wishlistProductIds.value = res.productIds
        }
        await fetchWishlist()
      }
    } catch (err) {
      console.error('Failed to sync guest wishlist:', err)
    }
  }

  return {
    wishlistProductIds,
    wishlistItems,
    wishlistCount,
    isWishlistLoaded,
    showLoginPrompt,
    isToggling,
    isWishlisted,
    toggleWishlist,
    removeWishlist,
    fetchWishlist,
    syncGuestWishlist
  }
}
