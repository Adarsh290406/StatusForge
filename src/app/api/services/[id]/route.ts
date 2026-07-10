import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, incidentServices, incidents } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { name, description, status } = await req.json();

    // Verify ownership
    const existing = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.orgId, session.orgId)))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updates: Partial<typeof services.$inferInsert> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      updates.status = status;
      if (status !== existing[0].status) {
        updates.statusChangedAt = new Date();
      }
    }
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(services)
      .set(updates)
      .where(and(eq(services.id, id), eq(services.orgId, session.orgId)))
      .returning();

    // Dispatch SSE Event
    const { sseEmitter } = await import("@/lib/sse");
    sseEmitter.emit("service-update", {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    // 1. Verify ownership
    const existing = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.orgId, session.orgId)))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 2. Check for unresolved incidents linked to this service
    const activeIncidentLinks = await db
      .select({ incidentId: incidentServices.incidentId })
      .from(incidentServices)
      .innerJoin(incidents, eq(incidentServices.incidentId, incidents.id))
      .where(
        and(
          eq(incidentServices.serviceId, id),
          ne(incidents.status, "resolved")
        )
      );

    if (activeIncidentLinks.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete service — it is linked to an active incident. Resolve the incident first.",
        },
        { status: 400 }
      );
    }

    // Perform delete
    await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.orgId, session.orgId)));

    // Dispatch SSE Event
    const { sseEmitter } = await import("@/lib/sse");
    sseEmitter.emit("service-delete", { id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
