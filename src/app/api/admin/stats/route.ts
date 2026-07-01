import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalOutlets,
      totalUsers,
      totalOwners,
      totalGroups,
      outletsByPlan,
      suspendedOutlets,
      recentOutlets,
      expiringOutlets,
      plans,
    ] = await Promise.all([
      db.outlet.count(),
      db.user.count(),
      db.user.count({ where: { role: 'OWNER' } }),
      db.outletGroup.count(),
      db.outlet.groupBy({ by: ['accountType'], _count: true }),
      db.outlet.count({ where: { accountType: { startsWith: 'suspended:' } } }),
      db.outlet.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { users: { where: { role: 'OWNER' }, take: 1 } },
      }),
      db.outlet.count({
        where: {
          planExpiresAt: {
            not: null,
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          accountType: { not: 'free' },
        },
      }),
      // Fetch all plans for revenue calculation
      db.plan.findMany({ orderBy: { sortOrder: 'asc' } }),
    ])

    const planBreakdown: Record<string, number> = {}
    outletsByPlan.forEach((item) => {
      planBreakdown[item.accountType] = item._count
    })

    // ==================== REVENUE CALCULATION ====================
    // Build a price map from the Plan table (slug → price)
    const planPriceMap: Record<string, number> = {}
    plans.forEach((p) => {
      planPriceMap[p.slug] = p.price
    })

    // Calculate revenue per plan type
    // For each accountType in planBreakdown, resolve the base plan (strip "suspended:" prefix)
    const planRevenue: Record<string, { outlets: number; price: number; revenue: number }> = {}
    let totalMRR = 0

    for (const [accountType, count] of Object.entries(planBreakdown)) {
      // Resolve the base plan slug (strip suspended: prefix)
      const baseSlug = accountType.startsWith('suspended:')
        ? accountType.replace('suspended:', '')
        : accountType

      const price = planPriceMap[baseSlug] ?? 0
      const revenue = count * price
      totalMRR += revenue

      // Merge with existing entry for the same base slug
      if (!planRevenue[baseSlug]) {
        planRevenue[baseSlug] = { outlets: 0, price, revenue: 0 }
      }
      planRevenue[baseSlug].outlets += count
      planRevenue[baseSlug].revenue += revenue
    }

    // Annual projection
    const totalARR = totalMRR * 12

    return NextResponse.json({
      totalOutlets,
      totalUsers,
      totalOwners,
      totalGroups,
      suspendedOutlets,
      expiringOutlets,
      planBreakdown,
      totalMRR,
      totalARR,
      planRevenue,
      recentOutlets: recentOutlets.map((o) => ({
        id: o.id,
        name: o.name,
        accountType: o.accountType,
        planExpiresAt: o.planExpiresAt,
        createdAt: o.createdAt,
        owner: o.users[0] ? { id: o.users[0].id, name: o.users[0].name, email: o.users[0].email } : null,
      })),
    })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
