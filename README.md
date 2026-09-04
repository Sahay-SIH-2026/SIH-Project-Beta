# SAHAY — Victim Support Continuity & Early-Warning Platform

> **Phase 1 — Skeleton.** This is a hackathon MVP skeleton. No database, no authentication, and no ML models are connected yet.

---

## What is SAHAY?

SAHAY is a human-centered platform that helps authorized support workers identify changing well-being needs of victims over time.

It surfaces **support-prioritisation signals** — not clinical diagnoses — and always requires a human counsellor to review and act.

SAHAY is **not** a replacement for police, courts, counsellors, or emergency services. It does not provide autonomous counselling or clinical diagnostics.

---

## Current Development Phase

**Phase 1 — Skeleton**

| # | Phase                        | Status      |
|---|------------------------------|-------------|
| 1 | Skeleton                     | ✅ Current  |
| 2 | Database                     | ⏳ Upcoming |
| 3 | Authentication + RBAC        | ⏳ Upcoming |
| 4 | API                          | ⏳ Upcoming |
| 5 | Core UI                      | ⏳ Upcoming |
| 6 | Risk Engine                  | ⏳ Upcoming |
| 7 | ML Integration               | ⏳ Upcoming |
| 8 | Voice + Notifications        | ⏳ Upcoming |

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | Next.js 15 (App Router)           |
| Language      | TypeScript                        |
| Styling       | Tailwind CSS v4                   |
| UI Components | shadcn/ui                         |
| Fonts         | Inter (Google Fonts)              |
| Linting       | ESLint (next/core-web-vitals)     |

---

## Local Setup

```bash
cd sahay
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No external services or environment variables are required to run the skeleton.

---

## Environment Variables

Copy `.env.example` to `.env.local` (Phase 2+):

```bash
cp .env.example .env.local
```

---

## Project Structure

```
sahay/
├── app/                  Next.js App Router pages + API routes
│   ├── page.tsx          Landing page
│   ├── layout.tsx        Root layout
│   ├── victim/           Victim portal
│   ├── counselor/        Counselor portal
│   ├── admin/            Admin portal
│   └── api/health/       Health-check endpoint
│
├── components/
│   ├── coming-soon/      <ComingSoon /> — placeholder for unimplemented features
│   ├── layout/           PublicHeader, PublicFooter
│   ├── navigation/       VictimNav, CounselorNav, AdminNav
│   └── shared/           PageHeader and shared UI helpers
│
├── features/             Feature module stubs (victim, counselor, admin, cases…)
├── lib/
│   ├── constants/        App-wide constants, routes, product labels
│   └── utils/            cn(), date formatting, relative time
├── types/                TypeScript domain types (User, Case, Alert, …)
└── styles/               Global CSS overrides (if needed beyond globals.css)
```

---

## Available Routes

### Public

| Route | Description         |
|-------|---------------------|
| `/`   | Landing page        |

### Victim Portal

| Route               | Description              |
|---------------------|--------------------------|
| `/victim`           | Home — welcome & CTAs    |
| `/victim/case`      | Case details             |
| `/victim/check-in`  | Well-being check-in      |
| `/victim/data`      | My Data & consent        |
| `/victim/support`   | Support contact info     |

### Counselor Portal

| Route                      | Description              |
|----------------------------|--------------------------|
| `/counselor`               | Dashboard                |
| `/counselor/cases`         | Case list                |
| `/counselor/alerts`        | Support alerts           |
| `/counselor/follow-ups`    | Follow-up tasks          |
| `/counselor/reports`       | Reports                  |
| `/counselor/audit-log`     | Counselor audit log      |

### Admin Portal

| Route                    | Description              |
|--------------------------|--------------------------|
| `/admin`                 | Dashboard                |
| `/admin/users`           | User management          |
| `/admin/assignments`     | Case assignments         |
| `/admin/audit-log`       | System audit log         |

### API

| Route          | Description     |
|----------------|-----------------|
| `/api/health`  | Health check    |

---

## Design Principles

- **No government seals or official emblems.** SAHAY is not an official GoI product.
- **No fake emergency numbers.** Emergency sections are clearly marked as placeholders.
- **No clinical language.** Support signals use "Support review recommended", never "AI diagnosed" or clinical diagnosis language.
- **Human review is mandatory.** All ML/risk signals will require counsellor approval in future phases.

---

## Contributing

This is a hackathon project. Follow the phase order above when adding new functionality.

Each new feature should be added behind its module boundary:

```
features/<module>/
```

Use `<ComingSoon />` for anything not yet implemented. Do not create fake functional buttons.
# SIH-Project-Beta
