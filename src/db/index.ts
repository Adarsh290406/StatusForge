// Central re-export — import db and schema tables from here throughout the app
export { db } from "@/lib/db";
export {
  orgs,
  users,
  services,
  incidents,
  incidentServices,
  incidentUpdates,
  // Enums
  userRoleEnum,
  serviceStatusEnum,
  incidentSeverityEnum,
  incidentStatusEnum,
  // Relations
  orgsRelations,
  usersRelations,
  servicesRelations,
  incidentsRelations,
  incidentServicesRelations,
  incidentUpdatesRelations,
} from "@/db/schema";

// Inferred TypeScript types for use across the app
export type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  orgs,
  users,
  services,
  incidents,
  incidentServices,
  incidentUpdates,
} from "@/db/schema";

export type Org = InferSelectModel<typeof orgs>;
export type NewOrg = InferInsertModel<typeof orgs>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Service = InferSelectModel<typeof services>;
export type NewService = InferInsertModel<typeof services>;

export type Incident = InferSelectModel<typeof incidents>;
export type NewIncident = InferInsertModel<typeof incidents>;

export type IncidentService = InferSelectModel<typeof incidentServices>;
export type NewIncidentService = InferInsertModel<typeof incidentServices>;

export type IncidentUpdate = InferSelectModel<typeof incidentUpdates>;
export type NewIncidentUpdate = InferInsertModel<typeof incidentUpdates>;
