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
            where: { role: 'OWNER' },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
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
