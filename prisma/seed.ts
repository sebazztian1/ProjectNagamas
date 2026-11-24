import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting minimal database seeding...')

  // 1. Clean up existing data in foreign-key-safe reverse order
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

  // 2. Seed only 2 accounts: 1 admin & 1 customer
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

  const totalUsers = await prisma.users.count()
  const activeBanks = await prisma.bank_accounts.count({ where: { is_active: true } })

  console.log(`Seeded admin user: id=${admin.id}, username="${admin.username}", role=${admin.role}`)
  console.log(`Seeded customer user: id=${customer.id}, username="${customer.username}", role=${customer.role}`)
  console.log(`Database totals -> users: ${totalUsers}, active bank_accounts: ${activeBanks}`)
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
