import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status && status !== 'ALL' ? { status } : {}

    const transfers = await db.outletTransfer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fromOutlet: { select: { name: true } },
        toOutlet: { select: { name: true } },
        items: { select: { id: true } },
      },
    })

    const result = transfers.map((t) => ({
      id: t.id,
      transferNumber: t.transferNumber,
      fromOutlet: t.fromOutlet.name,
      toOutlet: t.toOutlet.name,
      status: t.status,
      itemsCount: t.items.length,
      notes: t.notes,
      createdAt: t.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Pipeline API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}