import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 10))
  const search = searchParams.get('search') || ''
  const outletId = searchParams.get('outletId') || undefined
  const ownerId = searchParams.get('ownerId') || undefined

  // Handle filter presets
  const filter = searchParams.get('filter') || ''
  let startDate = searchParams.get('startDate') || undefined
  let endDate = searchParams.get('endDate') || undefined

  if (filter === 'today') {
    const d = new Date(); d.setHours(0,0,0,0)
    startDate = d.toISOString()
  } else if (filter === 'thisMonth') {
    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  } else if (filter === 'thisYear') {
    startDate = new Date(new Date().getFullYear(), 0, 1).toISOString()
  }

  try {
    const where: Record<string, unknown> = {}
    if (search) {
      where.invoiceNo = { contains: search }
    }
    if (startDate) {
      where.createdAt = { ...(where.createdAt as Record<string, unknown> || {}), gte: new Date(startDate) }
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      where.createdAt = { ...(where.createdAt as Record<string, unknown> || {}), lte: end }
    }
    if (outletId) where.outletId = outletId
    if (ownerId) where.ownerId = ownerId

    const [data, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          outlet: { select: { name: true } },
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.transaction.count({ where }),
    ])

    return NextResponse.json({
      data: data.map((tx) => ({
        id: tx.id,
        invoiceNo: tx.invoiceNo,
        outletName: tx.outlet.name,
        ownerName: tx.owner.name,
        items: tx.items,
        total: tx.total,
        paymentMethod: tx.paymentMethod,
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
      })),
      totalPages: Math.ceil(total / limit),
      total,
    })
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}