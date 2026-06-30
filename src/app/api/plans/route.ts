import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Plans API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const plan = await db.plan.create({ data: body })
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Plan create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}