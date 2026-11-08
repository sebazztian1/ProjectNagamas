import { defineEventHandler, readBody, createError } from 'h3'
import { getSessionFromEvent, clearSessionCookie } from '../../utils/session'
import { prisma } from '../../utils/prisma'
import { useAblyRest } from '../../utils/ably'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Harus login untuk mengirim pesan' })
  }

  // Ensure sender still exists in database
  const currentUser = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, is_active: true }
  })
  if (!currentUser || !currentUser.is_active) {
    clearSessionCookie(event)
    throw createError({ statusCode: 401, message: 'Sesi akun kedaluwarsa. Silakan masuk kembali.' })
  }

  const body = await readBody(event)
  const isAdmin = session.role === 'admin' || session.role === 'staff'

  const allowedTypes = ['text', 'image', 'product', 'jastip', 'request'] as const
  const messageType: 'text' | 'image' | 'product' | 'jastip' | 'request' =
    allowedTypes.includes(body?.messageType) ? body.messageType : 'text'

  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : null
  const productId = body?.productId ? Number(body.productId) : null
  const tripId = body?.tripId ? Number(body.tripId) : null
  const requestId = body?.requestId ? Number(body.requestId) : null

  if (messageType === 'text' && !content && !productId && !tripId && !requestId && !imageUrl) {
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
      trip_id: tripId && !isNaN(tripId) ? tripId : null,
      request_id: requestId && !isNaN(requestId) ? requestId : null,
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
      },
      jastip_trips: {
        select: {
          id: true,
          title: true,
          slug: true,
          country: true,
          city_or_area: true,
          cover_image_url: true,
          status: true,
          close_date: true,
          estimated_arrival_date: true
        }
      },
      product_requests: {
        select: {
          id: true,
          product_name: true,
          description: true,
          reference_image_url: true,
          reference_link: true,
          status: true,
          quoted_price: true,
          jastip_trips: {
            select: { title: true, country: true }
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
        ? `[${createdMsg.products.product_type === 'jastip' ? 'Jastip' : 'Produk'}] ${createdMsg.products.name}`
        : createdMsg.jastip_trips
          ? `[Jastip] ${createdMsg.jastip_trips.title}`
          : createdMsg.product_requests
            ? `[Request] ${createdMsg.product_requests.product_name}`
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

  if (isAdmin && room.customer_id) {
    try {
      await prisma.notifications.create({
        data: {
          user_id: room.customer_id,
          type: 'chat',
          title: 'Balasan Pesan dari Admin dbb_luxe',
          body: lastMessagePreview.slice(0, 250),
          link_url: '/chat'
        }
      })
    } catch {
      // Non-blocking notification insert
    }
  }

  const messagePayload = {
    id: Number(createdMsg.id),
    roomId: createdMsg.room_id,
    senderId: createdMsg.sender_id,
    senderRole: createdMsg.sender_role,
    messageType: createdMsg.message_type,
    content: createdMsg.content,
    imageUrl: createdMsg.image_url,
    productId: createdMsg.product_id,
    tripId: createdMsg.trip_id,
    requestId: createdMsg.request_id,
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
    trip: createdMsg.jastip_trips
      ? {
          id: createdMsg.jastip_trips.id,
          title: createdMsg.jastip_trips.title,
          slug: createdMsg.jastip_trips.slug,
          country: createdMsg.jastip_trips.country,
          cityOrArea: createdMsg.jastip_trips.city_or_area || '',
          coverImageUrl: createdMsg.jastip_trips.cover_image_url || null,
          status: createdMsg.jastip_trips.status,
          closeDate: createdMsg.jastip_trips.close_date,
          estimatedArrivalDate: createdMsg.jastip_trips.estimated_arrival_date
        }
      : null,
    productRequest: createdMsg.product_requests
      ? {
          id: createdMsg.product_requests.id,
          productName: createdMsg.product_requests.product_name,
          description: createdMsg.product_requests.description || '',
          referenceImageUrl: createdMsg.product_requests.reference_image_url || null,
          referenceLink: createdMsg.product_requests.reference_link || null,
          status: createdMsg.product_requests.status,
          quotedPrice: createdMsg.product_requests.quoted_price ? Number(createdMsg.product_requests.quoted_price) : null,
          tripTitle: createdMsg.product_requests.jastip_trips?.title || null,
          tripCountry: createdMsg.product_requests.jastip_trips?.country || null
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

