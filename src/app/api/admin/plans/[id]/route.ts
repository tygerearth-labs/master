import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/plans/[id] — Get a single plan
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plan = await db.plan.findUnique({ where: { id } })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[GET /api/admin/plans/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
  }
}

// PUT /api/admin/plans/[id] — Update a plan (partial update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if plan exists
    const existing = await db.plan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // If slug is being changed, check for uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.plan.findUnique({ where: { slug: body.slug } })
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A plan with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Build partial update data — only include fields that are provided
    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.slug !== undefined) data.slug = body.slug
    if (body.price !== undefined) data.price = body.price
    if (body.duration !== undefined) data.duration = body.duration
    if (body.paymentLink !== undefined) data.paymentLink = body.paymentLink
    if (body.features !== undefined) data.features = body.features
    if (body.active !== undefined) data.active = body.active
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder
    if (body.description !== undefined) data.description = body.description

    const plan = await db.plan.update({
      where: { id },
      data,
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'UPDATE_PLAN',
        entityType: 'PLAN',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(data), values: data }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[PUT /api/admin/plans/[id]]', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

// DELETE /api/admin/plans/[id] — Delete a plan
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if plan exists
    const existing = await db.plan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    await db.plan.delete({ where: { id } })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'DELETE_PLAN',
        entityType: 'PLAN',
        entityId: id,
        details: JSON.stringify({ name: existing.name, slug: existing.slug }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ success: true, message: 'Plan deleted successfully' })
  } catch (error) {
    console.error('[DELETE /api/admin/plans/[id]]', error)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
