import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const outlet = await db.outlet.update({
      where: { id },
      data: {
        name: body.name,
        branchId: body.branchId,
        address: body.address || null,
        status: body.status,
      },
    })
    return NextResponse.json(outlet)
  } catch (error) {
    console.error('Update outlet error:', error)
    return NextResponse.json({ error: 'Failed to update outlet' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.transaction.deleteMany({ where: { outletId: id } })
    await db.crew.deleteMany({ where: { outletId: id } })
    await db.outlet.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete outlet error:', error)
    return NextResponse.json({ error: 'Failed to delete outlet' }, { status: 500 })
  }
}