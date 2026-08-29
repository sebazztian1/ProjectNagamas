import type { Product } from '../types/product'

export const mockCategories = [
  { id: 'all', name: 'Semua Produk' },
  { id: 'tas', name: 'Tas & Backpack' },
  { id: 'pakaian', name: 'Pakaian & Baju' },
  { id: 'outerwear', name: 'Outerwear & Jaket' },
  { id: 'aksesoris', name: 'Aksesoris & Topi' }
]

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Aethel Minimalist Leather Tote Bag',
    category: 'tas',
    price: 489000,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tas tote kulit sintetis premium dengan kompartemen laptop 14 inci, resleting utama YKK, dan jahitan kuat untuk aktivitas harian.',
    specifications: {
      'Bahan': 'Premium PU Leather Vegan',
      'Dimensi': '38 x 30 x 12 cm',
      'Kapasitas': 'Laptop hingga 14 inch',
      'Warna': 'Espresso Brown & Onyx Black'
    },
    badge: 'Best Seller',
    inStock: true,
    stockCount: 15
  },
  {
    id: 'prod-002',
    name: 'Oversized French Linen Shirt',
    category: 'pakaian',
    price: 279000,
    rating: 4.8,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Kemeja lengan panjang bahan linen breathable dengan potongan relaxed oversized modern yang nyaman dan sejuk dipakai sepanjang hari.',
    specifications: {
      'Bahan': '100% Organic Pure Linen',
      'Ukuran': 'S, M, L, XL',
      'Fitting': 'Relaxed Oversized Fit',
      'Perawatan': 'Cuci mesin air dingin / gentle wash'
    },
    badge: 'Popular',
    inStock: true,
    stockCount: 24
  },
  {
    id: 'prod-003',
    name: 'Urban Canvas Crossbody Sling Bag',
    category: 'tas',
    price: 219000,
    rating: 4.7,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tas selempang multifungsi dari bahan kanvas water-repellent dengan multiple quick-access pockets dan tali strap ergonomis.',
    specifications: {
      'Bahan': 'Water-Repellent Cotton Canvas 16oz',
      'Dimensi': '26 x 18 x 8 cm',
      'Fitur': 'Hidden Back Anti-Theft Pocket'
    },
    inStock: true,
    stockCount: 18
  },
  {
    id: 'prod-004',
    name: 'Vintage Washed Denim Chore Jacket',
    category: 'outerwear',
    price: 529000,
    rating: 4.9,
    reviewsCount: 110,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Jaket denim tebal 14oz berpotongan boxy klasik dengan 4 saku utilitas luar dan kancing logam brass antik.',
    specifications: {
      'Bahan': '100% Rigid Heavyweight Cotton Denim (14oz)',
      'Ukuran': 'M, L, XL',
      'Warna': 'Washed Vintage Indigo'
    },
    badge: 'New',
    inStock: true,
    stockCount: 10
  },
  {
    id: 'prod-005',
    name: 'Retro Tortoiseshell Acetate Sunglasses',
    category: 'aksesoris',
    price: 189000,
    rating: 4.8,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Kacamata hitam frame asetat motif tortoiseshell dengan lensa UV400 polarized anti-silau untuk perlindungan maksimal.',
    specifications: {
      'Frame': 'Handmade Cellulose Acetate',
      'Lensa': 'TAC Polarized UV400 Protection',
      'Kelengkapan': 'Hard Case & Microfiber Cloth'
    },
    inStock: true,
    stockCount: 30
  },
  {
    id: 'prod-006',
    name: 'Heavyweight Relaxed Cotton T-Shirt',
    category: 'pakaian',
    price: 165000,
    rating: 4.85,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Kaos polos katun combed heavyweight 220 GSM dengan rib kerah tebal dan potongan drop-shoulder yang tidak mudah melar.',
    specifications: {
      'Bahan': '100% Combed Cotton 24s Heavy (220 GSM)',
      'Ukuran': 'S, M, L, XL, XXL',
      'Fitting': 'Drop Shoulder Relaxed Fit'
    },
    badge: 'Popular',
    inStock: true,
    stockCount: 50
  },
  {
    id: 'prod-007',
    name: 'Classic Full-Grain Leather Belt',
    category: 'aksesoris',
    price: 245000,
    rating: 4.9,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ikat pinggang kulit sapi asli vegetable-tanned dengan gesper solid alloy matte finish yang tahan karat dan awet bertahun-tahun.',
    specifications: {
      'Bahan': '100% Genuine Full-Grain Cowhide Leather',
      'Lebar': '3.5 cm',
      'Panjang': '110 cm - 125 cm (Adjustable)',
      'Warna': 'Vintage Tan & Dark Walnut'
    },
    inStock: true,
    stockCount: 16
  },
  {
    id: 'prod-008',
    name: 'Structured Utility Commuter Backpack',
    category: 'tas',
    price: 589000,
    rating: 4.92,
    reviewsCount: 134,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ransel laptop fungsional berkapasitas 22 liter dengan kompartemen empuk untuk laptop 15.6 inci, slot botol minum, dan bahan tahan cuaca.',
    specifications: {
      'Bahan': 'Cordura 600D Weatherproof Fabric',
      'Kapasitas': '22 Liters (Laptop 15.6")',
      'Dimensi': '45 x 30 x 15 cm'
    },
    badge: 'Best Seller',
    inStock: true,
    stockCount: 8
  },
  {
    id: 'prod-009',
    name: 'Cozy Wool-Blend Knit Cardigan',
    category: 'outerwear',
    price: 389000,
    rating: 4.75,
    reviewsCount: 52,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Kardigan rajut bertekstur lembut dengan aksen kancing tanduk tortoise shell dan saku depan ganda.',
    specifications: {
      'Bahan': 'Soft Cotton & Wool Blend Knit',
      'Ukuran': 'All Size Fit to L',
      'Warna': 'Oatmeal Beige'
    },
    inStock: false,
    stockCount: 0
  },
  {
    id: 'prod-010',
    name: 'Minimalist Washed Cotton Baseball Cap',
    category: 'aksesoris',
    price: 135000,
    rating: 4.8,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Topi baseball katun twill washed dengan strap buckle besi di bagian belakang untuk penyesuaian ukuran yang presisi.',
    specifications: {
      'Bahan': '100% Washed Cotton Twill',
      'Ukuran': 'Adjustable (56 - 60 cm)',
      'Warna': 'Slate Grey & Olive Khaki'
    },
    badge: 'New',
    inStock: true,
    stockCount: 22
  }
]
