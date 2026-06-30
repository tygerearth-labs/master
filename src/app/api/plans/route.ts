import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Plans API error:', error)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, durationDays, maxOutlets, maxCrew, features, isActive } = body

    if (!name || price == null || !durationDays) {
      return NextResponse.json({ error: 'Name, price, and duration are required' }, { status: 400 })
    }

    const plan = await db.plan.create({
      data: {
        name,
        price: Number(price),
        durationDays: Number(durationDays),
        maxOutlets: Number(maxOutlets) || 0,
        maxCrew: Number(maxCrew) || 0,
        features: JSON.stringify(features || []),
        isActive: isActive !== false,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}