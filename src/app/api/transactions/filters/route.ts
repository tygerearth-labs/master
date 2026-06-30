import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [outlets, owners] = await Promise.all([
      db.outlet.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      db.owner.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    ])
    return NextResponse.json({ outlets, owners })
  } catch {
    return NextResponse.json({ outlets: [], owners: [] })
  }
}