import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/webmaster/outlets
 * List all outlets with search and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      db.outlet.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true } },
        },
      }),
      db.outlet.count(
        Object.keys(where).length > 0 ? { where } : undefined
      ),
    ]);

    return NextResponse.json({
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/webmaster/outlets] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/webmaster/outlets
 * Create a new outlet
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const outlet = await db.outlet.create({ data: body });
    return NextResponse.json(outlet, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/webmaster/outlets] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
