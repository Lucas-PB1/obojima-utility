import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { ApiUser } from '@/lib/server/apiAuth';
import { AdminAuditAction, AdminAuditEntry } from '@/features/admin/types';

export const ADMIN_AUDIT_COLLECTION = 'adminAuditLog';

async function getDisplayName(uid: string): Promise<string> {
  const doc = await adminDb.collection('users').doc(uid).get();
  const data = doc.data();
  return String(data?.displayName || data?.email || uid);
}

/**
 * Records an admin action. Never throws: a failed audit write must not undo or
 * block the action itself, it is logged instead.
 */
export async function logAdminAction(
  actor: ApiUser,
  action: AdminAuditAction,
  summary: string,
  targetUid?: string | null,
  targetName?: string | null
): Promise<void> {
  try {
    const [actorName, resolvedTargetName] = await Promise.all([
      getDisplayName(actor.uid),
      targetUid && !targetName ? getDisplayName(targetUid) : Promise.resolve(targetName || null)
    ]);

    await adminDb.collection(ADMIN_AUDIT_COLLECTION).add({
      actorId: actor.uid,
      actorName,
      action,
      targetUid: targetUid || null,
      targetName: resolvedTargetName,
      summary,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    logger.error('Falha ao registrar auditoria do admin:', error);
  }
}

export async function listAdminAudit(options: {
  targetUid?: string | null;
  limit?: number;
}): Promise<AdminAuditEntry[]> {
  const max = Math.min(Math.max(options.limit || 100, 1), 300);
  const collection = adminDb.collection(ADMIN_AUDIT_COLLECTION);
  // Single-field ordering works with the automatic index. With a target filter,
  // where + orderBy would need a composite index, so sort that subset in memory.
  const snapshot = options.targetUid
    ? await collection.where('targetUid', '==', options.targetUid).limit(300).get()
    : await collection.orderBy('createdAt', 'desc').limit(max).get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : String(data.createdAt || '');
      return {
        id: doc.id,
        actorId: String(data.actorId || ''),
        actorName: String(data.actorName || data.actorId || ''),
        action: data.action as AdminAuditAction,
        targetUid: data.targetUid || null,
        targetName: data.targetName || null,
        summary: String(data.summary || ''),
        createdAt
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, max);
}
