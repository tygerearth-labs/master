import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/plans — List all plans ordered by sortOrder
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('[GET /api/admin/plans]', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

// POST /api/admin/plans — Create a new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, price, duration, paymentLink, features, active, sortOrder, description } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await db.plan.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'A plan with this slug already exists' },
        { status: 409 }
      )
    }

    const plan = await db.plan.create({
      data: {
        name,
        slug,
        price: price ?? 0,
        duration: duration ?? 30,
        paymentLink: paymentLink ?? null,
        features: features ?? '{}',
        active: active ?? true,
        sortOrder: sortOrder ?? 0,
        description: description ?? null,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/plans]', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
