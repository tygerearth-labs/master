import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const outlets = await db.outlet.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        group: { select: { name: true } },
        users: { select: { id: true } },
      },
    })

    const result = outlets.map((o) => ({
      id: o.id,
      name: o.name,
      address: o.address,
      phone: o.phone,
      accountType: o.accountType,
      planExpiresAt: o.planExpiresAt,
      crewCount: o.users.length,
      group: o.group?.name ?? null,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Outlets API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}