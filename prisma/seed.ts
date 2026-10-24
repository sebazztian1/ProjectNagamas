import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Clean up existing data in reverse relation order
  await prisma.audit_logs.deleteMany()
  await prisma.order_status_logs.deleteMany()
  await prisma.payments.deleteMany()
  await prisma.order_items.deleteMany()
  await prisma.orders.deleteMany()
  await prisma.wishlists.deleteMany()
  await prisma.product_requests.deleteMany()
  await prisma.product_images.deleteMany()
  await prisma.chat_messages.deleteMany()
  await prisma.chat_rooms.deleteMany()
  await prisma.notifications.deleteMany()
  await prisma.products.deleteMany()
  await prisma.jastip_trips.deleteMany()
  await prisma.categories.deleteMany()
  await prisma.bank_accounts.deleteMany()
  await prisma.store_settings.deleteMany()
  await prisma.users.deleteMany()

  // 2. Users
  const passwordHashAdmin = await bcrypt.hash('admin123', 10)
  const passwordHashUser = await bcrypt.hash('password123', 10)

  const admin = await prisma.users.create({
    data: {
      username: 'admin',
      phone_number: '081298765432',
      password_hash: passwordHashAdmin,
      role: 'admin',
      is_active: true
    }
  })

  const customer = await prisma.users.create({
    data: {
      username: 'sitirahma',
      phone_number: '081234567890',
      password_hash: passwordHashUser,
      role: 'customer',
      is_active: true
    }
  })

  console.log('✅ Users seeded: username "admin" (pass: admin123) & "sitirahma" (pass: password123)')

  // 3. Categories (Tas, Baju, Sepatu, Aksesoris, Lainnya)
  const catTas = await prisma.categories.create({
    data: { name: 'Tas', slug: 'tas' }
  })
  const catBaju = await prisma.categories.create({
    data: { name: 'Baju', slug: 'baju' }
  })
  const catSepatu = await prisma.categories.create({
    data: { name: 'Sepatu', slug: 'sepatu' }
  })
  const catAksesoris = await prisma.categories.create({
    data: { name: 'Aksesoris', slug: 'aksesoris' }
  })
  const catLainnya = await prisma.categories.create({
    data: { name: 'Lainnya', slug: 'lainnya' }
  })

  console.log('✅ 5 Categories seeded: Tas, Baju, Sepatu, Aksesoris, Lainnya')

  // 4. Bank Accounts
  await prisma.bank_accounts.createMany({
    data: [
      {
        bank_name: 'BCA (Bank Central Asia)',
        account_number: '8830192831',
        account_holder: 'DBB LUXE INDONESIA',
        qris_image_url: 'https://images.unsplash.com/photo-1595079672139-545c600f5632?auto=format&fit=crop&w=600&q=80',
        is_active: true
      },
      {
        bank_name: 'Bank Mandiri',
        account_number: '1370019283912',
        account_holder: 'DBB LUXE INDONESIA',
        is_active: true
      }
    ]
  })

  console.log('✅ Bank Accounts seeded')

  // 5. Jastip Trips
  const tripJapan = await prisma.jastip_trips.create({
    data: {
      title: 'Japan Autumn Special Trip 2026',
      slug: 'japan-autumn-trip',
      country: 'Jepang',
      city_or_area: 'Tokyo & Osaka (Don Quijote, Tokyo Station, Ginza)',
      description: 'Titip berbagai macam snack legendaris Jepang, kosmetik & skincare drugstore, rilisan anime eksklusif, serta outerwear Uniqlo/GU dengan harga resmi Jepang.',
      terms: 'Batas pelunasan atau DP 50% wajib sebelum cut-off date. Barang yang out of stock di toko resmi Jepang akan di-refund 100%.',
      cover_image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      currency: 'JPY',
      exchange_rate: 108,
      fee_type: 'flat',
      fee_value: 35000,
      open_date: new Date('2026-10-01'),
      close_date: new Date('2026-10-20'),
      departure_date: new Date('2026-10-23'),
      estimated_arrival_date: new Date('2026-11-02'),
      quota_total: 50,
      status: 'open',
      created_by: admin.id
    }
  })

  const tripKorea = await prisma.jastip_trips.create({
    data: {
      title: 'Korea K-Beauty & Fashion Trip',
      slug: 'korea-k-beauty-trip',
      country: 'Korea Selatan',
      city_or_area: 'Seoul (Olive Young Myeongdong, Hongdae, Seongsu)',
      description: 'Beli langsung skincare viral Olive Young (Torriden, Anua, Medicube), merchandise K-Pop, dan fashion brand lokal Korea langsung dari store resmi.',
      terms: 'Pengiriman via ekspedisi kurir langsung ke alamat Anda setelah barang tiba di Jakarta.',
      cover_image_url: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80',
      currency: 'KRW',
      exchange_rate: 11.8,
      fee_type: 'flat',
      fee_value: 30000,
      open_date: new Date('2026-10-05'),
      close_date: new Date('2026-10-28'),
      departure_date: new Date('2026-10-31'),
      estimated_arrival_date: new Date('2026-11-12'),
      quota_total: 40,
      status: 'open',
      created_by: admin.id
    }
  })

  const tripBangkok = await prisma.jastip_trips.create({
    data: {
      title: 'Bangkok Mega Fashion & Big C Snack',
      slug: 'bangkok-snack-fashion',
      country: 'Thailand',
      city_or_area: 'Bangkok (Platinum Mall, Big C Supercenter, Siam)',
      description: 'Open PO pakaian santai linen, camilan rumput laut Tao Kae Noi, manisan mangga, dan Thai Tea Cha Tra Mue langsung dari Bangkok.',
      terms: 'Barang cair/kosmetik dalam kemasan bersegel aman sesuai regulasi penerbangan.',
      cover_image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
      currency: 'THB',
      exchange_rate: 460,
      fee_type: 'flat',
      fee_value: 25000,
      open_date: new Date('2026-10-10'),
      close_date: new Date('2026-11-15'),
      departure_date: new Date('2026-11-18'),
      estimated_arrival_date: new Date('2026-11-25'),
      quota_total: 60,
      status: 'open',
      created_by: admin.id
    }
  })

  console.log('✅ 3 Jastip Trips seeded')

  // 6. Ready Stock Products
  await prisma.products.create({
    data: {
      name: 'SK-II Facial Treatment Essence 230ml',
      slug: 'sk-ii-facial-treatment-essence-230ml',
      description: 'Pitera essence ikonik dari Jepang untuk mencerahkan, melembapkan, dan meratakan tekstur kulit secara mendalam. 100% Original stok impor resmi dengan segel utuh.',
      category_id: catLainnya.id,
      product_type: 'ready',
      price: 2450000,
      source_store: 'Isetan Shinjuku Tokyo',
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 4,
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Tokyo Banana Original Custard Cream Cake (Box of 8)',
      slug: 'tokyo-banana-original-box-8',
      description: 'Oleh-oleh nomor 1 dari stasiun Tokyo. Kue sponge lembut berisi krim custard pisang asli yang harum dan legit. Masa kedaluwarsa fresh 10 hari.',
      category_id: catLainnya.id,
      product_type: 'ready',
      price: 215000,
      source_store: 'Tokyo Station Ichibangai',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 12,
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Uniqlo Japan Flannel Check Shirt Regular Fit',
      slug: 'uniqlo-japan-flannel-check-shirt',
      description: 'Kemeja flanel katun 100% lembut kualitas pasar domestik Jepang. Hangat, nyaman dipakai harian, dan potongan fit rapi.',
      category_id: catBaju.id,
      product_type: 'ready',
      price: 380000,
      source_store: 'Uniqlo Ginza Global Flagship',
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 6,
      variants: { Ukuran: ['M', 'L', 'XL'], Warna: ['Navy Plaid', 'Red Brown'] },
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Shiseido Anessa Perfect UV Sunscreen Skincare Milk SPF50+ 60ml',
      slug: 'shiseido-anessa-perfect-uv-sunscreen-60ml',
      description: 'Tabir surya nomor 1 Jepang tahan air & keringat dengan teknologi Auto Booster. Tekstur ringan tidak lengket dan nyaman di bawah riasan.',
      category_id: catLainnya.id,
      product_type: 'ready',
      price: 340000,
      source_store: 'Matsumoto Kiyoshi Ginza',
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 8,
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Aethel Minimalist Leather Tote Bag with Laptop Sleeve',
      slug: 'aethel-minimalist-leather-tote-bag',
      description: 'Tas tote kulit asli berdesain elegan minimalis untuk gaya kerja modern. Dilengkapi kompartemen busa khusus laptop hingga 14 inch.',
      category_id: catTas.id,
      product_type: 'ready',
      price: 1250000,
      source_store: 'Local Curated Designer',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 3,
      variants: { Warna: ['Cognac Brown', 'Noir Black'] },
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Onitsuka Tiger Mexico 66 Classic Sneakers',
      slug: 'onitsuka-tiger-mexico-66-classic',
      description: 'Sepatu ikonik asal Jepang berbahan kulit premium dengan stripe khas Onitsuka Tiger. Sangat nyaman untuk pemakaian kasual sehari-hari.',
      category_id: catSepatu.id,
      product_type: 'ready',
      price: 1850000,
      source_store: 'Onitsuka Tiger Omotesando Flagship',
      image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 5,
      variants: { Ukuran: ['40', '41', '42', '43'] },
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Gentle Monster Sunglasses Minimalist Edition',
      slug: 'gentle-monster-sunglasses-minimalist',
      description: 'Kacamata hitam desainer asal Korea dengan proteksi UV400 penuh dan frame asetat premium yang ringan dan kokoh.',
      category_id: catAksesoris.id,
      product_type: 'ready',
      price: 3600000,
      source_store: 'Haus Dosan Seoul Store',
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      stock_status: 'in_stock',
      stock_quantity: 2,
      is_active: true
    }
  })

  // 7. Jastip Products (Linked to Trips)
  await prisma.products.create({
    data: {
      name: 'Shiroi Koibito White Chocolate Cookies (Box of 18)',
      slug: 'shiroi-koibito-white-chocolate-box-18',
      description: 'Kue lidah kucing legendaris Hokkaido dengan lapisan cokelat putih lembut. Dibelikan langsung dari bandara Haneda/Narita dengan jaminan fresh.',
      category_id: catLainnya.id,
      product_type: 'jastip',
      trip_id: tripJapan.id,
      price: 245000,
      original_price: 1500,
      original_currency: 'JPY',
      source_store: 'Fa-So-La Narita Duty Free',
      image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      quota: 25,
      is_active: true
    }
  })

  await prisma.products.create({
    data: {
      name: 'Torriden DIVE-IN Low Molecular Hyaluronic Acid Serum 50ml',
      slug: 'torriden-dive-in-hyaluronic-serum-50ml',
      description: 'Serum pelembap viral peraih juara Olive Young Awards 3 tahun berturut-turut. Menghidrasi kulit hingga lapisan terdalam tanpa rasa lengket.',
      category_id: catLainnya.id,
      product_type: 'jastip',
      trip_id: tripKorea.id,
      price: 285000,
      original_price: 21000,
      original_currency: 'KRW',
      source_store: 'Olive Young Myeongdong Global Store',
      image_url: 'https://images.unsplash.com/photo-1608248597359-33568853b1b6?auto=format&fit=crop&w=800&q=80',
      quota: 20,
      is_active: true
    }
  })

  console.log('✅ Ready Stock & Jastip Products seeded')

  // 8. Store Settings
  await prisma.store_settings.createMany({
    data: [
      { setting_key: 'store_name', setting_value: 'dbb_luxe' },
      { setting_key: 'contact_whatsapp', setting_value: '081234567890' },
      { setting_key: 'contact_email', setting_value: 'support@dbbluxe.com' },
      { setting_key: 'store_status', setting_value: 'open' },
      { setting_key: 'payment_deadline_hours', setting_value: '24' },
      { setting_key: 'default_fee_flat', setting_value: '35000' },
      { setting_key: 'exchange_rate_jpy', setting_value: '108' },
      { setting_key: 'exchange_rate_krw', setting_value: '11.8' },
      { setting_key: 'exchange_rate_thb', setting_value: '460' }
    ]
  })

  console.log('✅ Store Settings seeded')
  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
