import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/outlets/[id]/change-owner — Transfer outlet ownership
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newOwnerId } = body

    if (!newOwnerId) {
      return NextResponse.json({ error: 'newOwnerId is required' }, { status: 400 })
    }

    const outlet = await db.outlet.findUnique({
      where: { id },
      include: { users: true, group: true },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    const currentOwner = outlet.users.find(u => u.role === 'OWNER')
    const newOwner = outlet.users.find(u => u.id === newOwnerId)

    if (!newOwner) {
      return NextResponse.json({ error: 'New owner must be a user in this outlet' }, { status: 400 })
    }

    if (currentOwner?.id === newOwnerId) {
      return NextResponse.json({ error: 'User is already the owner' }, { status: 400 })
    }

    // Use transaction: demote current owner → CREW, promote new owner → OWNER
    const updates: Promise<unknown>[] = []

    if (currentOwner) {
      updates.push(
        db.user.update({
          where: { id: currentOwner.id },
          data: { role: 'CREW' },
        })
      )
    }

    updates.push(
      db.user.update({
        where: { id: newOwnerId },
        data: { role: 'OWNER' },
      })
    )

    // Update OutletGroup.ownerId if this outlet is the main outlet or has a group
    if (outlet.groupId && outlet.group) {
      updates.push(
        db.outletGroup.update({
          where: { id: outlet.groupId },
          data: { ownerId: newOwnerId },
        })
      )
    }

    await db.$transaction(updates)

    // Log the action
    await db.auditLog.create({
      data: {
        action: 'CHANGE_OWNER',
        targetId: id,
        targetType: 'outlet',
        details: JSON.stringify({
          outletId: id,
          outletName: outlet.name,
          previousOwner: currentOwner ? { id: currentOwner.id, name: currentOwner.name, email: currentOwner.email } : null,
          newOwner: { id: newOwner.id, name: newOwner.name, email: newOwner.email },
        }),
      },
    })

    return NextResponse.json({
      success: true,
      previousOwner: currentOwner ? { id: currentOwner.id, name: currentOwner.name } : null,
      newOwner: { id: newOwner.id, name: newOwner.name },
    })
  } catch (error) {
    console.error('[PUT /api/admin/outlets/[id]/change-owner]', error)
    return NextResponse.json({ error: 'Failed to change owner' }, { status: 500 })
  }
}
