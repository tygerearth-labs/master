import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  const { model, id } = await params;

  try {
    // @ts-expect-error dynamic model access
    if (!prisma[model] || !prisma[model].findUnique) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    // @ts-expect-error dynamic model access
    const record = await prisma[model].findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  const { model, id } = await params;

  try {
    const body = await req.json();

    // @ts-expect-error dynamic model access
    if (!prisma[model] || !prisma[model].update) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    // @ts-expect-error dynamic model access
    const record = await prisma[model].update({ where: { id }, data: body });
    return NextResponse.json(record);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  const { model, id } = await params;

  try {
    // @ts-expect-error dynamic model access
    if (!prisma[model] || !prisma[model].delete) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    // @ts-expect-error dynamic model access
    await prisma[model].delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
