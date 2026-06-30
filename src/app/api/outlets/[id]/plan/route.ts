import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { planId, durationMonths } = body

    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + (durationMonths || plan.duration))

    const outlet = await db.outlet.update({
      where: { id },
      data: {
        accountType: plan.slug,
        planExpiresAt: expiresAt,
      },
    })

    return NextResponse.json(outlet)
  } catch (error) {
    console.error('Outlet plan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}