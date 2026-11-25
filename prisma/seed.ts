import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const daysFromNow = (days: number, hour = 10, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

const hoursFromNow = (hours: number) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

interface VariantOptionInput {
  value: string
  price: number
  stock: number
  sku: string
}

function buildSingleTierVariants(
  tierName: string,
  options: VariantOptionInput[],
  isJastip = false
) {
  const json = {
    tiers: [
      {
        name: tierName,
        options: options.map(o => o.value)
      }
    ],
    combinations: options.map(o => ({
      key: o.value,
      label: `${tierName}: ${o.value}`,
      options: { [tierName]: o.value },
      price: o.price,
      stock: o.stock,
      sku: o.sku
    }))
  }

  const rows = options.map(o => ({
    variant_key: o.value,
    variant_label: `${tierName}: ${o.value}`,
    tier_values: { [tierName]: o.value },
    price: o.price,
    stock_quantity: isJastip ? 0 : o.stock,
    quota: isJastip ? o.stock : null,
    sku: o.sku,
    is_active: true
  }))

  return { json, rows }
}

async function main() {
  console.log('Starting rich database seeding...')

  // 1. Clean up existing data in foreign-key-safe reverse order (never touch bank_accounts or audit_logs guard)
  if (await prisma.audit_logs.findFirst({ select: { id: true } })) {
    throw new Error('Seed dibatalkan karena database sudah memiliki audit log.')
  }
  await prisma.order_status_logs.deleteMany()
  await prisma.payments.deleteMany()
  await prisma.order_items.deleteMany()
  await prisma.orders.deleteMany()
  await prisma.wishlists.deleteMany()
  await prisma.chat_messages.deleteMany()
  await prisma.chat_rooms.deleteMany()
  await prisma.notifications.deleteMany()
  await prisma.product_requests.deleteMany()
  await prisma.product_images.deleteMany()
  await prisma.product_variants.deleteMany()
  await prisma.products.deleteMany()
  await prisma.jastip_trips.deleteMany()
  await prisma.categories.deleteMany()
  await prisma.store_settings.deleteMany()
  await prisma.users.deleteMany()

  // 2. Seed only 2 accounts: 1 admin & 1 customer (preserved unchanged)
  const [passwordHashAdmin, passwordHashCustomer] = await Promise.all([
    bcrypt.hash('adminadminadmin123', 10),
    bcrypt.hash('custcustcust123', 10),
  ])

  const admin = await prisma.users.create({
    data: {
      username: 'admin',
      phone_number: '081298765432',
      password_hash: passwordHashAdmin,
      role: 'admin',
      is_active: true,
    },
  })

  const customer = await prisma.users.create({
    data: {
      username: 'customer',
      phone_number: '081234567890',
      password_hash: passwordHashCustomer,
      role: 'customer',
      is_active: true,
    },
  })

  // 3. Ensure at least 1 active store bank account exists (required by /api/orders/[orderCode]/pay)
  const existingActiveBanks = await prisma.bank_accounts.count({
    where: { is_active: true },
  })

  if (existingActiveBanks === 0) {
    await prisma.bank_accounts.create({
      data: {
        bank_name: 'BCA (Bank Central Asia)',
        account_number: '8830192831',
        account_holder: 'DBB LUXE INDONESIA',
        is_active: true,
      },
    })
  }

  const activeBank = await prisma.bank_accounts.findFirstOrThrow({
    where: { is_active: true },
    orderBy: { id: 'asc' },
  })

  // 4. Store Settings
  await prisma.store_settings.createMany({
    data: [
      { setting_key: 'store_payment_duration_hours', setting_value: '24' },
      { setting_key: 'store_default_fee', setting_value: '35000' },
      { setting_key: 'store_wa_number', setting_value: '0812-9876-5432' },
      { setting_key: 'store_status', setting_value: 'open' },
    ],
  })

  // 5. Categories (6 categories)
  const categoryDefs = [
    { name: 'Tas & Dompet', slug: 'tas-dompet' },
    { name: 'Fashion & Pakaian', slug: 'fashion-pakaian' },
    { name: 'Sepatu & Sneakers', slug: 'sepatu-sneakers' },
    { name: 'Skincare & Kosmetik', slug: 'skincare-kosmetik' },
    { name: 'Parfum & Aksesori', slug: 'parfum-aksesori' },
    { name: 'Snack & Lifestyle', slug: 'snack-lifestyle' },
  ]

  const categoryBySlug = new Map<string, { id: number; name: string; slug: string }>()
  for (const cat of categoryDefs) {
    const created = await prisma.categories.create({ data: cat })
    categoryBySlug.set(cat.slug, created)
  }

  // 6. Jastip Trips (6 trips across countries and statuses)
  const tripDefs = [
    {
      title: 'Japan Tokyo & Osaka Winter Batch',
      slug: 'trip-jepang-tokyo-osaka-winter',
      country: 'Jepang',
      city_or_area: 'Tokyo (Ginza, Shibuya) & Osaka',
      description: 'Belanja langsung di flagship store Tokyo & Osaka: Onitsuka Tiger, Uniqlo, Shiseido, SK-II, Sanrio, dan Don Quijote.',
      terms: 'Pembayaran penuh atau DP 50% wajib masuk sebelum PO ditutup. Barang out of stock di-refund 100%.',
      cover_image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      currency: 'JPY',
      exchange_rate: 108,
      fee_type: 'flat' as const,
      fee_value: 35000,
      open_date: daysFromNow(-7, 9),
      close_date: daysFromNow(8, 21),
      departure_date: daysFromNow(10, 8),
      estimated_arrival_date: daysFromNow(16, 18),
      quota_total: 80,
      status: 'open' as const,
    },
    {
      title: 'Korea Seoul Seongsu & Myeongdong Edit',
      slug: 'trip-korea-seoul-seongsu-myeongdong',
      country: 'Korea Selatan',
      city_or_area: 'Seoul (Seongsu, Hannam, Myeongdong)',
      description: 'Kurasi K-fashion & K-beauty terpopuler: Gentle Monster, Tamburins, Marithe Francois Girbaud, dan Olive Young.',
      terms: 'DP 50% tersedia untuk seluruh slot PO Seoul. Estimasi tiba 5 hari setelah keberangkatan.',
      cover_image_url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80',
      currency: 'KRW',
      exchange_rate: 12,
      fee_type: 'flat' as const,
      fee_value: 40000,
      open_date: daysFromNow(-5, 9),
      close_date: daysFromNow(12, 21),
      departure_date: daysFromNow(14, 9),
      estimated_arrival_date: daysFromNow(20, 18),
      quota_total: 70,
      status: 'open' as const,
    },
    {
      title: 'Singapore Orchard & Marina Bay Express',
      slug: 'trip-singapura-orchard-marina-bay',
      country: 'Singapura',
      city_or_area: 'Orchard Road & Marina Bay Sands',
      description: 'Express jastip 3 hari: Charles & Keith, Bacha Coffee, TWG Tea, Coach, dan Sephora SG.',
      terms: 'Trip kilat akhir pekan, wajib melunasi tagihan sesuai batas transfer setelah ACC admin.',
      cover_image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
      currency: 'SGD',
      exchange_rate: 12200,
      fee_type: 'flat' as const,
      fee_value: 30000,
      open_date: daysFromNow(-3, 9),
      close_date: daysFromNow(5, 20),
      departure_date: daysFromNow(6, 7),
      estimated_arrival_date: daysFromNow(9, 19),
      quota_total: 60,
      status: 'open' as const,
    },
    {
      title: 'Paris & Milan Luxury Outlet Batch',
      slug: 'trip-eropa-paris-milan-luxury-outlet',
      country: 'Prancis',
      city_or_area: 'Paris (Galeries Lafayette) & Milan',
      description: 'Belanja produk luxury Eropa dengan tax refund: Longchamp, Polene, Jacquemus, Diptyque, dan Loewe.',
      terms: 'PO sudah ditutup dan tim sedang dalam fase pembelanjaan di Paris & Milan.',
      cover_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      currency: 'EUR',
      exchange_rate: 17500,
      fee_type: 'percent' as const,
      fee_value: 8,
      open_date: daysFromNow(-24, 9),
      close_date: daysFromNow(-4, 21),
      departure_date: daysFromNow(-2, 10),
      estimated_arrival_date: daysFromNow(4, 18),
      quota_total: 40,
      status: 'purchasing' as const,
    },
    {
      title: 'Bangkok Siam & Chatuchak Curated Trip',
      slug: 'trip-bangkok-siam-chatuchak-batch',
      country: 'Thailand',
      city_or_area: 'Bangkok (Siam Paragon, CentralWorld)',
      description: 'Batch Bangkok dengan koleksi Gentlewoman, Rally Movement, Care Bears, dan camilan Thailand populer.',
      terms: 'Barang sudah mendarat di Jakarta dan dalam proses sortir sebelum dikirim ke alamat customer.',
      cover_image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
      currency: 'THB',
      exchange_rate: 470,
      fee_type: 'flat' as const,
      fee_value: 25000,
      open_date: daysFromNow(-30, 9),
      close_date: daysFromNow(-12, 21),
      departure_date: daysFromNow(-8, 9),
      estimated_arrival_date: daysFromNow(-1, 18),
      quota_total: 65,
      status: 'arrived' as const,
    },
    {
      title: 'Hong Kong & Macau Autumn Heritage Trip',
      slug: 'trip-hongkong-macau-autumn-batch',
      country: 'Hong Kong',
      city_or_area: 'Causeway Bay & Tsim Sha Tsui',
      description: 'Trip musim gugur Hong Kong untuk Jenny Bakery, Polo Ralph Lauren, dan skincare duty free.',
      terms: 'Seluruh pesanan pada batch ini telah selesai disalurkan.',
      cover_image_url: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200&q=80',
      currency: 'HKD',
      exchange_rate: 2100,
      fee_type: 'flat' as const,
      fee_value: 30000,
      open_date: daysFromNow(-45, 9),
      close_date: daysFromNow(-26, 21),
      departure_date: daysFromNow(-22, 9),
      estimated_arrival_date: daysFromNow(-16, 18),
      quota_total: 50,
      status: 'completed' as const,
    },
  ]

  const tripBySlug = new Map<string, { id: number; title: string; slug: string }>()
  for (const trip of tripDefs) {
    const created = await prisma.jastip_trips.create({
      data: {
        ...trip,
        created_by: admin.id,
      },
    })
    tripBySlug.set(trip.slug, created)
  }

  // 7. Products (39 total: 6-7 per category across all 6 categories)
  interface ProductSeedDef {
    name: string
    slug: string
    categorySlug: string
    productType: 'ready' | 'jastip'
    tripSlug?: string
    price: number
    originalPrice?: number
    originalCurrency?: string
    sourceStore: string
    description: string
    imageUrl: string
    galleryImages?: string[]
    stockStatus?: 'in_stock' | 'out_of_stock'
    stockQuantity?: number
    quota?: number
    maxQtyPerOrder?: number
    variantTier?: {
      name: string
      options: VariantOptionInput[]
    }
  }

  const productDefs: ProductSeedDef[] = [
    // === 1. Tas & Dompet (7 produk) ===
    {
      name: 'Longchamp Le Pliage Original Medium Tote',
      slug: 'longchamp-le-pliage-original-medium-tote',
      categorySlug: 'tas-dompet',
      productType: 'ready',
      price: 2150000,
      originalPrice: 120,
      originalCurrency: 'EUR',
      sourceStore: 'Galeries Lafayette Paris (Ready Jakarta)',
      description: 'Tas tote ikonik berbahan kanvas nilon ringan dengan trim kulit asli, muat laptop 13 inci dan cocok untuk harian.',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
      ],
      stockQuantity: 10,
      variantTier: {
        name: 'Warna',
        options: [
          { value: 'Black', price: 2150000, stock: 5, sku: 'LC-BLK-M' },
          { value: 'Navy', price: 2150000, stock: 3, sku: 'LC-NVY-M' },
          { value: 'Paper Cream', price: 2250000, stock: 2, sku: 'LC-CRM-M' },
        ],
      },
    },
    {
      name: 'Polene Cyme Mini Leather Tote',
      slug: 'polene-cyme-mini-leather-tote',
      categorySlug: 'tas-dompet',
      productType: 'jastip',
      tripSlug: 'trip-eropa-paris-milan-luxury-outlet',
      price: 6850000,
      originalPrice: 350,
      originalCurrency: 'EUR',
      sourceStore: 'Polene Flagship Paris',
      description: 'Tas kulit calf-grain sculpted dari Paris dengan desain sayap lipat dua gaya pakai.',
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
      quota: 6,
      maxQtyPerOrder: 2,
      variantTier: {
        name: 'Warna',
        options: [
          { value: 'Camel', price: 6850000, stock: 3, sku: 'POL-CYM-CML' },
          { value: 'Taupe', price: 6850000, stock: 3, sku: 'POL-CYM-TPE' },
        ],
      },
    },
    {
      name: 'Coach Tabby Shoulder Bag 26 Quilted',
      slug: 'coach-tabby-shoulder-bag-26-quilted',
      categorySlug: 'tas-dompet',
      productType: 'ready',
      price: 6450000,
      originalPrice: 520,
      originalCurrency: 'SGD',
      sourceStore: 'Coach Wisma Atria Singapore',
      description: 'Tas bahu kulit nappa quilted dengan logo hardware C klasik dan dua strap lepas pasang.',
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 4,
      maxQtyPerOrder: 2,
    },
    {
      name: 'Gentlewoman Canvas Tote Classic Cream',
      slug: 'gentlewoman-canvas-tote-classic-cream',
      categorySlug: 'tas-dompet',
      productType: 'ready',
      price: 495000,
      originalPrice: 790,
      originalCurrency: 'THB',
      sourceStore: 'Gentlewoman Siam Square Bangkok',
      description: 'Totebag kanvas tebal signature Bangkok yang kokoh dan populer untuk hangout maupun kuliah.',
      imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 18,
    },
    {
      name: 'Charles & Keith Gabine Saddle Crossbody',
      slug: 'charles-keith-gabine-saddle-crossbody',
      categorySlug: 'tas-dompet',
      productType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      price: 1180000,
      originalPrice: 89,
      originalCurrency: 'SGD',
      sourceStore: 'Charles & Keith ION Orchard SG',
      description: 'Saddle bag dengan gesper emas melengkung khas seri Gabine langsung dari butik Singapura.',
      imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
      quota: 12,
      variantTier: {
        name: 'Warna',
        options: [
          { value: 'Espresso Brown', price: 1180000, stock: 6, sku: 'CK-GAB-BRN' },
          { value: 'Ivory Cream', price: 1180000, stock: 6, sku: 'CK-GAB-IVR' },
        ],
      },
    },
    {
      name: 'Samo Ondoh Pocket Mug Bag M',
      slug: 'samo-ondoh-pocket-mug-bag-m',
      categorySlug: 'tas-dompet',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 1920000,
      originalPrice: 139000,
      originalCurrency: 'KRW',
      sourceStore: 'Samo Ondoh Seongsu-dong Seoul',
      description: 'Tas desainer Korea bergaya Y2K dengan banyak kantong fungsional di bagian luar.',
      imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80',
      quota: 8,
    },
    {
      name: 'Porter Yoshida Tanker Zip Card Wallet',
      slug: 'porter-yoshida-tanker-zip-card-wallet',
      categorySlug: 'tas-dompet',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 2390000,
      originalPrice: 20900,
      originalCurrency: 'JPY',
      sourceStore: 'Porter Flagship Omotesando Tokyo',
      description: 'Dompet kartu nilon militer tiga lapis Made in Japan dengan ritsleting halus dan ring carabiner.',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
      quota: 10,
    },

    // === 2. Fashion & Pakaian (7 produk) ===
    {
      name: 'Marithe Francois Girbaud Classic Logo Tee',
      slug: 'marithe-francois-girbaud-classic-logo-tee',
      categorySlug: 'fashion-pakaian',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 785000,
      originalPrice: 49000,
      originalCurrency: 'KRW',
      sourceStore: 'Marithe Hannam-dong Seoul',
      description: 'Kaus katun premium potongan reguler dengan sablon logo klasik Prancis populer di Seoul.',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      quota: 20,
      variantTier: {
        name: 'Ukuran',
        options: [
          { value: 'S', price: 785000, stock: 6, sku: 'MFG-TEE-S' },
          { value: 'M', price: 785000, stock: 8, sku: 'MFG-TEE-M' },
          { value: 'L', price: 785000, stock: 6, sku: 'MFG-TEE-L' },
        ],
      },
    },
    {
      name: 'Uniqlo Japan Heattech Fleece Turtleneck',
      slug: 'uniqlo-japan-heattech-fleece-turtleneck',
      categorySlug: 'fashion-pakaian',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 365000,
      originalPrice: 2290,
      originalCurrency: 'JPY',
      sourceStore: 'Uniqlo Ginza Flagship Tokyo',
      description: 'Atasan turtleneck lembut berteknologi Heattech edisi musim dingin Jepang, hangat dan breathable.',
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',
      quota: 25,
      variantTier: {
        name: 'Ukuran',
        options: [
          { value: 'S', price: 365000, stock: 8, sku: 'UQ-HT-S' },
          { value: 'M', price: 365000, stock: 10, sku: 'UQ-HT-M' },
          { value: 'L', price: 365000, stock: 7, sku: 'UQ-HT-L' },
        ],
      },
    },
    {
      name: 'Mardi Mercredi Sweatshirt Flower Print',
      slug: 'mardi-mercredi-sweatshirt-flower-print',
      categorySlug: 'fashion-pakaian',
      productType: 'ready',
      price: 1190000,
      originalPrice: 75000,
      originalCurrency: 'KRW',
      sourceStore: 'Mardi Mercredi Hannam Store',
      description: 'Crewneck sweatshirt katun fleece oversized dengan motif bunga daisy khas Seoul.',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 9,
    },
    {
      name: 'Comme des Garcons Play Striped Long Sleeve',
      slug: 'cdg-play-striped-long-sleeve',
      categorySlug: 'fashion-pakaian',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 2290000,
      originalPrice: 18700,
      originalCurrency: 'JPY',
      sourceStore: 'Dover Street Market Ginza',
      description: 'Kaus lengan panjang garis breton katun Jepang dengan bordir hati ikonik merah.',
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80',
      quota: 10,
      variantTier: {
        name: 'Ukuran',
        options: [
          { value: 'M', price: 2290000, stock: 5, sku: 'CDG-STR-M' },
          { value: 'L', price: 2290000, stock: 5, sku: 'CDG-STR-L' },
        ],
      },
    },
    {
      name: 'Polo Ralph Lauren Oxford Linen Shirt',
      slug: 'polo-ralph-lauren-oxford-linen-shirt',
      categorySlug: 'fashion-pakaian',
      productType: 'ready',
      price: 2450000,
      originalPrice: 1100,
      originalCurrency: 'HKD',
      sourceStore: 'Ralph Lauren Harbour City HK',
      description: 'Kemeja oxford linen breathable dengan detail kuda bordir di dada, cocok untuk gaya smart-casual.',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 7,
    },
    {
      name: 'AMI Paris De Coeur Wool Cardigan',
      slug: 'ami-paris-de-coeur-wool-cardigan',
      categorySlug: 'fashion-pakaian',
      productType: 'jastip',
      tripSlug: 'trip-eropa-paris-milan-luxury-outlet',
      price: 5950000,
      originalPrice: 310,
      originalCurrency: 'EUR',
      sourceStore: 'AMI Paris Le Marais Boutique',
      description: 'Kardigan rajut merino wool lembut dengan bordir logo hati A klasik.',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
      quota: 5,
      maxQtyPerOrder: 2,
    },
    {
      name: 'Human Made Heavyweight Duck Tee',
      slug: 'human-made-heavyweight-duck-tee',
      categorySlug: 'fashion-pakaian',
      productType: 'ready',
      price: 1650000,
      originalPrice: 12100,
      originalCurrency: 'JPY',
      sourceStore: 'Human Made Offline Store Tokyo',
      description: 'Kaus katun slub Jepang edisi terbatas (sementara stok terjual habis untuk demo status out of stock).',
      imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
      stockStatus: 'out_of_stock',
      stockQuantity: 0,
    },

    // === 3. Sepatu & Sneakers (6 produk) ===
    {
      name: 'Onitsuka Tiger Mexico 66 Birch Green',
      slug: 'onitsuka-tiger-mexico-66-birch-green',
      categorySlug: 'sepatu-sneakers',
      productType: 'ready',
      price: 2350000,
      originalPrice: 15400,
      originalCurrency: 'JPY',
      sourceStore: 'Onitsuka Tiger Ginza Flagship',
      description: 'Sneakers kulit retro ikonik dari Tokyo warna Birch/Peacoat Green lengkap box asli.',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 8,
      variantTier: {
        name: 'Ukuran EU',
        options: [
          { value: '39', price: 2350000, stock: 3, sku: 'OT-M66-39' },
          { value: '41', price: 2350000, stock: 3, sku: 'OT-M66-41' },
          { value: '42', price: 2350000, stock: 2, sku: 'OT-M66-42' },
        ],
      },
    },
    {
      name: 'New Balance 990v6 Made in USA Grey',
      slug: 'new-balance-990v6-made-in-usa-grey',
      categorySlug: 'sepatu-sneakers',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 3650000,
      originalPrice: 31000,
      originalCurrency: 'JPY',
      sourceStore: 'New Balance Harajuku Tokyo',
      description: 'Sneakers lari/lifestyle flagship dengan FuelCell midsole super empuk untuk jalan jauh.',
      imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
      quota: 9,
      variantTier: {
        name: 'Ukuran EU',
        options: [
          { value: '40', price: 3650000, stock: 3, sku: 'NB-990-40' },
          { value: '42', price: 3650000, stock: 4, sku: 'NB-990-42' },
          { value: '43', price: 3650000, stock: 2, sku: 'NB-990-43' },
        ],
      },
    },
    {
      name: 'Adidas Samba OG Cloud White Core Black',
      slug: 'adidas-samba-og-cloud-white',
      categorySlug: 'sepatu-sneakers',
      productType: 'ready',
      price: 2100000,
      originalPrice: 159,
      originalCurrency: 'SGD',
      sourceStore: 'Adidas Brand Centre Orchard SG',
      description: 'Siluet klasik sol gum dengan upper kulit dan suede abu di ujung depan.',
      imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 10,
      variantTier: {
        name: 'Ukuran EU',
        options: [
          { value: '38', price: 2100000, stock: 4, sku: 'AD-SMB-38' },
          { value: '40', price: 2100000, stock: 3, sku: 'AD-SMB-40' },
          { value: '41', price: 2100000, stock: 3, sku: 'AD-SMB-41' },
        ],
      },
    },
    {
      name: 'Salomon XT-6 Gore-Tex Lunar Rock',
      slug: 'salomon-xt-6-gore-tex-lunar-rock',
      categorySlug: 'sepatu-sneakers',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 3490000,
      originalPrice: 260000,
      originalCurrency: 'KRW',
      sourceStore: 'Salomon Seongsu Flagship Seoul',
      description: 'Trail sneakers tahan air berlapis membran Gore-Tex ePE yang populer di streetwear.',
      imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80',
      quota: 7,
    },
    {
      name: 'Asics Gel-Kayano 14 Cream Metallic',
      slug: 'asics-gel-kayano-14-cream-metallic',
      categorySlug: 'sepatu-sneakers',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 2890000,
      originalPrice: 22000,
      originalCurrency: 'JPY',
      sourceStore: 'Asics Original Store Harajuku',
      description: 'Sneakers mesh retro akhir 2000-an dengan bantalan GEL khas Asics Jepang.',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
      quota: 8,
    },
    {
      name: 'Veja Campo Chromefree White Gold',
      slug: 'veja-campo-chromefree-white-gold',
      categorySlug: 'sepatu-sneakers',
      productType: 'ready',
      price: 2650000,
      originalPrice: 145,
      originalCurrency: 'EUR',
      sourceStore: 'Veja Store Paris',
      description: 'Sneakers kulit bebas krom minimalis dengan logo V berwarna gold.',
      imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 6,
    },

    // === 4. Skincare & Kosmetik (7 produk) ===
    {
      name: 'SK-II Facial Treatment Essence 230ml (Japan)',
      slug: 'sk-ii-facial-treatment-essence-230ml-japan',
      categorySlug: 'skincare-kosmetik',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 2550000,
      originalPrice: 22000,
      originalCurrency: 'JPY',
      sourceStore: 'Mitsukoshi Ginza Tokyo',
      description: 'Pitera essence asli Jepang ukuran full-size 230ml untuk mencerahkan dan menjaga tekstur kulit.',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
      quota: 15,
    },
    {
      name: 'Shiseido Ultimune Power Infusing Concentrate',
      slug: 'shiseido-ultimune-power-infusing-75ml',
      categorySlug: 'skincare-kosmetik',
      productType: 'ready',
      price: 1850000,
      originalPrice: 15950,
      originalCurrency: 'JPY',
      sourceStore: 'Shiseido Global Flagship Ginza',
      description: 'Serum anti-aging penguat skin barrier ukuran 75ml buatan Jepang.',
      imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 11,
    },
    {
      name: 'Round Lab Birch Juice Moisturizing Sun Cream Twin',
      slug: 'round-lab-birch-juice-sunscreen-twin',
      categorySlug: 'skincare-kosmetik',
      productType: 'ready',
      price: 385000,
      originalPrice: 26000,
      originalCurrency: 'KRW',
      sourceStore: 'Olive Young Myeongdong Seoul',
      description: 'Paket isi 2 tube sunscreen Korea terlaris SPF50+ PA++++ tanpa whitecast.',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 24,
    },
    {
      name: 'Torriden Dive-In Low Molecular Hyaluronic Serum',
      slug: 'torriden-dive-in-hyaluronic-serum-duo',
      categorySlug: 'skincare-kosmetik',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 315000,
      originalPrice: 21000,
      originalCurrency: 'KRW',
      sourceStore: 'Olive Young Seongsu Seoul',
      description: 'Serum hidrasi ringan cepat meresap dengan 5D hyaluronic acid untuk kulit sensitif.',
      imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
      quota: 30,
    },
    {
      name: 'Rom&nd Juicy Lasting Tint Exclusive Set',
      slug: 'romand-juicy-lasting-tint-exclusive',
      categorySlug: 'skincare-kosmetik',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 195000,
      originalPrice: 12000,
      originalCurrency: 'KRW',
      sourceStore: 'Chicor Gangnam Seoul',
      description: 'Lip tint glossy tahan lama dengan pilihan warna terfavorit langsung dari Korea.',
      imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
      quota: 35,
      variantTier: {
        name: 'Shade',
        options: [
          { value: '06 Figfig', price: 195000, stock: 12, sku: 'RM-JLT-06' },
          { value: '13 Eat Dotori', price: 195000, stock: 11, sku: 'RM-JLT-13' },
          { value: '25 Bare Grape', price: 195000, stock: 12, sku: 'RM-JLT-25' },
        ],
      },
    },
    {
      name: 'Anessa Perfect UV Skincare Milk SPF50+',
      slug: 'anessa-perfect-uv-skincare-milk-60ml',
      categorySlug: 'skincare-kosmetik',
      productType: 'ready',
      price: 375000,
      originalPrice: 3050,
      originalCurrency: 'JPY',
      sourceStore: 'Matsumoto Kiyoshi Shibuya',
      description: 'Sunscreen emas Jepang tahan air & keringat dengan tekstur susu ringan.',
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 16,
    },
    {
      name: 'Rare Beauty Soft Pinch Liquid Blush',
      slug: 'rare-beauty-soft-pinch-liquid-blush',
      categorySlug: 'skincare-kosmetik',
      productType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      price: 465000,
      originalPrice: 35,
      originalCurrency: 'SGD',
      sourceStore: 'Sephora ION Orchard Singapore',
      description: 'Blush cair super pigmented cukup satu titik untuk hasil merona alami seharian.',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80',
      quota: 18,
      variantTier: {
        name: 'Shade',
        options: [
          { value: 'Happy', price: 465000, stock: 9, sku: 'RB-BL-HPY' },
          { value: 'Hope', price: 465000, stock: 9, sku: 'RB-BL-HOP' },
        ],
      },
    },

    // === 5. Parfum & Aksesori (6 produk) ===
    {
      name: 'Tamburins Perfume Chamo 50ml',
      slug: 'tamburins-perfume-chamo-50ml',
      categorySlug: 'parfum-aksesori',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 2150000,
      originalPrice: 149000,
      originalCurrency: 'KRW',
      sourceStore: 'Tamburins Flagship Seongsu Seoul',
      description: 'Parfum signature Jennie dengan aroma chamomile lembut, wood grain, dan musky hangat.',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
      quota: 10,
    },
    {
      name: 'Gentle Monster Lilit 01 Sunglasses',
      slug: 'gentle-monster-lilit-01-sunglasses',
      categorySlug: 'parfum-aksesori',
      productType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      price: 4150000,
      originalPrice: 299000,
      originalCurrency: 'KRW',
      sourceStore: 'Gentle Monster Haus Dosan Seoul',
      description: 'Kacamata hitam frame asetat hitam kotak dengan lensa 99.9% UV protection.',
      imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
      quota: 6,
      maxQtyPerOrder: 2,
    },
    {
      name: 'Diptyque Orpheon Eau de Parfum 75ml',
      slug: 'diptyque-orpheon-eau-de-parfum-75ml',
      categorySlug: 'parfum-aksesori',
      productType: 'ready',
      price: 2950000,
      originalPrice: 160,
      originalCurrency: 'EUR',
      sourceStore: 'Diptyque Saint-Germain Paris',
      description: 'Parfum woody floral dengan aroma juniper berry, cedar, tonka bean, dan jasmine.',
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 5,
    },
    {
      name: 'Casio G-Shock DW-5600BB Matte Black (Japan)',
      slug: 'casio-g-shock-dw-5600bb-japan',
      categorySlug: 'parfum-aksesori',
      productType: 'ready',
      price: 1590000,
      originalPrice: 12500,
      originalCurrency: 'JPY',
      sourceStore: 'Bic Camera Shibuya Tokyo',
      description: 'Jam tangan digital G-Shock serba hitam matte dengan garansi resmi toko Jepang.',
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 7,
    },
    {
      name: 'Jo Malone English Pear & Freesia 30ml',
      slug: 'jo-malone-english-pear-freesia-30ml',
      categorySlug: 'parfum-aksesori',
      productType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      price: 1290000,
      originalPrice: 102,
      originalCurrency: 'SGD',
      sourceStore: 'Jo Malone Marina Bay Sands SG',
      description: 'Cologne aroma buah pir segar dan bunga freesia putih kemasan hadiah lengkap pita.',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
      quota: 12,
    },
    {
      name: 'Vivienne Westwood Mini Bas Relief Pearl Choker',
      slug: 'vivienne-westwood-mini-bas-relief-choker',
      categorySlug: 'parfum-aksesori',
      productType: 'jastip',
      tripSlug: 'trip-eropa-paris-milan-luxury-outlet',
      price: 3650000,
      originalPrice: 185,
      originalCurrency: 'EUR',
      sourceStore: 'Vivienne Westwood Paris Boutique',
      description: 'Kalung mutiara Swarovski single strand dengan orb crystal signature berwarna perak.',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      quota: 5,
    },

    // === 6. Snack & Lifestyle (6 produk) ===
    {
      name: 'Tokyo Banana Original 8pcs Gift Box',
      slug: 'tokyo-banana-original-8pcs-gift-box',
      categorySlug: 'snack-lifestyle',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 225000,
      originalPrice: 1296,
      originalCurrency: 'JPY',
      sourceStore: 'Tokyo Station Gift Hall',
      description: 'Bolu sponge lembut khas Tokyo berisi krim pisang custard segar oleh-oleh favorit Jepang.',
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80',
      quota: 30,
      maxQtyPerOrder: 6,
    },
    {
      name: 'Royces Nama Chocolate Au Lait 20pcs',
      slug: 'royces-nama-chocolate-au-lait-20pcs',
      categorySlug: 'snack-lifestyle',
      productType: 'ready',
      price: 245000,
      originalPrice: 864,
      originalCurrency: 'JPY',
      sourceStore: 'Royce Duty Free Narita (Ready Cold Box)',
      description: 'Cokelat ganache Hokkaido super lumer dibalut bubuk kakao lembut.',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 20,
    },
    {
      name: 'Bacha Coffee 1910 Fine Flavoured Assorted',
      slug: 'bacha-coffee-1910-assorted-12bags',
      categorySlug: 'snack-lifestyle',
      productType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      price: 455000,
      originalPrice: 32,
      originalCurrency: 'SGD',
      sourceStore: 'Bacha Coffee ION Orchard Singapore',
      description: 'Kotak berisi 12 drip coffee bag 100% Arabica beraroma stroberi & krim khas Bacha Coffee.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
      quota: 25,
    },
    {
      name: 'Jenny Bakery Butter Cookies Mix 4-in-1 640g',
      slug: 'jenny-bakery-butter-cookies-640g',
      categorySlug: 'snack-lifestyle',
      productType: 'ready',
      price: 495000,
      originalPrice: 175,
      originalCurrency: 'HKD',
      sourceStore: 'Jenny Bakery Tsim Sha Tsui HK',
      description: 'Kue mentega kaleng Teddy Bear autentik Hong Kong isi 4 rasa (Butter, Coffee, Shortbread, Raisin Oats).',
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
      stockQuantity: 14,
    },
    {
      name: 'Starbucks Japan Reserve Ceramic Tumbler 355ml',
      slug: 'starbucks-japan-reserve-ceramic-tumbler',
      categorySlug: 'snack-lifestyle',
      productType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      price: 685000,
      originalPrice: 4400,
      originalCurrency: 'JPY',
      sourceStore: 'Starbucks Reserve Roastery Nakameguro',
      description: 'Tumbler keramik edisi eksklusif Nakameguro Tokyo dengan tutup anti-tumpah.',
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80',
      quota: 12,
    },
    {
      name: 'Irvins Salted Egg Salmon Skin Large 230g',
      slug: 'irvins-salted-egg-salmon-skin-230g',
      categorySlug: 'snack-lifestyle',
      productType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      price: 275000,
      originalPrice: 19,
      originalCurrency: 'SGD',
      sourceStore: 'Irvins VivoCity Singapore',
      description: 'Keripik kulit ikan salmon renyah dibalut saus telur asin dan daun kari asli Singapura.',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80',
      quota: 25,
    },
  ]

  const productBySlug = new Map<
    string,
    {
      id: number
      name: string
      slug: string
      price: number
      productType: 'ready' | 'jastip'
      tripId: number | null
      categoryName: string
      variantIds: Map<string, { id: number; label: string; price: number }>
    }
  >()

  for (const def of productDefs) {
    const category = categoryBySlug.get(def.categorySlug)
    if (!category) throw new Error(`Missing category: ${def.categorySlug}`)

    const trip = def.tripSlug ? tripBySlug.get(def.tripSlug) : undefined
    const isJastip = def.productType === 'jastip'
    const builtVariants = def.variantTier
      ? buildSingleTierVariants(def.variantTier.name, def.variantTier.options, isJastip)
      : null

    const createdProduct = await prisma.products.create({
      data: {
        name: def.name,
        slug: def.slug,
        description: def.description,
        category_id: category.id,
        product_type: def.productType,
        trip_id: trip ? trip.id : null,
        price: def.price,
        original_price: def.originalPrice ?? null,
        original_currency: def.originalCurrency ?? null,
        source_store: def.sourceStore,
        variants: builtVariants ? builtVariants.json : undefined,
        image_url: def.imageUrl,
        stock_status: def.stockStatus ?? 'in_stock',
        stock_quantity: isJastip ? null : (def.stockQuantity ?? 10),
        quota: isJastip ? (def.quota ?? 15) : null,
        max_qty_per_order: def.maxQtyPerOrder ?? 5,
        is_active: true,
        created_at: daysFromNow(-20, 10),
      },
    })

    const imgs = def.galleryImages?.length ? def.galleryImages : [def.imageUrl]
    await prisma.product_images.createMany({
      data: imgs.map((url, idx) => ({
        product_id: createdProduct.id,
        image_url: url,
        sort_order: idx + 1,
      })),
    })

    const variantIds = new Map<string, { id: number; label: string; price: number }>()
    if (builtVariants) {
      for (const row of builtVariants.rows) {
        const createdVar = await prisma.product_variants.create({
          data: {
            product_id: createdProduct.id,
            ...row,
          },
        })
        variantIds.set(createdVar.variant_label, {
          id: createdVar.id,
          label: createdVar.variant_label,
          price: Number(createdVar.price),
        })
      }
    }

    productBySlug.set(def.slug, {
      id: createdProduct.id,
      name: createdProduct.name,
      slug: createdProduct.slug,
      price: Number(createdProduct.price),
      productType: def.productType,
      tripId: trip ? trip.id : null,
      categoryName: category.name,
      variantIds,
    })
  }

  // 8. Orders + Order Items + Payments + Order Status Logs (15 orders covering all order statuses)
  interface OrderSeedItemInput {
    productSlug: string
    variantLabel?: string
    qty: number
  }

  interface OrderSeedDef {
    orderCode: string
    orderType: 'ready' | 'jastip'
    tripSlug?: string
    orderStatus:
      | 'pending_approval'
      | 'pending_payment'
      | 'payment_uploaded'
      | 'verified'
      | 'purchasing'
      | 'arrived'
      | 'ready_handover'
      | 'completed'
      | 'rejected'
      | 'cancelled'
      | 'expired'
    paymentType: 'full' | 'dp'
    shippingCost: number
    fulfillmentMethod: 'delivery' | 'pickup'
    createdDaysAgo: number
    customerNote?: string
    adminNote?: string
    rejectionReason?: string
    items: OrderSeedItemInput[]
  }

  const orderDefs: OrderSeedDef[] = [
    {
      orderCode: 'ORD-202611-001',
      orderType: 'ready',
      orderStatus: 'pending_approval',
      paymentType: 'full',
      shippingCost: 0,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 0,
      customerNote: 'Mohon cek ketersediaan warna Black dan kirim pakai JNE Yes.',
      items: [
        { productSlug: 'longchamp-le-pliage-original-medium-tote', variantLabel: 'Warna: Black', qty: 1 },
        { productSlug: 'royces-nama-chocolate-au-lait-20pcs', qty: 2 },
      ],
    },
    {
      orderCode: 'ORD-202611-002',
      orderType: 'jastip',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      orderStatus: 'pending_approval',
      paymentType: 'dp',
      shippingCost: 0,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 1,
      customerNote: 'Titip untuk oleh-oleh keluarga.',
      items: [
        { productSlug: 'new-balance-990v6-made-in-usa-grey', variantLabel: 'Ukuran EU: 42', qty: 1 },
        { productSlug: 'tokyo-banana-original-8pcs-gift-box', qty: 2 },
      ],
    },
    {
      orderCode: 'ORD-202611-003',
      orderType: 'ready',
      orderStatus: 'pending_payment',
      paymentType: 'full',
      shippingCost: 22000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 1,
      adminNote: 'Stok tersedia lengkap, silakan transfer sesuai total.',
      items: [
        { productSlug: 'round-lab-birch-juice-sunscreen-twin', qty: 2 },
        { productSlug: 'anessa-perfect-uv-skincare-milk-60ml', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-004',
      orderType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      orderStatus: 'pending_payment',
      paymentType: 'dp',
      shippingCost: 30000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 2,
      adminNote: 'Slot koper Seongsu tersedia. DP 50% aktif 24 jam.',
      items: [
        { productSlug: 'tamburins-perfume-chamo-50ml', qty: 1 },
        { productSlug: 'marithe-francois-girbaud-classic-logo-tee', variantLabel: 'Ukuran: M', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-005',
      orderType: 'ready',
      orderStatus: 'payment_uploaded',
      paymentType: 'full',
      shippingCost: 25000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 2,
      items: [
        { productSlug: 'onitsuka-tiger-mexico-66-birch-green', variantLabel: 'Ukuran EU: 41', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-006',
      orderType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      orderStatus: 'payment_uploaded',
      paymentType: 'dp',
      shippingCost: 20000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 3,
      items: [
        { productSlug: 'charles-keith-gabine-saddle-crossbody', variantLabel: 'Warna: Espresso Brown', qty: 1 },
        { productSlug: 'bacha-coffee-1910-assorted-12bags', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-007',
      orderType: 'ready',
      orderStatus: 'verified',
      paymentType: 'full',
      shippingCost: 18000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 4,
      adminNote: 'Pembayaran lunas terverifikasi, siap dipacking.',
      items: [
        { productSlug: 'shiseido-ultimune-power-infusing-75ml', qty: 1 },
        { productSlug: 'gentlewoman-canvas-tote-classic-cream', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-008',
      orderType: 'jastip',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      orderStatus: 'verified',
      paymentType: 'dp',
      shippingCost: 35000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 5,
      adminNote: 'DP 50% terverifikasi. Masuk daftar belanja tim Seoul.',
      items: [
        { productSlug: 'gentle-monster-lilit-01-sunglasses', qty: 1 },
        { productSlug: 'romand-juicy-lasting-tint-exclusive', variantLabel: 'Shade: 06 Figfig', qty: 2 },
      ],
    },
    {
      orderCode: 'ORD-202611-009',
      orderType: 'jastip',
      tripSlug: 'trip-eropa-paris-milan-luxury-outlet',
      orderStatus: 'purchasing',
      paymentType: 'full',
      shippingCost: 45000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 9,
      adminNote: 'Sedang dibelanjakan langsung di Galeries Lafayette & Le Marais Paris.',
      items: [
        { productSlug: 'polene-cyme-mini-leather-tote', variantLabel: 'Warna: Camel', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-010',
      orderType: 'jastip',
      tripSlug: 'trip-eropa-paris-milan-luxury-outlet',
      orderStatus: 'purchasing',
      paymentType: 'dp',
      shippingCost: 35000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 10,
      adminNote: 'DP diterima, masuk antrean pembelian butik Paris.',
      items: [
        { productSlug: 'vivienne-westwood-mini-bas-relief-choker', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-011',
      orderType: 'jastip',
      tripSlug: 'trip-bangkok-siam-chatuchak-batch',
      orderStatus: 'arrived',
      paymentType: 'full',
      shippingCost: 22000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 15,
      adminNote: 'Barang sudah mendarat di Jakarta dan lolos pengecekan kualitas.',
      items: [
        { productSlug: 'gentlewoman-canvas-tote-classic-cream', qty: 2 },
      ],
    },
    {
      orderCode: 'ORD-202611-012',
      orderType: 'ready',
      orderStatus: 'ready_handover',
      paymentType: 'full',
      shippingCost: 20000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 16,
      adminNote: 'Resi JNE: JNE-DBB-88912041.',
      items: [
        { productSlug: 'adidas-samba-og-cloud-white', variantLabel: 'Ukuran EU: 40', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-013',
      orderType: 'jastip',
      tripSlug: 'trip-hongkong-macau-autumn-batch',
      orderStatus: 'completed',
      paymentType: 'full',
      shippingCost: 25000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 26,
      adminNote: 'Paket diterima customer dengan baik.',
      items: [
        { productSlug: 'polo-ralph-lauren-oxford-linen-shirt', qty: 1 },
        { productSlug: 'jenny-bakery-butter-cookies-640g', qty: 2 },
      ],
    },
    {
      orderCode: 'ORD-202611-014',
      orderType: 'ready',
      orderStatus: 'completed',
      paymentType: 'full',
      shippingCost: 0,
      fulfillmentMethod: 'pickup',
      createdDaysAgo: 21,
      adminNote: 'Diambil langsung oleh customer di galeri dbb_luxe.',
      items: [
        { productSlug: 'diptyque-orpheon-eau-de-parfum-75ml', qty: 1 },
        { productSlug: 'casio-g-shock-dw-5600bb-japan', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-015',
      orderType: 'jastip',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      orderStatus: 'rejected',
      paymentType: 'full',
      shippingCost: 0,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 7,
      rejectionReason: 'Stok varian di butik Singapura sedang kosong sementara.',
      items: [
        { productSlug: 'rare-beauty-soft-pinch-liquid-blush', variantLabel: 'Shade: Hope', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-016',
      orderType: 'ready',
      orderStatus: 'cancelled',
      paymentType: 'full',
      shippingCost: 0,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 11,
      rejectionReason: 'Customer mengganti pilihan model sebelum pembayaran.',
      items: [
        { productSlug: 'veja-campo-chromefree-white-gold', qty: 1 },
      ],
    },
    {
      orderCode: 'ORD-202611-017',
      orderType: 'ready',
      orderStatus: 'expired',
      paymentType: 'full',
      shippingCost: 20000,
      fulfillmentMethod: 'delivery',
      createdDaysAgo: 18,
      rejectionReason: 'Batas waktu pembayaran 24 jam berakhir tanpa transfer.',
      items: [
        { productSlug: 'mardi-mercredi-sweatshirt-flower-print', qty: 1 },
      ],
    },
  ]

  const seededOrdersSummary: Array<{
    orderCode: string
    orderType: string
    orderStatus: string
    paymentType: string
    totalAmount: number
    paidAmount: number
  }> = []

  const receiptPlaceholder = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'

  for (const def of orderDefs) {
    const resolvedItems = def.items.map((it) => {
      const prod = productBySlug.get(it.productSlug)
      if (!prod) throw new Error(`Missing product for order ${def.orderCode}: ${it.productSlug}`)
      const matchedVariant = it.variantLabel ? prod.variantIds.get(it.variantLabel) : undefined
      const unitPrice = matchedVariant ? matchedVariant.price : prod.price
      return {
        productId: prod.id,
        productName: prod.name,
        variantId: matchedVariant ? matchedVariant.id : null,
        variantSnapshot: matchedVariant ? matchedVariant.label : (it.variantLabel || 'Standard'),
        qty: it.qty,
        unitPrice,
        subtotal: unitPrice * it.qty,
      }
    })

    const subtotal = resolvedItems.reduce((sum, it) => sum + it.subtotal, 0)
    const shippingCost = def.shippingCost
    const totalAmount = subtotal + shippingCost
    const dpAmount = def.paymentType === 'dp' ? Math.ceil(totalAmount / 2) : null
    const expectedFirstPay = def.paymentType === 'dp' ? (dpAmount || Math.ceil(totalAmount / 2)) : totalAmount

    const isPaidVerified = ['verified', 'purchasing', 'arrived', 'ready_handover', 'completed'].includes(def.orderStatus)
    const isPaymentUploaded = def.orderStatus === 'payment_uploaded'
    const paidAmount = isPaidVerified ? expectedFirstPay : 0
    const remainingAmount = Math.max(0, totalAmount - paidAmount)

    const createdAt = daysFromNow(-def.createdDaysAgo, 10, 15)
    const approvedAt = def.orderStatus !== 'pending_approval' && def.orderStatus !== 'rejected' && def.orderStatus !== 'cancelled'
      ? new Date(createdAt.getTime() + 60 * 60 * 1000)
      : null
    const paymentDeadline = def.orderStatus === 'pending_payment'
      ? hoursFromNow(18)
      : approvedAt
        ? new Date(approvedAt.getTime() + 24 * 60 * 60 * 1000)
        : null

    const trip = def.tripSlug ? tripBySlug.get(def.tripSlug) : undefined

    const createdOrder = await prisma.orders.create({
      data: {
        order_code: def.orderCode,
        user_id: customer.id,
        order_type: def.orderType,
        trip_id: trip ? trip.id : null,
        subtotal,
        unique_code: 0,
        total_amount: totalAmount,
        payment_type: def.paymentType,
        dp_amount: dpAmount,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        order_status: def.orderStatus,
        rejection_reason: def.rejectionReason ?? null,
        approved_at: approvedAt,
        payment_deadline: paymentDeadline,
        fulfillment_method: def.fulfillmentMethod,
        recipient_name: 'Siti Rahma',
        recipient_phone: customer.phone_number,
        shipping_address:
          def.fulfillmentMethod === 'pickup'
            ? 'Ambil di Galeri DBB Luxe, Jakarta Selatan'
            : 'Jl. Kemang Raya No. 88, Mampang Prapatan, Jakarta Selatan, DKI Jakarta 12730',
        shipping_cost: shippingCost,
        customer_note: def.customerNote ?? null,
        admin_note: def.adminNote ?? null,
        created_at: createdAt,
        updated_at: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
      },
    })

    for (const item of resolvedItems) {
      await prisma.order_items.create({
        data: {
          order_id: createdOrder.id,
          product_id: item.productId,
          variant_id: item.variantId,
          product_name_snapshot: item.productName,
          variant_snapshot: item.variantSnapshot,
          qty: item.qty,
          price_at_order: item.unitPrice,
          subtotal: item.subtotal,
        },
      })
    }

    if (isPaymentUploaded || isPaidVerified) {
      const paymentCreatedAt = new Date(createdAt.getTime() + 3 * 60 * 60 * 1000)
      await prisma.payments.create({
        data: {
          order_id: createdOrder.id,
          payment_kind: def.paymentType === 'dp' ? 'dp' : 'full',
          bank_account_id: activeBank.id,
          sender_name: 'Siti Rahma',
          sender_bank: 'BCA',
          amount: expectedFirstPay,
          receipt_url: receiptPlaceholder,
          status: isPaidVerified ? 'verified' : 'pending',
          admin_note: isPaidVerified ? 'Mutasi rekening terverifikasi.' : null,
          verified_by: isPaidVerified ? admin.id : null,
          verified_at: isPaidVerified ? new Date(paymentCreatedAt.getTime() + 45 * 60 * 1000) : null,
          created_at: paymentCreatedAt,
        },
      })
    }

    // Status Timeline Logs
    await prisma.order_status_logs.create({
      data: {
        order_id: createdOrder.id,
        from_status: null,
        to_status: 'pending_approval',
        changed_by: customer.id,
        note: 'Pesanan diajukan oleh customer.',
        created_at: createdAt,
      },
    })

    if (def.orderStatus !== 'pending_approval') {
      await prisma.order_status_logs.create({
        data: {
          order_id: createdOrder.id,
          from_status: 'pending_approval',
          to_status:
            def.orderStatus === 'rejected' || def.orderStatus === 'cancelled'
              ? def.orderStatus
              : 'pending_payment',
          changed_by: def.orderStatus === 'cancelled' ? customer.id : admin.id,
          note:
            def.orderStatus === 'rejected'
              ? `Pesanan ditolak admin: ${def.rejectionReason}`
              : def.orderStatus === 'cancelled'
                ? `Pesanan dibatalkan: ${def.rejectionReason}`
                : 'Pesanan disetujui admin (ACC).',
          created_at: new Date(createdAt.getTime() + 60 * 60 * 1000),
        },
      })
    }

    if (isPaymentUploaded || isPaidVerified) {
      await prisma.order_status_logs.create({
        data: {
          order_id: createdOrder.id,
          from_status: 'pending_payment',
          to_status: 'payment_uploaded',
          changed_by: customer.id,
          note: `Bukti transfer Rp ${expectedFirstPay.toLocaleString('id-ID')} diunggah.`,
          created_at: new Date(createdAt.getTime() + 3 * 60 * 60 * 1000),
        },
      })
    }

    if (isPaidVerified) {
      await prisma.order_status_logs.create({
        data: {
          order_id: createdOrder.id,
          from_status: 'payment_uploaded',
          to_status: 'verified',
          changed_by: admin.id,
          note: 'Pembayaran telah diverifikasi admin.',
          created_at: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000),
        },
      })
    }

    if (['purchasing', 'arrived', 'ready_handover', 'completed'].includes(def.orderStatus) && def.orderStatus !== 'verified') {
      await prisma.order_status_logs.create({
        data: {
          order_id: createdOrder.id,
          from_status: 'verified',
          to_status: def.orderStatus,
          changed_by: admin.id,
          note: def.adminNote || `Status pesanan diperbarui ke ${def.orderStatus}.`,
          created_at: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
        },
      })
    }

    if (def.orderStatus === 'expired') {
      await prisma.order_status_logs.create({
        data: {
          order_id: createdOrder.id,
          from_status: 'pending_payment',
          to_status: 'expired',
          changed_by: customer.id,
          note: 'Batas waktu pembayaran habis. Stok/kuota dikembalikan.',
          created_at: new Date(createdAt.getTime() + 25 * 60 * 60 * 1000),
        },
      })
    }

    seededOrdersSummary.push({
      orderCode: createdOrder.order_code,
      orderType: createdOrder.order_type,
      orderStatus: createdOrder.order_status,
      paymentType: createdOrder.payment_type,
      totalAmount: Number(createdOrder.total_amount),
      paidAmount: Number(createdOrder.paid_amount),
    })
  }

  // 9. Product Requests (6 requests covering all statuses)
  const requestDefs = [
    {
      product_name: 'Sony WH-1000XM5 Midnight Blue (Japan Edition)',
      description: 'Versi Jepang dengan garansi toko Yodobashi Camera Tokyo.',
      reference_image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      reference_link: 'https://www.yodobashi.com/',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      status: 'pending' as const,
      quoted_price: null,
      quote_note: null,
      quote_expires_at: null,
      admin_note: null,
    },
    {
      product_name: 'Dior Addict Lip Glow 001 Pink Duty Free',
      description: 'Tolong cek harga bundle 2 pcs jika tersedia di Lotte Duty Free.',
      reference_image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      reference_link: 'https://www.dior.com/',
      tripSlug: 'trip-korea-seoul-seongsu-myeongdong',
      status: 'reviewed' as const,
      quoted_price: null,
      quote_note: null,
      quote_expires_at: null,
      admin_note: 'Sedang dicek stok counter Lotte Duty Free Seoul.',
    },
    {
      product_name: 'Aesop Resurrection Aromatique Hand Balm 75ml',
      description: 'Cari tube aluminium ukuran 75ml beserta cotton pouch Aesop.',
      reference_image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      reference_link: 'https://www.aesop.com/sg/',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      status: 'quoted' as const,
      quoted_price: 495000,
      quote_note: 'Harga sudah termasuk fee jastip & box pelindung.',
      quote_expires_at: daysFromNow(4, 21),
      admin_note: 'Stok tersedia di Aesop Ngee Ann City.',
    },
    {
      product_name: 'Nintendo Switch OLED Splatoon 3 Special Edition',
      description: 'Set lengkap dock edisi khusus Jepang.',
      reference_image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80',
      reference_link: 'https://store-jp.nintendo.com/',
      tripSlug: 'trip-jepang-tokyo-osaka-winter',
      status: 'accepted' as const,
      quoted_price: 4950000,
      quote_note: 'Harga nett termasuk bubble wrap tebal & hand-carry cabin.',
      quote_expires_at: daysFromNow(3, 21),
      admin_note: 'Customer sudah menyetujui penawaran.',
    },
    {
      product_name: 'Bacha Coffee 1910 Fine Flavoured Assorted',
      description: 'Request box isi 12 sachet varian bestseller 1910.',
      reference_image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      reference_link: 'https://bachacoffee.com/',
      tripSlug: 'trip-singapura-orchard-marina-bay',
      status: 'available' as const,
      quoted_price: 455000,
      quote_note: 'Produk sudah ditambahkan ke katalog resmi trip Singapura.',
      quote_expires_at: null,
      admin_note: 'Sudah diterbitkan ke katalog trip.',
    },
    {
      product_name: 'Botol Kaca Cairan 1 Liter Edisi Terbatas',
      description: 'Cairan mudah pecah volume besar tanpa kemasan segel.',
      reference_image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
      reference_link: null,
      tripSlug: 'trip-bangkok-siam-chatuchak-batch',
      status: 'rejected' as const,
      quoted_price: null,
      quote_note: null,
      quote_expires_at: null,
      admin_note: 'Tidak memenuhi standar keamanan bagasi cairan > 500ml dalam botol kaca.',
    },
  ]

  for (const req of requestDefs) {
    const trip = tripBySlug.get(req.tripSlug)
    await prisma.product_requests.create({
      data: {
        user_id: customer.id,
        product_name: req.product_name,
        description: req.description,
        reference_image_url: req.reference_image_url,
        reference_link: req.reference_link,
        trip_id: trip ? trip.id : null,
        status: req.status,
        quoted_price: req.quoted_price,
        quote_note: req.quote_note,
        quote_expires_at: req.quote_expires_at,
        admin_note: req.admin_note,
        created_at: daysFromNow(-6, 14),
      },
    })
  }

  // 10. Wishlists for customer (6 items)
  const wishlistSlugs = [
    'longchamp-le-pliage-original-medium-tote',
    'onitsuka-tiger-mexico-66-birch-green',
    'sk-ii-facial-treatment-essence-230ml-japan',
    'tamburins-perfume-chamo-50ml',
    'bacha-coffee-1910-assorted-12bags',
    'mardi-mercredi-sweatshirt-flower-print',
  ]
  for (const slug of wishlistSlugs) {
    const prod = productBySlug.get(slug)
    if (prod) {
      await prisma.wishlists.create({
        data: {
          user_id: customer.id,
          product_id: prod.id,
        },
      })
    }
  }

  // 11. Customer Notifications (using standardized action types; no chat rooms/messages seeded)
  const bachaProd = productBySlug.get('bacha-coffee-1910-assorted-12bags')
  await prisma.notifications.createMany({
    data: [
      {
        user_id: customer.id,
        type: 'order_created',
        title: 'Pesanan #ORD-202611-001 Diajukan',
        body: 'Menunggu persetujuan admin untuk pemeriksaan stok.',
        link_url: '/orders/ORD-202611-001',
        is_read: false,
        created_at: daysFromNow(0, 10, 16),
      },
      {
        user_id: customer.id,
        type: 'order_approved',
        title: 'Pesanan #ORD-202611-003 Disetujui (ACC)!',
        body: 'Pesanan Anda telah disetujui oleh admin. Ongkir disepakati Rp 22.000. Silakan selesaikan pembayaran dalam 24 jam.',
        link_url: '/orders/ORD-202611-003/bayar',
        is_read: false,
        created_at: daysFromNow(-1, 11, 15),
      },
      {
        user_id: customer.id,
        type: 'payment_uploaded',
        title: 'Bukti Transfer #ORD-202611-005 Terkirim',
        body: 'Rp 2.375.000 via BCA. Menunggu verifikasi admin.',
        link_url: '/orders/ORD-202611-005',
        is_read: false,
        created_at: daysFromNow(-2, 13, 15),
      },
      {
        user_id: customer.id,
        type: 'request_quoted',
        title: 'Penawaran Harga Masuk!',
        body: 'Admin telah memberikan penawaran harga Rp 495.000 untuk request barang "Aesop Resurrection Aromatique Hand Balm 75ml".',
        link_url: '/request',
        is_read: false,
        created_at: daysFromNow(-2, 15, 0),
      },
      {
        user_id: customer.id,
        type: 'trip_arrived',
        title: 'Barang Trip Bangkok Siam & Chatuchak Curated Trip Telah Tiba!',
        body: 'Koper jastip sudah tiba di Indonesia. Pesanan Anda (#ORD-202611-011) sedang dalam proses sortir.',
        link_url: '/orders/ORD-202611-011',
        is_read: false,
        created_at: daysFromNow(-1, 18, 0),
      },
      {
        user_id: customer.id,
        type: 'payment_verified',
        title: 'Pembayaran #ORD-202611-007 Terverifikasi!',
        body: 'Terima kasih! Pembayaran Anda sebesar Rp 2.363.000 telah diverifikasi.',
        link_url: '/orders/ORD-202611-007',
        is_read: true,
        created_at: daysFromNow(-4, 14, 0),
      },
      {
        user_id: customer.id,
        type: 'request_available',
        title: 'Barang Request Anda Sudah Tersedia!',
        body: 'Produk "Bacha Coffee 1910 Fine Flavoured Assorted" telah dimasukkan ke dalam katalog trip Singapore Orchard & Marina Bay Express!',
        link_url: bachaProd ? `/jastip/trip-singapura-orchard-marina-bay/${bachaProd.slug}` : '/jastip',
        is_read: true,
        created_at: daysFromNow(-5, 11, 0),
      },
      {
        user_id: customer.id,
        type: 'order_completed',
        title: 'Update Status Pesanan #ORD-202611-013',
        body: 'Pesanan telah diterima dan transaksi selesai. Terima kasih telah berbelanja di dbb_luxe!',
        link_url: '/orders/ORD-202611-013',
        is_read: true,
        created_at: daysFromNow(-15, 16, 0),
      },
    ],
  })

  // Summary output of all seeded trips, products per category, and orders
  console.log('\n=== SEED SUMMARY ===')
  console.log(`Accounts (preserved): admin (@${admin.username}), customer (@${customer.username})`)
  console.log(`Active Bank (preserved): ${activeBank.bank_name} - ${activeBank.account_number}`)

  console.log(`\nTrips (${tripDefs.length}):`)
  tripDefs.forEach((t, idx) => {
    console.log(`  ${idx + 1}. [${t.status}] ${t.title} (${t.country}, ${t.currency} @ ${t.exchange_rate}) -> /jastip/${t.slug}`)
  })

  console.log(`\nProducts by Category (${productDefs.length} total):`)
  for (const cat of categoryDefs) {
    const items = productDefs.filter(p => p.categorySlug === cat.slug)
    console.log(`  - ${cat.name} (${items.length} produk):`)
    items.forEach((p, idx) => {
      console.log(`      ${idx + 1}. [${p.productType}] ${p.name} - Rp ${p.price.toLocaleString('id-ID')}`)
    })
  }

  console.log(`\nOrders (${seededOrdersSummary.length} total):`)
  seededOrdersSummary.forEach((o, idx) => {
    console.log(
      `  ${idx + 1}. ${o.orderCode} | ${o.orderType}/${o.paymentType} | ${o.orderStatus} | Total Rp ${o.totalAmount.toLocaleString('id-ID')} (Dibayar Rp ${o.paidAmount.toLocaleString('id-ID')})`
    )
  })
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
