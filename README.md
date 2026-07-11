# StatusForge

An open-source, self-hosted system status page and incident tracker designed for modern engineering teams.

![StatusForge Desktop Landing Page Mockup](docs/screenshots/desktop_landing.png)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-Live-green.svg)](https://your-app.vercel.app)

---

## Features

- **Real-Time Status Updates via SSE:** Broadcasts service health changes instantly to all active visitors using Server-Sent Events — zero page refresh required.
- **Incident Timeline feeds:** Log chronological timeline updates from Investigating $\rightarrow$ Monitoring $\rightarrow$ Resolved to provide transparency during outages.
- **Outage Auto-Detection:** Executes cron jobs to identify unacknowledged downtime and auto-generate draft incidents if components remain down for more than 5 minutes.
- **Incident History & Pagination:** Lists searchable, resolved historical events, detailing calculated time-to-resolution logs for SLA metrics.
- **Role-Based Admin Dashboard:** Manage individual system components, reorder services with ▲/▼ triggers, and coordinate active incident threads from a central dashboard.
- **System-Aware Dark Mode:** Swaps styling palettes seamlessly based on active user or OS preferences.
- **Mobile Responsive Layouts:** Optimized touch target paddings and responsive grids configured for seamless viewing on viewports down to 375px (iPhone SE).

---

## Tech Stack

| Technology | Purpose / Layer |
| :--- | :--- |
| **Next.js 16** | Application Framework (App Router & React Server Components) |
| **TypeScript** | Strict Type Checking & Safe Data Modeling |
| **PostgreSQL** | Relational Database Store |
| **Drizzle ORM** | Object-Relational Schema Mapping & SQL Query Client |
| **Tailwind CSS v4** | CSS Utility Styling with Persisted Variables |
| **shadcn/ui** | Responsive UI Components |
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
| `AUTO_DETECTION_THRESHOLD_MINUTES` | Minutes a service must be Down before trigger logs auto-generate. | `5` |
| `AUTO_DETECTION_INTERVAL_SECONDS` | Cron run loop check frequency in seconds. | `60` |
| `CRON_SECRET` | Secret token to authenticate request hooks targeting the cron route. | `replace-with-a-random-secret-for-cron-endpoint` |
| `UPSTASH_REDIS_URL` | Redis URL for rate-limiting (production environment only). | `redis://...` |
| `UPSTASH_REDIS_TOKEN` | Access token for rate-limiting (production environment only). | `token-string` |
| `NEXT_PUBLIC_APP_URL` | Base public URL where the application is deployed. | `http://localhost:3000` |

---

## Architecture

StatusForge is architected as a Next.js App Router project leveraging React Server Components (RSC) for optimized initial loads, and Client Hooks for real-time SSE stream events. The persistent layer utilizes PostgreSQL, managed securely with Drizzle ORM to enforce multi-tenant schema isolation and user role restrictions. Standalone cron functions automatically track service states to manage recovery behaviors without background daemon processes.

For a deep dive into the data models, system flows, and technical design patterns, refer to the [System Architecture Guide](docs/architecture.md).

---

## Roadmap

Features deliberately deferred to **v2** to protect product complexity and initial release timelines:

| Feature | Reason for Deferral |
| :--- | :--- |
| **Multi-Tenant Orgs** | Adds high complexity around slug-based routing, permission splits, and dynamic org switching. |
| **Email Password Reset** | Requires third-party SMTP server setup and token tables, which are non-core for initial setup. |
| **SMS/Email Notifications** | Requires queue handlers and customer preference matrixes, adding high operations overhead. |
| **OAuth Chat Integrations** | Webhook triggers for Slack/Discord require separate integration layers and platform permissions. |
| **Full Audit Log Table** | Simple logging of author IDs inside incident logs is sufficient for basic traceability in v1. |
| **Custom Domains** | Dynamic DNS pointer routing and SSL validation are out of scope for early deployments. |
| **Incident Templates** | Nice-to-have, but manual logs are sufficient for early stage operations. |
| **Programmatic API Keys** | Key rotation mechanisms and scoped permission routers are deferred to v2. |

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
    <td><img src="docs/screenshots/desktop_admin.png" width="100%" alt="StatusForge Admin Dashboard"/></td>
  </tr>
  <tr>
    <td align="center" colspan="2"><b>Incident updates detail timeline</b></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="docs/screenshots/desktop_incident.png" width="70%" alt="StatusForge Admin Incident Detail Timeline"/></td>
  </tr>
</table>

---

## Demo Credentials

Sign up directly from the landing page to register your own organization — no demo account is pre-provisioned in local databases.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
