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

    const updatedServices = await db.transaction(async (tx) => {
      const items = [];
      for (const item of order) {
        const [updated] = await tx
          .update(services)
          .set({ sortOrder: item.sortOrder })
          .where(and(eq(services.id, item.id), eq(services.orgId, session.orgId!)))
          .returning();
        items.push(updated);
      }
      return items;
    });

    // Dispatch SSE Event for each service
    const { sseEmitter } = await import("@/lib/sse");
    for (const service of updatedServices) {
      if (service) {
        sseEmitter.emit("service-update", {
          id: service.id,
          name: service.name,
          description: service.description,
          status: service.status,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reorder services" }, { status: 500 });
  }
}
