import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/webmaster/crew?outletId=xxx
 * List crew (users) for a specific outlet
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get("outletId");
    if (!outletId) {
      return NextResponse.json({ error: "outletId is required" }, { status: 400 });
    }

    const users = await db.user.findMany({
      where: { outletId },
      orderBy: { createdAt: "desc" },
      include: { crewPermission: true },
    });

    return NextResponse.json({ records: users, total: users.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/webmaster/crew] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/webmaster/crew
 * Create a new crew member
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await db.user.create({ data: body });
    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/webmaster/crew] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
