import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/users/[id]/suspend — Suspend or unsuspend a user
// OWNER: prefixes the outlet's accountType with "suspended:"
// CREW: sets the user's `active` field to false
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { suspend, suspendGroup } = body

    const user = await db.user.findUnique({
      where: { id },
      include: { outlet: { include: { group: { include: { outlets: true } } } } },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ==================== CREW SUSPEND ====================
    if (user.role !== 'OWNER') {
      if (suspend && user.active) {
        await db.user.update({ where: { id }, data: { active: false } })
        await db.auditLog.create({
          data: {
            action: 'SUSPEND_USER',
            targetId: id,
            targetType: 'user',
            details: JSON.stringify({ userId: id, userName: user.name, userEmail: user.email, role: user.role }),
          },
        })
        return NextResponse.json({ success: true, action: 'suspended', userId: id })
      } else if (!suspend && !user.active) {
        await db.user.update({ where: { id }, data: { active: true } })
        await db.auditLog.create({
          data: {
            action: 'UNSUSPEND_USER',
            targetId: id,
            targetType: 'user',
            details: JSON.stringify({ userId: id, userName: user.name, userEmail: user.email, role: user.role }),
          },
        })
        return NextResponse.json({ success: true, action: 'unsuspended', userId: id })
      } else {
        return NextResponse.json({
          success: false,
          message: suspend ? 'User is already suspended' : 'User is not suspended',
        })
      }
    }

    // ==================== OWNER SUSPEND ====================
    const outlet = user.outlet
    const isCurrentlySuspended = outlet.accountType.startsWith('suspended:')
    const updatedOutlets: string[] = []

    if (suspend && !isCurrentlySuspended) {
      // SUSPEND: Prefix accountType with "suspended:" + deactivate user
      const suspendedType = `suspended:${outlet.accountType}`

      if (suspendGroup && outlet.groupId && outlet.group) {
        // Suspend all outlets in the group + all owners
        const groupOutletIds = outlet.group.outlets.map(o => o.id)
        await db.$transaction([
          ...groupOutletIds.map(oid =>
            db.outlet.update({
              where: { id: oid },
              data: { accountType: `suspended:${outlet.group!.outlets.find(o => o.id === oid)?.accountType || 'free'}` },
            })
          ),
          db.user.update({ where: { id }, data: { active: false } }),
        ])
        updatedOutlets.push(...groupOutletIds)
      } else {
        await db.$transaction([
          db.outlet.update({ where: { id: outlet.id }, data: { accountType: suspendedType } }),
          db.user.update({ where: { id }, data: { active: false } }),
        ])
        updatedOutlets.push(outlet.id)
      }

      await db.auditLog.create({
        data: {
          action: 'SUSPEND_OWNER',
          targetId: id,
          targetType: 'user',
          details: JSON.stringify({
            userId: id, userEmail: user.email,
            outletId: outlet.id, previousAccountType: outlet.accountType,
            suspendGroup: !!suspendGroup, updatedOutlets,
          }),
        },
      })

      return NextResponse.json({ success: true, action: 'suspended', previousAccountType: outlet.accountType, updatedOutlets })
    } else if (!suspend && isCurrentlySuspended) {
      // UNSUSPEND: Remove "suspended:" prefix + reactivate user
      const originalType = outlet.accountType.replace('suspended:', '')

      if (suspendGroup && outlet.groupId && outlet.group) {
        const groupOutletIds = outlet.group.outlets
          .filter(o => o.accountType.startsWith('suspended:'))
          .map(o => o.id)
        await db.$transaction([
          ...outlet.group.outlets
            .filter(o => o.accountType.startsWith('suspended:'))
            .map(o =>
              db.outlet.update({
                where: { id: o.id },
                data: { accountType: o.accountType.replace('suspended:', '') },
              })
            ),
          db.user.update({ where: { id }, data: { active: true } }),
        ])
        updatedOutlets.push(...groupOutletIds)
      } else {
        await db.$transaction([
          db.outlet.update({ where: { id: outlet.id }, data: { accountType: originalType } }),
          db.user.update({ where: { id }, data: { active: true } }),
        ])
        updatedOutlets.push(outlet.id)
      }

      await db.auditLog.create({
        data: {
          action: 'UNSUSPEND_OWNER',
          targetId: id,
          targetType: 'user',
          details: JSON.stringify({
            userId: id, userEmail: user.email,
            outletId: outlet.id, restoredAccountType: originalType,
            suspendGroup: !!suspendGroup, updatedOutlets,
          }),
        },
      })

      return NextResponse.json({ success: true, action: 'unsuspended', restoredAccountType: originalType, updatedOutlets })
    } else {
      return NextResponse.json({
        success: false,
        message: suspend ? 'Outlet is already suspended' : 'Outlet is not suspended',
      })
    }
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]/suspend]', error)
    return NextResponse.json({ error: 'Failed to suspend/unsuspend' }, { status: 500 })
  }
}
