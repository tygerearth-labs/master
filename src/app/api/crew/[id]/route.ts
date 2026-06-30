import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const crew = await db.crew.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        role: body.role,
        outletId: body.outletId,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(crew)
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    if (errMsg.includes('Unique')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    console.error('Update crew error:', error)
    return NextResponse.json({ error: 'Failed to update crew' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const crew = await db.crew.update({
      where: { id },
      data: { isActive: body.isActive },
    })
    return NextResponse.json(crew)
  } catch (error) {
    console.error('Patch crew error:', error)
    return NextResponse.json({ error: 'Failed to update crew' }, { status: 500 })
  }
}