import { prisma } from './prisma'
import { resolvePublicMediaUrl } from './r2'

export const STORE_SETTING_KEYS = {
  paymentDuration: 'store_payment_duration_hours',
  defaultFee: 'store_default_fee',
  waNumber: 'store_wa_number',
  storeStatus: 'store_status'
} as const

export type PaymentDurationOption = '12' | '24' | '48'
export type StoreStatusOption = 'open' | 'trip_mode' | 'closed'

export interface StoreSettingsPayload {
  paymentDuration: PaymentDurationOption
  defaultFee: number
  waNumber: string
  storeStatus: StoreStatusOption
}

export const DEFAULT_STORE_SETTINGS: StoreSettingsPayload = {
  paymentDuration: '24',
  defaultFee: 35000,
  waNumber: '0812-9876-5432',
  storeStatus: 'open'
}

export function normalizeStoreSettings(
  input: Partial<Record<keyof StoreSettingsPayload, unknown>>
): StoreSettingsPayload {
  const rawDuration = String(input.paymentDuration ?? DEFAULT_STORE_SETTINGS.paymentDuration).trim()
  const paymentDuration: PaymentDurationOption =
    rawDuration === '12' || rawDuration === '24' || rawDuration === '48'
      ? rawDuration
      : DEFAULT_STORE_SETTINGS.paymentDuration

  const parsedFee = Number(input.defaultFee)
  const defaultFee =
    Number.isFinite(parsedFee) && parsedFee >= 0
      ? Math.round(parsedFee)
      : DEFAULT_STORE_SETTINGS.defaultFee

  const rawStatus = String(input.storeStatus ?? DEFAULT_STORE_SETTINGS.storeStatus).trim()
  const storeStatus: StoreStatusOption =
    rawStatus === 'open' || rawStatus === 'trip_mode' || rawStatus === 'closed'
      ? rawStatus
      : DEFAULT_STORE_SETTINGS.storeStatus

  const waNumber = String(input.waNumber ?? DEFAULT_STORE_SETTINGS.waNumber).trim().slice(0, 40)

  return {
    paymentDuration,
    defaultFee,
    waNumber: waNumber || DEFAULT_STORE_SETTINGS.waNumber,
    storeStatus
  }
}

export async function getStoreSettings(): Promise<StoreSettingsPayload> {
  const rows = await prisma.store_settings.findMany({
    where: {
      setting_key: { in: Object.values(STORE_SETTING_KEYS) }
    }
  })

  const map = new Map<string, string | null>()
  for (const row of rows) {
    map.set(row.setting_key, row.setting_value)
  }

  return normalizeStoreSettings({
    paymentDuration: map.get(STORE_SETTING_KEYS.paymentDuration) ?? DEFAULT_STORE_SETTINGS.paymentDuration,
    defaultFee: map.get(STORE_SETTING_KEYS.defaultFee) ?? DEFAULT_STORE_SETTINGS.defaultFee,
    waNumber: map.get(STORE_SETTING_KEYS.waNumber) ?? DEFAULT_STORE_SETTINGS.waNumber,
    storeStatus: map.get(STORE_SETTING_KEYS.storeStatus) ?? DEFAULT_STORE_SETTINGS.storeStatus
  })
}

export function formatBankAccount(b: {
  id: number
  bank_name: string
  account_number: string
  account_holder: string
  qris_image_url: string | null
  is_active: boolean
  _count?: { payments?: number }
}) {
  return {
    id: b.id,
    bankName: b.bank_name,
    accountNumber: b.account_number,
    accountHolder: b.account_holder,
    qrisImageUrl: resolvePublicMediaUrl(b.qris_image_url) || null,
    isActive: b.is_active,
    ...(b._count && typeof b._count.payments === 'number'
      ? { paymentsCount: b._count.payments }
      : {})
  }
}
