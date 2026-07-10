import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, orgs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    // Single-org MVP rule: fetch services belonging to the first org in the DB
    const firstOrgList = await db.select().from(orgs).limit(1);
    const firstOrg = firstOrgList[0];

    if (!firstOrg) {
      return NextResponse.json([]);
    }

    const list = await db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        status: services.status,
      })
      .from(services)
      .where(eq(services.orgId, firstOrg.id))
      .orderBy(asc(services.sortOrder));

    return NextResponse.json(list);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
