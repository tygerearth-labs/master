import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * PUT /api/webmaster/plans/[id]
 * Update a plan
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.duration !== undefined) data.duration = Number(body.duration);
    if (body.paymentLink !== undefined) data.paymentLink = body.paymentLink || null;
    if (body.features !== undefined) {
      data.features = typeof body.features === "string" ? body.features : JSON.stringify(body.features);
    }
    if (body.active !== undefined) data.active = Boolean(body.active);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    if (body.description !== undefined) data.description = body.description || null;

    const plan = await db.plan.update({ where: { id }, data });
    return NextResponse.json(plan);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[PUT /api/webmaster/plans/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/webmaster/plans/[id]
 * Delete a plan
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.plan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[DELETE /api/webmaster/plans/id] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}