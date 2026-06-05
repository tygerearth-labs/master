import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params;

  try {
    // @ts-expect-error dynamic model access
    const modelDelegate = prisma[model];
    if (!modelDelegate || !modelDelegate.findMany) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const filterKey = searchParams.get("filterKey") || "";
    const filterValue = searchParams.get("filterValue") || "";

    const where: Record<string, unknown> = {};
    if (filterKey && filterValue) {
      where[filterKey] = filterValue;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { outletName: { contains: search } },
      ];
    }

    // @ts-expect-error dynamic model access
    const records = await prisma[model].findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // @ts-expect-error dynamic model access
    const total = await prisma[model].count({
      where: Object.keys(where).length > 0 ? where : undefined,
    });

    return NextResponse.json({ records, total, page, limit });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params;

  try {
    const body = await req.json();

    // @ts-expect-error dynamic model access
    if (!prisma[model] || !prisma[model].create) {
      return NextResponse.json({ error: `Model "${model}" not found` }, { status: 404 });
    }

    // @ts-expect-error dynamic model access
    const record = await prisma[model].create({ data: body });
    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
