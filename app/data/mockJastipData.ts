export interface JastipTrip {
  id: string
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
  feeType: 'flat' | 'percent'
  feeValue: number
  openDate: string
  closeDate: string
  departureDate: string
  estimatedArrivalDate: string
  quotaTotal: number
  quotaFilled: number
  status: 'draft' | 'open' | 'closed' | 'purchasing' | 'arrived' | 'completed' | 'cancelled'
}

export interface UnifiedProduct {
  id: string
  name: string
  slug: string
  description: string
  category: string
  productType: 'ready' | 'jastip'
  tripId?: string
  tripSlug?: string
  tripTitle?: string
  country?: string
  flag?: string
  price: number // IDR
  originalPrice?: number
  originalCurrency?: string
  sourceStore?: string
  image: string
  gallery?: string[]
  variants?: { [key: string]: string[] }
  stockStatus: 'in_stock' | 'out_of_stock'
  stockQuantity?: number
  quota?: number
  quotaRemaining?: number
  maxQtyPerOrder?: number
  badge?: string
  rating?: number
  reviewsCount?: number
}

export interface OrderItem {
  id: string
  productId: string
  productSlug: string
  productName: string
  variant?: string
  priceAtOrder: number
  quantity: number
  subtotal: number
}

export interface OrderStatusLog {
  id: string
  fromStatus: string
  toStatus: string
  title: string
  note?: string
  proofImageUrl?: string
  createdAt: string
}

export interface Order {
  id: string
  orderCode: string
  userId: string
  customerName: string
  customerPhone: string
  orderType: 'ready' | 'jastip'
  tripId?: string
  tripTitle?: string
  items: OrderItem[]
  subtotal: number
  uniqueCode: number
  totalAmount: number
  paymentType: 'full' | 'dp'
  dpAmount: number
  paidAmount: number
  remainingAmount: number
  orderStatus: 'pending_approval' | 'pending_payment' | 'payment_uploaded' | 'verified' | 'purchasing' | 'arrived' | 'ready_pickup' | 'completed' | 'rejected' | 'cancelled' | 'expired'
  rejectionReason?: string
  approvedAt?: string
  paymentDeadline?: string
  fulfillmentMethod: 'pickup' | 'shipping'
  shippingAddress?: string
  shippingCost?: number
  trackingNumber?: string
  customerNote?: string
  receiptUrl?: string
  logs: OrderStatusLog[]
  createdAt: string
}

export interface ProductRequest {
  id: string
  userId: string
  userName: string
  productName: string
  description: string
  targetCountry: string
  tripId?: string
  tripTitle?: string
  referenceImageUrl: string
  referenceLink?: string
  status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'available' | 'rejected'
  quotedPrice?: number
  quoteNote?: string
  quoteExpiresAt?: string
  adminNote?: string
  createdAt: string
}

export interface AppNotification {
  id: string
  userId: string
  type: 'order' | 'request' | 'chat' | 'system'
  title: string
  body: string
  linkUrl: string
  isRead: boolean
  createdAt: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  qrisImageUrl?: string
  isActive: boolean
}

// -------------------------------------------------------------
// MOCK DATA
// -------------------------------------------------------------

// Jastip trips are now loaded dynamically from MySQL database via Prisma (/api/trips)
export const mockJastipTrips: JastipTrip[] = []


// Products are now loaded dynamically from MySQL database via Prisma (/api/products)
export const mockUnifiedProducts: UnifiedProduct[] = []

export const mockOrders: Order[] = [
  {
    id: 'ord-04',
    orderCode: 'JST-20261002-004',
    userId: 'user-01',
    customerName: 'Siti Rahmawati',
    customerPhone: '081234567890',
    orderType: 'jastip',
    tripId: 'trip-jpn-01',
    tripTitle: 'Japan Autumn Special Trip 2026',
    items: [
      {
        id: 'item-04',
        productId: 'jastip-001',
        productSlug: 'shiroi-koibito-white-chocolate-box-18',
        productName: 'Shiroi Koibito White Chocolate Cookies (Box of 18)',
        variant: 'Box 18 pcs (White Choc)',
        priceAtOrder: 215000,
        quantity: 1,
        subtotal: 215000
      }
    ],
    subtotal: 215000,
    uniqueCode: 342,
    totalAmount: 215342,
    paymentType: 'full',
    dpAmount: 0,
    paidAmount: 0,
    remainingAmount: 215342,
    orderStatus: 'pending_approval',
    fulfillmentMethod: 'pickup',
    customerNote: 'Tolong pilihkan kemasan yang tidak penyok ya kak.',
    logs: [
      {
        id: 'log-04-1',
        fromStatus: '',
        toStatus: 'pending_approval',
        title: 'Pesanan Diajukan',
        note: 'Menunggu peninjauan & persetujuan (ACC) dari Admin dbb_luxe untuk ketersediaan barang dan kuota bagasi.',
        createdAt: '2026-10-02 16:30'
      }
    ],
    createdAt: '2026-10-02 16:30'
  },
  {
    id: 'ord-05',
    orderCode: 'JST-20261002-005',
    userId: 'user-01',
    customerName: 'Budi Santoso',
    customerPhone: '081398765432',
    orderType: 'jastip',
    tripId: 'trip-jpn-01',
    tripTitle: 'Japan Autumn Special Trip 2026',
    items: [
      {
        id: 'item-05',
        productId: 'jastip-002',
        productSlug: 'tokyo-banana-original-box-8',
        productName: 'Tokyo Banana Original Custard Cream Cake (Box of 8)',
        variant: 'Box isi 8 pcs',
        priceAtOrder: 325000,
        quantity: 1,
        subtotal: 325000
      }
    ],
    subtotal: 325000,
    uniqueCode: 147,
    totalAmount: 325147,
    paymentType: 'full',
    dpAmount: 0,
    paidAmount: 0,
    remainingAmount: 325147,
    orderStatus: 'pending_payment',
    paymentDeadline: '2026-10-03T17:00:00Z',
    fulfillmentMethod: 'pickup',
    logs: [
      {
        id: 'log-05-1',
        fromStatus: '',
        toStatus: 'pending_approval',
        title: 'Pesanan Diajukan',
        note: 'Pesanan berhasil dibuat oleh customer.',
        createdAt: '2026-10-02 15:00'
      },
      {
        id: 'log-05-2',
        fromStatus: 'pending_approval',
        toStatus: 'pending_payment',
        title: 'Pesanan Disetujui Admin (ACC)',
        note: 'Admin dbb_luxe menyetujui pesanan. Batas waktu pembayaran 24 jam dibuka.',
        createdAt: '2026-10-02 15:15'
      }
    ],
    createdAt: '2026-10-02 15:00'
  },
  {
    id: 'ord-06',
    orderCode: 'RDY-20261002-010',
    userId: 'user-02',
    customerName: 'Dewi Lestari',
    customerPhone: '081765432190',
    orderType: 'ready',
    items: [
      {
        id: 'item-06',
        productId: 'ready-001',
        productSlug: 'starbucks-japan-sakura-tumbler',
        productName: 'Starbucks Japan Sakura 2026 Stainless Tumbler',
        variant: 'Sakura Petal Pink 473ml',
        priceAtOrder: 680000,
        quantity: 1,
        subtotal: 680000
      }
    ],
    subtotal: 680000,
    uniqueCode: 215,
    totalAmount: 680215,
    paymentType: 'full',
    dpAmount: 0,
    paidAmount: 680215,
    remainingAmount: 0,
    orderStatus: 'payment_uploaded',
    paymentDeadline: '2026-10-03T12:00:00Z',
    fulfillmentMethod: 'shipping',
    shippingAddress: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    logs: [
      {
        id: 'log-06-1',
        fromStatus: '',
        toStatus: 'pending_approval',
        title: 'Pesanan Diajukan',
        createdAt: '2026-10-02 11:00'
      },
      {
        id: 'log-06-2',
        fromStatus: 'pending_approval',
        toStatus: 'pending_payment',
        title: 'Pesanan Disetujui Admin (ACC)',
        note: 'Stok ready di warehouse siap dikemas.',
        createdAt: '2026-10-02 11:20'
      },
      {
        id: 'log-06-3',
        fromStatus: 'pending_payment',
        toStatus: 'payment_uploaded',
        title: 'Bukti Transfer Diunggah',
        note: 'Customer mengunggah bukti transfer BCA Rp680.215. Menunggu verifikasi admin.',
        createdAt: '2026-10-02 11:45'
      }
    ],
    createdAt: '2026-10-02 11:00'
  },
  {
    id: 'ord-01',
    orderCode: 'JST-20261002-001',
    userId: 'user-01',
    customerName: 'Siti Rahmawati',
    customerPhone: '081234567890',
    orderType: 'jastip',
    tripId: 'trip-jpn-01',
    tripTitle: 'Japan Autumn Special Trip 2026',
    items: [
      {
        id: 'item-01',
        productId: 'jastip-001',
        productSlug: 'shiroi-koibito-white-chocolate-box-18',
        productName: 'Shiroi Koibito White Chocolate Cookies (Box of 18)',
        variant: 'Box 18 pcs (White Choc)',
        priceAtOrder: 215000,
        quantity: 2,
        subtotal: 430000
      }
    ],
    subtotal: 430000,
    uniqueCode: 147,
    totalAmount: 430147,
    paymentType: 'full',
    dpAmount: 0,
    paidAmount: 430147,
    remainingAmount: 0,
    orderStatus: 'purchasing',
    paymentDeadline: '2026-10-03T18:00:00Z',
    fulfillmentMethod: 'pickup',
    customerNote: 'Tolong pilihkan tanggal kadaluwarsa yang paling lama ya kak.',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    logs: [
      {
        id: 'log-1',
        fromStatus: 'pending_approval',
        toStatus: 'pending_payment',
        title: 'Pesanan Disetujui Admin (ACC)',
        note: 'Kuota bagasi koper dikonfirmasi muat.',
        createdAt: '2026-10-02 08:45'
      },
      {
        id: 'log-2',
        fromStatus: 'pending_payment',
        toStatus: 'payment_uploaded',
        title: 'Bukti Transfer Diunggah',
        note: 'Customer mengunggah bukti transfer BCA Rp430.147',
        createdAt: '2026-10-02 09:15'
      },
      {
        id: 'log-3',
        fromStatus: 'payment_uploaded',
        toStatus: 'verified',
        title: 'Pembayaran Terverifikasi',
        note: 'Diverifikasi oleh Admin dbb_luxe. Mutasi bank cocok.',
        createdAt: '2026-10-02 09:40'
      },
      {
        id: 'log-4',
        fromStatus: 'verified',
        toStatus: 'purchasing',
        title: 'Sedang Dibelikan di Jepang',
        note: 'Admin sudah berada di Tokyo dan sedang membelikan pesanan di Don Quijote.',
        proofImageUrl: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&q=80',
        createdAt: '2026-10-02 14:00'
      }
    ],
    createdAt: '2026-10-02 08:30'
  },
  {
    id: 'ord-02',
    orderCode: 'RDY-20261001-008',
    userId: 'user-01',
    customerName: 'Siti Rahmawati',
    customerPhone: '081234567890',
    orderType: 'ready',
    items: [
      {
        id: 'item-02',
        productId: 'ready-002',
        productSlug: 'tokyo-banana-original-box-8',
        productName: 'Tokyo Banana Original Custard Cream Cake (Box of 8)',
        variant: 'Box isi 8 pcs',
        priceAtOrder: 325000,
        quantity: 1,
        subtotal: 325000
      }
    ],
    subtotal: 325000,
    uniqueCode: 219,
    totalAmount: 325219,
    paymentType: 'full',
    dpAmount: 0,
    paidAmount: 325219,
    remainingAmount: 0,
    orderStatus: 'ready_pickup',
    paymentDeadline: '2026-10-02T12:00:00Z',
    fulfillmentMethod: 'pickup',
    logs: [
      {
        id: 'log-02-1',
        fromStatus: 'pending_approval',
        toStatus: 'pending_payment',
        title: 'Pesanan Disetujui Admin (ACC)',
        createdAt: '2026-10-01 09:45'
      },
      {
        id: 'log-02-2',
        fromStatus: 'pending_payment',
        toStatus: 'verified',
        title: 'Pembayaran Lunas',
        createdAt: '2026-10-01 10:10'
      },
      {
        id: 'log-02-3',
        fromStatus: 'verified',
        toStatus: 'ready_pickup',
        title: 'Siap Dikemas & Dikirim',
        note: 'Barang sudah disiapkan di warehouse dbb_luxe untuk proses pengiriman kurir.',
        createdAt: '2026-10-01 14:20'
      }
    ],
    createdAt: '2026-10-01 09:30'
  },
  {
    id: 'ord-03',
    orderCode: 'JST-20261001-009',
    userId: 'user-03',
    customerName: 'Rian Pratama',
    customerPhone: '081987654321',
    orderType: 'jastip',
    tripId: 'trip-jpn-01',
    tripTitle: 'Japan Autumn Special Trip 2026',
    items: [
      {
        id: 'item-03',
        productId: 'jastip-003',
        productSlug: 'starbucks-japan-sakura-tumbler',
        productName: 'Starbucks Japan Sakura 2026 Stainless Tumbler',
        variant: 'Sakura Petal Pink 473ml',
        priceAtOrder: 680000,
        quantity: 5,
        subtotal: 3400000
      }
    ],
    subtotal: 3400000,
    uniqueCode: 125,
    totalAmount: 3400125,
    paymentType: 'full',
    dpAmount: 0,
    paidAmount: 0,
    remainingAmount: 3400125,
    orderStatus: 'rejected',
    rejectionReason: 'Kuota koper bagasi trip Tokyo sudah penuh untuk tumbler berukuran besar (maks 2 pcs per customer).',
    fulfillmentMethod: 'shipping',
    logs: [
      {
        id: 'log-03-1',
        fromStatus: '',
        toStatus: 'pending_approval',
        title: 'Pesanan Diajukan',
        createdAt: '2026-10-01 16:00'
      },
      {
        id: 'log-03-2',
        fromStatus: 'pending_approval',
        toStatus: 'rejected',
        title: 'Pesanan Ditolak Admin',
        note: 'Alasan: Kuota koper bagasi trip Tokyo sudah penuh untuk tumbler berukuran besar (maks 2 pcs per customer).',
        createdAt: '2026-10-01 16:30'
      }
    ],
    createdAt: '2026-10-01 16:00'
  }
]

export const mockProductRequests: ProductRequest[] = [
  {
    id: 'req-01',
    userId: 'user-01',
    userName: 'Siti Rahmawati',
    productName: 'Pokemon Center Tokyo Pikachu Kimono Plush Doll Limited',
    description: 'Boneka Pikachu berbusana kimono musim gugur edisi terbatas Pokemon Center Tokyo Station. Mohon carikan yang jahitan mukanya rapi.',
    targetCountry: 'Jepang',
    tripId: 'trip-jpn-01',
    tripTitle: 'Japan Autumn Special Trip 2026',
    referenceImageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80',
    referenceLink: 'https://www.pokemoncenter-online.com',
    status: 'quoted',
    quotedPrice: 420000,
    quoteNote: 'Estimasi harga di store JPY 2,800 + fee jastip Rp50.000 + bubble wrap. Tersedia di store Tokyo Station.',
    quoteExpiresAt: '2026-10-18T23:59:59Z',
    createdAt: '2026-10-02 11:00'
  }
]

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-01',
    userId: 'user-01',
    type: 'order',
    title: 'Pesanan Dibelikan di Luar Negeri!',
    body: 'Pesanan JST-20261002-001 sedang dibelikan oleh Admin di Tokyo, Jepang. Cek foto struk pembelian di halaman tracking.',
    linkUrl: '/orders/JST-20261002-001',
    isRead: false,
    createdAt: '2 jam yang lalu'
  },
  {
    id: 'notif-02',
    userId: 'user-01',
    type: 'request',
    title: 'Penawaran Harga Masuk',
    body: 'Admin telah memberikan penawaran harga untuk request boneka Pikachu Kimono Anda (Rp420.000). Silakan review & setujui.',
    linkUrl: '/request',
    isRead: false,
    createdAt: '5 jam yang lalu'
  }
]

export const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank-bca',
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '8830-192-888',
    accountHolder: 'DBB LUXE RETAIL INDONESIA',
    isActive: true
  },
  {
    id: 'bank-mandiri',
    bankName: 'Bank Mandiri',
    accountNumber: '137-00-9821-445',
    accountHolder: 'DBB LUXE RETAIL INDONESIA',
    isActive: true
  },
  {
    id: 'qris-gopay',
    bankName: 'QRIS Semua Pembayaran (BCA, GoPay, OVO, Dana)',
    accountNumber: 'NMID: ID1029384756',
    accountHolder: 'DBB LUXE STORE JASTIP',
    qrisImageUrl: 'https://images.unsplash.com/photo-1595079672139-545c6373d575?auto=format&fit=crop&w=600&q=80',
    isActive: true
  }
]
