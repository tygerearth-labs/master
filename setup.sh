#!/bin/bash
# ============================================================
# POST-EXTRACT SETUP SCRIPT
# Jalankan ini setelah extract zip:  bash setup.sh
# ============================================================

echo "=== AetherPOS Webmaster Setup ==="

# 1. Buat [model] directory yang diproteksi filesystem
echo "Creating [model] API routes..."
mkdir -p "src/app/api/webmaster/[model]/[id]"

# 2. Buat route.ts untuk generic CRUD - GET list + POST create
cat > "src/app/api/webmaster/[model]/route.ts" << 'ROUTESCRIPT'
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type PrismaModelKey = keyof typeof db;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  const { model } = await params;
  try {
    const modelDelegate = db[model as PrismaModelKey] as {
      findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
      count: (args?: Record<string, unknown>) => Promise<number>;
    };
    if (!modelDelegate || !modelDelegate.findMany) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const filterKey = searchParams.get("filterKey") || "";
    const filterValue = searchParams.get("filterValue") || "";

    const where: Record<string, unknown> = {};
    if (filterKey && filterValue) where[filterKey] = filterValue;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { outletName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      modelDelegate.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      modelDelegate.count(Object.keys(where).length > 0 ? { where } : undefined),
    ]);

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
    const modelDelegate = db[model as PrismaModelKey] as {
      create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    };
    if (!modelDelegate || !modelDelegate.create) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    const record = await modelDelegate.create({ data: body });
    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
ROUTESCRIPT

# 3. Buat route.ts untuk generic CRUD - GET/PUT/DELETE by ID
cat > "src/app/api/webmaster/[model]/[id]/route.ts" << 'ROUTESCRIPT'
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type PrismaModelKey = keyof typeof db;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  const { model, id } = await params;
  try {
    const modelDelegate = db[model as PrismaModelKey] as {
      findUnique: (args: { where: { id: string } }) => Promise<unknown>;
    };
    if (!modelDelegate || !modelDelegate.findUnique) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    const record = await modelDelegate.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });
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
    const modelDelegate = db[model as PrismaModelKey] as {
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    };
    if (!modelDelegate || !modelDelegate.update) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    const record = await modelDelegate.update({ where: { id }, data: body });
    return NextResponse.json(record);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  const { model, id } = await params;
  try {
    const modelDelegate = db[model as PrismaModelKey] as {
      delete: (args: { where: { id: string } }) => Promise<unknown>;
    };
    if (!modelDelegate || !modelDelegate.delete) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    await modelDelegate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
ROUTESCRIPT

echo "[model] API routes created successfully!"
echo ""
echo "Next steps:"
echo "  1. Edit .env → set DATABASE_URL ke Neon PostgreSQL connection string kamu"
echo "  2. npm install && npx prisma generate"
echo "  3. npx prisma db push  (satu kali saja, AMAN - tidak reset data)"
echo "  4. npm run dev"
