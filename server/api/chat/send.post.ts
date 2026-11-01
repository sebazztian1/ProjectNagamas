import { defineEventHandler, readBody, createError } from 'h3'
import { getSessionFromEvent } from '../../utils/session'
import { prisma } from '../../utils/prisma'
import { useAblyRest } from '../../utils/ably'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harus login untuk mengirim pesan' })
  }

  const body = await readBody(event)
  const isAdmin = session.role === 'admin' || session.role === 'staff'

  const messageType: 'text' | 'image' | 'product' =
    body?.messageType === 'image' || body?.messageType === 'product'
      ? body.messageType
      : 'text'

  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : null
  const productId = body?.productId ? Number(body.productId) : null

  if (messageType === 'text' && !content) {
    throw createError({ statusCode: 400, message: 'Isi pesan tidak boleh kosong' })
  }

  let room: any = null

  if (isAdmin) {
    const roomId = body?.roomId ? Number(body.roomId) : undefined
    const customerId = body?.customerId ? Number(body.customerId) : undefined

    if (roomId && !isNaN(roomId)) {
      room = await prisma.chat_rooms.findUnique({ where: { id: roomId } })
    } else if (customerId && !isNaN(customerId)) {
      room = await prisma.chat_rooms.upsert({
        where: { customer_id: customerId },
        update: {},
        create: {
          customer_id: customerId,
          updated_at: new Date()
        }
      })
    }
  } else {
    room = await prisma.chat_rooms.upsert({
      where: { customer_id: session.userId },
      update: {},
      create: {
        customer_id: session.userId,
        updated_at: new Date()
      }
    })
  }

  if (!room) {
    throw createError({ statusCode: 404, message: 'Ruang chat tidak ditemukan' })
  }

  const createdMsg = await prisma.chat_messages.create({
    data: {
      room_id: room.id,
      sender_id: session.userId,
      sender_role: session.role as any,
      message_type: messageType,
      content: content || null,
      image_url: imageUrl,
      product_id: productId && !isNaN(productId) ? productId : null,
      is_read: false
    },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          image_url: true,
          product_type: true,
          stock_status: true,
          jastip_trips: {
            select: { slug: true, title: true }
          }
        }
      }
    }
  })

  const lastMessagePreview =
    content ||
    (messageType === 'image'
      ? '[Lampiran Gambar]'
      : createdMsg.products
        ? `[Produk] ${createdMsg.products.name}`
        : '[Pesan]')

  const updatedRoom = await prisma.chat_rooms.update({
    where: { id: room.id },
    data: {
      last_message: lastMessagePreview.slice(0, 250),
      updated_at: new Date(),
      ...(isAdmin
        ? { unread_customer_count: { increment: 1 } }
        : { unread_admin_count: { increment: 1 } })
    },
    include: {
      users: {
        select: { id: true, username: true, phone_number: true }
      }
    }
  })

  const messagePayload = {
    id: Number(createdMsg.id),
    roomId: createdMsg.room_id,
    senderId: createdMsg.sender_id,
    senderRole: createdMsg.sender_role,
    messageType: createdMsg.message_type,
    content: createdMsg.content,
    imageUrl: createdMsg.image_url,
    productId: createdMsg.product_id,
    product: createdMsg.products
      ? {
          id: createdMsg.products.id,
          name: createdMsg.products.name,
          slug: createdMsg.products.slug,
          price: Number(createdMsg.products.price),
          imageUrl: createdMsg.products.image_url,
          productType: createdMsg.products.product_type,
          stockStatus: createdMsg.products.stock_status,
          tripSlug: createdMsg.products.jastip_trips?.slug || null,
          tripTitle: createdMsg.products.jastip_trips?.title || null
        }
      : null,
    isRead: createdMsg.is_read,
    createdAt: createdMsg.created_at
  }

  // Publish real-time events via Ably if configured
  const ably = useAblyRest()
  if (ably) {
    try {
      await Promise.all([
        ably.channels.get(`chat:room-${room.id}`).publish('new-message', messagePayload),
        ably.channels.get('chat:admin-inbox').publish('room-updated', {
          id: updatedRoom.id,
          customerId: updatedRoom.customer_id,
          customerUsername: updatedRoom.users?.username || `Customer #${updatedRoom.customer_id}`,
          customerPhone: updatedRoom.users?.phone_number || '-',
          lastMessage: updatedRoom.last_message,
          unreadAdminCount: updatedRoom.unread_admin_count,
          unreadCustomerCount: updatedRoom.unread_customer_count,
          updatedAt: updatedRoom.updated_at,
          latestMessage: messagePayload
        })
      ])
    } catch (err: any) {
      console.warn('[chat/send] Ably broadcast warning:', err?.message || err)
    }
  }

  return messagePayload
})

