import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 10))
  const search = searchParams.get('search') || ''

  try {
    const where: Record<string, unknown> = {}
    if (search) {
      where.name = { contains: search }
    }

    const [data, total] = await Promise.all([
      db.branch.findMany({
        where,
        include: {
          owner: { select: { name: true } },
          _count: { select: { outlets: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.branch.count({ where }),
    ])

    return NextResponse.json({
      data: data.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        ownerId: b.ownerId,
        ownerName: b.owner.name,
        isActive: b.isActive,
        outletCount: b._count.outlets,
      })),
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    console.error('Branches API error:', error)
    return NextResponse.json({ error: 'Failed to load branches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, ownerId, address, phone, isActive } = body

    if (!name || !ownerId) {
      return NextResponse.json({ error: 'Name and owner are required' }, { status: 400 })
    }

    const branch = await db.branch.create({
      data: {
        name,
        ownerId,
        address: address || null,
        phone: phone || null,
        isActive: isActive !== false,
      },
    })
    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    console.error('Create branch error:', error)
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
  }
}