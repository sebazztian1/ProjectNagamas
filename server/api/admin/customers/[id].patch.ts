import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '../../../utils/prisma'
import { getSessionFromEvent } from '../../../utils/session'
import { recordAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const session = getSessionFromEvent(event)
  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    throw createError({ statusCode: 403, message: 'Akses khusus Admin/Staff.' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, message: 'ID pelanggan tidak valid.' })
  }

  if (id === session.userId) {
    throw createError({ statusCode: 400, message: 'Anda tidak dapat mengubah pembatasan akun sendiri.' })
  }

  const target = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      phone_number: true,
      role: true,
      is_active: true,
      can_order: true,
      can_request: true,
      can_chat: true,
      restriction_reason: true
    }
  })

  if (!target) {
    throw createError({ statusCode: 404, message: 'Pelanggan tidak ditemukan.' })
  }

  if (target.role !== 'customer') {
    throw createError({ statusCode: 400, message: 'Pembatasan hanya berlaku untuk akun pelanggan.' })
  }

  const body = await readBody(event)

  const nextIsActive = typeof body?.isActive === 'boolean' ? body.isActive : target.is_active
  const nextCanOrder = typeof body?.canOrder === 'boolean' ? body.canOrder : target.can_order
  const nextCanRequest = typeof body?.canRequest === 'boolean' ? body.canRequest : target.can_request
  const nextCanChat = typeof body?.canChat === 'boolean' ? body.canChat : target.can_chat

  let nextReason = target.restriction_reason
  if (body && 'restrictionReason' in body) {
    const rawReason = typeof body.restrictionReason === 'string' ? body.restrictionReason.trim().slice(0, 500) : ''
    nextReason = rawReason || null
  }

  const changedFields: string[] = []
  if (nextIsActive !== target.is_active) changedFields.push(`isActive: ${target.is_active} -> ${nextIsActive}`)
  if (nextCanOrder !== target.can_order) changedFields.push(`canOrder: ${target.can_order} -> ${nextCanOrder}`)
  if (nextCanRequest !== target.can_request) changedFields.push(`canRequest: ${target.can_request} -> ${nextCanRequest}`)
  if (nextCanChat !== target.can_chat) changedFields.push(`canChat: ${target.can_chat} -> ${nextCanChat}`)
  if (nextReason !== target.restriction_reason) changedFields.push('restrictionReason updated')

  const updated = await prisma.users.update({
    where: { id },
    data: {
      is_active: nextIsActive,
      can_order: nextCanOrder,
      can_request: nextCanRequest,
      can_chat: nextCanChat,
      restriction_reason: nextReason,
      updated_at: new Date()
    },
    select: {
      id: true,
      username: true,
      phone_number: true,
      is_active: true,
      can_order: true,
      can_request: true,
      can_chat: true,
      restriction_reason: true,
      updated_at: true
    }
  })

  if (changedFields.length > 0) {
    let action = 'UPDATE_CUSTOMER_ACCESS'
    if (!target.is_active && nextIsActive) {
      action = 'ENABLE_CUSTOMER_ACCOUNT'
    } else if (target.is_active && !nextIsActive) {
      action = 'DISABLE_CUSTOMER_ACCOUNT'
    }

    await recordAuditLog(session, {
      action,
      entityType: 'customer',
      entityId: target.id,
      detail: {
        username: target.username,
        phone: target.phone_number,
        previous: {
          isActive: target.is_active,
          canOrder: target.can_order,
          canRequest: target.can_request,
          canChat: target.can_chat
        },
        current: {
          isActive: updated.is_active,
          canOrder: updated.can_order,
          canRequest: updated.can_request,
          canChat: updated.can_chat
        },
        reason: updated.restriction_reason || undefined,
        note: changedFields.join(', ')
      }
    })
  }

  return {
    success: true,
    message: 'Status dan akses pelanggan berhasil diperbarui.',
    customer: {
      id: updated.id,
      username: updated.username,
      phone: updated.phone_number,
      isActive: updated.is_active,
      canOrder: updated.can_order,
      canRequest: updated.can_request,
      canChat: updated.can_chat,
      restrictionReason: updated.restriction_reason || null,
      updatedAt: updated.updated_at ? updated.updated_at.toISOString() : null
    }
  }
})

