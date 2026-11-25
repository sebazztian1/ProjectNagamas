import { defineEventHandler, createError, setResponseHeader } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { formatBankAccount, getStoreSettings } from '../../../utils/storeSettings'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Halaman khusus admin.' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')

  const [accounts, settings] = await Promise.all([
    prisma.bank_accounts.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { payments: true }
        }
      }
    }),
    getStoreSettings()
  ])

  return {
    banks: accounts.map(formatBankAccount),
    settings
  }
})
