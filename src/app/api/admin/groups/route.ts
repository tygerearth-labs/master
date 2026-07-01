import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/groups — List all outlet groups with their outlets and owner info
export async function GET() {
  try {
    const groups = await db.outletGroup.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        outlets: {
          select: {
            id: true,
            name: true,
            accountType: true,
            isMain: true,
            planExpiresAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('[GET /api/admin/groups]', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

// POST /api/admin/groups — Create a new outlet group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ownerId } = body

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: 'Name and ownerId are required' },
        { status: 400 }
      )
    }

    // Verify owner exists and has OWNER role
    const owner = await db.user.findUnique({ where: { id: ownerId } })
    if (!owner) {
      return NextResponse.json({ error: 'Owner user not found' }, { status: 404 })
    }

    if (owner.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'ownerId must be a user with OWNER role' },
        { status: 400 }
      )
    }

    const group = await db.outletGroup.create({
      data: {
        name,
        ownerId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        outlets: true,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'CREATE_GROUP',
        entityType: 'OUTLET',
        entityId: group.id,
        outletId: owner.outletId,
        details: JSON.stringify({ name: group.name, ownerId }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/groups]', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
