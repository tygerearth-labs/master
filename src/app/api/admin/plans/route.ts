import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSystemAuditContext } from '@/lib/audit'

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
        duration: duration ?? 1,
        paymentLink: paymentLink ?? null,
        features: features ?? '{}',
        active: active ?? true,
        sortOrder: sortOrder ?? 0,
        description: description ?? null,
      },
    })

    // Audit log — use system context since plan actions don't have a specific outlet/user
    const auditCtx = await getSystemAuditContext()
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'CREATE_PLAN',
          entityType: 'PLAN',
          entityId: plan.id,
          outletId: auditCtx.outletId,
          userId: auditCtx.userId,
          details: JSON.stringify({ name: plan.name, slug: plan.slug, price: plan.price }),
        },
      })
    }

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/plans]', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
