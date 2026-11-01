import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID Request tidak valid.' })
  }

  const body = await readBody(event)
  const nextStatus = body?.status

  if (!['accepted', 'rejected'].includes(nextStatus)) {
    throw createError({ statusCode: 400, message: 'Status yang diperbolehkan: accepted atau rejected.' })
  }

  const req = await prisma.product_requests.findUnique({
    where: { id }
  })

  if (!req) {
    throw createError({ statusCode: 404, message: 'Data request tidak ditemukan.' })
  }

  if (req.user_id !== session.userId && session.role !== 'admin' && session.role !== 'staff') {
    throw createError({ statusCode: 403, message: 'Anda tidak memiliki akses ke request ini.' })
  }

  const updated = await prisma.product_requests.update({
    where: { id },
    data: {
      status: nextStatus
    }
  })

  return {
    success: true,
    message: nextStatus === 'accepted' ? 'Penawaran disetujui!' : 'Penawaran ditolak.',
    status: updated.status
  }
})
