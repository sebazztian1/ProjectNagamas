import { defineEventHandler, getQuery, createError } from 'h3'
import { getSessionFromEvent, clearSessionCookie } from '../../utils/session'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Silakan login terlebih dahulu' })
  }

  // Ensure user still exists in database
  const currentUser = await prisma.users.findUnique({
    where: { id: session.userId },
    select: { id: true, is_active: true }
  })
  if (!currentUser || !currentUser.is_active) {
    clearSessionCookie(event)
    throw createError({ statusCode: 401, message: 'Sesi akun kedaluwarsa. Silakan masuk kembali.' })
  }

  const query = getQuery(event)
  const isAdmin = session.role === 'admin' || session.role === 'staff'

  let room: any = null

  if (isAdmin) {
    const roomId = query.roomId ? Number(query.roomId) : undefined
    const customerId = query.customerId ? Number(query.customerId) : undefined

    if (roomId && !isNaN(roomId)) {
      room = await prisma.chat_rooms.findUnique({
        where: { id: roomId },
        include: {
          users: { select: { id: true, username: true, phone_number: true } }
        }
      })
    } else if (customerId && !isNaN(customerId)) {
      room = await prisma.chat_rooms.upsert({
        where: { customer_id: customerId },
        update: {},
        create: {
          customer_id: customerId,
          updated_at: new Date()
        },
        include: {
          users: { select: { id: true, username: true, phone_number: true } }
        }
      })
    } else {
      throw createError({ statusCode: 400, message: 'Parameter roomId atau customerId diperlukan' })
    }
  } else {
    room = await prisma.chat_rooms.upsert({
      where: { customer_id: session.userId },
      update: {},
      create: {
        customer_id: session.userId,
        updated_at: new Date()
      },
      include: {
        users: { select: { id: true, username: true, phone_number: true } }
      }
    })
  }

  if (!room) {
    throw createError({ statusCode: 404, message: 'Ruang chat tidak ditemukan' })
  }

  // Mark unread messages as read for the viewer
  if (isAdmin && room.unread_admin_count > 0) {
    await Promise.all([
      prisma.chat_rooms.update({
        where: { id: room.id },
        data: { unread_admin_count: 0 }
      }),
      prisma.chat_messages.updateMany({
        where: {
          room_id: room.id,
          sender_role: 'customer',
          is_read: false
        },
        data: { is_read: true }
      })
    ])
    room.unread_admin_count = 0
  } else if (!isAdmin && room.unread_customer_count > 0) {
    await Promise.all([
      prisma.chat_rooms.update({
        where: { id: room.id },
        data: { unread_customer_count: 0 }
      }),
      prisma.chat_messages.updateMany({
        where: {
          room_id: room.id,
          sender_role: { in: ['admin', 'staff'] },
          is_read: false
        },
        data: { is_read: true }
      })
    ])
    room.unread_customer_count = 0
  }

  const messages = await prisma.chat_messages.findMany({
    where: { room_id: room.id },
    orderBy: { created_at: 'asc' },
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

  return {
    room: {
      id: room.id,
      customerId: room.customer_id,
      customerUsername: room.users?.username || `user_${room.customer_id}`,
      customerPhone: room.users?.phone_number || '-',
      lastMessage: room.last_message,
      unreadAdminCount: room.unread_admin_count,
      unreadCustomerCount: room.unread_customer_count,
      updatedAt: room.updated_at
    },
    messages: messages.map(m => ({
      id: Number(m.id),
      roomId: m.room_id,
      senderId: m.sender_id,
      senderRole: m.sender_role,
      messageType: m.message_type,
      content: m.content,
      imageUrl: m.image_url,
      productId: m.product_id,
      tripId: m.trip_id,
      requestId: m.request_id,
      product: m.products
        ? {
            id: m.products.id,
            name: m.products.name,
            slug: m.products.slug,
            price: Number(m.products.price),
            imageUrl: m.products.image_url,
            productType: m.products.product_type,
            stockStatus: m.products.stock_status,
            tripSlug: m.products.jastip_trips?.slug || null,
            tripTitle: m.products.jastip_trips?.title || null
          }
        : null,
      trip: m.jastip_trips
        ? {
            id: m.jastip_trips.id,
            title: m.jastip_trips.title,
            slug: m.jastip_trips.slug,
            country: m.jastip_trips.country,
            cityOrArea: m.jastip_trips.city_or_area || '',
            coverImageUrl: m.jastip_trips.cover_image_url || null,
            status: m.jastip_trips.status,
            closeDate: m.jastip_trips.close_date,
            estimatedArrivalDate: m.jastip_trips.estimated_arrival_date
          }
        : null,
      productRequest: m.product_requests
        ? {
            id: m.product_requests.id,
            productName: m.product_requests.product_name,
            description: m.product_requests.description || '',
            referenceImageUrl: m.product_requests.reference_image_url || null,
            referenceLink: m.product_requests.reference_link || null,
            status: m.product_requests.status,
            quotedPrice: m.product_requests.quoted_price ? Number(m.product_requests.quoted_price) : null,
            tripTitle: m.product_requests.jastip_trips?.title || null,
            tripCountry: m.product_requests.jastip_trips?.country || null
          }
        : null,
      isRead: m.is_read,
      createdAt: m.created_at
    }))
  }
})

