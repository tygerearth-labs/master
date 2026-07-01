import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { VALID_ACCOUNT_TYPES } from '@/lib/plan-config'
import { getOutletAuditContext } from '@/lib/audit'

// PUT /api/admin/outlets/[id]/plan — Change outlet plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { accountType, applyToGroup } = body

    if (!accountType || !VALID_ACCOUNT_TYPES.includes(accountType)) {
      return NextResponse.json(
        { error: `Invalid accountType. Valid: ${VALID_ACCOUNT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const outlet = await db.outlet.findUnique({
      where: { id },
      include: { group: { include: { outlets: true } } },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    const oldType = outlet.accountType

    // If this is a suspended outlet, unsuspend it by setting new plan
    // If changing plan, also unsuspend
    const updatedOutlets: string[] = []

    if (applyToGroup && outlet.groupId && outlet.group) {
      // Apply plan to all outlets in the group
      for (const groupOutlet of outlet.group.outlets) {
        // If outlet is suspended, unsuspend it to the new plan
        let newType = accountType
        if (groupOutlet.accountType.startsWith('suspended:')) {
          // Unsuspend — set to the new plan
          newType = accountType
        }
        await db.outlet.update({
          where: { id: groupOutlet.id },
          data: { accountType: newType },
        })
        updatedOutlets.push(groupOutlet.id)
      }
    } else {
      // Apply to single outlet
      await db.outlet.update({
        where: { id },
        data: { accountType },
      })
      updatedOutlets.push(id)
    }

    // Audit log
    const auditCtx = await getOutletAuditContext(id)
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'CHANGE_PLAN',
          entityType: 'OUTLET',
          entityId: id,
          outletId: id,
          userId: auditCtx.userId,
          details: JSON.stringify({ oldType, newType: accountType, applyToGroup: !!applyToGroup, updatedOutlets }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      previousPlan: oldType,
      newPlan: accountType,
      updatedOutlets,
    })
  } catch (error) {
    console.error('[PUT /api/admin/outlets/[id]/plan]', error)
    return NextResponse.json({ error: 'Failed to change plan' }, { status: 500 })
  }
}
