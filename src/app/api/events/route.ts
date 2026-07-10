import { NextResponse } from "next/server";
import { sseEmitter } from "@/lib/sse";
import { db } from "@/db";
import { services, incidents, incidentUpdates, incidentServices, orgs } from "@/db/schema";
import { eq, ne, asc } from "drizzle-orm";

export async function GET() {
  const encoder = new TextEncoder();

  // Create stream channel
  const stream = new ReadableStream({
    async start(controller) {
      // 1. Fetch initial state snapshot
      try {
        const firstOrgList = await db.select().from(orgs).limit(1);
        const firstOrg = firstOrgList[0];

        let initialServices: any[] = [];
        let initialIncidents: any[] = [];

        if (firstOrg) {
          initialServices = await db
            .select({
              id: services.id,
              name: services.name,
              description: services.description,
              status: services.status,
            })
            .from(services)
            .where(eq(services.orgId, firstOrg.id))
            .orderBy(asc(services.sortOrder));

          const activeIncidents = await db
            .select()
            .from(incidents)
            .where(and => eq(incidents.orgId, firstOrg.id))
            .orderBy(incidents.createdAt);

          // Filter out resolved ones for initial ongoing snapshot
          const openIncidents = activeIncidents.filter(i => i.status !== "resolved");

          initialIncidents = await Promise.all(
            openIncidents.map(async (incident) => {
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
        }

        controller.enqueue(
          encoder.encode(`event: snapshot\ndata: ${JSON.stringify({ services: initialServices, incidents: initialIncidents })}\n\n`)
        );
      } catch (err) {
        console.error("SSE Initial Snapshot Failed:", err);
      }

      // 2. Setup listener callback
      const onEvent = (event: string, data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch (e) {
          // Stream may already be closed
        }
      };

      // Register listener bindings
      const eventNames = ["service-update", "incident-created", "incident-update", "incident-resolved"];
      const handlers = eventNames.map((name) => {
        const handler = (data: any) => onEvent(name, data);
        sseEmitter.on(name, handler);
        return { name, handler };
      });

      // Keep connection alive with periodic pings every 25 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":\n\n"));
        } catch (e) {
          clearInterval(pingInterval);
        }
      }, 25000);

      // Cleanup listeners on close
      reqClosePromise.then(() => {
        clearInterval(pingInterval);
        handlers.forEach(({ name, handler }) => {
          sseEmitter.off(name, handler);
        });
      });
    },
  });

  // Track client disconnection
  let resolveClose: () => void;
  const reqClosePromise = new Promise<void>((resolve) => {
    resolveClose = resolve;
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
