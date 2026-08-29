export interface Product {
  id: string
  name: string
  category: string
  price: number
  rating: number
  reviewsCount: number
  image: string
  gallery?: string[]
  description: string
  specifications: { [key: string]: string }
  badge?: string
  inStock: boolean
  stockCount: number
}

export interface FilterState {
  search: string
  category: string
  inStockOnly: boolean
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating'
}

export interface Toast {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning'
}
