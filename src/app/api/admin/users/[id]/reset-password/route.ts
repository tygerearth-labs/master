import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// PUT /api/admin/users/[id]/reset-password — Reset user password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    // Log the action with new AuditLog structure
    await db.auditLog.create({
      data: {
        action: 'RESET_PASSWORD',
        entityType: 'USER',
        entityId: id,
        userId: id,
        outletId: user.outletId,
        details: JSON.stringify({ userEmail: user.email }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ success: true, message: `Password reset for ${user.email}` })
  } catch (error) {
    console.error('[PUT /api/admin/users/[id]/reset-password]', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
