import { prisma } from './prisma'
import {
  getProvinces,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getVillagesByDistrict,
  normalizeIndonesianPhone
} from './indonesiaRegions'

export interface SavedAddressRecord {
  id: number
  user_id: number
  recipient_name: string
  phone: string
  province_code: string
  province_name: string
  regency_code: string
  regency_name: string
  district_code: string
  district_name: string
  village_code: string | null
  village_name: string | null
  postal_code: string | null
  street: string
  courier_note: string | null
  is_default: boolean
  created_at: string
}

export interface ValidatedAddressSnapshot {
  recipient_name: string
  phone: string
  province_code: string
  province_name: string
  regency_code: string
  regency_name: string
  district_code: string
  district_name: string
  village_code: string | null
  village_name: string | null
  postal_code: string | null
  street: string
  courier_note: string | null
  formatted_address: string
}

function escapePlainText(str: string, maxLen: number): string {
  return String(str || '')
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, maxLen)
}

/**
 * Validate and resolve an Indonesian address according to design_address.md Section 4:
 * - Recipient name >= 2 chars
 * - Phone matches ^(\+62|62|0)8[1-9][0-9]{6,11}$ and normalized to 628...
 * - Chosen kecamatan belongs to chosen kota, and kota to provinsi
 * - Chosen kelurahan (if given) belongs to kecamatan
 * - Postal code (if given) is 5 digits
 * - Street address >= 10 chars
 */
export function validateAndBuildAddressSnapshot(input: any): {
  valid: boolean
  errors: Record<string, string>
  data?: ValidatedAddressSnapshot
} {
  const errors: Record<string, string> = {}

  const recipientName = escapePlainText(input?.recipient_name ?? input?.recipientName ?? '', 100)
  if (recipientName.length < 2) {
    errors.recipient_name = 'Nama penerima wajib diisi'
  }

  const rawPhone = String(input?.phone ?? input?.recipientPhone ?? '').trim()
  const normalizedPhone = normalizeIndonesianPhone(rawPhone)
  if (!normalizedPhone) {
    errors.phone = 'Masukkan nomor HP yang valid, contoh: 081234567890'
  }

  const provinceCode = String(input?.province_code ?? input?.provinceCode ?? '').trim()
  const regencyCode = String(input?.regency_code ?? input?.regencyCode ?? '').trim()
  const districtCode = String(input?.district_code ?? input?.districtCode ?? '').trim()
  const villageCode = String(input?.village_code ?? input?.villageCode ?? '').trim() || null
  const postalCodeRaw = String(input?.postal_code ?? input?.postalCode ?? '').trim()
  const postalCode = postalCodeRaw ? postalCodeRaw : null
  const street = escapePlainText(input?.street ?? input?.streetAddress ?? '', 500)
  const courierNoteRaw = escapePlainText(input?.courier_note ?? input?.courierNote ?? '', 200)
  const courierNote = courierNoteRaw || null

  const provinces = getProvinces()
  const prov = provinces.find((p) => p.code === provinceCode)
  if (!prov) {
    errors.province_code = 'Pilih provinsi terlebih dahulu'
  }

  let reg: { code: string; province_code: string; name: string } | undefined
  if (prov) {
    const regencies = getRegenciesByProvince(prov.code)
    reg = regencies.find((r) => r.code === regencyCode)
    if (!reg || reg.province_code !== prov.code) {
      errors.regency_code = 'Pilih kota atau kabupaten'
    }
  } else if (!regencyCode) {
    errors.regency_code = 'Pilih kota atau kabupaten'
  }

  let dist: { code: string; regency_code: string; name: string } | undefined
  if (reg) {
    const districts = getDistrictsByRegency(reg.code)
    dist = districts.find((d) => d.code === districtCode)
    if (!dist || dist.regency_code !== reg.code) {
      errors.district_code = 'Pilih kecamatan'
    }
  } else if (!districtCode) {
    errors.district_code = 'Pilih kecamatan'
  }

  let vil: { code: string; district_code: string; name: string; postal_code: string | null } | undefined
  if (dist && villageCode) {
    const villages = getVillagesByDistrict(dist.code)
    vil = villages.find((v) => v.code === villageCode)
    if (!vil || vil.district_code !== dist.code) {
      errors.village_code = 'Kelurahan / desa tidak sesuai dengan kecamatan yang dipilih'
    }
  }

  if (postalCode && !/^\d{5}$/.test(postalCode)) {
    errors.postal_code = 'Kode pos harus 5 angka'
  }

  if (street.length < 10) {
    errors.street = 'Tulis alamat lengkap (nama jalan, nomor, RT/RW)'
  }

  if (Object.keys(errors).length > 0 || !prov || !reg || !dist || !normalizedPhone) {
    return { valid: false, errors }
  }

  const finalPostal = postalCode || vil?.postal_code || null
  const parts = [
    street,
    vil ? `Kel. ${vil.name}` : null,
    `Kec. ${dist.name}`,
    reg.name,
    prov.name,
    finalPostal
  ].filter(Boolean)

  const formattedAddress = parts.join(', ') + (courierNote ? ` (Catatan Kurir: ${courierNote})` : '')

  return {
    valid: true,
    errors: {},
    data: {
      recipient_name: recipientName,
      phone: normalizedPhone,
      province_code: prov.code,
      province_name: prov.name,
      regency_code: reg.code,
      regency_name: reg.name,
      district_code: dist.code,
      district_name: dist.name,
      village_code: vil ? vil.code : null,
      village_name: vil ? vil.name : null,
      postal_code: finalPostal,
      street,
      courier_note: courierNote,
      formatted_address: formattedAddress
    }
  }
}

export async function getUserSavedAddresses(userId: number): Promise<SavedAddressRecord[]> {
  const key = `user_addresses_${userId}`
  const row = await prisma.store_settings.findUnique({
    where: { setting_key: key }
  })
  if (!row?.setting_value) return []
  try {
    const parsed = JSON.parse(row.setting_value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveUserAddress(
  userId: number,
  snapshot: ValidatedAddressSnapshot
): Promise<SavedAddressRecord> {
  const key = `user_addresses_${userId}`
  const existing = await getUserSavedAddresses(userId)

  // Mark all previous addresses as non-default so the latest used one is preselected
  const updatedList = existing.map((a) => ({ ...a, is_default: false }))

  // Avoid exact duplicate
  const dupIndex = updatedList.findIndex(
    (a) =>
      a.recipient_name.toLowerCase() === snapshot.recipient_name.toLowerCase() &&
      a.phone === snapshot.phone &&
      a.district_code === snapshot.district_code &&
      a.street.toLowerCase() === snapshot.street.toLowerCase()
  )

  const newRecord: SavedAddressRecord = {
    id: dupIndex >= 0 ? updatedList[dupIndex].id : Date.now(),
    user_id: userId,
    recipient_name: snapshot.recipient_name,
    phone: snapshot.phone,
    province_code: snapshot.province_code,
    province_name: snapshot.province_name,
    regency_code: snapshot.regency_code,
    regency_name: snapshot.regency_name,
    district_code: snapshot.district_code,
    district_name: snapshot.district_name,
    village_code: snapshot.village_code,
    village_name: snapshot.village_name,
    postal_code: snapshot.postal_code,
    street: snapshot.street,
    courier_note: snapshot.courier_note,
    is_default: true,
    created_at: new Date().toISOString()
  }

  if (dupIndex >= 0) {
    updatedList.splice(dupIndex, 1)
  }

  const nextAddresses = [newRecord, ...updatedList].slice(0, 10)

  await prisma.store_settings.upsert({
    where: { setting_key: key },
    update: { setting_value: JSON.stringify(nextAddresses) },
    create: { setting_key: key, setting_value: JSON.stringify(nextAddresses) }
  })

  return newRecord
}

