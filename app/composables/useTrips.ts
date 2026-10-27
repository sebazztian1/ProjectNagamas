export interface ApiTrip {
  id: number
  title: string
  slug: string
  country: string
  flag: string
  cityOrArea: string
  description: string
  terms: string
  coverImageUrl: string
  currency: string
  exchangeRate: number
  feeType: 'percent' | 'flat'
  feeValue: number
  openDate: string
  closeDate: string
  departureDate?: string | null
  estimatedArrivalDate?: string | null
  quotaTotal: number
  quotaFilled: number
  quotaRemaining: number
  status: 'draft' | 'open' | 'closed' | 'purchasing' | 'arrived' | 'completed' | 'cancelled'
  productsCount?: number
  ordersCount?: number
  totalOrdersAmount?: number
  products?: any[]
  createdAt?: string
}

export const useTrips = () => {
  const fetchTrips = (status?: string) => {
    return useFetch<ApiTrip[]>('/api/trips', {
      query: status && status !== 'all' ? { status } : {}
    })
  }

  const fetchTripBySlug = (slug: string) => {
    return useFetch<ApiTrip>(`/api/trips/${slug}`)
  }

  return {
    fetchTrips,
    fetchTripBySlug
  }
}
