import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/webmaster/plans
 * List all plans ordered by sortOrder
 */
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(plans);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/webmaster/plans] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/webmaster/plans
 * Create a new plan
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, price, duration, paymentLink, features, active, sortOrder, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "name dan slug wajib diisi" }, { status: 400 });
    }

    const plan = await db.plan.create({
      data: {
        name,
        slug,
        price: Number(price) || 0,
        duration: Number(duration) || 0,
        paymentLink: paymentLink || null,
        features: typeof features === "string" ? features : JSON.stringify(features || {}),
        active: active !== undefined ? Boolean(active) : true,
        sortOrder: Number(sortOrder) || 0,
        description: description || null,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/webmaster/plans] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}