import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { getSessionFromEvent } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Halaman khusus admin.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID Request tidak valid.' })
  }

  const body = await readBody(event)
  const req = await prisma.product_requests.findUnique({
    where: { id }
  })

  if (!req) {
    throw createError({ statusCode: 404, message: 'Data request tidak ditemukan.' })
  }

  const status = body?.status || 'quoted'
  const quotedPrice = body?.quotedPrice !== undefined && body?.quotedPrice !== null ? Number(body.quotedPrice) : req.quoted_price
  const quoteNote = body?.quoteNote !== undefined ? body.quoteNote : req.quote_note
  const adminNote = body?.adminNote !== undefined ? body.adminNote : req.admin_note

  let quoteExpiresAt = req.quote_expires_at
  if (body?.quoteExpiresAt) {
    quoteExpiresAt = new Date(body.quoteExpiresAt)
  }

  const updated = await prisma.product_requests.update({
    where: { id },
    data: {
      status,
      quoted_price: quotedPrice !== null ? quotedPrice : undefined,
      quote_note: quoteNote,
      quote_expires_at: quoteExpiresAt,
      admin_note: adminNote
    }
  })

  // Create customer notification if status changed to 'quoted', 'reviewed', or 'rejected'
  if (status === 'quoted' && quotedPrice) {
    await prisma.notifications.create({
      data: {
        user_id: req.user_id,
        type: 'request',
        title: 'Penawaran Harga Masuk!',
        body: `Admin telah memberikan penawaran harga Rp ${Number(quotedPrice).toLocaleString('id-ID')} untuk request barang "${req.product_name}". Segera tinjau penawaran ini.`,
        link_url: '/request'
      }
    })
  } else if (status === 'reviewed') {
    await prisma.notifications.create({
      data: {
        user_id: req.user_id,
        type: 'request',
        title: 'Request Produk Sedang Ditinjau Admin',
        body: `Permintaan titip barang "${req.product_name}" sedang dicek ketersediaan & harganya oleh tim dbb_luxe.`,
        link_url: '/request'
      }
    })
  } else if (status === 'rejected') {
    await prisma.notifications.create({
      data: {
        user_id: req.user_id,
        type: 'request',
        title: 'Update Request Titip Barang',
        body: `Mohon maaf, permintaan titip barang "${req.product_name}" saat ini belum dapat dipenuhi.${adminNote ? ' Catatan: ' + adminNote : ''}`,
        link_url: '/request'
      }
    })
  }

  return {
    success: true,
    message: 'Penawaran dan status request berhasil diperbarui!',
    data: {
      id: updated.id,
      status: updated.status,
      quotedPrice: updated.quoted_price ? Number(updated.quoted_price) : null,
      quoteNote: updated.quote_note,
      quoteExpiresAt: updated.quote_expires_at ? updated.quote_expires_at.toISOString().split('T')[0] : null
    }
  }
})
