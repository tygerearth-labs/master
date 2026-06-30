import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const owner = await db.owner.update({
      where: { id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json(owner)
  } catch (error) {
    console.error('Owner update error:', error)
    return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 })
  }
}