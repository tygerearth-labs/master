import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/webmaster/stats
 */
export async function GET() {
  try {
    const totalOutlets = await db.outlet.count()
    const totalUsers = await db.user.count()
    const totalProducts = await db.product.count()
    const totalTransactions = await db.transaction.count()
    const totalCustomers = await db.customer.count()
    const totalGroups = await db.outletGroup.count()
    const totalPlans = await db.plan.count()

    const totalRevenue = await db.transaction.aggregate({
      _sum: { total: true },
    })

    // Count by plan
    const freeCount = await db.outlet.count({ where: { accountType: 'free' } })
    const proCount = await db.outlet.count({ where: { accountType: 'pro' } })
    const enterpriseCount = await db.outlet.count({ where: { accountType: 'enterprise' } })

    return NextResponse.json({
      stats: {
        outlet: totalOutlets,
        user: totalUsers,
        product: totalProducts,
        transaction: totalTransactions,
        customer: totalCustomers,
        outletGroup: totalGroups,
        plan: totalPlans,
      },
      derived: {
        totalRevenue: totalRevenue._sum.total || 0,
        freeCount,
        proCount,
        enterpriseCount,
      },
    })
  } catch (error) {
    console.error('[GET /api/webmaster/stats] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil statistik' },
      { status: 500 }
    )
  }
}