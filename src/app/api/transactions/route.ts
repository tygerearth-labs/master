import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import {
  getStartOfToday,
  getStartOfDay,
  getStartOfMonth,
  getStartOfYear,
} from '@/lib/format'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999)
    } else {
      switch (filter) {
        case 'today':
          startDate = getStartOfToday()
          break
        case '7d':
          startDate = getStartOfDay(6)
          break
        case '30d':
          startDate = getStartOfDay(29)
          break
        case 'month':
          startDate = getStartOfMonth()
          break
        case 'year':
          startDate = getStartOfYear()
          break
        default:
          break
      }
    }

    const where: Record<string, unknown> = {}
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate }
    } else if (startDate) {
      where.createdAt = { gte: startDate }
    }

    const [transactions, summary] = await Promise.all([
      db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          outlet: { select: { name: true } },
          user: { select: { name: true } },
        },
      }),
      db.transaction.aggregate({
        where,
        _sum: { total: true },
        _count: true,
      }),
    ])

    const result = transactions.map((t) => ({
      id: t.id,
      invoiceNumber: t.invoiceNumber,
      outlet: t.outlet.name,
      cashier: t.user.name,
      paymentMethod: t.paymentMethod,
      total: t.total,
      createdAt: t.createdAt,
    }))

    const totalRevenue = summary._sum.total ?? 0
    const txCount = summary._count
    const avgTransaction = txCount > 0 ? totalRevenue / txCount : 0

    return NextResponse.json({
      transactions: result,
      summary: {
        totalRevenue,
        transactionCount: txCount,
        avgTransaction,
      },
    })
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}