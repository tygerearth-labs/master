import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/users/[id]/suspend — Suspend or unsuspend a user
// OWNER: prefixes the outlet's accountType with "suspended:"
// CREW: revokes all crew permissions by setting pages to empty string ""
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
      include: {
        outlet: { include: { group: { include: { outlets: true } } } },
        crewPermission: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ==================== CREW SUSPEND ====================
    if (user.role !== 'OWNER') {
      // A CREW user is "active" if they have a crewPermission with non-empty pages
      const isActive = user.crewPermission ? user.crewPermission.pages !== '' : true

      if (suspend && isActive) {
        // Suspend: set crewPermission pages to empty string
        if (user.crewPermission) {
          await db.crewPermission.update({
            where: { userId: id },
            data: { pages: '' },
          })
        } else {
          // Create an empty permission record (suspended state)
          await db.crewPermission.create({
            data: {
              userId: id,
              outletId: user.outletId,
              pages: '',
            },
          })
        }
        await db.auditLog.create({
          data: {
            action: 'SUSPEND_USER',
            entityType: 'USER',
            entityId: id,
            userId: id,
            outletId: user.outlet.id,
            details: JSON.stringify({ userName: user.name, userEmail: user.email, role: user.role }),
          },
        })
        return NextResponse.json({ success: true, action: 'suspended', userId: id })
      } else if (!suspend && !isActive) {
        // Unsuspend: restore crewPermission pages to "pos"
        if (user.crewPermission) {
          await db.crewPermission.update({
            where: { userId: id },
            data: { pages: 'pos' },
          })
        } else {
          await db.crewPermission.create({
            data: {
              userId: id,
              outletId: user.outletId,
              pages: 'pos',
            },
          })
        }
        await db.auditLog.create({
          data: {
            action: 'UNSUSPEND_USER',
            entityType: 'USER',
            entityId: id,
            userId: id,
            outletId: user.outlet.id,
            details: JSON.stringify({ userName: user.name, userEmail: user.email, role: user.role }),
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
      // SUSPEND: Prefix accountType with "suspended:"
      const suspendedType = `suspended:${outlet.accountType}`

      if (suspendGroup && outlet.groupId && outlet.group) {
        // Suspend all outlets in the group
        const groupOutletIds = outlet.group.outlets.map(o => o.id)
        await db.$transaction([
          ...groupOutletIds.map(oid =>
            db.outlet.update({
              where: { id: oid },
              data: { accountType: `suspended:${outlet.group!.outlets.find(o => o.id === oid)?.accountType || 'free'}` },
            })
          ),
        ])
        updatedOutlets.push(...groupOutletIds)
      } else {
        await db.outlet.update({ where: { id: outlet.id }, data: { accountType: suspendedType } })
        updatedOutlets.push(outlet.id)
      }

      await db.auditLog.create({
        data: {
          action: 'SUSPEND_OWNER',
          entityType: 'USER',
          entityId: id,
          userId: id,
          outletId: outlet.id,
          details: JSON.stringify({
            userEmail: user.email,
            previousAccountType: outlet.accountType,
            suspendGroup: !!suspendGroup,
            updatedOutlets,
          }),
        },
      })

      return NextResponse.json({ success: true, action: 'suspended', previousAccountType: outlet.accountType, updatedOutlets })
    } else if (!suspend && isCurrentlySuspended) {
      // UNSUSPEND: Remove "suspended:" prefix
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
        ])
        updatedOutlets.push(...groupOutletIds)
      } else {
        await db.outlet.update({ where: { id: outlet.id }, data: { accountType: originalType } })
        updatedOutlets.push(outlet.id)
      }

      await db.auditLog.create({
        data: {
          action: 'UNSUSPEND_OWNER',
          entityType: 'USER',
          entityId: id,
          userId: id,
          outletId: outlet.id,
          details: JSON.stringify({
            userEmail: user.email,
            restoredAccountType: originalType,
            suspendGroup: !!suspendGroup,
            updatedOutlets,
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
