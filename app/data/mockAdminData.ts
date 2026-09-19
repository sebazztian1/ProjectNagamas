import type { AdminOrder, CustomerChat, StockAdjustment } from '../types/admin'

export const mockAdminOrders: AdminOrder[] = [
  {
    id: 'ord-001',
    orderCode: 'ORD-2026-0801',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    customerAddress: 'Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan, 12190',
    items: [
      {
        id: 'prod-001',
        name: 'Aethel Minimalist Leather Tote Bag',
        price: 489000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 489000,
    paymentMethod: 'Transfer Bank BCA',
    status: 'Diproses',
    createdAt: '02 Sep 2026, 13:20',
    notes: 'Mohon packing bubble wrap tebal agar kulit tas tidak terlipat'
  },
  {
    id: 'ord-002',
    orderCode: 'ORD-2026-0802',
    customerName: 'Aulia Putri Lestari',
    customerPhone: '087855667788',
    customerAddress: 'Jl. Dago Asri No. 12, Coblong, Kota Bandung, 40135',
    items: [
      {
        id: 'prod-004',
        name: 'Vintage Washed Denim Chore Jacket',
        price: 529000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'prod-010',
        name: 'Minimalist Washed Cotton Baseball Cap',
        price: 135000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 664000,
    paymentMethod: 'QRIS',
    status: 'Baru',
    createdAt: '02 Sep 2026, 14:05',
    notes: 'Pengiriman via J&T Express kalau bisa ya min'
  },
  {
    id: 'ord-003',
    orderCode: 'ORD-2026-0803',
    customerName: 'Siti Rahmawati',
    customerPhone: '082198765432',
    customerAddress: 'Jl. Malioboro No. 88, Sosromenduran, Yogyakarta, 55271',
    items: [
      {
        id: 'prod-002',
        name: 'Oversized French Linen Shirt',
        price: 279000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 558000,
    paymentMethod: 'Transfer Bank BCA',
    status: 'Dikirim',
    createdAt: '01 Sep 2026, 18:30',
    trackingNumber: 'JNENAG-88291039',
    shippingCourier: 'JNE Reguler',
    notes: 'Warna Sand Beige ukuran L'
  },
  {
    id: 'ord-004',
    orderCode: 'ORD-2026-0804',
    customerName: 'Rian Pratama',
    customerPhone: '081399887766',
    customerAddress: 'Jl. Basuki Rahmat No. 20, Tegalsari, Surabaya, 60261',
    items: [
      {
        id: 'prod-008',
        name: 'Structured Utility Commuter Backpack',
        price: 589000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 589000,
    paymentMethod: 'COD',
    status: 'Baru',
    createdAt: '02 Sep 2026, 11:45',
    notes: 'Mohon konfirmasi via WA sebelum kurir antar ke alamat'
  },
  {
    id: 'ord-005',
    orderCode: 'ORD-2026-0805',
    customerName: 'Dewi Anggraini',
    customerPhone: '085277889900',
    customerAddress: 'Jl. Gatot Subroto No. 15, Medan Petisah, Medan, 20118',
    items: [
      {
        id: 'prod-007',
        name: 'Classic Full-Grain Leather Belt',
        price: 245000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'prod-005',
        name: 'Retro Tortoiseshell Acetate Sunglasses',
        price: 189000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 434000,
    paymentMethod: 'QRIS',
    status: 'Selesai',
    createdAt: '30 Agu 2026, 09:15',
    trackingNumber: 'SICEPAT-9912044',
    shippingCourier: 'SiCepat BEST'
  },
  {
    id: 'ord-006',
    orderCode: 'ORD-2026-0806',
    customerName: 'Hendro Wijaya',
    customerPhone: '081911223344',
    customerAddress: 'Jl. Pemuda No. 7, Pandansari, Semarang, 50132',
    items: [
      {
        id: 'prod-006',
        name: 'Heavyweight Relaxed Cotton T-Shirt',
        price: 165000,
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 495000,
    paymentMethod: 'Transfer Bank BCA',
    status: 'Selesai',
    createdAt: '29 Agu 2026, 15:40',
    trackingNumber: 'JNENAG-7718291',
    shippingCourier: 'JNE YES'
  },
  {
    id: 'ord-007',
    orderCode: 'ORD-2026-0807',
    customerName: 'Maya Indah Lestari',
    customerPhone: '089612345678',
    customerAddress: 'Jl. Diponegoro No. 34, Dauh Puri Klod, Denpasar, 80113',
    items: [
      {
        id: 'prod-003',
        name: 'Urban Canvas Crossbody Sling Bag',
        price: 219000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 219000,
    paymentMethod: 'QRIS',
    status: 'Diproses',
    createdAt: '02 Sep 2026, 12:10'
  }
]

export const mockCustomerChats: CustomerChat[] = [
  {
    id: 'chat-001',
    customerName: 'Aulia Putri Lestari',
    customerPhone: '087855667788',
    customerAvatar: 'A',
    unreadCount: 2,
    lastMessage: 'Halo admin, kemeja French Linen Shirt warna apa saja yang masih ada stok ya?',
    lastMessageTime: '5 menit lalu',
    status: 'unread',
    relatedProduct: {
      id: 'prod-002',
      name: 'Oversized French Linen Shirt',
      price: 279000,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      stockCount: 24
    },
    messages: [
      {
        id: 'm-101',
        sender: 'user',
        text: 'Halo admin Nagamas, salam kenal!',
        timestamp: '14:10'
      },
      {
        id: 'm-102',
        sender: 'user',
        text: 'Saya mau tanya tentang produk Oversized French Linen Shirt.',
        timestamp: '14:11'
      },
      {
        id: 'm-103',
        sender: 'user',
        text: 'Halo admin, kemeja French Linen Shirt warna apa saja yang masih ada stok ya?',
        timestamp: '14:12'
      }
    ]
  },
  {
    id: 'chat-002',
    customerName: 'Rian Pratama',
    customerPhone: '081399887766',
    customerAvatar: 'R',
    unreadCount: 1,
    lastMessage: 'Permisi min, saya baru order backpack ORD-2026-0804 lewat COD, kapan dikirim ya?',
    lastMessageTime: '28 menit lalu',
    status: 'unread',
    relatedProduct: {
      id: 'prod-008',
      name: 'Structured Utility Commuter Backpack',
      price: 589000,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      stockCount: 8
    },
    messages: [
      {
        id: 'm-201',
        sender: 'user',
        text: 'Halo admin, saya baru saja check out pesanan ORD-2026-0804.',
        timestamp: '13:45'
      },
      {
        id: 'm-202',
        sender: 'user',
        text: 'Permisi min, saya baru order backpack ORD-2026-0804 lewat COD, kapan dikirim ya?',
        timestamp: '13:46'
      }
    ]
  },
  {
    id: 'chat-003',
    customerName: 'Fajar Nugraha',
    customerPhone: '081733445566',
    customerAvatar: 'F',
    unreadCount: 1,
    lastMessage: 'Min, Cozy Wool-Blend Knit Cardigan kapan restock ya? Mau pesan nih.',
    lastMessageTime: '2 jam lalu',
    status: 'unread',
    relatedProduct: {
      id: 'prod-009',
      name: 'Cozy Wool-Blend Knit Cardigan',
      price: 389000,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      stockCount: 0
    },
    messages: [
      {
        id: 'm-301',
        sender: 'user',
        text: 'Selamat siang admin Nagamas!',
        timestamp: '12:15'
      },
      {
        id: 'm-302',
        sender: 'user',
        text: 'Min, Cozy Wool-Blend Knit Cardigan kapan restock ya? Mau pesan nih.',
        timestamp: '12:16'
      }
    ]
  },
  {
    id: 'chat-004',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    customerAvatar: 'B',
    unreadCount: 0,
    lastMessage: 'Terima kasih banyak infonya min, ditunggu paketnya!',
    lastMessageTime: '3 jam lalu',
    status: 'replied',
    relatedProduct: {
      id: 'prod-001',
      name: 'Aethel Minimalist Leather Tote Bag',
      price: 489000,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      stockCount: 15
    },
    messages: [
      {
        id: 'm-401',
        sender: 'user',
        text: 'Siang min, pesanan saya ORD-2026-0801 sudah diproses belum ya?',
        timestamp: '11:20'
      },
      {
        id: 'm-402',
        sender: 'admin',
        text: 'Halo Pak Budi, pesanan Bapak sedang kami siapkan dan kami kemas dengan ekstra bubble wrap. Sore ini akan diserahkan ke kurir ya!',
        timestamp: '11:25'
      },
      {
        id: 'm-403',
        sender: 'user',
        text: 'Terima kasih banyak infonya min, ditunggu paketnya!',
        timestamp: '11:28'
      }
    ]
  },
  {
    id: 'chat-005',
    customerName: 'Dewi Anggraini',
    customerPhone: '085277889900',
    customerAvatar: 'D',
    unreadCount: 0,
    lastMessage: 'Sip, barang sudah sampai dengan aman kak, kualitasnya bagus banget!',
    lastMessageTime: 'Kemarin',
    status: 'replied',
    relatedProduct: {
      id: 'prod-005',
      name: 'Retro Tortoiseshell Acetate Sunglasses',
      price: 189000,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      stockCount: 30
    },
    messages: [
      {
        id: 'm-501',
        sender: 'user',
        text: 'Halo kak, apakah kacamata tortoiseshell sudah termasuk hard case & lap pembersih?',
        timestamp: 'Kemarin 10:00'
      },
      {
        id: 'm-502',
        sender: 'admin',
        text: 'Halo Kak Dewi! Betul sekali kak, pembelian kacamata sudah free hard case eksklusif dan lap microfiber tebal ya :)',
        timestamp: 'Kemarin 10:04'
      },
      {
        id: 'm-503',
        sender: 'user',
        text: 'Sip, barang sudah sampai dengan aman kak, kualitasnya bagus banget!',
        timestamp: 'Kemarin 16:30'
      }
    ]
  }
]

export const mockStockAdjustments: StockAdjustment[] = [
  {
    id: 'adj-001',
    productId: 'prod-002',
    productName: 'Oversized French Linen Shirt',
    type: 'masuk',
    changeAmount: 15,
    previousStock: 9,
    newStock: 24,
    reason: 'Penerimaan stok baru dari penjahit/workshop',
    date: '02 Sep 2026, 10:30',
    operator: 'Admin Nagamas'
  },
  {
    id: 'adj-002',
    productId: 'prod-008',
    productName: 'Structured Utility Commuter Backpack',
    type: 'rusak',
    changeAmount: -2,
    previousStock: 10,
    newStock: 8,
    reason: 'Ditemukan resleting macet saat QC stok fisik',
    date: '01 Sep 2026, 16:15',
    operator: 'Staff Gudang'
  },
  {
    id: 'adj-003',
    productId: 'prod-001',
    productName: 'Aethel Minimalist Leather Tote Bag',
    type: 'masuk',
    changeAmount: 10,
    previousStock: 5,
    newStock: 15,
    reason: 'Restock batch kedua kulit espresso brown',
    date: '01 Sep 2026, 11:00',
    operator: 'Admin Nagamas'
  },
  {
    id: 'adj-004',
    productId: 'prod-009',
    productName: 'Cozy Wool-Blend Knit Cardigan',
    type: 'opname',
    changeAmount: -1,
    previousStock: 1,
    newStock: 0,
    reason: 'Penyesuaian stok opname bulanan (stok habis)',
    date: '31 Agu 2026, 17:45',
    operator: 'Admin Nagamas'
  }
]

export const mockQuickReplies = [
  'Halo kak! Stok produk ini ready dan siap dikirim hari ini ya :)',
  'Pesanan kakak sedang kami siapkan dan segera kami serahkan ke pihak ekspedisi.',
  'Nomor resi pengiriman sudah kami update di sistem ya kak, bisa dicek berkala.',
  'Mohon maaf saat ini stok produk tersebut sedang kosong dan dalam proses restock ya kak.',
  'Terima kasih banyak sudah berbelanja di Nagamas! Semoga harimu menyenangkan.'
]
