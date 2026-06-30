import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const outletId = searchParams.get('outletId')

    const where: Record<string, unknown> = {}
    if (role && role !== 'ALL') where.role = role
    if (outletId) where.outletId = outletId

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        outlet: { select: { name: true } },
      },
    })

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      outlet: u.outlet.name,
      outletId: u.outletId,
      createdAt: u.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}