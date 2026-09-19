export type OrderStatus = 'Baru' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan'

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface AdminOrder {
  id: string
  orderCode: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: OrderItem[]
  totalAmount: number
  paymentMethod: 'Transfer Bank BCA' | 'QRIS' | 'COD' | 'Kartu Kredit'
  status: OrderStatus
  createdAt: string
  trackingNumber?: string
  shippingCourier?: string
  notes?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'admin'
  text: string
  timestamp: string
}

export interface CustomerChat {
  id: string
  customerName: string
  customerPhone: string
  customerAvatar?: string
  unreadCount: number
  lastMessage: string
  lastMessageTime: string
  status: 'unread' | 'replied'
  relatedProduct?: {
    id: string
    name: string
    price: number
    image: string
    stockCount: number
  }
  messages: ChatMessage[]
}

export interface StockAdjustment {
  id: string
  productId: string
  productName: string
  type: 'masuk' | 'keluar' | 'rusak' | 'opname'
  changeAmount: number
  previousStock: number
  newStock: number
  reason: string
  date: string
  operator: string
}
