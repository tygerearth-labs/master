import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/outlets/[id] — Get outlet detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const outlet = await db.outlet.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
          orderBy: { role: 'desc' },
        },
        group: { select: { id: true, name: true } },
      },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    return NextResponse.json(outlet)
  } catch (error) {
    console.error('[GET /api/admin/outlets/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch outlet' }, { status: 500 })
  }
}
