export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'Customer' | 'Admin' | 'Staff'
  status: 'Active' | 'Inactive'
  joinDate: string
  totalOrders: number
}

export interface SaleOrder {
  id: string
  orderCode: string
  customerName: string
  customerPhone: string
  items: string
  itemCount: number
  totalAmount: number
  paymentMethod: 'Transfer Bank' | 'QRIS' | 'COD' | 'Kartu Kredit'
  status: 'Selesai' | 'Diproses' | 'Menunggu Pembayaran' | 'Dibatalkan'
  createdAt: string
}

export interface PurchaseOrder {
  id: string
  poCode: string
  supplierName: string
  items: string
  quantity: number
  totalCost: number
  status: 'Diterima' | 'Dikirim' | 'Menunggu Konfirmasi'
  orderDate: string
}
