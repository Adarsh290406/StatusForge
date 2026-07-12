# StatusForge

An open-source, self-hosted system status page and incident tracker designed for modern engineering teams.

![StatusForge Desktop Landing Page](docs/screenshots/desktop_landing.png)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)
[![Live Demo](https://img.shields.io/badge/Demo-Live-green.svg)](https://statusforge.vercel.app)

---

## Features

- **Real-Time Status Updates via SSE:** Broadcasts service health changes instantly to all active visitors using Server-Sent Events — zero page refresh required.
- **Incident Timeline Feeds:** Log chronological timeline updates from Investigating → Monitoring → Resolved to provide transparency during outages.
- **Outage Auto-Detection:** Executes cron jobs to identify unacknowledged downtime and auto-generate draft incidents if components remain down for more than 5 minutes.
- **Incident History & Pagination:** Lists searchable, resolved historical events with calculated time-to-resolution logs for SLA metrics.
- **Role-Based Admin Dashboard:** Manage individual system components, reorder services with ▲/▼ triggers, and coordinate active incident threads from a central dashboard.
- **Optimistic UI Status Toggles:** Service status changes update instantly in the UI with automatic rollback if the API request fails.
- **Email Verification Flow:** Newly registered accounts receive a console-logged verification link; unverified accounts cannot log in.
- **Password Reset via Secure Link:** Token-based password reset flow — SHA-256 hashed tokens stored at rest, single-use, with 15-minute TTL.
- **Toast Notifications:** Real-time Sonner toast alerts for all admin mutations (service CRUD, incident management, auth events).
- **Custom 404 & Error Pages:** Styled not-found and global error boundaries matching the application design system.
- **System-Aware Dark Mode:** Swaps styling palettes seamlessly based on active user or OS preferences.
- **Mobile Responsive Layouts:** Optimized touch target paddings and responsive grids for viewports down to 375px (iPhone SE).
- **Security Headers:** Strict HTTP security headers applied via Vercel config (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).

---

## Tech Stack

| Technology | Purpose / Layer |
| :--- | :--- |
| **Next.js 16** | Application Framework (App Router & React Server Components) |
| **TypeScript** | Strict Type Checking & Safe Data Modeling |
| **PostgreSQL** | Relational Database Store |
| **Drizzle ORM** | Object-Relational Schema Mapping & SQL Query Client |
| **Tailwind CSS v4** | CSS Utility Styling with Persisted Variables |
| **Sonner** | Toast Notification System |
| **iron-session** | Secure, signed HTTP-only session cookies |
| **Argon2id** | Password Hashing (via `@node-rs/argon2`) |
| **Resend** | Transactional Email Delivery (password reset) |
| **Server-Sent Events** | Real-time push communications for Client Sync |
| **Vercel** | Deployment Platform & Cron Job Scheduler |

---

## Quick Start

Get StatusForge running locally in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/Adarsh290406/StatusForge.git
cd StatusForge

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Push the schema to your database
npx drizzle-kit push

# 5. Start the development server
npm run dev
```

*Prerequisites: Node.js 18+ and a running PostgreSQL database instance.*

---

## Environment Variables

| Variable Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL string. | `postgresql://user:password@localhost:5432/statusforge` |
| `SESSION_SECRET` | 64-character random string used for secure auth cookies. | `replace-with-a-random-64-character-string` |
| `RESEND_API_KEY` | API key from [Resend](https://resend.com) for sending password reset emails. | `re_xxxxxxxxxxxxxxxxxxxxxx` |
| `AUTO_DETECTION_THRESHOLD_MINUTES` | Minutes a service must be Down before auto-generating a draft incident. | `5` |
| `AUTO_DETECTION_INTERVAL_SECONDS` | Cron run frequency in seconds. | `60` |
| `CRON_SECRET` | Secret token to authenticate incoming requests to the cron route. | `replace-with-a-random-secret-for-cron-endpoint` |
| `UPSTASH_REDIS_URL` | Redis URL for rate-limiting (production only). | `redis://...` |
| `UPSTASH_REDIS_TOKEN` | Access token for rate-limiting (production only). | `token-string` |
| `NEXT_PUBLIC_APP_URL` | Base public URL where the application is deployed. | `http://localhost:3000` |

---

## Auth Flows

### Email Verification
After signing up, a verification link is printed to the **server console** (dev-friendly):
```
================================================================================
[DEV ONLY] Email Verification Link for you@example.com:
http://localhost:3000/verify-email?token=abc123...
================================================================================
```
- Tokens are SHA-256 hashed before storage and expire after **24 hours**.
- Unverified accounts receive a clear error when attempting to log in.
- On successful verification, users are redirected to `/login?verified=true` with a success banner.

### Password Reset
1. Submit email on `/forgot-password`.
2. A secure reset link is sent via **Resend** (or printed to console in dev when using sandbox).
3. Click the link → `/reset-password?token=...` → enter a new password.
- Tokens are SHA-256 hashed, single-use, and expire after **15 minutes**.

---

## Architecture

StatusForge is architected as a Next.js App Router project leveraging React Server Components (RSC) for optimized initial loads and Client Hooks for real-time SSE stream events. The persistence layer uses PostgreSQL managed with Drizzle ORM enforcing schema isolation and user role restrictions. Standalone cron functions automatically track service states to manage recovery behaviors without background daemon processes.

For a deep dive into data models, system flows, and technical design patterns, refer to the [System Architecture Guide](docs/architecture.md).

---

## Roadmap

Features deliberately deferred to **v2** to protect product complexity and initial release timelines:

| Feature | Reason for Deferral |
| :--- | :--- |
| **Multi-Tenant Orgs** | Adds high complexity around slug-based routing, permission splits, and dynamic org switching. |
| **SMS/Email Subscriber Notifications** | Requires queue handlers and customer preference matrices, adding high operations overhead. |
| **OAuth Chat Integrations** | Webhook triggers for Slack/Discord require separate integration layers and platform permissions. |
| **Full Audit Log Table** | Author IDs inside incident logs are sufficient for basic traceability in v1. |
| **Custom Domains** | Dynamic DNS pointer routing and SSL validation are out of scope for early deployments. |
| **Incident Templates** | Manual logs are sufficient for early-stage operations. |
| **Programmatic API Keys** | Key rotation mechanisms and scoped permission routers deferred to v2. |

---

## Screenshots

<table border="0">
  <tr>
    <td align="center"><b>Landing Page</b></td>
    <td align="center"><b>Public Status Board</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/desktop_landing.png" width="100%" alt="StatusForge Desktop Landing Page"/></td>
    <td><img src="docs/screenshots/desktop_status.png" width="100%" alt="StatusForge Desktop Status Page"/></td>
  </tr>
  <tr>
    <td align="center"><b>Mobile Status Board</b></td>
    <td align="center"><b>Admin Services Dashboard</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/mobile_status.png" width="100%" alt="StatusForge Mobile Status Page"/></td>
    <td><img src="docs/screenshots/desktop_admin.png" width="100%" alt="StatusForge Admin Services Dashboard"/></td>
  </tr>
  <tr>
    <td align="center"><b>Incidents Management</b></td>
    <td align="center"><b>Email Verification</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/desktop_incidents.png" width="100%" alt="StatusForge Admin Incidents Page"/></td>
    <td><img src="docs/screenshots/verify_email.png" width="100%" alt="StatusForge Email Verification Page"/></td>
  </tr>
  <tr>
    <td align="center"><b>Custom 404 Page</b></td>
    <td align="center"><b>Login with Verification Banner</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/custom_404.png" width="100%" alt="StatusForge Custom 404 Page"/></td>
    <td><img src="docs/screenshots/login_verified.png" width="100%" alt="StatusForge Login Page with Verification Success"/></td>
  </tr>
</table>

---

## Demo Credentials

Sign up directly from the landing page to register your own organization. After signing up, check the **server console** for the email verification link — no email client required during local development.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
