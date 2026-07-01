import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/users/[id]/suspend — Suspend or unsuspend an owner
// Suspending: prefixes the outlet's accountType with "suspended:"
// Unsuspending: removes the "suspended:" prefix
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

    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only OWNER accounts can be suspended' },
        { status: 400 }
      )
    }

    const outlet = user.outlet
    const isCurrentlySuspended = outlet.accountType.startsWith('suspended:')
    const updatedOutlets: string[] = []

    if (suspend && !isCurrentlySuspended) {
      // SUSPEND: Prefix accountType with "suspended:"
      const suspendedType = `suspended:${outlet.accountType}`

      if (suspendGroup && outlet.groupId && outlet.group) {
        // Suspend all outlets in the group
        for (const groupOutlet of outlet.group.outlets) {
          if (!groupOutlet.accountType.startsWith('suspended:')) {
            await db.outlet.update({
              where: { id: groupOutlet.id },
              data: { accountType: `suspended:${groupOutlet.accountType}` },
            })
            updatedOutlets.push(groupOutlet.id)
          }
        }
      } else {
        await db.outlet.update({
          where: { id: outlet.id },
          data: { accountType: suspendedType },
        })
        updatedOutlets.push(outlet.id)
      }

      // Log
      await db.auditLog.create({
        data: {
          action: 'SUSPEND_OWNER',
          targetId: id,
          targetType: 'user',
          details: JSON.stringify({
            userId: id,
            userEmail: user.email,
            outletId: outlet.id,
            previousAccountType: outlet.accountType,
            suspendGroup: !!suspendGroup,
            updatedOutlets,
          }),
        },
      })

      return NextResponse.json({
        success: true,
        action: 'suspended',
        previousAccountType: outlet.accountType,
        updatedOutlets,
      })
    } else if (!suspend && isCurrentlySuspended) {
      // UNSUSPEND: Remove "suspended:" prefix
      const originalType = outlet.accountType.replace('suspended:', '')

      if (suspendGroup && outlet.groupId && outlet.group) {
        for (const groupOutlet of outlet.group.outlets) {
          if (groupOutlet.accountType.startsWith('suspended:')) {
            const restored = groupOutlet.accountType.replace('suspended:', '')
            await db.outlet.update({
              where: { id: groupOutlet.id },
              data: { accountType: restored },
            })
            updatedOutlets.push(groupOutlet.id)
          }
        }
      } else {
        await db.outlet.update({
          where: { id: outlet.id },
          data: { accountType: originalType },
        })
        updatedOutlets.push(outlet.id)
      }

      // Log
      await db.auditLog.create({
        data: {
          action: 'UNSUSPEND_OWNER',
          targetId: id,
          targetType: 'user',
          details: JSON.stringify({
            userId: id,
            userEmail: user.email,
            outletId: outlet.id,
            restoredAccountType: originalType,
            suspendGroup: !!suspendGroup,
            updatedOutlets,
          }),
        },
      })

      return NextResponse.json({
        success: true,
        action: 'unsuspended',
        restoredAccountType: originalType,
        updatedOutlets,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: suspend ? 'Outlet is already suspended' : 'Outlet is not suspended',
      })
    }
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]/suspend]', error)
    return NextResponse.json({ error: 'Failed to suspend/unsuspend owner' }, { status: 500 })
  }
}
