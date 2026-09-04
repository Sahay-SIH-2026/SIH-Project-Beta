# SAHAY — Victim Support Continuity & Early-Warning Platform

> **Phase 1 — Project Skeleton**
> This prototype uses synthetic/demo data only. No real victim or survivor data is processed.

---

## What is SAHAY?

SAHAY is a hackathon MVP focused on improving the continuity of victim and survivor support. It helps **authorized support workers** identify changing support needs over time, so that appropriate follow-up actions can be taken in a timely and human-centred manner.

### Important — what SAHAY is not

- SAHAY does **not** replace police, courts, NGOs, legal aid, welfare officers, or counselors.
- SAHAY does **not** provide medical or clinical diagnosis of any kind.
- AI features are intended only as a **support-prioritisation signal** to assist human decision-making.
- **Human review is mandatory** for all AI-assisted workflows.
- The current prototype uses **synthetic/demo data only**.

---

## Current Phase

```
Phase 1 — Project Skeleton
```

The skeleton establishes the application structure, routing, component system, TypeScript types, and design tokens. No database, authentication, or ML is connected yet.

---

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | Next.js (App Router)        |
| Language    | TypeScript                  |
| UI Library  | React                       |
| Styling     | Tailwind CSS v4             |
| Components  | shadcn/ui                   |

**Future phases will add** (not yet implemented):

- PostgreSQL + Prisma (database)
- Authentication & RBAC
- REST/tRPC API layer
- Risk engine
- Python ML service
- Voice input
- SMS / email notifications

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template (no secrets required for Phase 1)
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No external services or paid accounts are required to run the Phase 1 skeleton.

---

## Project Structure

```
sahay/
├── app/                  Next.js App Router — pages, layouts, API routes
│   ├── victim/           Victim portal routes
│   ├── counselor/        Counselor portal routes
│   ├── admin/            Admin portal routes
│   └── api/health/       Health-check endpoint
│
├── components/
│   ├── coming-soon/      <ComingSoon /> — placeholder for unimplemented features
│   ├── layout/           Shared header and footer
│   ├── navigation/       Role-specific navigation components
│   ├── shared/           General-purpose UI helpers
│   └── ui/               shadcn/ui primitives
│
├── features/             Feature module boundaries (victim, counselor, admin, …)
├── lib/
│   ├── config/           Environment-aware configuration
│   ├── constants/        App-wide constants, routes, product constraint labels
│   └── utils/            Utility functions (cn, date formatting, …)
│
└── types/                TypeScript domain interfaces (User, Case, Alert, …)
```

---

## Available Routes

| Route                      | Description              |
|----------------------------|--------------------------|
| `/`                        | Landing page             |
| `/victim`                  | Victim portal home       |
| `/victim/case`             | Case details             |
| `/victim/check-in`         | Well-being check-in      |
| `/victim/data`             | My Data & consent        |
| `/victim/support`          | Support contact          |
| `/counselor`               | Counselor dashboard      |
| `/counselor/cases`         | Case list                |
| `/counselor/alerts`        | Support alerts           |
| `/counselor/follow-ups`    | Follow-up tasks          |
| `/counselor/reports`       | Reports                  |
| `/counselor/audit-log`     | Counselor audit log      |
| `/admin`                   | Admin dashboard          |
| `/admin/users`             | User management          |
| `/admin/assignments`       | Case assignments         |
| `/admin/audit-log`         | System audit log         |
| `/api/health`              | Health-check (`{ status: "ok" }`) |

---

## Development Roadmap

| # | Phase                     | Status      |
|---|---------------------------|-------------|
| 1 | Skeleton                  | ✅ Current  |
| 2 | Database                  | ⏳ Planned  |
| 3 | Authentication + RBAC     | ⏳ Planned  |
| 4 | API                       | ⏳ Planned  |
| 5 | Core UI                   | ⏳ Planned  |
| 6 | Risk Engine               | ⏳ Planned  |
| 7 | ML Integration            | ⏳ Planned  |
| 8 | Voice + Notifications     | ⏳ Planned  |

---

## Zero-Budget Principle

SAHAY prioritizes open-source, local, and free-tier tooling. No paid service is mandatory to run the MVP. Future integrations are designed behind provider interfaces so that a free/local implementation can always substitute a commercial one.

---

## License

[MIT](./LICENSE) — Copyright © 2026 SAHAY Contributors
