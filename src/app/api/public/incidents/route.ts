import { NextResponse } from "next/server";
import { db } from "@/db";
import { incidents, incidentUpdates, orgs, incidentServices } from "@/db/schema";
import { eq, and, ne, ilike, desc, asc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isHistory = searchParams.get("history") === "true";
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    // Single-org MVP: Fetch for first organization
    const firstOrgList = await db.select().from(orgs).limit(1);
    const firstOrg = firstOrgList[0];

    if (!firstOrg) {
      return NextResponse.json({ data: [], total: 0 });
    }

    let results;
    let totalCount = 0;

    if (isHistory) {
      // Resolved incidents list with pagination and search
      const conditions = [
        eq(incidents.orgId, firstOrg.id),
        eq(incidents.status, "resolved"),
      ];
      if (query) {
        conditions.push(ilike(incidents.title, `%${query}%`));
      }

      const allHistoryList = await db
        .select()
        .from(incidents)
        .where(and(...conditions))
        .orderBy(desc(incidents.createdAt));

      totalCount = allHistoryList.length;
      results = allHistoryList.slice(offset, offset + limit);
    } else {
      // Ongoing incidents list
      results = await db
        .select()
        .from(incidents)
        .where(and(eq(incidents.orgId, firstOrg.id), ne(incidents.status, "resolved")))
        .orderBy(desc(incidents.createdAt));
      totalCount = results.length;
    }

    // Populate timeline updates & serviceIds
    const finalIncidents = await Promise.all(
      results.map(async (incident) => {
        const updates = await db
          .select()
          .from(incidentUpdates)
          .where(eq(incidentUpdates.incidentId, incident.id))
          .orderBy(asc(incidentUpdates.createdAt));

        const servicesLinked = await db
          .select({ serviceId: incidentServices.serviceId })
          .from(incidentServices)
          .where(eq(incidentServices.incidentId, incident.id));

        return {
          ...incident,
          updates,
          serviceIds: servicesLinked.map((s) => s.serviceId),
        };
      })
    );

    return NextResponse.json({ data: finalIncidents, total: totalCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}
