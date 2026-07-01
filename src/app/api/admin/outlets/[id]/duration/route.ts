import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/outlets/[id]/duration — Change plan duration/expiry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { days, expiresAt, applyToGroup } = body

    // Fetch outlet once with all relations needed
    const outlet = await db.outlet.findUnique({
      where: { id },
      include: { group: { include: { outlets: true } } },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Calculate new expiry date
    let newExpiresAt: Date | null = null

    if (expiresAt) {
      // Explicit date provided — validate it
      const parsed = new Date(expiresAt)
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format for "expiresAt"' },
          { status: 400 }
        )
      }
      newExpiresAt = parsed
    } else if (typeof days === 'number' && days > 0) {
      // Duration in days — add to current expiry (or now if expired/null)
      const startDate = outlet.planExpiresAt && new Date(outlet.planExpiresAt) > new Date()
        ? new Date(outlet.planExpiresAt)
        : new Date()
      newExpiresAt = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)
    } else if (days === 0 || days === null || days === undefined) {
      // 0 / null / undefined = no expiry (lifetime/free)
      newExpiresAt = null
    } else {
      return NextResponse.json(
        { error: 'Provide either "days" (positive number) or "expiresAt" (ISO date string), or "days": 0 for no expiry' },
        { status: 400 }
      )
    }

    const oldExpiresAt = outlet.planExpiresAt
    const updatedOutlets: string[] = []

    // Use transaction for group updates to prevent partial writes
    if (applyToGroup && outlet.groupId && outlet.group) {
      const outletIds = outlet.group.outlets.map(o => o.id)
      await db.$transaction(
        outletIds.map(oid =>
          db.outlet.update({
            where: { id: oid },
            data: { planExpiresAt: newExpiresAt },
          })
        )
      )
      updatedOutlets.push(...outletIds)
    } else {
      await db.outlet.update({
        where: { id },
        data: { planExpiresAt: newExpiresAt },
      })
      updatedOutlets.push(id)
    }

    // Log the action
    await db.auditLog.create({
      data: {
        action: 'CHANGE_DURATION',
        targetId: id,
        targetType: 'outlet',
        details: JSON.stringify({
          oldExpiresAt,
          newExpiresAt,
          days,
          applyToGroup: !!applyToGroup,
          updatedOutlets,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      previousExpiresAt: oldExpiresAt,
      newExpiresAt,
      updatedOutlets,
    })
  } catch (error) {
    console.error('[PUT /api/admin/outlets/[id]/duration]', error)
    return NextResponse.json({ error: 'Failed to change duration' }, { status: 500 })
  }
}
