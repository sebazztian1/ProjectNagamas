import { defineEventHandler, setResponseHeader } from 'h3'
import { prisma } from '../../utils/prisma'
import { formatBankAccount } from '../../utils/storeSettings'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const accounts = await prisma.bank_accounts.findMany({
    where: { is_active: true },
    orderBy: { id: 'asc' }
  })

  return accounts.map(formatBankAccount)
})

