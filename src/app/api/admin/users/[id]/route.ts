import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/users/[id] — Update user (partial update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If changing role, validate it's OWNER or CREW
    if (body.role !== undefined && body.role !== 'OWNER' && body.role !== 'CREW') {
      return NextResponse.json(
        { error: 'Role must be OWNER or CREW' },
        { status: 400 }
      )
    }

    // Build partial update data — only include provided fields
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.role !== undefined) data.role = body.role

    const updatedUser = await db.user.update({
      where: { id },
      data,
      include: {
        outlet: { select: { id: true, name: true, accountType: true } },
      },
    })

    // Audit log — use the user's own id and outletId
    await db.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: id,
        userId: id,
        outletId: user.outletId,
        details: JSON.stringify({ updatedFields: Object.keys(data), values: data }),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — Delete user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      include: { ownedGroup: true, crewPermission: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot delete OWNER if they own a group
    if (user.role === 'OWNER' && user.ownedGroup) {
      return NextResponse.json(
        { error: 'Cannot delete owner who owns an outlet group. Transfer ownership first.' },
        { status: 400 }
      )
    }

    // Delete crew permission if exists
    if (user.crewPermission) {
      await db.crewPermission.delete({ where: { userId: id } })
    }

    // Store user data for audit log before deletion
    const userData = { name: user.name, email: user.email, role: user.role, outletId: user.outletId }

    // Delete the user
    await db.user.delete({ where: { id } })

    // Audit log — we need a userId but the user is deleted. Use the system audit context.
    const { getSystemAuditContext } = await import('@/lib/audit')
    const auditCtx = await getSystemAuditContext()
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'DELETE_USER',
          entityType: 'USER',
          entityId: id,
          userId: auditCtx.userId,
          outletId: userData.outletId || auditCtx.outletId,
          details: JSON.stringify({ name: userData.name, email: userData.email, role: userData.role }),
        },
      })
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('[DELETE /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
