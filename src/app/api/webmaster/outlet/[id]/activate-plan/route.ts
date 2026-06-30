import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/webmaster/outlet/[id]/activate-plan
 * Activate a plan on an outlet — sets accountType & calculates planExpiresAt
 *
 * Body: { planId: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    // Find the plan
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan tidak ditemukan" }, { status: 404 });
    }

    // Find the outlet
    const outlet = await db.outlet.findUnique({ where: { id } });
    if (!outlet) {
      return NextResponse.json({ error: "Outlet tidak ditemukan" }, { status: 404 });
    }

    // Determine account type from plan slug
    let accountType = "free";
    if (plan.slug.includes("enterprise")) {
      accountType = "enterprise";
    } else if (plan.slug.includes("pro")) {
      accountType = "pro";
    }

    // Calculate expiration date
    let planExpiresAt: Date | null = null;
    if (plan.duration > 0) {
      planExpiresAt = new Date();
      planExpiresAt.setMonth(planExpiresAt.getMonth() + plan.duration);
    }

    // Update outlet
    const updated = await db.outlet.update({
      where: { id },
      data: {
        accountType,
        planExpiresAt,
      },
    });

    return NextResponse.json({
      outlet: updated,
      plan: {
        name: plan.name,
        slug: plan.slug,
        duration: plan.duration,
        price: plan.price,
      },
      activatedAt: new Date().toISOString(),
      expiresAt: planExpiresAt?.toISOString() || null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST activate-plan] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}