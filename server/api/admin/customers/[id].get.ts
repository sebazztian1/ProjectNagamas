import { defineEventHandler, getRouterParam, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { autoExpireOverdueOrders, formatOrderResponse } from '../../../utils/orders'
import { getCountryFlag } from '../../../utils/countryFlags'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID pelanggan tidak valid.' })
  }

  await autoExpireOverdueOrders()

  const customer = await prisma.users.findFirst({
    where: {
      id,
      role: 'customer'
    },
    select: {
      id: true,
      username: true,
      phone_number: true,
      role: true,
      is_active: true,
      can_order: true,
      can_request: true,
      can_chat: true,
      restriction_reason: true,
      created_at: true,
      updated_at: true,
      chat_rooms: {
        select: {
          id: true,
          last_message: true,
          unread_admin_count: true,
          unread_customer_count: true,
          updated_at: true
        }
      },
      orders: {
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: { id: true, username: true, phone_number: true }
          },
          jastip_trips: {
            select: { id: true, title: true, slug: true }
          },
          order_items: {
            include: {
              products: {
                select: { id: true, slug: true, image_url: true }
              }
            }
          },
          payments: {
            include: {
              bank_accounts: {
                select: { id: true, bank_name: true }
              }
            },
            orderBy: { created_at: 'desc' }
          },
          order_status_logs: {
            include: {
              users: {
                select: { id: true, username: true }
              }
            },
            orderBy: { created_at: 'asc' }
          }
        }
      },
      product_requests: {
        orderBy: { created_at: 'desc' },
        include: {
          jastip_trips: {
            select: {
              id: true,
              title: true,
              slug: true,
              country: true,
              status: true
            }
          }
        }
      }
    }
  })

  if (!customer) {
    throw createError({ statusCode: 404, message: 'Data pelanggan tidak ditemukan.' })
  }

  const formattedOrders = await Promise.all(
    customer.orders.map(order => formatOrderResponse(order))
  )

  const now = new Date()
  const formattedRequests = customer.product_requests.map(r => {
    const trip = r.jastip_trips
    const isExpired = r.quote_expires_at ? new Date(r.quote_expires_at) < now : false
    return {
      id: r.id,
      productName: r.product_name,
      description: r.description || '',
      referenceImageUrl: r.reference_image_url || '',
      referenceLink: r.reference_link || '',
      tripId: r.trip_id,
      tripTitle: trip?.title || 'Bebas / Belum Ditentukan',
      tripSlug: trip?.slug || '',
      targetCountry: trip?.country || 'Internasional',
      flag: trip?.country ? getCountryFlag(trip.country) : '🌐',
      status: r.status,
      quotedPrice: r.quoted_price !== null ? Number(r.quoted_price) : null,
      quoteNote: r.quote_note || '',
      quoteExpiresAt: r.quote_expires_at ? r.quote_expires_at.toISOString() : null,
      adminNote: r.admin_note || '',
      isExpired,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at ? r.updated_at.toISOString() : null
    }
  })

  const unpaidStatuses = new Set(['pending_approval', 'pending_payment'])
  const paidProgressStatuses = new Set(['payment_uploaded', 'verified', 'purchasing', 'arrived', 'ready_handover'])
  const cancelledStatuses = new Set(['rejected', 'cancelled', 'expired'])

  const summary = {
    totalOrders: formattedOrders.length,
    unpaidOrders: formattedOrders.filter(o => unpaidStatuses.has(o.orderStatus)).length,
    paidOrders: formattedOrders.filter(o => paidProgressStatuses.has(o.orderStatus) || o.orderStatus === 'completed').length,
    completedOrders: formattedOrders.filter(o => o.orderStatus === 'completed').length,
    cancelledOrders: formattedOrders.filter(o => cancelledStatuses.has(o.orderStatus)).length,
    totalPaidAmount: formattedOrders.reduce((sum, o) => {
      if (o.paidAmount > 0) return sum + o.paidAmount
      if (['verified', 'purchasing', 'arrived', 'ready_handover', 'completed'].includes(o.orderStatus)) {
        return sum + o.totalAmount
      }
      return sum
    }, 0),
    totalRequests: formattedRequests.length,
    pendingRequests: formattedRequests.filter(r => ['pending', 'reviewed', 'quoted'].includes(r.status)).length
  }

  return {
    customer: {
      id: customer.id,
      username: customer.username,
      phone: customer.phone_number,
      isActive: customer.is_active,
      canOrder: customer.can_order,
      canRequest: customer.can_request,
      canChat: customer.can_chat,
      restrictionReason: customer.restriction_reason || null,
      joinedAt: customer.created_at.toISOString(),
      updatedAt: customer.updated_at ? customer.updated_at.toISOString() : null,
      chatRoom: customer.chat_rooms
        ? {
            id: customer.chat_rooms.id,
            lastMessage: customer.chat_rooms.last_message || '',
            unreadAdminCount: customer.chat_rooms.unread_admin_count,
            unreadCustomerCount: customer.chat_rooms.unread_customer_count,
            updatedAt: customer.chat_rooms.updated_at ? customer.chat_rooms.updated_at.toISOString() : null
          }
        : null
    },
    summary,
    orders: formattedOrders,
    requests: formattedRequests
  }
})

