# StatusForge — Project Plan

## One-line pitch
A public status page + incident tracker for teams — admins manage service health and post incident updates; anyone can view real-time status with no login required.

---

## User Stories

### Admin (team member)
1. Sign up / log in securely (first signup creates the org).
2. Create and manage a list of services (e.g. "API", "Website", "Payments").
3. Manually change a service's status (Operational / Degraded / Down).
4. Create an incident tied to one or more services, with a title, severity, and initial message.
5. Post timestamped updates to an ongoing incident (investigating → identified → monitoring → resolved).
6. See a dashboard of current service health and open incidents at a glance.
7. System auto-creates a draft incident if a service has been marked Down for >5 minutes with no linked open incident.
8. Resolving an incident auto-flips all linked services back to `operational`.

### Public visitor (no login)
1. Visit the public status page and instantly see if everything is working.
2. See status updates live, without refreshing the page (real-time via SSE).
3. See a history of past incidents and how long they took to resolve.
4. Search incident history by title.
5. Subscribe to notifications (stretch goal — deferred to v2).

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | API routes + React in one project |
| Language | TypeScript | Type safety end-to-end |
| Database | PostgreSQL | UUID support, enum types, cron-friendly |
| ORM | Drizzle ORM | Lightweight, SQL-like, great TypeScript inference |
| Auth | Iron Session or Lucia Auth | httpOnly cookie sessions, no JWT complexity |
| Password Hashing | Argon2id (via `@node-rs/argon2`) | Modern, secure |
| Styling | Tailwind CSS + shadcn/ui | Fast to build, looks polished |
| Real-time | Server-Sent Events (SSE) | One-directional, native `EventSource`, no extra deps |
| Cron Jobs | Vercel Cron Jobs (prod) / setInterval (dev) | Runs auto-detection every 60s |
| Rate Limiting | Upstash Redis (prod) / in-memory Map (dev) | 5 attempts/15min on login |
| Deployment | Vercel | Zero-config for Next.js, cron support |

---

## Data Model (Schema)

### `orgs`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, default: gen_random_uuid() | |
| name | text | e.g. "Acme Corp" |
| slug | text, unique | URL-safe, for future multi-tenant routing |
| created_at | timestamp, default: now() | |

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, default: gen_random_uuid() | |
| org_id | uuid, FK → orgs, not null | scopes user to their org |
| email | text, unique, not null | |
| password_hash | text, not null | Argon2id hashed |
| name | text, not null | |
| role | enum: 'owner', 'admin', default: 'admin' | 'owner' = first user in org |
| created_at | timestamp, default: now() | |

### `services`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, default: gen_random_uuid() | |
| org_id | uuid, FK → orgs, not null | |
| name | text, not null | e.g. "API" |
| description | text, nullable | |
| status | enum: 'operational', 'degraded', 'down', default: 'operational' | |
| status_changed_at | timestamp, default: now() | used for auto-detection timer |
| sort_order | int, default: 0 | for display ordering |
| created_at | timestamp, default: now() | |
| updated_at | timestamp, default: now() | |

### `incidents`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, default: gen_random_uuid() | |
| org_id | uuid, FK → orgs, not null | denormalized for faster queries |
| title | text, not null | |
| severity | enum: 'minor', 'major', 'critical' | |
| status | enum: 'investigating', 'identified', 'monitoring', 'resolved' | |
| is_auto_generated | boolean, default: false | true if created by auto-detection |
| created_at | timestamp, default: now() | |
| resolved_at | timestamp, nullable | set when status → resolved |

### `incident_services` (join table)
| Column | Type | Notes |
|---|---|---|
| incident_id | uuid, FK → incidents, on delete cascade | |
| service_id | uuid, FK → services, on delete restrict | blocks deleting services with active incidents |
| | | Composite PK: (incident_id, service_id) |

### `incident_updates`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, default: gen_random_uuid() | |
| incident_id | uuid, FK → incidents, on delete cascade | |
| message | text, not null | |
| status_at_time | enum: 'investigating', 'identified', 'monitoring', 'resolved' | snapshot of incident status when posted |
| created_at | timestamp, default: now() | |
| author_id | uuid, FK → users, not null | |

---

## Business Logic Rules

### Incident Resolution
When an admin resolves an incident (status → `resolved`):
1. Require a closing message as the final `incident_update` (`status_at_time = 'resolved'`).
2. Set `incidents.resolved_at = now()`.
3. Flip all linked services' status to `operational`.
4. Update `status_changed_at` on all linked services to `now()`.

### Auto-Detection (runs every 60 seconds)
1. Find services where `status = 'down'` AND `status_changed_at < now() - 5 minutes`.
2. For each such service, check for an open incident linked via `incident_services`.
   - **Open incident** = `incidents.status IN ('investigating', 'identified', 'monitoring')`
3. If no open incident exists:
   - Create incident: `is_auto_generated = true`, `status = 'investigating'`, `severity = 'major'`
   - Link service in `incident_services`
   - Post initial update: "⚠️ [Service Name] has been down for over 5 minutes without an update. This incident was auto-generated."
   - **Service status stays `down`** — no change. The incident link prevents re-firing.
4. If an open incident exists, skip.

### Service Deletion Guard
- Cannot delete a service linked to any incident where `status != 'resolved'`.
- Enforced at DB level (`on delete restrict`) and application level.
- Return error: "Cannot delete service — it is linked to an active incident. Resolve the incident first."

---

## Screens & UI States

### Admin (auth required)
1. **Login / Signup** — first user creates org; subsequent users join existing org (v1: single org per deployment).
2. **Dashboard** — services list with color-coded status dots, quick toggle to change status, open incidents list.
3. **Service Management** — create/edit/delete (with guard)/reorder services.
4. **Incident Detail** — timeline of updates (newest first), form to post an update, resolve button (requires closing message modal).
5. **Settings** (stretch) — org name, branding.

### Public (no login)
1. **Status Page** — banner summary, service list with live status indicators, ongoing incidents with timelines. Updates via SSE.
2. **Incident History** — paginated list of resolved incidents with resolution time, text search by title.

### Shared UI States
Every async view must handle:
- **Loading:** Skeleton placeholders
- **Empty:** Friendly message (e.g. "No incidents yet — your services are running smoothly.")
- **Error:** Error message + Retry button
- **Success:** Render data

---

## Auth & Access

- Email + password authentication with Argon2id hashing.
- Session stored in httpOnly, Secure, SameSite=Lax cookie.
- **Rate limiting on login:** Max 5 attempts per email per 15-minute window. In-memory Map (dev) or Upstash Redis (prod).
- All admin API routes protected server-side — verify session and org membership.
- All DB queries scoped by `org_id` from session.
- Public routes require zero auth.
- **Password reset:** Deferred to v2. Manual DB resets only for v1.

---

## Real-Time Layer

- **Technology:** Server-Sent Events (SSE)
- **Why:** One-directional (server→client), native `EventSource` API, auto-reconnection, no extra dependencies.
- **Events:** `service-update`, `incident-update`, `incident-created`, `incident-resolved`
- **Client:** Public status page opens an `EventSource` connection to `/api/events`. Server sends full state snapshot on initial connection.

---

## Edge Cases Checklist

- [ ] First user signup → org auto-created, user assigned `owner` role.
- [ ] Service has zero incidents → empty state, not blank.
- [ ] Incident affects multiple services → status page reflects all affected services.
- [ ] Admin resolves incident without final update → form validation blocks it.
- [ ] Auto-detection + manual incident for same outage → dedupe by checking open incidents.
- [ ] Auto-detection fires while service is still down → service stays `down`, incident link prevents re-fire.
- [ ] Admin resolves incident, auto-flips services to operational, but service is actually still down → auto-detection fires again after 5 minutes, creates new incident. Correct behavior.
- [ ] Two admins editing same incident → last-write-wins (acceptable for v1).
- [ ] Public page with zero services → friendly empty state.
- [ ] Long incident history → paginated (20 per page).
- [ ] Deleting service with active incident → blocked with error.
- [ ] SSE connection drops → auto-reconnect + full state snapshot on reconnect.
- [ ] Search yields no results → distinct "No results" empty state.

---

## Out of Scope (v1) — Deferred to v2

| Feature | Reason |
|---|---|
| Multi-tenant (multiple orgs per deployment) | Adds slug-based routing, org switching |
| Password reset via email | Requires email integration, token table |
| Email/SMS/webhook subscriber notifications | Requires email service, queue, preference management |
| Slack/Teams/Discord integrations | Requires OAuth per platform, webhook management |
| Full audit log table | Author tracking via `author_id` is sufficient for v1 |
| Custom domains / white-label status pages | Out of scope for MVP, needs DNS/cert handling |
| Incident templates | Nice-to-have, not core |
| API keys for programmatic incident creation | Requires key management, scoped permissions — v2 |

> Note: This table is intentionally reused in the README under a "Roadmap" section — showing what was deliberately deferred (and why) reads as product judgment, not an unfinished project.

---

## Build Order

### Milestone 0: Project Scaffold
- [ ] Initialize Next.js with TypeScript and App Router
- [ ] Install dependencies: Drizzle ORM, `@node-rs/argon2`, `pg`, Tailwind CSS, shadcn/ui
- [ ] Configure database connection (Neon/Supabase for dev, same for prod)
- [ ] Write Drizzle schema for all 6 tables
- [ ] Run `drizzle-kit generate` and `drizzle-kit push` to create tables
- [ ] Generate TypeScript types from schema
- [ ] Create basic API route skeleton (`/api/...`)
- [ ] Set up environment variables
- [ ] Verify app runs locally and connects to DB
- [ ] Test: app boots, `/api/health` returns 200, Drizzle Studio shows empty tables

### Milestone 1: Auth
- [ ] Implement signup API route (creates org on first signup, hashes password with Argon2id)
- [ ] Implement login API route (verify password, create session, rate limiting)
- [ ] Implement logout API route (destroy session)
- [ ] Create session utility and auth middleware
- [ ] Create `useAuth` hook for client-side session checking
- [ ] Build login and signup page UI
- [ ] Test: signup → logout → login → access protected route

### Milestone 2: Services CRUD
- [ ] Create service API routes (POST/GET/PUT/DELETE), all org-scoped
- [ ] Implement service deletion guard
- [ ] Implement reorder logic
- [ ] Build service list UI on admin dashboard with quick status toggle
- [ ] Build create/edit service form
- [ ] Build delete confirmation dialog
- [ ] Handle all UI states: loading, empty, error, success
- [ ] Test: CRUD a service, try deleting one linked to an active incident (should block)

### Milestone 3: Incidents + Updates CRUD
- [ ] Create incident API routes (POST/GET/PUT), all org-scoped
- [ ] Create incident_update API route
- [ ] Implement incident resolution logic (require closing message, set resolved_at, flip services to operational)
- [ ] Build incident list UI (open vs resolved tabs)
- [ ] Build incident detail page with update timeline
- [ ] Build "post update" form and "resolve incident" flow
- [ ] Handle all UI states
- [ ] Test: create incident with 2 services, post updates, resolve, verify services flip to operational

### Milestone 4: Public Status Page
- [ ] Create public API routes (GET services, GET incidents, GET incident history)
- [ ] Calculate overall system status banner
- [ ] Build service status list with colored status dots
- [ ] Build ongoing incidents list with inline update timelines
- [ ] Build incident history page with pagination and text search
- [ ] Show resolution time for resolved incidents
- [ ] Handle all UI states
- [ ] Test: visit public page as logged-out user, verify all data renders

### Milestone 5: Real-Time Layer (SSE)
- [ ] Create SSE endpoint (`/api/events`)
- [ ] Send full state snapshot on initial connection
- [ ] Wire up service status changes to trigger SSE events
- [ ] Wire up incident create/update/resolve to trigger SSE events
- [ ] Build `EventSource` client hook for the public status page
- [ ] Test: open public page in two tabs, change a service status in admin, verify both tabs update

### Milestone 6: Auto-Detection Job
- [ ] Implement auto-detection logic as a standalone function
- [ ] Wire to a cron endpoint (`/api/cron/auto-detect`) or Vercel Cron Job
- [ ] Set interval to 60 seconds
- [ ] Test: mark a service as "down", wait 5+ minutes, verify auto-incident is created
- [ ] Test dedupe: create a manual incident for the same service, verify auto-detect skips it

### Milestone 7: Polish Pass
- [ ] Audit every page for loading, empty, error, and success states
- [ ] Mobile responsive (375px+)
- [ ] Keyboard navigation
- [ ] Dark mode
- [ ] Favicon and page titles
- [ ] Transitions/animations on status changes
- [ ] Accessibility pass

### Milestone 8: SEO + Deploy
- [ ] Add meta tags, og:image to public pages
- [ ] Generate sitemap.xml and robots.txt
- [ ] Deploy to Vercel
- [ ] Configure Vercel Cron Job for auto-detection
- [ ] Test production build end-to-end
- [ ] Run Lighthouse audit

### Milestone 9: Docs + Open Source
- [ ] Write README.md (description, screenshots, tech stack, setup, deploy button, Roadmap section using the Out of Scope table)
- [ ] Write architecture.md (system diagram, data flow, design decisions, deferred features)
- [ ] Add LICENSE (MIT)
- [ ] Add CHANGELOG.md
- [ ] Record demo video (2-3 minutes)
- [ ] Write case study / blog post
- [ ] Push to GitHub, make public

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=random-64-char-string
AUTO_DETECTION_THRESHOLD_MINUTES=5
AUTO_DETECTION_INTERVAL_SECONDS=60
CRON_SECRET=random-secret-for-cron-endpoint
UPSTASH_REDIS_URL=...      # prod only
UPSTASH_REDIS_TOKEN=...    # prod only
NEXT_PUBLIC_APP_URL=https://statusforge.example.com
```
