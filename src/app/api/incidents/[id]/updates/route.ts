import { NextResponse } from "next/server";
import { db } from "@/db";
import { incidents, incidentUpdates, services, incidentServices } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { message, statusAtTime } = await req.json();
    if (!message || !statusAtTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify incident belongs to org
    const incidentList = await db
      .select()
      .from(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.orgId, session.orgId)))
      .limit(1);

    const incident = incidentList[0];
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const result = await db.transaction(async (tx) => {
      // 1. Post the timeline update
      const [update] = await tx
        .insert(incidentUpdates)
        .values({
          incidentId: id,
          message,
          statusAtTime,
          authorId: session.userId!,
        })
        .returning();

      // 2. Sync incident overall status
      const incidentUpdatesMap: Partial<typeof incidents.$inferInsert> = { status: statusAtTime };
      if (statusAtTime === "resolved") {
        incidentUpdatesMap.resolvedAt = new Date();
      }
      await tx.update(incidents).set(incidentUpdatesMap).where(eq(incidents.id, id));

      // 3. Resolution Workflow: Auto-flip all linked services to 'operational'
      const updatedServiceIds: string[] = [];
      if (statusAtTime === "resolved") {
        const linkedServices = await tx
          .select({ serviceId: incidentServices.serviceId })
          .from(incidentServices)
          .where(eq(incidentServices.incidentId, id));

        for (const link of linkedServices) {
          await tx
            .update(services)
            .set({
              status: "operational",
              statusChangedAt: new Date(),
            })
            .where(eq(services.id, link.serviceId));
          updatedServiceIds.push(link.serviceId);
        }
      }

      return { update, updatedServiceIds };
    });

    // Dispatch SSE Event
    const { sseEmitter } = await import("@/lib/sse");
    if (statusAtTime === "resolved") {
      sseEmitter.emit("incident-resolved", {
        id,
        update: result.update,
        resolvedServiceIds: result.updatedServiceIds,
      });
    } else {
      sseEmitter.emit("incident-update", {
        id,
        update: result.update,
      });
    }

    return NextResponse.json(result.update, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 });
  }
}
