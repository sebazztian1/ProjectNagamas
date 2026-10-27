import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getCountryFlag } from '../../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const idStr = event.context.params?.id
  const id = Number(idStr)
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID trip tidak valid' })
  }

  const existing = await prisma.jastip_trips.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Jadwal trip tidak ditemukan' })
  }

  const body = await readBody(event)

  const updateData: any = {}
  if (body.title) updateData.title = body.title.trim()
  if (body.country) updateData.country = body.country.trim()
  if (body.cityOrArea !== undefined) updateData.city_or_area = body.cityOrArea ? body.cityOrArea.trim() : null
  if (body.description !== undefined) updateData.description = body.description ? body.description.trim() : null
  if (body.terms !== undefined) updateData.terms = body.terms ? body.terms.trim() : null
  if (body.coverImageUrl) updateData.cover_image_url = body.coverImageUrl.trim()
  if (body.currency) updateData.currency = body.currency.toUpperCase().slice(0, 3)
  if (body.exchangeRate !== undefined) updateData.exchange_rate = Number(body.exchangeRate)
  if (body.feeType) updateData.fee_type = body.feeType === 'percent' ? 'percent' : 'flat'
  if (body.feeValue !== undefined) updateData.fee_value = Number(body.feeValue)
  if (body.openDate) updateData.open_date = new Date(body.openDate)
  if (body.closeDate) updateData.close_date = new Date(body.closeDate)
  if (body.departureDate) updateData.departure_date = new Date(body.departureDate)
  if (body.estimatedArrivalDate) updateData.estimated_arrival_date = new Date(body.estimatedArrivalDate)
  if (body.quotaTotal !== undefined) updateData.quota_total = Number(body.quotaTotal)
  if (body.status) updateData.status = body.status
  updateData.updated_at = new Date()

  const updated = await prisma.jastip_trips.update({
    where: { id },
    data: updateData
  })

  return {
    success: true,
    message: 'Jadwal trip berhasil diperbarui.',
    trip: {
      id: updated.id,
      title: updated.title,
      country: updated.country,
      flag: getCountryFlag(updated.country),
      status: updated.status
    }
  }
})
