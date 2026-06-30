import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const branch = await db.branch.update({
      where: { id },
      data: {
        name: body.name,
        ownerId: body.ownerId,
        address: body.address || null,
        phone: body.phone || null,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(branch)
  } catch (error) {
    console.error('Update branch error:', error)
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Delete outlets and their data
    const outlets = await db.outlet.findMany({ where: { branchId: id }, select: { id: true } })
    for (const o of outlets) {
      await db.transaction.deleteMany({ where: { outletId: o.id } })
      await db.crew.deleteMany({ where: { outletId: o.id } })
    }
    await db.outlet.deleteMany({ where: { branchId: id } })
    await db.branch.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete branch error:', error)
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}