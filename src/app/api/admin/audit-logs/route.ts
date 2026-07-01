import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/audit-logs — Get recent audit logs
export async function GET() {
  try {
    const logs = await db.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('[GET /api/admin/audit-logs]', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
