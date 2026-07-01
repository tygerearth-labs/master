import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/outlets — List all outlets with their owners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (plan) {
      if (plan === 'suspended') {
        where.accountType = { startsWith: 'suspended:' }
      } else {
        where.accountType = plan
      }
    }

    const [outlets, total] = await Promise.all([
      db.outlet.findMany({
        where,
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
          },
          group: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.outlet.count({ where }),
    ])

    return NextResponse.json({
      outlets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/admin/outlets]', error)
    return NextResponse.json({ error: 'Failed to fetch outlets' }, { status: 500 })
  }
}

// POST /api/admin/outlets — Create a new outlet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, accountType, isMain, groupId } = body

    if (!name) {
      return NextResponse.json({ error: 'Outlet name is required' }, { status: 400 })
    }

    // If groupId provided, verify group exists
    if (groupId) {
      const group = await db.outletGroup.findUnique({ where: { id: groupId } })
      if (!group) {
        return NextResponse.json({ error: 'Outlet group not found' }, { status: 404 })
      }
    }

    const outlet = await db.outlet.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        accountType: accountType || 'free',
        isMain: isMain ?? false,
        groupId: groupId || null,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'CREATE_OUTLET',
        entityType: 'OUTLET',
        entityId: outlet.id,
        outletId: outlet.id,
        details: JSON.stringify({ name: outlet.name, accountType: outlet.accountType, isMain: outlet.isMain, groupId: outlet.groupId }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ outlet }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/outlets]', error)
    return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 })
  }
}
