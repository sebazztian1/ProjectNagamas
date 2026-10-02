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

export const mockJastipTrips: JastipTrip[] = [
  {
    id: 'trip-jpn-01',
    title: 'Japan Autumn Special Trip 2026',
    slug: 'japan-autumn-trip',
    country: 'Jepang',
    flag: '🇯🇵',
    cityOrArea: 'Tokyo & Osaka (Don Quijote, Tokyo Station, Ginza)',
    description: 'Titip berbagai macam snack legendaris Jepang, kosmetik & skincare drugstore, rilisan anime eksklusif, serta outerwear Uniqlo/GU dengan harga resmi Jepang.',
    terms: 'Batas pelunasan atau DP 50% wajib sebelum cut-off date. Barang yang out of stock di toko fisik Jepang akan di-refund 100%.',
    coverImageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    currency: 'JPY',
    exchangeRate: 108,
    feeType: 'flat',
    feeValue: 35000,
    openDate: '2026-10-01',
    closeDate: '2026-10-20',
    departureDate: '2026-10-23',
    estimatedArrivalDate: '2026-11-02',
    quotaTotal: 50,
    quotaFilled: 38,
    status: 'open'
  },
  {
    id: 'trip-kor-02',
    title: 'Korea K-Beauty & Fashion Trip',
    slug: 'korea-k-beauty-trip',
    country: 'Korea Selatan',
    flag: '🇰🇷',
    cityOrArea: 'Seoul (Olive Young Myeongdong, Hongdae, Seongsu)',
    description: 'Beli langsung skincare viral Olive Young (Torriden, Anua, Medicube), merchandise K-Pop, dan fashion brand lokal Korea langsung dari store resmi.',
    terms: 'Pengambilan barang di toko fisik dbb_luxe atau via ekspedisi lokal setelah barang tiba di Jakarta.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80',
    currency: 'KRW',
    exchangeRate: 11.8,
    feeType: 'flat',
    feeValue: 30000,
    openDate: '2026-10-05',
    closeDate: '2026-10-28',
    departureDate: '2026-11-03',
    estimatedArrivalDate: '2026-11-12',
    quotaTotal: 40,
    quotaFilled: 15,
    status: 'open'
  },
  {
    id: 'trip-bkk-03',
    title: 'Bangkok Mega Fashion & Snack Batch 4',
    slug: 'bangkok-snack-fashion',
    country: 'Thailand',
    flag: '🇹🇭',
    cityOrArea: 'Bangkok (Platinum Fashion Mall, Big C Rajdamri)',
    description: 'Surga baju santai linen, dress katun Bangkok, cemilan Big C rumput laut Tao Kae Noi, cha tra mue tea, dan wewangian khas Thailand.',
    terms: 'Bisa full payment atau DP 50%. Free bubble wrap untuk makanan kering.',
    coverImageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    currency: 'THB',
    exchangeRate: 470,
    feeType: 'flat',
    feeValue: 25000,
    openDate: '2026-09-15',
    closeDate: '2026-09-30',
    departureDate: '2026-10-02',
    estimatedArrivalDate: '2026-10-09',
    quotaTotal: 60,
    quotaFilled: 60,
    status: 'closed'
  }
]

export const mockUnifiedProducts: UnifiedProduct[] = [
  // READY STOCK PRODUCTS
  {
    id: 'ready-001',
    name: 'SK-II Facial Treatment Essence 230ml',
    slug: 'sk-ii-facial-treatment-essence-230ml',
    description: 'Miracle Water legendaris dengan kandungan lebih dari 90% Pitera. Memperbaiki tekstur kulit, kekencangan, dan kilau alami kulit wajah secara nyata.',
    category: 'Skincare & Kecantikan',
    productType: 'ready',
    country: 'Jepang',
    flag: '🇯🇵',
    price: 1850000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
    ],
    variants: { 'Ukuran': ['230ml (Standard)', '330ml (Jumbo)'] },
    stockStatus: 'in_stock',
    stockQuantity: 12,
    badge: 'Ready Stock',
    rating: 4.9,
    reviewsCount: 42
  },
  {
    id: 'ready-002',
    name: 'Tokyo Banana Original Custard Cream Cake (Box of 8)',
    slug: 'tokyo-banana-original-box-8',
    description: 'Oleh-oleh ikonik nomor satu dari Tokyo! Bolu lembut berbentuk pisang berisi krim custard pisang asli yang lumer di mulut. Selalu fresh dari Tokyo Station.',
    category: 'Makanan & Snack',
    productType: 'ready',
    country: 'Jepang',
    flag: '🇯🇵',
    price: 325000,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    variants: { 'Isi': ['Box isi 8 pcs', 'Box isi 12 pcs'] },
    stockStatus: 'in_stock',
    stockQuantity: 25,
    badge: 'Best Seller',
    rating: 4.8,
    reviewsCount: 88
  },
  {
    id: 'ready-003',
    name: 'Uniqlo Japan Flannel Check Shirt Regular Fit',
    slug: 'uniqlo-japan-flannel-check-shirt',
    description: 'Kemeja flanel katun 100% tebal lembut khas rilisan musim gugur Uniqlo Jepang dengan motif kotak klasik dan potongan rapi.',
    category: 'Fashion & Pakaian',
    productType: 'ready',
    country: 'Jepang',
    flag: '🇯🇵',
    price: 499000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    variants: { 'Ukuran': ['S', 'M', 'L', 'XL'], 'Warna': ['Navy / Dark Green', 'Red / Black'] },
    stockStatus: 'in_stock',
    stockQuantity: 18,
    badge: 'Ready Stock',
    rating: 4.9,
    reviewsCount: 31
  },
  {
    id: 'ready-004',
    name: 'Shiseido Anessa Perfect UV Sunscreen Skincare Milk SPF50+ 60ml',
    slug: 'shiseido-anessa-perfect-uv-sunscreen-60ml',
    description: 'Sunscreen gold no. 1 di Jepang dengan teknologi Auto Booster yang semakin kuat melindungi saat terkena panas, keringat, dan air.',
    category: 'Skincare & Kecantikan',
    productType: 'ready',
    country: 'Jepang',
    flag: '🇯🇵',
    price: 395000,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'in_stock',
    stockQuantity: 10,
    badge: 'Favorite',
    rating: 5.0,
    reviewsCount: 76
  },
  {
    id: 'ready-005',
    name: 'Aethel Minimalist Leather Tote Bag with Laptop Sleeve',
    slug: 'aethel-minimalist-leather-tote-bag',
    description: 'Tas tote kulit sintetis premium dengan kompartemen empuk untuk laptop 14 inci, resleting utama YKK, dan jahitan kuat untuk aktivitas harian.',
    category: 'Tas & Aksesoris',
    productType: 'ready',
    country: 'Lokal / Impor',
    flag: '🛍️',
    price: 489000,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    variants: { 'Warna': ['Espresso Brown', 'Onyx Black', 'Cream Taupe'] },
    stockStatus: 'in_stock',
    stockQuantity: 8,
    badge: 'Ready Stock',
    rating: 4.9,
    reviewsCount: 142
  },

  // JASTIP / OPEN PO PRODUCTS
  {
    id: 'jastip-001',
    name: 'Shiroi Koibito White Chocolate Cookies (Box of 18)',
    slug: 'shiroi-koibito-white-chocolate-box-18',
    description: 'Kue lidah kucing langue de chat renyah khas Hokkaido yang mengapit cokelat putih lembut meleleh. Wajib dibeli saat trip Jepang!',
    category: 'Makanan & Snack',
    productType: 'jastip',
    tripId: 'trip-jpn-01',
    tripSlug: 'japan-autumn-trip',
    tripTitle: 'Japan Autumn Special Trip 2026',
    country: 'Jepang',
    flag: '🇯🇵',
    originalPrice: 1500,
    originalCurrency: 'JPY',
    sourceStore: 'Don Quijote / Haneda Airport',
    price: 215000, // (1500 * 108) + 35000 + margin
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    variants: { 'Isi': ['Box 18 pcs (White Choc)', 'Box 24 pcs (Mix White & Milk)'] },
    stockStatus: 'in_stock',
    quota: 30,
    quotaRemaining: 12,
    maxQtyPerOrder: 4,
    badge: 'Open PO',
    rating: 4.9,
    reviewsCount: 54
  },
  {
    id: 'jastip-002',
    name: 'Rohto Melano CC Intensive Anti-Spot Essence 20ml',
    slug: 'rohto-melano-cc-essence-20ml',
    description: 'Serum vitamin C murni Jepang untuk memudarkan bekas jerawat, bintik hitam, dan mencerahkan warna kulit tanpa memicu iritasi.',
    category: 'Skincare & Kecantikan',
    productType: 'jastip',
    tripId: 'trip-jpn-01',
    tripSlug: 'japan-autumn-trip',
    tripTitle: 'Japan Autumn Special Trip 2026',
    country: 'Jepang',
    flag: '🇯🇵',
    originalPrice: 1100,
    originalCurrency: 'JPY',
    sourceStore: 'Matsumoto Kiyoshi Tokyo',
    price: 165000,
    image: 'https://images.unsplash.com/photo-1608248597359-598d9e6027a0?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'in_stock',
    quota: 40,
    quotaRemaining: 21,
    maxQtyPerOrder: 5,
    badge: 'Open PO',
    rating: 4.8,
    reviewsCount: 92
  },
  {
    id: 'jastip-003',
    name: 'Torriden DIVE-IN Low Molecular Hyaluronic Acid Serum 50ml',
    slug: 'torriden-dive-in-serum-50ml',
    description: 'Serum hydrating pemenang No. 1 Hwahae & Olive Young Awards di Korea. Sangat cepat meresap dan mengembalikan kelembapan kulit dehidrasi.',
    category: 'Skincare & Kecantikan',
    productType: 'jastip',
    tripId: 'trip-kor-02',
    tripSlug: 'korea-k-beauty-trip',
    tripTitle: 'Korea K-Beauty & Fashion Trip',
    country: 'Korea Selatan',
    flag: '🇰🇷',
    originalPrice: 19000,
    originalCurrency: 'KRW',
    sourceStore: 'Olive Young Myeongdong',
    price: 275000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'in_stock',
    quota: 25,
    quotaRemaining: 18,
    maxQtyPerOrder: 3,
    badge: 'Open PO',
    rating: 5.0,
    reviewsCount: 38
  },
  {
    id: 'jastip-004',
    name: 'Gentle Monster Sunglasses 2026 Collection (Authentic)',
    slug: 'gentle-monster-sunglasses-2026',
    description: 'Kacamata hitam desainer asal Seoul dengan bentuk frame modern futuristik. Pembelian resmi di flagship store Haus Dosan lengkap dengan kotak, leather case, dan kartu garansi.',
    category: 'Tas & Aksesoris',
    productType: 'jastip',
    tripId: 'trip-kor-02',
    tripSlug: 'korea-k-beauty-trip',
    tripTitle: 'Korea K-Beauty & Fashion Trip',
    country: 'Korea Selatan',
    flag: '🇰🇷',
    originalPrice: 280000,
    originalCurrency: 'KRW',
    sourceStore: 'Gentle Monster Haus Dosan',
    price: 3650000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    variants: { 'Model': ['Lilit 01 (Black)', 'Her 01 (Cat-eye)', 'Rococo 01 (Oval)'] },
    stockStatus: 'in_stock',
    quota: 10,
    quotaRemaining: 6,
    maxQtyPerOrder: 2,
    badge: 'Luxury Jastip',
    rating: 5.0,
    reviewsCount: 19
  }
]

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
        note: 'Stok fisik di Pasar Baru siap.',
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
        title: 'Siap Diambil di Toko',
        note: 'Barang sudah disiapkan di meja kasir dbb_luxe Store Pasar Baru.',
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
