import type { AdminUser, SaleOrder, PurchaseOrder } from '../types/admin'

export const mockUsers: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '081234567890',
    role: 'Customer',
    status: 'Active',
    joinDate: '12 Jan 2026',
    totalOrders: 6
  },
  {
    id: 'usr-002',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@yahoo.com',
    phone: '082198765432',
    role: 'Customer',
    status: 'Active',
    joinDate: '18 Jan 2026',
    totalOrders: 4
  },
  {
    id: 'usr-003',
    name: 'Admin Utama (Nagamas)',
    email: 'admin@nagamas.id',
    phone: '081122334455',
    role: 'Admin',
    status: 'Active',
    joinDate: '01 Jan 2026',
    totalOrders: 0
  },
  {
    id: 'usr-004',
    name: 'Dimas Setiawan',
    email: 'dimas.setiawan@gmail.com',
    phone: '085712348899',
    role: 'Staff',
    status: 'Active',
    joinDate: '05 Feb 2026',
    totalOrders: 0
  },
  {
    id: 'usr-005',
    name: 'Aulia Putri Lestari',
    email: 'aulia.putri@hotmail.com',
    phone: '087855667788',
    role: 'Customer',
    status: 'Active',
    joinDate: '14 Feb 2026',
    totalOrders: 9
  },
  {
    id: 'usr-006',
    name: 'Rian Pratama',
    email: 'rian.pratama@gmail.com',
    phone: '081399887766',
    role: 'Customer',
    status: 'Inactive',
    joinDate: '20 Feb 2026',
    totalOrders: 1
  }
]

export const mockSales: SaleOrder[] = [
  {
    id: 'sale-001',
    orderCode: 'ORD-2026-0801',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    items: 'Aethel Leather Tote Bag (1x)',
    itemCount: 1,
    totalAmount: 489000,
    paymentMethod: 'Transfer Bank',
    status: 'Selesai',
    createdAt: '28 Agu 2026, 14:30'
  },
  {
    id: 'sale-002',
    orderCode: 'ORD-2026-0802',
    customerName: 'Aulia Putri Lestari',
    customerPhone: '087855667788',
    items: 'Vintage Washed Denim Chore Jacket (1x), Cotton Cap (1x)',
    itemCount: 2,
    totalAmount: 664000,
    paymentMethod: 'QRIS',
    status: 'Diproses',
    createdAt: '28 Agu 2026, 11:15'
  },
  {
    id: 'sale-003',
    orderCode: 'ORD-2026-0803',
    customerName: 'Siti Rahmawati',
    customerPhone: '082198765432',
    items: 'Oversized French Linen Shirt (2x)',
    itemCount: 2,
    totalAmount: 558000,
    paymentMethod: 'Transfer Bank',
    status: 'Selesai',
    createdAt: '27 Agu 2026, 19:40'
  },
  {
    id: 'sale-004',
    orderCode: 'ORD-2026-0804',
    customerName: 'Rian Pratama',
    customerPhone: '081399887766',
    items: 'Structured Commuter Backpack (1x)',
    itemCount: 1,
    totalAmount: 589000,
    paymentMethod: 'COD',
    status: 'Menunggu Pembayaran',
    createdAt: '27 Agu 2026, 16:05'
  },
  {
    id: 'sale-005',
    orderCode: 'ORD-2026-0805',
    customerName: 'Dewi Anggraini',
    customerPhone: '085277889900',
    items: 'Classic Leather Belt (1x), Tortoiseshell Sunglasses (1x)',
    itemCount: 2,
    totalAmount: 434000,
    paymentMethod: 'QRIS',
    status: 'Selesai',
    createdAt: '26 Agu 2026, 10:20'
  },
  {
    id: 'sale-006',
    orderCode: 'ORD-2026-0806',
    customerName: 'Hendro Wijaya',
    customerPhone: '081911223344',
    items: 'Heavyweight Relaxed Cotton T-Shirt (3x)',
    itemCount: 3,
    totalAmount: 495000,
    paymentMethod: 'Kartu Kredit',
    status: 'Dibatalkan',
    createdAt: '25 Agu 2026, 09:12'
  }
]

export const mockPurchases: PurchaseOrder[] = [
  {
    id: 'po-001',
    poCode: 'PO-2026-0089',
    supplierName: 'PT Garment Texindo Utama',
    items: 'Heavyweight Cotton Combed T-Shirt Fabric (Roll)',
    quantity: 120,
    totalCost: 9800000,
    status: 'Diterima',
    orderDate: '24 Agu 2026'
  },
  {
    id: 'po-002',
    poCode: 'PO-2026-0090',
    supplierName: 'CV Kulit Nusantara Artisan',
    items: 'Full-Grain Cowhide Leather Bahan Sabuk & Tas',
    quantity: 50,
    totalCost: 14500000,
    status: 'Diterima',
    orderDate: '20 Agu 2026'
  },
  {
    id: 'po-003',
    poCode: 'PO-2026-0091',
    supplierName: 'Bandung Denim Craft Supply',
    items: 'Washed Denim 14oz & Brass Button Hardware',
    quantity: 80,
    totalCost: 18200000,
    status: 'Dikirim',
    orderDate: '27 Agu 2026'
  },
  {
    id: 'po-004',
    poCode: 'PO-2026-0092',
    supplierName: 'Optik Global Accessories Ltd',
    items: 'Acetate Sunglasses Frame & UV400 Polarized Lens',
    quantity: 100,
    totalCost: 6500000,
    status: 'Menunggu Konfirmasi',
    orderDate: '28 Agu 2026'
  }
]
