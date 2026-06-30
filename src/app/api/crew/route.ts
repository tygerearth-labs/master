import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 10))
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || undefined

  try {
    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (role) {
      where.role = role
    }

    const [data, total] = await Promise.all([
      db.crew.findMany({
        where,
        include: {
          outlet: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.crew.count({ where }),
    ])

    return NextResponse.json({
      data: data.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        outletId: c.outletId,
        outletName: c.outlet.name,
        isActive: c.isActive,
      })),
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    console.error('Crew API error:', error)
    return NextResponse.json({ error: 'Failed to load crew' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, role, outletId, isActive } = body

    if (!name || !email || !outletId) {
      return NextResponse.json({ error: 'Name, email, and outlet are required' }, { status: 400 })
    }

    const crew = await db.crew.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || 'staff',
        outletId,
        password: 'default_password_123',
        isActive: isActive !== false,
      },
    })
    return NextResponse.json(crew, { status: 201 })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    if (errMsg.includes('Unique')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    console.error('Create crew error:', error)
    return NextResponse.json({ error: 'Failed to create crew' }, { status: 500 })
  }
}