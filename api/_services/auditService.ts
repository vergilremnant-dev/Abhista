import { db } from '../_utils/../_utils/db.js';
import { RequirementStatus } from '@prisma/client';

export interface AuditLogParams {
  requirementId: number;
  fromStatus?: RequirementStatus | null;
  toStatus: RequirementStatus;
  changedById: string;
  changeReason?: string;
  previousValues?: unknown;
  newValues?: unknown;
}

export async function logRequirementHistory(params: AuditLogParams) {
  let prevStr: string | null = null;
  let nextStr: string | null = null;

  if (params.previousValues) {
    prevStr = JSON.stringify(params.previousValues);
  }
  if (params.newValues) {
    nextStr = JSON.stringify(params.newValues);
  }

  return await db.requirementHistory.create({
    data: {
      requirementId: params.requirementId,
      fromStatus: params.fromStatus || null,
      toStatus: params.toStatus,
      changedById: params.changedById,
      changeReason: params.changeReason || null,
      previousValues: prevStr,
      newValues: nextStr,
    },
  });
}

/**
 * Logs a secure audit event to the global_activities table.
 * These logs track system actions, are read-only, and cannot be updated/deleted.
 */
export async function logSecurityEvent(
  actorId: string,
  activityType: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PROFILE_UPDATE' | 'REQUIREMENT_CREATE' | 'BOOKING_ACCEPT' | 'PAYMENT_UPDATE' | 'ADMIN_ACTION',
  description: string,
  targetType?: string,
  targetId?: string
) {
  try {
    return await db.globalActivity.create({
      data: {
        actorId,
        activityType,
        description,
        targetType: targetType || null,
        targetId: targetId || null,
      },
    });
  } catch (error) {
    console.error(`[AUDIT_FAIL] Failed to log security event: ${error}`);
    // Return void, do not fail parent transaction for logging failure
  }
}
