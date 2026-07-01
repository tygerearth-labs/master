import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOutletAuditContext, getSystemAuditContext } from '@/lib/audit'

// GET /api/admin/outlets/[id] — Get outlet detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const outlet = await db.outlet.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true, name: true, email: true, role: true, createdAt: true,
            crewPermission: { select: { pages: true } },
          },
          orderBy: { role: 'desc' },
        },
        group: { select: { id: true, name: true } },
      },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...outlet,
      users: outlet.users.map(u => ({
        ...u,
        active: u.role === 'OWNER'
          ? !outlet.accountType.startsWith('suspended:')
          : u.crewPermission ? u.crewPermission.pages !== '' : true,
      })),
    })
  } catch (error) {
    console.error('[GET /api/admin/outlets/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch outlet' }, { status: 500 })
  }
}

// PUT /api/admin/outlets/[id] — Update outlet (partial update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const outlet = await db.outlet.findUnique({ where: { id } })
    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // If changing groupId, verify the new group exists
    if (body.groupId !== undefined && body.groupId !== null) {
      const group = await db.outletGroup.findUnique({ where: { id: body.groupId } })
      if (!group) {
        return NextResponse.json({ error: 'Outlet group not found' }, { status: 404 })
      }
    }

    // Build partial update data — only include provided fields
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.address !== undefined) data.address = body.address
    if (body.phone !== undefined) data.phone = body.phone
    if (body.isMain !== undefined) data.isMain = body.isMain
    if (body.groupId !== undefined) data.groupId = body.groupId || null

    const updatedOutlet = await db.outlet.update({
      where: { id },
      data,
    })

    // Audit log
    const auditCtx = await getOutletAuditContext(id)
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'UPDATE_OUTLET',
          entityType: 'OUTLET',
          entityId: id,
          outletId: id,
          userId: auditCtx.userId,
          details: JSON.stringify({ updatedFields: Object.keys(data), values: data }),
        },
      })
    }

    return NextResponse.json({ outlet: updatedOutlet })
  } catch (error) {
    console.error('[PUT /api/admin/outlets/[id]]', error)
    return NextResponse.json({ error: 'Failed to update outlet' }, { status: 500 })
  }
}

// DELETE /api/admin/outlets/[id] — Delete outlet
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const outlet = await db.outlet.findUnique({
      where: { id },
      include: { users: true },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Check if outlet has users
    if (outlet.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete outlet with users. Remove users first.' },
        { status: 400 }
      )
    }

    // Store outlet data for audit log before deletion
    const outletData = { name: outlet.name, accountType: outlet.accountType }

    await db.outlet.delete({ where: { id } })

    // Audit log — after deletion, use system context
    const auditCtx = await getSystemAuditContext()
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'DELETE_OUTLET',
          entityType: 'OUTLET',
          entityId: id,
          outletId: auditCtx.outletId,
          userId: auditCtx.userId,
          details: JSON.stringify(outletData),
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Outlet deleted successfully' })
  } catch (error) {
    console.error('[DELETE /api/admin/outlets/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete outlet' }, { status: 500 })
  }
}
