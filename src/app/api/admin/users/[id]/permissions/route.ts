import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/users/[id]/permissions — Get crew permissions for a user
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const permission = await db.crewPermission.findUnique({ where: { userId: id } })

    if (!permission) {
      // Return default values without creating a record
      return NextResponse.json({ permissions: { userId: id, pages: 'pos' } })
    }

    return NextResponse.json({ permissions: permission })
  } catch (error) {
    console.error('[GET /api/admin/users/[id]/permissions]', error)
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id]/permissions — Update crew permissions (upsert)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { pages } = body

    if (!pages || typeof pages !== 'string') {
      return NextResponse.json(
        { error: 'pages must be a comma-separated string of page keys' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate user is CREW role
    if (user.role !== 'CREW') {
      return NextResponse.json(
        { error: 'Permissions can only be set for CREW users' },
        { status: 400 }
      )
    }

    // Upsert: create if not exists, update if exists
    const permission = await db.crewPermission.upsert({
      where: { userId: id },
      update: { pages },
      create: {
        userId: id,
        outletId: user.outletId,
        pages,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'UPDATE_PERMISSIONS',
        entityType: 'USER',
        entityId: id,
        userId: id,
        outletId: user.outletId,
        details: JSON.stringify({ pages }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ permissions: permission })
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]/permissions]', error)
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 })
  }
}
