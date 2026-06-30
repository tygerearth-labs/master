import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  try {
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const owners = await db.owner.findMany({
      where,
      include: {
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            branches: { where: { isActive: true } },
            outlets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Count crew through outlets
    const crewCounts = await db.crew.groupBy({
      by: ['outletId'],
      _count: true,
    })

    // For simplicity, count crew per owner by looking at their outlets
    const ownerCrewCounts: Record<string, number> = {}
    const outletOwnerMap = await db.outlet.findMany({
      include: { branch: { select: { ownerId: true } } },
      select: { id: true, branch: { select: { ownerId: true } } },
    })

    const ownerOutletIds: Record<string, string[]> = {}
    for (const o of outletOwnerMap) {
      const oid = o.branch.ownerId
      if (!ownerOutletIds[oid]) ownerOutletIds[oid] = []
      ownerOutletIds[oid].push(o.id)
    }

    const allCrewCounts = await db.crew.groupBy({
      by: ['outletId'],
      _count: { id: true },
    })

    const outletCrewMap: Record<string, number> = {}
    for (const c of allCrewCounts) {
      outletCrewMap[c.outletId] = c._count.id
    }

    for (const [oid, outletIds] of Object.entries(ownerOutletIds)) {
      ownerCrewCounts[oid] = outletIds.reduce((sum, oId) => sum + (outletCrewMap[oId] || 0), 0)
    }

    return NextResponse.json(
      owners.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        planName: o.subscriptions[0]?.plan?.name || null,
        subscriptionStatus: o.subscriptions[0]?.status || null,
        outletsCount: o._count.outlets,
        crewCount: ownerCrewCounts[o.id] || 0,
        isActive: o.isActive,
        createdAt: o.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error('Owners API error:', error)
    return NextResponse.json({ error: 'Failed to load owners' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const owner = await db.owner.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: 'default_password_123',
      },
    })

    return NextResponse.json(owner, { status: 201 })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    if (errMsg.includes('Unique')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 })
  }
}