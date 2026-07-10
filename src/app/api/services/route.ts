import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select()
      .from(services)
      .where(eq(services.orgId, session.orgId))
      .orderBy(asc(services.sortOrder));
    return NextResponse.json(list);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }

    // Auto-increment sortOrder for this org
    const [{ maxSort }] = await db
      .select({ maxSort: sql<number>`COALESCE(MAX(${services.sortOrder}), 0)` })
      .from(services)
      .where(eq(services.orgId, session.orgId));

    const [newService] = await db
      .insert(services)
      .values({
        orgId: session.orgId,
        name,
        description,
        status: "operational",
        sortOrder: maxSort + 1,
      })
      .returning();

    return NextResponse.json(newService, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
