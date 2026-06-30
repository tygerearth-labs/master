import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/webmaster/outlet/[id]/transactions-summary
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transactions = await db.transaction.findMany({
      where: { outletId: id },
      select: {
        id: true,
        total: true,
        subtotal: true,
        discount: true,
        taxAmount: true,
        createdAt: true,
        paymentMethod: true,
        invoiceNumber: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const monthlyMap = new Map<string, {
      month: string
      label: string
      count: number
      total: number
      subtotal: number
      discount: number
      tax: number
    }>()

    for (const tx of transactions) {
      const d = new Date(tx.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`

      const existing = monthlyMap.get(key)
      if (existing) {
        existing.count += 1
        existing.total += tx.total
        existing.subtotal += tx.subtotal
        existing.discount += tx.discount
        existing.tax += tx.taxAmount
      } else {
        monthlyMap.set(key, {
          month: key,
          label,
          count: 1,
          total: tx.total,
          subtotal: tx.subtotal,
          discount: tx.discount,
          tax: tx.taxAmount,
        })
      }
    }

    const monthly = Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month))

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0)
    const totalTx = transactions.length
    const avgPerTx = totalTx > 0 ? totalRevenue / totalTx : 0

    const paymentBreakdown: Record<string, { count: number; total: number }> = {}
    for (const tx of transactions) {
      const method = tx.paymentMethod || 'OTHER'
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { count: 0, total: 0 }
      }
      paymentBreakdown[method].count += 1
      paymentBreakdown[method].total += tx.total
    }

    const recentTransactions = transactions.slice(0, 10)

    return NextResponse.json({
      monthly,
      summary: {
        totalRevenue,
        totalTransactions: totalTx,
        averagePerTransaction: avgPerTx,
        paymentBreakdown,
      },
      recentTransactions,
    })
  } catch (error) {
    console.error('[GET transactions-summary] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil ringkasan transaksi' },
      { status: 500 }
    )
  }
}