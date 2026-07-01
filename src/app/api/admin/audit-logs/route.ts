import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/audit-logs — Get audit logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || ''
    const entityType = searchParams.get('entityType') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200) // Max 200

    const where: Record<string, unknown> = {}

    if (action) {
      where.action = action
    }

    if (entityType) {
      where.entityType = entityType
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          outlet: { select: { id: true, name: true } },
        },
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('[GET /api/admin/audit-logs]', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
