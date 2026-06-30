import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { planId, durationDays } = body

    if (!planId || !durationDays) {
      return NextResponse.json({ error: 'Plan and duration are required' }, { status: 400 })
    }

    // Deactivate existing subscriptions
    await db.subscription.updateMany({
      where: { ownerId: id, status: 'active' },
      data: { status: 'cancelled' },
    })

    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)

    const subscription = await db.subscription.create({
      data: {
        ownerId: id,
        planId,
        startDate,
        endDate,
        status: 'active',
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Change plan error:', error)
    return NextResponse.json({ error: 'Failed to change plan' }, { status: 500 })
  }
}