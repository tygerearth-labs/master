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

    // Calculate new expiry date
    let newExpiresAt: Date | null = null

    if (expiresAt) {
      // Explicit date provided
      newExpiresAt = new Date(expiresAt)
    } else if (days && days > 0) {
      // Duration in days from now
      const outlet = await db.outlet.findUnique({ where: { id } })
      const startDate = outlet?.planExpiresAt && new Date(outlet.planExpiresAt) > new Date()
        ? new Date(outlet.planExpiresAt)
        : new Date()
      newExpiresAt = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)
    } else if (days === 0 || days === null) {
      // Set to null = no expiry (lifetime/free)
      newExpiresAt = null
    } else {
      return NextResponse.json(
        { error: 'Provide either "days" (number) or "expiresAt" (ISO date string)' },
        { status: 400 }
      )
    }

    const outlet = await db.outlet.findUnique({
      where: { id },
      include: { group: { include: { outlets: true } } },
    })

    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    const oldExpiresAt = outlet.planExpiresAt
    const updatedOutlets: string[] = []

    if (applyToGroup && outlet.groupId && outlet.group) {
      for (const groupOutlet of outlet.group.outlets) {
        await db.outlet.update({
          where: { id: groupOutlet.id },
          data: { planExpiresAt: newExpiresAt },
        })
        updatedOutlets.push(groupOutlet.id)
      }
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
