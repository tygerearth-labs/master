import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [revenueResult, txCount, outletCount, userCount] = await Promise.all([
      db.transaction.aggregate({ _sum: { total: true } }),
      db.transaction.count(),
      db.outlet.count(),
      db.user.count(),
    ])

    const recentTransfers = await db.outletTransfer.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        fromOutlet: { select: { name: true } },
        toOutlet: { select: { name: true } },
      },
    })

    const recentTransactions = await db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        outlet: { select: { name: true } },
        user: { select: { name: true } },
      },
    })

    return NextResponse.json({
      stats: {
        revenue: revenueResult._sum.total ?? 0,
        transactions: txCount,
        outlets: outletCount,
        users: userCount,
      },
      recentTransfers,
      recentTransactions,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}