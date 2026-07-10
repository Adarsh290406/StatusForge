import { NextResponse } from "next/server";
import { db } from "@/db";
import { incidents, incidentServices, incidentUpdates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const incidentList = await db
      .select()
      .from(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.orgId, session.orgId)))
      .limit(1);

    const incident = incidentList[0];
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const updates = await db
      .select()
      .from(incidentUpdates)
      .where(eq(incidentUpdates.incidentId, id))
      .orderBy(incidentUpdates.createdAt); // oldest first for chronological view

    const servicesLinked = await db
      .select({ serviceId: incidentServices.serviceId })
      .from(incidentServices)
      .where(eq(incidentServices.incidentId, id));

    return NextResponse.json({
      ...incident,
      updates,
      serviceIds: servicesLinked.map((s) => s.serviceId),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch incident" }, { status: 500 });
  }
}
