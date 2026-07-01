import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSystemAuditContext } from '@/lib/audit'

// DELETE /api/admin/groups/[id] — Delete an outlet group
// Outlets in the group will become standalone (groupId set to null)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const group = await db.outletGroup.findUnique({
      where: { id },
      include: { outlets: true },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Store group data for audit before deletion
    const groupData = { name: group.name, outletsAffected: group.outlets.length }

    // Remove groupId from all outlets in this group (make them standalone)
    await db.$transaction([
      ...group.outlets.map(outlet =>
        db.outlet.update({
          where: { id: outlet.id },
          data: { groupId: null },
        })
      ),
      db.outletGroup.delete({ where: { id } }),
    ])

    // Audit log — use system context since the group owner relation is now gone
    const auditCtx = await getSystemAuditContext()
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'DELETE_GROUP',
          entityType: 'OUTLET',
          entityId: id,
          outletId: auditCtx.outletId,
          userId: auditCtx.userId,
          details: JSON.stringify(groupData),
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Group deleted. Outlets are now standalone.' })
  } catch (error) {
    console.error('[DELETE /api/admin/groups/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
