import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MODEL_NAMES } from '@/lib/model-metadata'

type PrismaModelKey = keyof typeof db

/**
 * GET /api/webmaster/stats
 * Returns dashboard statistics — count of all models
 */
export async function GET() {
  try {
    // Run all count queries in parallel using Prisma transaction
    const counts = await db.$transaction(
      MODEL_NAMES.map((model) => {
        const prismaModel = db[model as PrismaModelKey] as {
          count: () => Promise<number>
        }
        return prismaModel.count()
      })
    )

    // Build stats object
    const stats: Record<string, number> = {}
    MODEL_NAMES.forEach((model, index) => {
      stats[model] = counts[index]
    })

    // Compute some derived stats
    const totalRevenue = await db.transaction.aggregate({
      _sum: { total: true },
    })

    const totalCustomers = await db.customer.count()

    return NextResponse.json({
      stats,
      derived: {
        totalModels: MODEL_NAMES.length,
        totalRecords: counts.reduce((sum, c) => sum + c, 0),
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
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
