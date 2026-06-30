import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { password } = body

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id },
      data: { password },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}