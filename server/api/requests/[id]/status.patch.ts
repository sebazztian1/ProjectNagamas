import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent, clearSessionCookie } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan masuk ke akun Anda.' })
  }

  const currentUser = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, is_active: true, can_request: true, restriction_reason: true }
  })

  if (!currentUser || !currentUser.is_active) {
    clearSessionCookie(event)
    throw createError({ statusCode: 403, message: 'Akun Anda telah dinonaktifkan.' })
  }

  const isAdminRole =
    session.role === 'admin' ||
    session.role === 'staff' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'staff'

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

  if (req.user_id !== session.userId && !isAdminRole) {
    throw createError({ statusCode: 403, message: 'Anda tidak memiliki akses ke request ini.' })
  }

  if (isAdminRole && req.user_id === session.userId && nextStatus === 'accepted') {
    throw createError({
      statusCode: 403,
      message: 'Akun admin tidak dapat menyetujui penawaran request sendiri.'
    })
  }

  if (!isAdminRole && nextStatus === 'accepted' && !currentUser.can_request) {
    const reasonText = currentUser.restriction_reason ? ` Alasan: ${currentUser.restriction_reason}` : ''
    throw createError({
      statusCode: 403,
      message: `Fitur request produk pada akun Anda sedang dinonaktifkan oleh admin.${reasonText}`
    })
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
