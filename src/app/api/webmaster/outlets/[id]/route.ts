import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/webmaster/outlets/[id]
 * Get single outlet by ID
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const outlet = await db.outlet.findUnique({
      where: { id },
      include: {
        users: true,
        setting: true,
        group: { include: { outlets: true, owner: true } },
        _count: {
          select: { transactions: true, products: true, customers: true },
        },
      },
    });
    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }
    return NextResponse.json(outlet);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/webmaster/outlets/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/webmaster/outlets/[id]
 * Update outlet
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const outlet = await db.outlet.update({ where: { id }, data: body });
    return NextResponse.json(outlet);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PUT /api/webmaster/outlets/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/webmaster/outlets/[id]
 * Delete outlet
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.outlet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[DELETE /api/webmaster/outlets/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}