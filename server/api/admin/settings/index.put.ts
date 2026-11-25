import { defineEventHandler, readBody, createError, setResponseHeader } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { recordAuditLog } from '../../../utils/audit'
import {
  STORE_SETTING_KEYS,
  formatBankAccount,
  getStoreSettings,
  normalizeStoreSettings
} from '../../../utils/storeSettings'

interface BankInput {
  id?: number
  bankName: string
  accountNumber: string
  accountHolder: string
  isActive: boolean
}

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Halaman khusus admin.' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')

  const body = await readBody(event)
  const rawBanks = Array.isArray(body?.banks) ? body.banks : []
  if (rawBanks.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Minimal harus terdapat 1 rekening bank pada pengaturan toko.'
    })
  }

  const normalizedBanks: BankInput[] = []
  for (let i = 0; i < rawBanks.length; i++) {
    const item = rawBanks[i] || {}
    const idNum = Number(item.id)
    const id = Number.isInteger(idNum) && idNum > 0 ? idNum : undefined
    const bankName = String(item.bankName || '').trim()
    const accountNumber = String(item.accountNumber || '').trim()
    const accountHolder = String(item.accountHolder || '').trim()
    const isActive = Boolean(item.isActive)

    if (!bankName || bankName.length > 50) {
      throw createError({
        statusCode: 400,
        message: `Nama bank pada baris ke-${i + 1} wajib diisi (maksimal 50 karakter).`
      })
    }
    if (!accountNumber || accountNumber.length > 30) {
      throw createError({
        statusCode: 400,
        message: `Nomor rekening pada baris ke-${i + 1} wajib diisi (maksimal 30 karakter).`
      })
    }
    if (!accountHolder || accountHolder.length > 100) {
      throw createError({
        statusCode: 400,
        message: `Nama pemilik rekening pada baris ke-${i + 1} wajib diisi (maksimal 100 karakter).`
      })
    }

    normalizedBanks.push({
      id,
      bankName,
      accountNumber,
      accountHolder,
      isActive
    })
  }

  if (!normalizedBanks.some(b => b.isActive)) {
    throw createError({
      statusCode: 400,
      message: 'Minimal harus ada 1 rekening bank yang aktif untuk pembayaran customer.'
    })
  }

  const normalizedSettings = normalizeStoreSettings(body?.settings || {})
  const deletedBankIds: number[] = Array.isArray(body?.deletedBankIds)
    ? Array.from(
        new Set(
          body.deletedBankIds
            .map((v: unknown) => Number(v))
            .filter((n: number) => Number.isInteger(n) && n > 0)
        )
      )
    : []

  const incomingIds = new Set(normalizedBanks.map(b => b.id).filter((id): id is number => Boolean(id)))
  const safeDeleteIds = deletedBankIds.filter(id => !incomingIds.has(id))

  await prisma.$transaction(async (tx) => {
    for (const delId of safeDeleteIds) {
      const existing = await tx.bank_accounts.findUnique({
        where: { id: delId },
        include: { _count: { select: { payments: true } } }
      })
      if (!existing) continue
      if (existing._count.payments === 0) {
        await tx.bank_accounts.delete({ where: { id: delId } })
      } else {
        await tx.bank_accounts.update({
          where: { id: delId },
          data: { is_active: false }
        })
      }
    }

    for (const b of normalizedBanks) {
      if (b.id) {
        await tx.bank_accounts.update({
          where: { id: b.id },
          data: {
            bank_name: b.bankName,
            account_number: b.accountNumber,
            account_holder: b.accountHolder,
            is_active: b.isActive
          }
        })
      } else {
        await tx.bank_accounts.create({
          data: {
            bank_name: b.bankName,
            account_number: b.accountNumber,
            account_holder: b.accountHolder,
            is_active: b.isActive
          }
        })
      }
    }

    const entries: Array<[string, string]> = [
      [STORE_SETTING_KEYS.paymentDuration, normalizedSettings.paymentDuration],
      [STORE_SETTING_KEYS.defaultFee, String(normalizedSettings.defaultFee)],
      [STORE_SETTING_KEYS.waNumber, normalizedSettings.waNumber],
      [STORE_SETTING_KEYS.storeStatus, normalizedSettings.storeStatus]
    ]

    for (const [key, value] of entries) {
      await tx.store_settings.upsert({
        where: { setting_key: key },
        update: { setting_value: value },
        create: { setting_key: key, setting_value: value }
      })
    }
  })

  const [updatedAccounts, updatedSettings] = await Promise.all([
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

  await recordAuditLog(session, {
    action: 'UPDATE_STORE_SETTINGS',
    entityType: 'setting',
    detail: {
      activeBanksCount: updatedAccounts.filter(b => b.is_active).length,
      totalBanksCount: updatedAccounts.length,
      settings: updatedSettings
    }
  })

  return {
    success: true,
    banks: updatedAccounts.map(formatBankAccount),
    settings: updatedSettings
  }
})
