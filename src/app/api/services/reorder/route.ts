import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { order } = await req.json(); // Expected: { order: { id: string, sortOrder: number }[] }
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (const item of order) {
        await tx
          .update(services)
          .set({ sortOrder: item.sortOrder })
          .where(and(eq(services.id, item.id), eq(services.orgId, session.orgId!)));
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reorder services" }, { status: 500 });
  }
}
