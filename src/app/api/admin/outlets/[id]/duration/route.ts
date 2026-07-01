import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOutletAuditContext } from '@/lib/audit'

// PUT /api/admin/outlets/[id]/duration — Change plan duration/expiry
// Supports both `days` and `months` fields. If `months` provided, converts to days: days = months * 30
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    let { days, months, expiresAt, applyToGroup } = body

    // Fetch outlet once with all relations needed
    const outlet = await db.outlet.findUnique({
      where: { id },
      include: { group: { include: { outlets: true } } },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Convert months to days if provided (backward compat: also accept days directly)
    if (typeof months === 'number' && months > 0) {
      days = months * 30
    } else if (typeof months === 'number' && months === 0) {
      days = 0
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
        { error: 'Provide either "days" or "months" (positive number), "expiresAt" (ISO date string), or "days": 0 for no expiry' },
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

    // Audit log
    const auditCtx = await getOutletAuditContext(id)
    if (auditCtx) {
      await db.auditLog.create({
        data: {
          action: 'CHANGE_DURATION',
          entityType: 'OUTLET',
          entityId: id,
          outletId: id,
          userId: auditCtx.userId,
          details: JSON.stringify({
            oldExpiresAt,
            newExpiresAt,
            days,
            months: months ?? null,
            applyToGroup: !!applyToGroup,
            updatedOutlets,
          }),
        },
      })
    }

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
