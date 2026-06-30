import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const plan = await db.plan.update({
      where: { id },
      data: {
        name: body.name,
        price: Number(body.price),
        durationDays: Number(body.durationDays),
        maxOutlets: Number(body.maxOutlets) || 0,
        maxCrew: Number(body.maxCrew) || 0,
        features: JSON.stringify(body.features || []),
        isActive: body.isActive,
      },
    })
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Update plan error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const plan = await db.plan.update({
      where: { id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Patch plan error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.subscription.deleteMany({ where: { planId: id } })
    await db.plan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete plan error:', error)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}