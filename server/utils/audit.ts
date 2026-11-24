import { prisma } from './prisma'
import { auditStorageMetadata } from './auditMetadata'
import type { Prisma } from '@prisma/client'
import type { SessionData } from './session'

export interface RecordAuditParams {
  action: string
  entityType: string
  entityId?: number | null
  detail?: any
}

/**
 * Mencatat aktivitas admin/staff ke tabel audit_logs.
 * Dijalankan dengan error handling agar kegagalan log tidak memutus operasi utama.
 */
export async function recordAuditLog(
  user: { userId?: number | null } | SessionData | number | null | undefined,
  params: RecordAuditParams
) {
  try {
    const userId = typeof user === 'number' ? user : (user && 'userId' in user ? user.userId : null)
    const entityId =
      params.entityId !== undefined && params.entityId !== null && !Number.isNaN(Number(params.entityId))
        ? Number(params.entityId)
        : null
    const sanitizedDetail =
      params.detail !== undefined && params.detail !== null
        ? auditStorageMetadata(params.entityType, params.detail) as Prisma.InputJsonObject
        : undefined
    return await prisma.audit_logs.create({
      data: {
        created_at: new Date(),
        user_id: userId ? Number(userId) : null,
        action: String(params.action || '').trim(),
        entity_type: String(params.entityType || '').trim(),
        entity_id: entityId,
        detail: sanitizedDetail
      }
    })
  } catch (err) {
    console.error('Failed to record audit log:', err)
    return null
  }
}

