import { prisma } from './prisma'
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
    return await prisma.audit_logs.create({
      data: {
        user_id: userId ? Number(userId) : null,
        action: String(params.action || '').trim(),
        entity_type: String(params.entityType || '').trim(),
        entity_id: params.entityId ? Number(params.entityId) : null,
        detail: params.detail !== undefined ? JSON.parse(JSON.stringify(params.detail)) : undefined
      }
    })
  } catch (err) {
    console.error('Failed to record audit log:', err)
    return null
  }
}

