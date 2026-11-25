import { defineEventHandler, setResponseHeader } from 'h3'
import { prisma } from '../../utils/prisma'
import { formatBankAccount, getStoreSettings } from '../../utils/storeSettings'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const [activeAccounts, settings] = await Promise.all([
    prisma.bank_accounts.findMany({
      where: { is_active: true },
      orderBy: { id: 'asc' }
    }),
    getStoreSettings()
  ])

  return {
    banks: activeAccounts.map(formatBankAccount),
    settings
  }
})
