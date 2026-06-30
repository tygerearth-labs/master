import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { subDays, format, startOfDay } from 'date-fns'

export async function GET() {
  try {
    const [
      totalOwners,
      totalOutlets,
      totalTransactions,
      totalRevenueResult,
      outletPipeline,
    ] = await Promise.all([
      db.owner.count(),
      db.outlet.count(),
      db.transaction.count(),
      db.transaction.aggregate({ _sum: { total: true }, where: { status: 'completed' } }),
      db.outlet.findMany({
        include: {
          branch: { include: { owner: true } },
          _count: { select: { transactions: { where: { status: 'completed' } } } },
          transactions: {
            select: { total: true, createdAt: true, status: true },
            where: { status: 'completed' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    const revenue = totalRevenueResult._sum.total || 0

    // Calculate per-outlet revenue
    const outletRevenueMap: Record<string, number> = {}
    const allCompletedTx = await db.transaction.groupBy({
      by: ['outletId'],
      where: { status: 'completed' },
      _sum: { total: true },
    })
    for (const row of allCompletedTx) {
      outletRevenueMap[row.outletId] = row._sum.total || 0
    }

    const outletLastTx = await db.transaction.findMany({
      distinct: ['outletId'],
      orderBy: { createdAt: 'desc' },
      select: { outletId: true, createdAt: true },
    })
    const lastTxMap: Record<string, string> = {}
    for (const tx of outletLastTx) {
      lastTxMap[tx.outletId] = tx.createdAt.toISOString()
    }

    // Calculate revenue chart data (last 7 days)
    const sevenDaysAgo = subDays(new Date(), 6)
    const startOf7Days = startOfDay(sevenDaysAgo)

    const recentTransactions = await db.transaction.findMany({
      where: { createdAt: { gte: startOf7Days } },
      select: { total: true, createdAt: true },
    })

    const chartMap: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const key = format(d, 'yyyy-MM-dd')
      chartMap[key] = 0
    }
    for (const tx of recentTransactions) {
      const key = format(new Date(tx.createdAt), 'yyyy-MM-dd')
      if (chartMap[key] !== undefined) {
        chartMap[key] += tx.total
      }
    }

    const revenueChart = Object.entries(chartMap).map(([date, rev]) => ({
      date: format(new Date(date), 'dd MMM'),
      revenue: rev,
    }))

    // Calculate trends (compare this month vs last month)
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthTx, lastMonthTx, thisMonthOwners, lastMonthOwners, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      db.transaction.count({ where: { createdAt: { gte: thisMonthStart } } }),
      db.transaction.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      db.owner.count({ where: { createdAt: { gte: thisMonthStart } } }),
      db.owner.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      db.transaction.aggregate({ where: { createdAt: { gte: thisMonthStart } }, _sum: { total: true } }),
      db.transaction.aggregate({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } }, _sum: { total: true } }),
    ])

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    return NextResponse.json({
      kpi: {
        totalOwners,
        totalOutlets,
        totalTransactions,
        totalRevenue: revenue,
        ownerTrend: calcTrend(thisMonthOwners, lastMonthOwners),
        outletTrend: 0,
        transactionTrend: calcTrend(thisMonthTx, lastMonthTx),
        revenueTrend: calcTrend(
          thisMonthRevenue._sum.total || 0,
          lastMonthRevenue._sum.total || 0
        ),
      },
      outlets: outletPipeline.map((o) => ({
        id: o.id,
        name: o.name,
        ownerName: o.branch.owner.name,
        branchName: o.branch.name,
        status: o.status,
        totalTransactions: o._count.transactions,
        totalRevenue: outletRevenueMap[o.id] || 0,
        lastTransaction: lastTxMap[o.id] || null,
      })),
      revenueChart,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}