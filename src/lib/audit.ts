import { db } from '@/lib/db'

/**
 * Get or create a system user for Command Center audit logging.
 *
 * The Command Center performs admin actions without a logged-in user context,
 * but AuditLog requires both outletId and userId. This helper:
 * 1. Looks for an existing system user (email: system@aetherpos.commandcenter)
 * 2. Falls back to the first OWNER user in the database
 * 3. If no users exist, returns null (audit log should be skipped)
 */
export async function getSystemAuditContext(): Promise<{ outletId: string; userId: string } | null> {
  // Try to find existing system user
  const systemUser = await db.user.findFirst({
    where: { email: 'system@aetherpos.commandcenter' },
  })
  if (systemUser) return { outletId: systemUser.outletId, userId: systemUser.id }

  // Fallback: find any OWNER user
  const anyOwner = await db.user.findFirst({ where: { role: 'OWNER' } })
  if (anyOwner) return { outletId: anyOwner.outletId, userId: anyOwner.id }

  // Last resort: find any user at all
  const anyUser = await db.user.findFirst()
  if (anyUser) return { outletId: anyUser.outletId, userId: anyUser.id }

  return null
}

/**
 * Get audit context for a specific outlet — finds the first owner user in that outlet.
 * Falls back to the system audit context if the outlet has no users.
 */
export async function getOutletAuditContext(outletId: string): Promise<{ outletId: string; userId: string } | null> {
  // Find an owner in this outlet
  const owner = await db.user.findFirst({
    where: { outletId, role: 'OWNER' },
  })
  if (owner) return { outletId, userId: owner.id }

  // Find any user in this outlet
  const anyUser = await db.user.findFirst({
    where: { outletId },
  })
  if (anyUser) return { outletId, userId: anyUser.id }

  // Fallback to system context
  return getSystemAuditContext()
}
