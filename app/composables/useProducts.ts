import { ref } from 'vue'

export interface ApiProduct {
  id: number
  name: string
  slug: string
  description: string
  category: string
  categorySlug: string
  categoryId: number
  productType: 'ready' | 'jastip'
  price: number
  originalPrice: number | null
  originalCurrency: string | null
  sourceStore: string | null
  image: string
  gallery: string[]
  stockStatus: 'in_stock' | 'out_of_stock'
  stockQuantity: number
  inStock: boolean
  quota: number | null
  maxQtyPerOrder: number
  variants: Record<string, string[]> | null
  trip: {
    id: number
    title: string
    slug: string
    country: string
    status: string
    estimatedArrivalDate?: string
  } | null
  createdAt: string
  updatedAt?: string | null
}

export interface ApiCategory {
  id: number
  name: string
  slug: string
  productCount: number
}

export const useProducts = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async (filters: {
    type?: 'ready' | 'jastip' | 'all'
    category?: string
    search?: string
    sort?: string
    tripId?: number
    inStockOnly?: boolean
  } = {}): Promise<ApiProduct[]> => {
    loading.value = true
    error.value = null
    try {
      const queryParams = new URLSearchParams()
      if (filters.type) queryParams.set('type', filters.type)
      if (filters.category && filters.category !== 'Semua') queryParams.set('category', filters.category)
      if (filters.search) queryParams.set('search', filters.search)
      if (filters.sort) queryParams.set('sort', filters.sort)
      if (filters.tripId) queryParams.set('tripId', String(filters.tripId))
      if (filters.inStockOnly) queryParams.set('inStockOnly', 'true')

      const res = await $fetch<ApiProduct[]>('/api/products?' + queryParams.toString())
      return res || []
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Gagal memuat produk'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchProductBySlug = async (slug: string): Promise<ApiProduct | null> => {
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<ApiProduct>(`/api/products/${slug}`)
      return res
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || 'Produk tidak ditemukan'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async (): Promise<ApiCategory[]> => {
    try {
      const res = await $fetch<ApiCategory[]>('/api/categories')
      return res || []
    } catch {
      return []
    }
  }

  return {
    loading,
    error,
    fetchProducts,
    fetchProductBySlug,
    fetchCategories
  }
}
