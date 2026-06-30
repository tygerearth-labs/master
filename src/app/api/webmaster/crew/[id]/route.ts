import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * PUT /api/webmaster/crew/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const user = await db.user.update({ where: { id }, data: body });
    return NextResponse.json(user);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PUT /api/webmaster/crew/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/webmaster/crew/[id]
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[DELETE /api/webmaster/crew/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}