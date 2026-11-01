import { defineEventHandler } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const accounts = await prisma.bank_accounts.findMany({
    where: { is_active: true },
    orderBy: { id: 'asc' }
  })

  return accounts.map((b) => ({
    id: b.id,
    bankName: b.bank_name,
    accountNumber: b.account_number,
    accountHolder: b.account_holder,
    qrisImageUrl: b.qris_image_url || null,
    isActive: b.is_active
  }))
})

