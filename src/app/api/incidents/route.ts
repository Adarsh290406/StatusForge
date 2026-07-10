import { NextResponse } from "next/server";
import { db } from "@/db";
import { incidents, incidentServices } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // 'open' or 'resolved'

  try {
    const query = db.select().from(incidents).where(eq(incidents.orgId, session.orgId));
    const allIncidents = await query;

    // Filter results logically to keep queries minimal and clear
    const filtered = allIncidents.filter((incident) => {
      if (statusFilter === "open") return incident.status !== "resolved";
      if (statusFilter === "resolved") return incident.status === "resolved";
      return true;
    });

    // Populate linked services for each incident
    const incidentsWithServices = await Promise.all(
      filtered.map(async (incident) => {
        const servicesLinked = await db
          .select({ serviceId: incidentServices.serviceId })
          .from(incidentServices)
          .where(eq(incidentServices.incidentId, incident.id));
        return {
          ...incident,
          serviceIds: servicesLinked.map((s) => s.serviceId),
        };
      })
    );

    return NextResponse.json(incidentsWithServices);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, severity, status, serviceIds } = await req.json();
    if (!title || !severity || !status || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newIncident = await db.transaction(async (tx) => {
      const [incident] = await tx
        .insert(incidents)
        .values({
          orgId: session.orgId!,
          title,
          severity,
          status,
        })
        .returning();

      for (const serviceId of serviceIds) {
        await tx.insert(incidentServices).values({
          incidentId: incident.id,
          serviceId,
        });
      }

      return incident;
    });

    return NextResponse.json(newIncident, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 });
  }
}
