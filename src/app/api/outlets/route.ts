import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 10))
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || undefined

  try {
    const where: Record<string, unknown> = {}
    if (search) {
      where.name = { contains: search }
    }
    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      db.outlet.findMany({
        where,
        include: {
          branch: { select: { name: true, ownerId: true, owner: { select: { name: true } } } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.outlet.count({ where }),
    ])

    return NextResponse.json({
      data: data.map((o) => ({
        id: o.id,
        name: o.name,
        branchId: o.branchId,
        branchName: o.branch.name,
        ownerName: o.branch.owner.name,
        address: o.address,
        status: o.status,
      })),
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    console.error('Outlets API error:', error)
    return NextResponse.json({ error: 'Failed to load outlets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, branchId, address, status } = body

    if (!name || !branchId) {
      return NextResponse.json({ error: 'Name and branch are required' }, { status: 400 })
    }

    const outlet = await db.outlet.create({
      data: {
        name,
        branchId,
        address: address || null,
        status: status || 'active',
      },
    })
    return NextResponse.json(outlet, { status: 201 })
  } catch (error) {
    console.error('Create outlet error:', error)
    return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 })
  }
}