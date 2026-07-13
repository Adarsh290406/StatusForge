# StatusForge — Case Study

## Problem

Engineering teams need a simple, reliable way to communicate system health to their users.
Existing solutions like Instatus and Atlassian Statuspage are powerful, but they come with monthly subscription fees and lock you into a third-party platform. For small teams and open-source projects, a self-hosted, transparent alternative was missing.

---

## Approach

I built **StatusForge** — an open-source, self-hosted status page and incident tracker.
The app lets admins manage services (API, Website, Payments), manually change their status, and create timestamped incident timelines. A public status page displays everything in real time, with zero login required.

### Key Technical Decisions

**Real-time updates via Server-Sent Events (SSE)**
Simpler than WebSockets for one-directional data, with native browser reconnection and no extra dependencies. When a service status changes or a new incident is posted, all connected public page visitors see the update within seconds — no polling, no refresh.

**Auto-detection of unacknowledged outages**
A Vercel cron job runs daily and scans for services marked "Down" for more than five minutes without a linked incident. It auto-creates a draft incident to ensure no outage goes unnoticed, reducing on-call toil.

**Schema-first development with Claude in Antigravity**
The entire data model was locked before any feature code was written. This eliminated entire categories of bugs (missing foreign keys, wrong column types, ambiguous relations) and made the build predictable. Every subsequent feature had a concrete contract to follow.

**Full auth & security stack**
- Argon2id password hashing via `@node-rs/argon2`
- `httpOnly` session cookies using `iron-session`
- In-memory rate limiting on login and forgot-password endpoints
- Email verification flow with SHA-256 hashed tokens (24h TTL)
- Token-based password reset via Resend (15-minute TTL, single-use)
- Server-side RBAC (`owner` / `admin` roles)
- Strict HTTP security headers via Vercel config (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)

**Optimistic UI and toast notifications**
Service status toggles update the UI instantly and roll back automatically if the API request fails — giving the app a fast, modern feel. All admin mutations surface Sonner toast alerts so the operator always has clear feedback.

**Polished, accessible design**
Custom landing page, system-aware dark mode, fully mobile responsive down to 375px, custom 404 page, global error boundary, and WCAG-friendly focus states throughout.

---

## Result

| | |
|---|---|
| **Live product** | [https://status-forge-uvx9.vercel.app](https://status-forge-uvx9.vercel.app) |
| **Open source** | [https://github.com/Adarsh290406/StatusForge](https://github.com/Adarsh290406/StatusForge) |
| **Demo video** | [Loom walkthrough](https://www.loom.com/share/724dc74cb3cd4068958b85ec1a716fbd) |
| **Lighthouse** | 80+ Performance · 93+ Accessibility · 100 Best Practices · 100 SEO |
| **Feature complete** | Real-time SSE, email verification, password reset, custom error boundaries, security headers, optimistic UI, toast notifications |

---

## What I Learned

**SSE > WebSockets for unidirectional push**
Server-Sent Events are significantly easier to implement, debug, and reason about when you only need server-to-client updates. The native browser reconnection handling alone saves substantial boilerplate.

**Deduplication is the hardest part of auto-detection**
Checking for an existing open incident before creating a new one required careful edge-case thinking that was easy to miss in planning but critical in practice — without it, every cron tick would create duplicate incidents during a prolonged outage.

**Schema-first development pays compound dividends**
Locking the data model with an AI assistant before writing any feature code forces you to resolve ambiguities upfront. The AI then has a concrete contract to follow, which dramatically reduces the back-and-forth of mid-build schema changes.

**Deploy early, deploy often**
Treating the Vercel deployment pipeline as a first-day dependency — not a final-day afterthought — would have caught environment-specific issues (TTY errors, missing env vars, cron plan limits) far sooner. The lesson: `git push && verify` on day one, not day ten.

**Sandbox email providers require careful scoping**
Resend's sandbox mode restricts outgoing email to the account owner's address only. Designing the verification flow to fall back gracefully (console link in dev, real email in production) made the feature usable across all environments without a fully verified domain.

---

## Tech Stack

| Technology | Role |
|---|---|
| Next.js 16 (App Router) | Framework — RSC + Client Components |
| TypeScript | Type safety throughout |
| PostgreSQL + Drizzle ORM | Database + schema-first query client |
| Tailwind CSS v4 | Styling |
| Sonner | Toast notifications |
| iron-session | Secure httpOnly session cookies |
| Argon2id | Password hashing |
| Resend | Transactional email |
| Server-Sent Events | Real-time public page updates |
| Vercel | Hosting + cron jobs |
