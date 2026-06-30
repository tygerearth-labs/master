import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/webmaster/enterprise-groups
 * Returns all OutletGroups with their outlets (enterprise multi-outlet accounts)
 */
export async function GET() {
  try {
    const groups = await db.outletGroup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        outlets: {
          orderBy: [{ isMain: "desc" }, { name: "asc" }],
          include: {
            _count: {
              select: {
                users: true,
                products: true,
                transactions: true,
                customers: true,
              },
            },
          },
        },
        _count: {
          select: { outlets: true, transfers: true },
        },
      },
    });

    // Add computed fields
    const enriched = groups.map((g) => {
      const totalOutlets = g.outlets.length;
      const totalUsers = g.outlets.reduce((s, o) => s + o._count.users, 0);
      const totalProducts = g.outlets.reduce((s, o) => s + o._count.products, 0);
      const totalTransactions = g.outlets.reduce((s, o) => s + o._count.transactions, 0);
      const mainOutlet = g.outlets.find((o) => o.isMain) || g.outlets[0];
      const planExpiresAt = mainOutlet?.planExpiresAt || null;

      // Check if any outlet is expired
      const now = new Date();
      const hasExpired = g.outlets.some(
        (o) => o.planExpiresAt && o.planExpiresAt < now
      );

      return {
        ...g,
        totalOutlets,
        totalUsers,
        totalProducts,
        totalTransactions,
        planExpiresAt,
        hasExpired,
        status: hasExpired ? "expired" : planExpiresAt ? "active" : "free",
      };
    });

    // Summary stats
    const totalGroups = enriched.length;
    const totalEnterpriseOutlets = enriched.reduce((s, g) => s + g.totalOutlets, 0);

    return NextResponse.json({
      groups: enriched,
      summary: {
        totalGroups,
        totalEnterpriseOutlets,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/webmaster/enterprise-groups] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}