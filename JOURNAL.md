# LUMA — Development Journal

> **What is this file?**
> This is the **LUMA Development Journal** — a running log maintained by developers and AI agents working on this project.
> Every significant change, fix, decision, or implementation detail is recorded here in reverse-chronological order (newest first).
> This file is **not a changelog** (that lives in `CHANGELOG.md` when created); it is a narrative record explaining *what* was changed, *why* it was changed, and *how* it was implemented. When debugging or onboarding, start here.

---

## Format

Each entry follows this template:

```
### YYYY-MM-DD — <Short title>
**Type:** Bug Fix | Feature | Refactor | Infra | Documentation
**Files changed:** comma-separated list of key files
**Status:** ✅ Done | 🚧 In Progress | ⚠️ Needs Verification
```

---

## Entries

---

### 2026-09-12 — Fix check-in insertion schema mutation error
**Type:** Bug Fix
**Files changed:** `app/actions/check-ins.ts`
**Status:** ✅ Done

Fixed `Failed to submit check-in` error on the victim portal. Attempted to insert computed distress features directly into the `check_ins` table, which lacks these columns dynamically. Dropped the extra columns from the `check_ins` insert and reliably redirected them into the foundational `risk_scores` table as specified by the domain logic.

---

### 2026-09-12 — Fix case-details column layout
**Type:** Bug Fix | UX
**Files changed:** `app/counselor/cases/[id]/page.tsx`
**Status:** ✅ Done

Replaced implicit three-column sizing with explicit equal two-column tracks. Added `min-w-0` and top alignment to keep check-ins and interactions visible beside right-side case panels.

---

### 2026-09-12 — Place KPI cards beside trend card
**Type:** UX
**Files changed:** `app/counselor/page.tsx`, `components/counselor/CaseloadTrendChart.tsx`
**Status:** ✅ Done

Placed four existing KPI cards in a 2×2 grid beside Caseload Support Signal Trend on large screens. Layout stacks on smaller screens. No data or behavior changed.

---

### 2026-09-12 — Make caseload trend card square-like
**Type:** UX
**Files changed:** `components/counselor/CaseloadTrendChart.tsx`
**Status:** ✅ Done

Constrained Caseload Support Signal Trend card to centered `max-w-3xl` width with 4:3 aspect ratio. Chart expands within card.

---

### 2026-09-12 — Center counselor page content
**Type:** UX
**Files changed:** `app/counselor/layout.tsx`
**Status:** ✅ Done

Added centered `max-w-6xl` content container inside counselor layout. Counselor pages now use same wide side margins as victim Dashboard while preserving page structure and data flow.

---

### 2026-09-12 — Fix duplicate victim sidebar selection
**Type:** Bug Fix | UX
**Files changed:** `components/app-sidebar.tsx`
**Status:** ✅ Done

Fixed Dashboard-08 active navigation logic to use current portal root. Victim Home no longer stays selected on Check-in, My Case, My Data, or Support routes.

---

### 2026-09-12 — Remove duplicate victim portal header
**Type:** UX
**Files changed:** `app/victim/layout.tsx`
**Status:** ✅ Done

Removed the top public header from the victim Dashboard shell. Dashboard-08 sidebar branding and inner Victim Portal header remain available. No routes, authentication, data flow, or backend logic changed.

---

### 2026-09-12 — Move victim navigation into Dashboard-08 sidebar
**Type:** UX
**Files changed:** `components/app-sidebar.tsx`, `app/victim/layout.tsx`
**Status:** ✅ Done

Reused the Dashboard-08 sidebar shell for the victim portal. Home, Check-in, My Case, My Data, and Support now use sidebar navigation on desktop and responsive off-canvas navigation on mobile. Existing routes, authentication, page data, and actions remain unchanged.

---

### 2026-09-12 — Add victim Check-in tab and focus CTA
**Type:** UX
**Files changed:** `components/navigation/VictimNav.tsx`, `app/victim/page.tsx`
**Status:** 🚧 Needs Verification

Added a direct Check-in tab to the victim portal navigation and restyled the existing Need to talk action as a centered, primary Dashboard focal point. The existing check-in route and all data flow remain unchanged.

---

### 2026-09-12 — Add live voice waveform to check-in
**Type:** Feature | UX
**Files changed:** `components/ui/live-waveform.tsx`, `components/victim/CheckInForm.tsx`
**Status:** ✅ Done

Added an ElevenLabs-compatible `LiveWaveform` component beside the existing voice transcription status. It runs in processing mode so Vapi remains the only microphone/audio owner; existing transcription, submission, authentication, and backend behavior are unchanged. The ElevenLabs registry installer was attempted but returned HTTP 429, so the component is locally implemented with the same public props needed by this screen.

---

### 2026-09-12 — Add minimal dashboard page margins
**Type:** UX
**Files changed:** `app/counselor/layout.tsx`, `app/admin/layout.tsx`, `app/victim/layout.tsx`
**Status:** ✅ Done

Added small responsive outer margins to all portal content layouts. Existing internal padding, structure, functionality, and routes remain unchanged.

---

### 2026-09-12 — Replace trend SVG with shadcn chart
**Type:** Feature | UX
**Files changed:** `components/counselor/CaseloadTrendChart.tsx`, `components/ui/chart.tsx`, `package.json`, `package-lock.json`
**Status:** ✅ Done

Replaced the custom SVG trend rendering with the installed shadcn `ChartContainer` and Recharts bar chart. The existing `dailySignals` data contract, score thresholds, status colors, disclaimer, and counselor dashboard placement are preserved.

---

### 2026-09-12 — Apply civic digital-health dashboard palette
**Type:** UX
**Files changed:** `app/globals.css`, `app/counselor/page.tsx`, `components/counselor/CaseloadTrendChart.tsx`
**Status:** ✅ Done

Updated the existing dashboard and sidebar color tokens to the supplied deep-indigo, institutional-teal, warm-amber, cool-neutral, and status palette. Existing component structure, spacing, typography, icons, logo markup, routes, data flow, and behavior remain unchanged.

---

### 2026-09-12 — Apply reference dashboard color scheme
**Type:** UX
**Files changed:** `app/globals.css`, `app/counselor/page.tsx`, `components/counselor/CaseloadTrendChart.tsx`
**Status:** ✅ Done

Applied the reference palette of white surfaces, cool gray backgrounds and borders, and ink/navy accents to the counselor dashboard and sidebar tokens. Updated only existing color classes and chart fills; component structure, layout, logo markup, routes, data flow, and functionality remain unchanged.

---

### 2026-09-12 — Restore utility exports after shadcn preset
**Type:** Bug Fix | UX
**Files changed:** `lib/utils.ts`, `app/counselor/cases/page.tsx`
**Status:** ✅ Done

Restored the utility barrel export so existing date formatting consumers resolve `formatDateOnly` and the related helpers again. Updated counselor case status filters to use the installed shadcn `Button` component while preserving their existing links, filters, and server-side data flow. No backend logic was changed.

---

### 2026-09-12 — Integrate sidebar-08 into counselor dashboard
**Type:** Feature | UX
**Files changed:** `components/app-sidebar.tsx`, `app/counselor/layout.tsx`
**Status:** ✅ Done

Replaced the generated sidebar-08 demo content with the existing counselor portal routes and navigation state. Wrapped the counselor layout in `SidebarProvider` and `SidebarInset`, added the responsive sidebar trigger, and preserved the existing sign-out action and profile display. No backend logic, queries, API routes, authentication logic, database schema, or business logic was changed.

---

### 2026-09-11 — Enforce counsellor assignment boundaries
**Type:** Security | Bug Fix
**Files changed:** `app/counselor/page.tsx`, `app/counselor/cases/page.tsx`, `app/counselor/cases/[id]/page.tsx`, `lib/auth/case-access.ts`, `app/actions/cases.ts`, `app/actions/interactions.ts`, `app/actions/follow-ups.ts`, `app/actions/risk.ts`, `supabase/schema.sql`, `supabase/migrations/20260908000000_initial_schema.sql`, `supabase/migrations/20260911000000_enforce_counselor_case_scope.sql`
**Status:** ⚠️ Needs Supabase migration application

- Removed the dashboard query that deliberately included unassigned cases (`counselor_id IS NULL`). Both caseload views now request only the signed-in counselor’s assigned records.
- Added a server-side `requireCaseAccess` guard before rendering a case workspace or accepting case status, notes, interaction, follow-up, or risk-review actions. This blocks direct-URL and forged server-action attempts even before database policy enforcement.
- Added a defence-in-depth RLS migration. It limits counselors to their own assigned cases and dependent check-ins, interactions, alerts, risk scores, follow-ups, and victim profiles. It also requires cases created by a counselor to have that counselor as assignee; admins retain assignment and oversight permissions.
- The migration must be run in the Supabase SQL Editor before this security fix is complete in the deployed database.

### 2026-09-11 — Fix active state for root navigation tabs
**Type:** Bug Fix
**Files changed:** `components/navigation/VictimNav.tsx`, `components/navigation/CounselorNav.tsx`, `components/navigation/AdminNav.tsx`
**Status:** ✅ Done

The active state calculation (`pathname.startsWith(href + "/")`) for navigation items incorrectly highlighted the "Home" / "Dashboard" root tabs when visiting any subpage because all subpages start with the root path (`/victim/`, `/counselor/`, `/admin/`). Updated the logic so the root tab only uses exact matching (`pathname === href`), while preserving `startsWith` for nested routing on other tabs.

### 2026-09-11 — Emergency Warning Toast & Credentials Update
**Type:** Feature | Bug Fix
**Files changed:** `app/actions/auth.ts`, `components/auth/VictimLoginToast.tsx`, `components/auth/LoginForm.tsx`, `app/victim/layout.tsx`, `app/victim/support/page.tsx`
**Status:** ✅ Done

- Updated demo credentials on the login page from `luma.org` to `sahay.org`.
- Moved the "Immediate Danger" warning from a static banner on `/victim/support` to a one-time toast notification (`sonner`) that is displayed only after a successful victim login.
- Modified the Server Actions (`signInAction`, `signUpAction`) to append `?login=success` to the redirect URL only for victims.
- Added `VictimLoginToast` client component to detect the query parameter, show the toast, and remove it immediately so it doesn't run on page reloads.

### 2026-09-11 — Hide Sign In button on authenticated portals
**Type:** Bug Fix
**Files changed:** `components/layout/PublicHeader.tsx`
**Status:** ✅ Done

`PublicHeader` unconditionally rendered the "Sign In" link, so authenticated victims always saw it. Since the component is a server component, added a server-side `supabase.auth.getUser()` check and conditionally render the button only when unauthenticated. No client JS, no flash, no new dependencies.

- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 warnings

---

### 2026-09-11 — Redesign victim dashboard as a support hub
**Type:** Feature | UX
**Files changed:** `app/victim/page.tsx`, `app/victim/loading.tsx`
**Status:** ✅ Done — victim dashboard redesigned from static case-management view to warm, supportive, mobile-first hub.

#### What changed

Rewrote the `/victim` dashboard around a support-first experience instead of a case-management display. The new flow:

1. **Welcome** — Personalized greeting ("Welcome back, Aarohi") with reassurance ("Your support is here whenever you need it.").
2. **Primary Check-in CTA** — Visually dominant card asking "How are you doing today?" with warm gradient accent bar. Shows a different state ("Thanks for checking in") if the victim checked in within the last 12 hours.
3. **Your Support** — Reframed from "Case Status" to a support-continuity framing with green "Support active" badge. Case ref and counselor shown as secondary metadata.
4. **What Happens Next** — Displays the next pending follow-up (date + title) or a calm empty state ("Nothing scheduled right now").
5. **Recent Update** — Shows when the case was last updated, hidden if no meaningful update exists.
6. **Need Support?** — Always-visible secondary CTA linking to `/victim/support`.
7. **Privacy & Consent** — Small footer reassurance with link to `/victim/data`.

Desktop uses two-column layout for the Support Status and What Happens Next sections. Mobile stacks everything vertically.

#### UX rationale

The victim should feel "someone is here to support me" — not "I am being monitored by an AI system." All internal AI/risk/alert data is hidden from the victim. No risk scores, no clinical terminology, no surveillance language. Plain, short sentences with clear actions. Calm color palette (emerald/teal for status, primary blue for actions). Large touch targets for mobile.

#### Data fetching

Added a follow-ups query to the existing `Promise.all` in the server component. All queries remain server-side via `createServerClient()` with RLS. No new client components, APIs, or schema changes.

#### Loading skeleton

Rewrote `loading.tsx` with skeleton placeholders matching the new section layout (greeting, check-in card, two-column secondary, support card, privacy footer). Pure CSS `animate-pulse` — no client JavaScript.

#### Validation

- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 warnings
- `npm run build` — exit code 0
- Browser: Login as victim, verified all 7 sections render correctly, all navigation links work (`/victim/check-in`, `/victim/case`, `/victim/support`, `/victim/data`), no full-page reloads during navigation

---

### 2026-09-11 — Disable Next.js development indicator
**Type:** Performance | Configuration
**Files changed:** `next.config.ts`, `JOURNAL.md`
**Status:** ✅ Done — the official Next.js development tools indicator is disabled without changing application loading states.

#### What changed

- Added `devIndicators: false` to `next.config.ts`, the supported Next.js 16.3.4 configuration for removing the bottom-left `N` / `Rendering` development indicator.
- Re-verified portal navigation after restarting the development server and against a production server.
- Confirmed authenticated pages remain dynamic and continue using the existing Supabase session, role, and RLS boundaries.

#### Findings and validation

- The remaining visible `Rendering` state was Next.js DevTools, not an LUMA component or CSS loading state.
- No normal-navigation `router.refresh`, `router.push`, `router.replace`, `window.location`, or raw internal anchor usage was found.
- Victim, counselor, and admin layouts remained mounted during sibling navigation; each measured transition issued one RSC request and no duplicate browser API requests.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` passed.
- Development and production browser checks showed no Next.js indicator and no full browser reload.

#### Remaining limitation

- Personalized portal routes remain dynamic because middleware and page helpers must perform cookie-bound authentication and Supabase reads. This is intentionally preserved to avoid stale authorization or cross-user data exposure.

---

### 2026-09-11 — Optimize portal navigation rendering
**Type:** Performance | Refactor
**Files changed:** `app/counselor/page.tsx`, `app/victim/page.tsx`, `app/victim/loading.tsx`, `app/counselor/loading.tsx`, `app/admin/loading.tsx`
**Status:** ✅ Done — independent server reads are parallelized and portal shells remain visible during child-route loading.

#### What changed

- Parallelized the counselor dashboard's independent cases, alerts, check-ins, follow-up, and risk-score queries with `Promise.all`.
- Parallelized the victim dashboard's independent case and latest-check-in queries.
- Added route-level loading boundaries for all three authenticated portals so their existing layouts and navigation remain mounted while page content loads.
- Preserved all existing query filters, authorization boundaries, routes, APIs, and rendered functionality.

#### Browser verification

- The visible `Rendering` label is produced by the Next.js DevTools button during development RSC navigation; it is not rendered by LUMA.
- Victim, counselor, and admin sibling-route probes each made one RSC navigation request per click, preserved one portal shell DOM node, and showed no duplicate browser API requests.
- The first navigation in each warm-up sequence was slower because Turbopack compiled the route; subsequent transitions completed in approximately 0.8–1.3 seconds in the local development server.

#### Validation

- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm run build` passed; authenticated Supabase pages remain dynamic as required.
- `npm run test:channels` passed.
- `npm run test:api` passed.

#### Remaining bottlenecks

- Authenticated pages still perform fresh cookie-bound Supabase reads on navigation by design; globally caching them would risk stale or cross-user data.
- Server-side cookie/session verification remains dynamic by design; removing it or globally caching personalized data would risk stale authorization or cross-user data exposure.
- Next.js reports the existing middleware-to-proxy convention deprecation warning.

---

### 2026-09-11 — Rebrand application to LUMA
**Type:** Refactor | Documentation
**Files changed:** Application metadata, UI copy, CSS utility naming, API health metadata, package metadata, demo domains, Supabase seed/repair files, documentation, and project guidance.
**Status:** ✅ Done — standalone product branding renamed to LUMA; Hindi support-response text intentionally preserved.

#### What changed

- Replaced the product name, titles, descriptions, comments, and documentation references with `LUMA`.
- Renamed the former brand container utility to `luma-container`.
- Updated demo email domains to `luma.org`.
- Renamed the comprehensive documentation file to `LUMA_COMPREHENSIVE_DOCUMENTATION.md`.
- Updated package, health-check, SQL, seed, diagnostic script, and license metadata.
- Removed stale `.next` build output so generated artifacts no longer contain the former brand.

---

### 2026-09-10 — Section 15: Full REST Application API Suite & AI Service Interface

**Type:** Feature | Infra  
**Files changed:**
- `app/api/users/route.ts` *(new)*
- `app/api/cases/route.ts` *(new)*
- `app/api/cases/[id]/route.ts` *(new)*
- `app/api/assignments/route.ts` *(new)*
- `app/api/check-ins/route.ts` *(new)*
- `app/api/interactions/route.ts` *(new)*
- `app/api/consents/route.ts` *(new)*
- `app/api/risk/route.ts` *(new)*
- `app/api/alerts/route.ts` *(new)*
- `app/api/follow-ups/route.ts` *(new)*
- `app/api/interventions/route.ts` *(new)*
- `app/api/analytics/route.ts` *(new)*
- `app/api/audit-log/route.ts` *(new)*
- `app/api/ai/route.ts` *(new)*
- `lib/db/alerts.ts` *(updated)*
- `lib/db/cases.ts` *(updated)*
- `lib/db/audit.ts` *(updated)*
- `lib/db/consents.ts` *(updated)*
- `lib/db/follow-ups.ts` *(updated)*
- `lib/risk/intervention-engine.ts` *(updated)*
- `lib/risk/trend-calculator.ts` *(updated)*
- `scripts/test-api.mjs` *(new)*
- `package.json` *(updated)*
- `AGENTS.md` *(updated)*

**Status:** ✅ Done — 0 TypeScript errors, 0 ESLint warnings, all 13 REST API modules passing diagnostic contracts.

#### What was built

Implemented the comprehensive Next.js REST API layer specified in AGENTS.md Section 15:

1. **User APIs (`/api/users`)**:
   - GET profiles filtered by role (`COUNSELOR`, `SUPERVISOR`, `ADMIN`, `VICTIM`).
   - PATCH profile updates (display name, phone, district).

2. **Case APIs (`/api/cases`, `/api/cases/[id]`)**:
   - GET cases list with counselor/victim metadata; POST new case registrations.
   - Comprehensive case dossier route returning case record, check-in history, interaction logs, and longitudinal risk score history; PATCH for case status transitions and counselor assignment.

3. **Assignment APIs (`/api/assignments`)**:
   - GET real-time active case distribution across all registered counselors.
   - POST assignment payload linking case to counselor.

4. **Check-in APIs (`/api/check-ins`)**:
   - GET check-ins by case; POST check-in ingestion bridging directly into the deterministic Risk Engine for immediate distress scoring, alert triggering, and database persistence.

5. **Interaction APIs (`/api/interactions`)**:
   - Multi-channel contact ledger supporting WHATSAPP, IVR, SMS, IN_PERSON, and MANUAL channels with inbound/outbound direction tracking.

6. **Consent APIs (`/api/consents`)**:
   - DPDP-compliant consent ledger tracking purpose, GIVEN / WITHDRAWN statuses, and timestamps.

7. **Signal & Risk APIs (`/api/risk`)**:
   - GET longitudinal risk history and trajectory assessment; POST signal evaluation across Hindi, English, and Hinglish keyword clusters.

8. **Alert APIs (`/api/alerts`)**:
   - GET alerts filtered by case, severity (`HIGH`, `MEDIUM`, `LOW`), or status; PATCH for human-in-the-loop counselor review and resolution.

9. **Follow-up APIs (`/api/follow-ups`)**:
   - GET, POST, and PATCH follow-up tasks with automated completion timestamping.

10. **Intervention APIs (`/api/interventions`)**:
    - GET suggested interventions generated by the decision-support engine; POST action conversion to schedule follow-up tasks.

11. **Dashboard & Analytics APIs (`/api/analytics`)**:
    - Privacy-preserving aggregate district metrics, caseload status distribution, and risk distribution with a strict Zero-PII guarantee.

12. **Audit Log APIs (`/api/audit-log`)**:
    - Query and append compliance audit logs with actor identity, action type, resource targeting, and metadata.

13. **AI/ML Service Interface (`/api/ai`)**:
    - Stable service boundary exposing `TEXT_ANALYSIS` (zero-network local NLP fallback) and `CASE_INSIGHTS` (Gemini 2.5 Flash / local heuristics) with mandatory non-clinical decision-support disclaimers.

14. **Diagnostic Test Automation (`scripts/test-api.mjs`, `npm run test:api`)**:
    - Added automated unit and contract test script validating all 13 modules.

---

### 2026-09-10 — Phase 8: Hardening, Official Aggregated Dashboards & Hackathon Demo Studio (Scenarios A, B, C, D)

**Type:** Feature | Infra  
**Files changed:**
- `lib/scenarios/demo-scenarios.ts` *(new)*
- `app/actions/demo.ts` *(new)*
- `components/counselor/DemoStudio.tsx` *(new)*
- `app/counselor/demo/page.tsx` *(new)*
- `components/counselor/OfficialAnalyticsView.tsx` *(new)*
- `app/counselor/reports/page.tsx` *(updated)*
- `app/admin/page.tsx` *(updated)*
- `components/navigation/CounselorNav.tsx` *(updated)*
- `lib/constants/index.ts` *(updated)*
- `scripts/test-scenarios.mjs` *(new)*
- `package.json` *(updated)*
- `AGENTS.md` *(updated)*

**Status:** ✅ Done — 0 TypeScript errors, 0 ESLint warnings, all 8 phases implemented and verified.

#### What was built

Implemented the final Phase 8 Hardening, Authority Analytics, and Hackathon Evaluation Suite:

1. **Hackathon 1-Click Demo Studio (`components/counselor/DemoStudio.tsx`, `app/counselor/demo/page.tsx`, `lib/scenarios/demo-scenarios.ts`)**:
   - Built an interactive presentation hub enabling presenters and hackathon judges to execute all 4 canonical SIH-26094 scenarios with a single click:
     - **Scenario A (Stable Baseline)**: Calm wellness check-in, taking medications, routine family stability (Score ~15/100, STABLE trend, 0 alerts).
     - **Scenario B (Gradual Distress Escalation)**: Worsening insomnia and anticipatory legal anxiety before court hearings (Score ~55/100, ELEVATED band, triggers advisory alert).
     - **Scenario C (Acute Crisis & Death Threat)**: Direct witness intimidation and death threats outside home (Score ~88/100, CRITICAL emergency alert, prompts Witness Protection & auto-schedules urgent 4-hour counselor callback task).
     - **Scenario D (Post-Intervention Recovery & De-escalation)**: Counselor contacts victim, police patrol arranged, transfer to safe shelter; subsequent check-in demonstrates marked relief, score falls to STABLE (<25), active alerts are resolved and marked REVIEWED.
   - Provides 1-click **Reset Baseline** to clean demo states between presentation pitches.

2. **Official / District & State Analytics Dashboard (`components/counselor/OfficialAnalyticsView.tsx`, `app/counselor/reports/page.tsx`)**:
   - Replaced placeholder `/counselor/reports` with a comprehensive, privacy-first Authority Analytics Hub.
   - Regional Hotspot breakdown across districts (Central Delhi, South Delhi, New Delhi, East Delhi).
   - Caseload severity distribution bar (Stable, Concern, Elevated, Critical).
   - Multi-channel ingestion volume metrics and executive response turnaround indicators.
   - **DPDP Act & Victim Protection Guardrail**: Strict zero-PII guarantee; victim names, phone numbers, and raw text are never exposed. Only anonymized case references (`V-1042`) and statistical cohorts are displayed.
   - Built-in **Export / Print PDF Summary** functionality for official reporting.

3. **Admin Dashboard Live Data Wiring (`app/admin/page.tsx`)**:
   - Removed prototype disclaimer and wired live Supabase aggregations for registered users, active caseloads, unreviewed alerts, and encrypted audit log records.

4. **Navigation & Platform Completion**:
   - Added `Demo Studio` with `Sparkles` icon to `CounselorNav`.
   - Updated `ROUTES.counselor.demo` in `lib/constants/index.ts`.
   - Marked Phase 8 as completed across `PHASES` constant and `AGENTS.md`.

---

### 2026-09-10 — Phase 7: Voice & Channels (Web Speech-to-Text, Inbound SMS Ingestion, IVRS Telephony Adapter, National Helpline 14566 Referral Gateway, Interactive Channel Simulator)

**Type:** Feature  
**Files changed:**
- `lib/channels/types.ts` *(new)*
- `lib/channels/stt.ts` *(new)*
- `lib/channels/sms-adapter.ts` *(new)*
- `lib/channels/ivrs-adapter.ts` *(new)*
- `lib/channels/helpline-adapter.ts` *(new)*
- `lib/channels/index.ts` *(new)*
- `app/api/channels/sms/route.ts` *(new)*
- `app/api/channels/ivrs/route.ts` *(new)*
- `app/api/channels/helpline/route.ts` *(new)*
- `app/actions/channels.ts` *(new)*
- `components/counselor/ChannelSimulator.tsx` *(new)*
- `app/counselor/channels/page.tsx` *(new)*
- `components/victim/CheckInForm.tsx` *(updated)*
- `app/actions/check-ins.ts` *(updated)*
- `components/navigation/CounselorNav.tsx` *(updated)*
- `app/counselor/cases/[id]/page.tsx` *(updated)*
- `lib/constants/index.ts` *(updated)*
- `scripts/test-channels.mjs` *(new)*
- `package.json` *(updated)*
- `AGENTS.md` *(updated)*

**Status:** ✅ Done — 0 TypeScript errors, 0 ESLint warnings, all unit and diagnostic tests passing cleanly.

#### What was built

Implemented the complete Phase 7 Voice & Multi-Channel Ingestion infrastructure:

1. **Web Speech-to-Text (STT) Check-In (`components/victim/CheckInForm.tsx`, `lib/channels/stt.ts`)**:
   - Integrated browser Web Speech API for real-time speech-to-text recording, supporting both Hindi (`hi-IN`) and Indian English (`en-IN`).
   - Added pulsing recording status indicator, timer, and simulated voice audio presets for testing low-literacy complainants without active microphones.
   - Saves `voice_input_used: true` into the `check_ins` table and logs channel provenance.
   - Extracts experimental non-clinical cadence indicators (`SLOW_HESITANT`, `NORMAL`, `RAPID_AGITATED`) strictly separated from clinical diagnosis.

2. **Inbound Two-Way SMS Ingestion Adapter (`lib/channels/sms-adapter.ts`, `app/api/channels/sms/route.ts`)**:
   - Ingests incoming SMS text from victims on feature phones with or without data connections.
   - Decodes emergency quick-codes: `1/SAFE/THEEK` (stable), `2/HELP/MADAD` (support needed), and `911/URGENT/KHATRA` (critical distress).
   - Resolves target cases, records check-ins and interactions, and runs the Risk Engine to compute updated distress signals and alert counselors.

3. **Automated IVRS Telephony Adapter (`lib/channels/ivrs-adapter.ts`, `app/api/channels/ivrs/route.ts`)**:
   - Handles automated wellness telephone calls, synthesizing DTMF touchtone ratings (1–5 scale) and recorded voicemail speech transcripts.
   - Maps calls to `interactions` with `channel: 'VOICE_CALL'` and evaluates longitudinal distress.

4. **National Helpline 14566 Referral Gateway (`lib/channels/helpline-adapter.ts`, `app/api/channels/helpline/route.ts`)**:
   - Standardized ingestion for referrals from NHAA / Tele-MANAS / 14566 operators.
   - Auto-schedules urgent 4h/24h counselor follow-up tasks in `follow_ups` for critical distress or requested callbacks.

5. **Multi-Channel Gateway & Ingestion Hub (`app/counselor/channels/page.tsx`, `components/counselor/ChannelSimulator.tsx`)**:
   - Counselor workspace hub displaying inbound volume across Web, Voice, SMS, IVRS, and 14566 Helpline.
   - Interactive testing suite allowing evaluators to fire simulated SMS, IVRS, and Helpline payloads and observe real-time risk scores and alert generation.

6. **Rich Visual Provenance Badges (`app/counselor/cases/[id]/page.tsx`, `components/navigation/CounselorNav.tsx`)**:
   - Timeline items display distinctive channel badges (`🎙️ Voice / STT`, `💬 SMS Ingestion`, `📞 IVRS Telephony`, `🏛️ Helpline 14566`, `🌐 Web Portal`).
   - Added "Channels" navigation link to `CounselorNav`.

---

### 2026-09-08 — Phase 6: GenAI / ML Integration (Multilingual NLP, Emotion Classification, 72h Escalation Forecast, Fact/Inference Separation, Gemini 2.5 Flash & Local ML Fallback)

**Type:** Feature  
**Files changed:**
- `lib/ai/types.ts` *(new)*
- `lib/ai/multilingual-dictionary.ts` *(new)*
- `lib/ai/local-nlp-fallback.ts` *(new)*
- `lib/ai/gemini-provider.ts` *(new)*
- `lib/ai/service.ts` *(new)*
- `lib/ai/index.ts` *(new)*
- `features/ai/index.ts` *(new)*
- `app/actions/ai.ts` *(new)*
- `components/counselor/AIInsightsCard.tsx` *(new)*
- `components/victim/CheckInForm.tsx` *(updated)*
- `app/counselor/cases/[id]/page.tsx` *(updated)*
- `lib/risk/rule-engine.ts` *(updated)*
- `lib/constants/index.ts` *(updated)*
- `AGENTS.md` *(updated)*

**Status:** ✅ Done — All 21 Next.js routes dynamic, 0 TypeScript errors, 0 ESLint warnings, production build clean.

#### What was built

Implemented the complete Phase 6 GenAI and ML decision-support layer:

1. **Multilingual NLP & Cross-Lingual Lexicon (`lib/ai/multilingual-dictionary.ts`)**:
   - Comprehensive cross-lingual lexicon mapping safety threats, severe distress, housing instability, legal pressure, and positive coping across English, Devanagari Hindi (हिन्दी), and Hinglish (Latin-script colloquial Hindi).
   - Dynamic language detection identifies script or token patterns, returning language mode and confidence scores.
   - Connected directly into `lib/risk/rule-engine.ts`, enabling seamless distress evaluation for victims writing in Hindi or Hinglish.

2. **Dual-Mode AI Architecture (`lib/ai/gemini-provider.ts`, `local-nlp-fallback.ts`, `service.ts`)**:
   - **Google Gemini 2.5 Flash**: Connects via structured JSON mode with low temperature (0.2) when `GEMINI_API_KEY` is present.
   - **Deterministic Heuristic ML Fallback**: Fast, zero-network, local NLP engine providing sentiment polarity, emotion categorization, and 72-hour escalation projection when running offline or without an external API key.
   - Unified public facade (`lib/ai/service.ts`) abstracts the provider selection behind a stable boundary.

3. **Clinical Fact vs. Machine Inference Demarcation**:
   - Explicitly partitions findings into verifiable **Observed Facts** (direct quotes, logged timestamps, reported occurrences) versus algorithmic **Support Inferences** (emotional hypotheses, vulnerability vectors).
   - Strictly enforces non-clinical framing: DSM/ICD diagnostic labels are prohibited.

4. **72-Hour Escalation Forecasting & Counselor Briefings**:
   - Multi-signal forecast predicts near-term escalation level (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), trajectory (`STABLE`, `ACCELERATING`, `DE-ESCALATING`), leading risk indicators, and rationale.
   - Synthesizes longitudinal submissions into a concise, actionable counselor case briefing with 2–3 suggested empathetic talking points.

5. **Counselor Workspace Integration (`components/counselor/AIInsightsCard.tsx`)**:
   - Embedded directly into `/counselor/cases/[id]`.
   - Displays real-time case briefing, language pill with translated gist, emotion badges with confidence levels, 72h escalation meter, facts vs inferences comparison table, suggested talking points, and non-clinical disclaimer.
   - Interactive "Refresh Analysis" button connected to `generateCaseInsightsAction` server action with audit logging.

6. **Victim Multilingual Guidance (`components/victim/CheckInForm.tsx`)**:
   - Added multilingual input guidance banner reassuring victims that they may write in English, हिन्दी, or Hinglish.

---

### 2026-09-08 — Phase 5: Risk Engine v1 (Rule Engine, Trend Calculator, Intervention Engine, Alerts, Explainability & Visualizations)

**Type:** Feature  
**Files changed:**
- `lib/risk/types.ts` *(new)*
- `lib/risk/rule-engine.ts` *(new)*
- `lib/risk/trend-calculator.ts` *(new)*
- `lib/risk/intervention-engine.ts` *(new)*
- `lib/risk/alert-generator.ts` *(new)*
- `lib/risk/index.ts` *(new)*
- `features/risk/index.ts` *(new)*
- `app/actions/risk.ts` *(new)*
- `app/actions/check-ins.ts` *(updated)*
- `components/counselor/TrendChart.tsx` *(new)*
- `components/counselor/ExplainabilityPanel.tsx` *(new)*
- `components/counselor/InterventionRecommendations.tsx` *(new)*
- `components/counselor/CaseloadTrendChart.tsx` *(new)*
- `app/counselor/page.tsx` *(updated)*
- `app/counselor/cases/[id]/page.tsx` *(updated)*
- `lib/constants/index.ts` *(updated)*
- `AGENTS.md` *(updated)*

**Status:** ✅ Done — All 21 Next.js routes dynamic, 0 TypeScript errors, 0 ESLint warnings, production build clean.

#### What was built

Implemented the Phase 5 decision-support signal engine and human-in-the-loop clinical continuity visualization workspace:

1. **Deterministic Rule Engine (`lib/risk/rule-engine.ts`, `types.ts`)**:
   - Transparent, explainable weighted keyword clusters: `SAFETY_THREAT` (+30), `SEVERE_DISTRESS` (+25), `HOUSING_INSTABILITY` (+20), `LEGAL_STRESS` (+15), and `POSITIVE_PROTECTIVE` (-15).
   - Interaction frequency and inactivity penalty logic (>3 days, >7 days elapsed).
   - Normalized 0–100 distress prioritization score mapped to `STABLE` (0–25), `CONCERN` (26–50), `ELEVATED` (51–75), and `CRITICAL` (76–100).
   - Strict adherence to non-clinical decision-support guidelines with clear separation between *Observed Facts* and *Support Inferences*.

2. **Longitudinal Trend Calculator (`lib/risk/trend-calculator.ts`)**:
   - 3-period moving average smoothing to prevent false-alarm jitter.
   - Trajectory classification: `STABLE`, `WORSENING`, `IMPROVING`, and `VOLATILE`.
   - Dynamic threshold delta triggers (delta >= 15 for medium priority, delta >= 25 for rapid escalation).

3. **Early-Warning Alerts & De-duplication (`lib/risk/alert-generator.ts`)**:
   - Automated evaluation triggered immediately upon check-in submission (`app/actions/check-ins.ts`).
   - Generates alerts (`HIGH`, `MEDIUM`, `LOW`) when distress thresholds or rapid acceleration are detected.
   - Intelligent 48-hour de-duplication suppresses spam by checking active (`NEW` / `UNDER_REVIEW`) alerts for the same case and severity.

4. **Actionable Intervention Suggestions (`lib/risk/intervention-engine.ts`)**:
   - Decision-support suggestions generated for `WITNESS_PROTECTION_REVIEW`, `HOUSING_RELOCATION`, `PRIORITY_COUNSELING`, and `LEGAL_AID_ASSISTANCE`.
   - Strict human-in-the-loop requirement: Sensitive interventions are never triggered autonomously.
   - Interactive one-click follow-up scheduling with urgency-based due dates directly creates pending records in the `follow_ups` table.

5. **Visualizations & Explainability Workspace**:
   - `CaseloadTrendChart.tsx`: 7-day longitudinal distress signal bar chart embedded on `/counselor` with interactive hover tooltips and threshold color-coding.
   - `TrendChart.tsx`: Custom SVG longitudinal line chart on `/counselor/cases/[id]` displaying score points, gradient fills, and trajectory indicators.
   - `ExplainabilityPanel.tsx`: Transparent factor breakdown distinguishing observed linguistic facts from support inferences, with "Confirm Human Review" counselor verification action and manual re-evaluation trigger.
   - `InterventionRecommendations.tsx`: Advisory recommendation cards with supporting signals and direct follow-up creation.

---

### 2026-09-08 — Phase 4: Core Workflow (Cases, Assignments, Check-ins, Interactions, Consent, Follow-ups)

**Type:** Feature  
**Files changed:**
- `lib/db/interactions.ts` *(new)*
- `lib/db/consents.ts` *(new)*
- `lib/db/follow-ups.ts` *(new)*
- `lib/db/risk-scores.ts` *(new)*
- `lib/db/cases.ts` *(updated)*
- `lib/db/index.ts` *(updated)*
- `types/database.types.ts` *(updated)*
- `lib/utils.ts` *(updated)*
- `lib/constants/index.ts` *(updated)*
- `app/actions/check-ins.ts` *(new)*
- `app/actions/cases.ts` *(new)*
- `app/actions/interactions.ts` *(new)*
- `app/actions/follow-ups.ts` *(new)*
- `app/actions/consents.ts` *(new)*
- `app/actions/assignments.ts` *(new)*
- `app/actions/alerts.ts` *(new)*
- `components/victim/CheckInForm.tsx` *(new)*
- `components/victim/ConsentManager.tsx` *(new)*
- `components/counselor/CaseStatusChanger.tsx` *(new)*
- `components/counselor/CaseNotesEditor.tsx` *(new)*
- `components/counselor/LogInteractionForm.tsx` *(new)*
- `components/counselor/CaseFollowUpManager.tsx` *(new)*
- `components/counselor/FollowUpListView.tsx` *(new)*
- `components/counselor/AlertsListView.tsx` *(new)*
- `components/admin/CaseAssignmentManager.tsx` *(new)*
- `components/admin/UserManager.tsx` *(new)*
- `app/victim/page.tsx` *(updated)*
- `app/victim/check-in/page.tsx` *(updated)*
- `app/victim/case/page.tsx` *(updated)*
- `app/victim/data/page.tsx` *(updated)*
- `app/victim/support/page.tsx` *(updated)*
- `app/counselor/page.tsx` *(updated)*
- `app/counselor/cases/page.tsx` *(updated)*
- `app/counselor/cases/[id]/page.tsx` *(new)*
- `app/counselor/follow-ups/page.tsx` *(updated)*
- `app/counselor/alerts/page.tsx` *(updated)*
- `app/counselor/audit-log/page.tsx` *(updated)*
- `app/admin/assignments/page.tsx` *(updated)*
- `app/admin/users/page.tsx` *(updated)*
- `app/admin/audit-log/page.tsx` *(updated)*
- `AGENTS.md` *(updated)*

**Status:** ✅ Done — All routes dynamic, typecheck clean, lint clean, production build passing.

#### What was built

Implemented the complete end-to-end Phase 4 Core Workflow across Victim, Counselor, and Admin portals:

1. **Database & Types Layer (`lib/db/`, `types/database.types.ts`)**:
   - Added query helpers for `interactions` (get by case, create with actor relationship).
   - Added query helpers for `consents` (get by victim, upsert status with timestamps).
   - Added query helpers for `follow_ups` (get with case relations, create, complete, update).
   - Added query helpers for `risk_scores` (get by case, create).
   - Added `assignCounselor` helper to `lib/db/cases.ts`.
   - Exported typed Row, Insert, and Update models from `types/database.types.ts`.

2. **Server Actions Layer (`app/actions/`)**:
   - Secure Next.js server actions validating user authentication and authorization via `getCurrentProfile()`.
   - `check-ins.ts`: Validates victim role, queries victim's active case, records check-in, logs tamper-evident audit event, and revalidates victim and counselor cache paths.
   - `cases.ts`: Allows authorized counselors/admins to transition case status (`OPEN`, `ACTIVE`, `UNDER_REVIEW`, `CLOSED`, `REFERRED`) and update confidential case notes with audit logging.
   - `interactions.ts`: Allows counselors to log multi-channel contact (`VOICE_CALL`, `IN_PERSON`, `SMS`, `EMAIL`, `IN_APP_CHECK_IN`) with summary notes.
   - `follow-ups.ts`: Allows scheduling and completion of case-related follow-ups with due dates.
   - `consents.ts`: Empowers victims to grant or withdraw specific consent purposes (`WELLBEING_MONITORING`, `LONGITUDINAL_ANALYSIS`, `STAFF_ACCESS`).
   - `assignments.ts`: Admin reassigns cases to certified counselors and toggles account activation states.
   - `alerts.ts`: Counselors acknowledge and review automated decision-support distress alerts.

3. **Victim Experience (`/victim`)**:
   - **Dashboard (`/victim`)**: Dynamically queries active case reference, counselor name, and last check-in date.
   - **Check-In (`/victim/check-in`)**: Interactive text submission form with immediate feedback, character count, and personal check-in history timeline. Kept experimental voice option clearly marked "Coming Soon".
   - **My Case (`/victim/case`)**: Dynamic case details including official reference, status badge, opened timestamp, counselor contact, and official support notes.
   - **My Data & Consent (`/victim/data`)**: Transparent privacy dashboard with interactive toggle buttons to grant/withdraw consent per purpose, alongside explanations of data minimization and access control.
   - **Support & Crisis (`/victim/support`)**: Emergency hotline banner (112, 1091, 14566, Tele-MANAS 14416) and assigned counselor details.

4. **Counselor Workspace (`/counselor`)**:
   - **Dashboard (`/counselor`)**: Live KPI metrics (assigned cases, alerts needing review, recent check-ins, follow-ups due) and active caseload glance.
   - **Caseload (`/counselor/cases`)**: Live table with status filtering tabs (`ALL`, `ACTIVE`, `UNDER_REVIEW`, `OPEN`, `CLOSED`) and direct link to case workspaces.
   - **Case Details Workspace (`/counselor/cases/[id]`)**: Full case overview with status changer, confidential notes editor, complete check-in timeline, multi-channel contact logging, actionable follow-ups, and illustrative distress scores with mandatory non-clinical disclaimers.
   - **Follow-Ups (`/counselor/follow-ups`)**: Replaced placeholder with task manager supporting status filtering (`ALL`, `PENDING`, `COMPLETED`), task creation, and "Mark Complete" action.
   - **Alerts (`/counselor/alerts`)**: Replaced placeholder with real alerts manager with priority badges, status filters, and "Mark as Reviewed" action.
   - **Audit Log (`/counselor/audit-log`)**: Displays real audit trail of recent staff actions.

5. **Admin Workspace (`/admin`)**:
   - **Assignments (`/admin/assignments`)**: Replaced placeholder with case allocation interface featuring counselor workload distribution metrics and case assignment dropdowns.
   - **User Management (`/admin/users`)**: Replaced placeholder with user management table displaying roles, verification status, and account activation toggles.
   - **Audit Log (`/admin/audit-log`)**: Full immutable audit trail of system events.

6. **Safety & Guardrail Compliance**:
   - Every distress signal display prominently embeds the non-clinical disclaimer: *"Illustrative support-prioritisation signal — not a clinical diagnosis. Human review is mandatory."*
   - All demo data is strictly synthetic and labeled as such.

---

### 2026-09-08 — Fix "Database error querying schema" for all demo accounts

**Type:** Bug Fix  
**Files changed:**
- `supabase/fix-auth-users.sql` *(new)*
- `supabase/seed.sql` *(updated)*
- `middleware.ts` *(new)*
- `app/actions/auth.ts` *(updated)*
- `scripts/test-login.mjs` *(new)*
- `package.json` *(updated)*

**Status:** ✅ Done — requires running `supabase/fix-auth-users.sql` in the Supabase SQL Editor once against the live project database.

#### Problem

Attempting to log in with any demo account (`admin@luma.org`, `counselor@luma.org`, `victim1@demo.luma.org`) via `/login` returned:

```text
500: Database error querying schema
```

This is a GoTrue (Supabase's internal auth service) error. It is **not** a problem with the application code — it is a problem in the `auth.*` schema in the Postgres database.

#### Root Causes (two separate issues)

**1. NULL token columns in `auth.users`**

The original `supabase/seed.sql` inserted users directly into `auth.users` via raw SQL (`INSERT INTO auth.users (...)`). The columns for internal token management — `confirmation_token`, `recovery_token`, `email_change`, `email_change_token_new`, `email_change_token_current`, `phone_change`, `phone_change_token`, `reauthentication_token` — were not included in the `INSERT` column list and defaulted to `NULL` in the database.

Supabase's GoTrue authentication engine is written in Go. When processing a login attempt, it reads all user fields using Go's SQL scanner. Go's SQL driver **cannot** scan a PostgreSQL `NULL` value into a Go `string` variable. The runtime error is:

```text
sql: Scan error on column index N, name "confirmation_token": converting NULL to string is unsupported
```

GoTrue wraps this as the generic `"Database error querying schema"` 500 response.

**2. Missing `auth.identities` entries**

Supabase Auth uses a two-table design for user identity management:
- `auth.users` — the core user record
- `auth.identities` — one or more rows per user, one for each authentication provider (email, Google, GitHub, etc.)

The original seed script only inserted into `auth.users` and skipped `auth.identities`. GoTrue requires a matching identity record to verify that a user can authenticate via a given provider (in this case `'email'`). Without it, authentication cannot complete.

**3. `proxy.ts` was not picked up as middleware**

The project had a file called `proxy.ts` at the root with a `proxy` export and a `config` export. This file contained the Supabase session refresh logic and RBAC route protection. However, **Next.js middleware must be in a file named `middleware.ts` (or `middleware.js`) and must export a function named `middleware`**. The file `proxy.ts` was completely ignored by Next.js — no session refreshing, no RBAC redirection was active for any route, including `/admin`.

#### Fixes

**Fix 1 — One-time database repair: `supabase/fix-auth-users.sql`**

Created a new SQL repair script that must be run once in the Supabase SQL Editor to fix the already-inserted seeded users:

```sql
-- Step 1: Replace NULL token columns with empty strings
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE <any of those columns> IS NULL;

-- Step 2: Insert missing auth.identities records for all users without one
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, ...)
SELECT u.id::text, u.id, u.id::text, 
       format('{"sub":"%s","email":"%s"}', u.id::text, u.email)::jsonb,
       'email', ...
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email'
);
```

The `on conflict (id) do nothing` on identities prevents duplicates on re-run.

**Fix 2 — Prevent recurrence: updated `supabase/seed.sql`**

Updated the `INSERT INTO auth.users (...)` statement to explicitly list and set all token columns to `''`:

```sql
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, phone_change,
  phone_change_token, reauthentication_token
) values (
  '...', '...', ... , '', '', '', '', '', '', '', ''
);
```

Also changed `on conflict (id) do nothing` to `on conflict (id) do update set encrypted_password = excluded.encrypted_password, confirmation_token = '', ...` — so a re-seed will also repair any NULL-token rows.

Added a new section `-- 1b. Insert corresponding identities into auth.identities` that populates the identity table for all six synthetic users (counselor, admin, 4 victims) using `on conflict (id) do nothing`.

**Fix 3 — Create `middleware.ts`**

Renamed the exported function and file:
- Before: `proxy.ts` exporting `export async function proxy(request: NextRequest)`
- After: `middleware.ts` exporting `export async function middleware(request: NextRequest)`

The internal logic in `lib/supabase/proxy.ts` (the actual Supabase session + RBAC logic) was kept unchanged. `middleware.ts` simply calls `updateSession(request)` from that module. This is the correct Next.js pattern.

The old `proxy.ts` root file was deleted.

**Fix 4 — Harden `app/actions/auth.ts` role lookup**

Changed `.single()` to `.maybeSingle()` when fetching user profile in `signInAction`. `.single()` throws an error if no row is returned; `.maybeSingle()` returns `null` which is handled gracefully.

Added a fallback chain for role resolution:
```typescript
const role =
  (profile?.role as UserRole) ??          // 1. from public.profiles table (most authoritative)
  (data.user.app_metadata?.role as UserRole) ?? // 2. from app_metadata JWT claim
  (data.user.user_metadata?.role as UserRole) ?? // 3. from user_metadata
  "VICTIM";                                // 4. safe default
```

**Fix 5 — Added `scripts/test-login.mjs` and `npm run test:login`**

Created a diagnostic script to reproduce and verify the authentication fix without a browser. It tests all three demo accounts and prints a clear error message with the fix URL if the schema error is still present.

```bash
npm run test:login
```

Expected output after the fix:
```text
Testing [ADMIN] (admin@luma.org)...       ✅ SUCCESS!
Testing [COUNSELOR] (counselor@luma.org)... ✅ SUCCESS!
Testing [VICTIM] (victim1@demo.luma.org)... ✅ SUCCESS!
```

#### How to Reproduce Before the Fix

1. Run `supabase/seed.sql` without the updated token columns against a fresh Supabase project.
2. Try to log in with any seeded account.
3. The auth API returns HTTP 500 with body `{"message":"Database error querying schema"}`.

#### Action Required

Run [`supabase/fix-auth-users.sql`](supabase/fix-auth-users.sql) in the Supabase SQL Editor once:

```
https://supabase.com/dashboard/project/<your-project-ref>/sql/new
```

Then verify:

```bash
npm run test:login
```

---

### 2026-09-05 — Phase 2 Supabase skills, Supabase schema, seed data, auth flow, and role-based navigation

**Type:** Feature  
**Files changed:**
- `supabase/schema.sql` *(new)*
- `supabase/seed.sql` *(new)*
- `supabase/migrations/20260908000000_initial_schema.sql` *(new)*
- `lib/supabase/server.ts`, `client.ts`, `admin.ts`, `proxy.ts`, `index.ts` *(new)*
- `lib/db/` — `profiles.ts`, `cases.ts`, `alerts.ts`, `check-ins.ts`, `audit.ts` *(new)*
- `types/database.types.ts` *(new)*
- `app/actions/auth.ts` *(new)*
- `app/login/page.tsx` *(new)*
- `components/auth/LoginForm.tsx`, `SignOutButton.tsx` *(new)*
- `app/admin/`, `app/counselor/`, `app/victim/` *(new route groups)*
- `app/admin/layout.tsx`, `app/counselor/layout.tsx`, `app/victim/layout.tsx` *(new)*
- `components/navigation/AdminNav.tsx`, `CounselorNav.tsx`, `VictimNav.tsx` *(new)*
- `scripts/test-db-connection.mjs` *(new)*
- `.agents/skills/supabase/`, `.agents/skills/supabase-postgres-best-practices/` *(new)*
- `package.json` — added `@supabase/supabase-js`, `@supabase/ssr`

**Status:** ✅ Done (modulo the auth fix above)

#### What was built

**Database schema (`supabase/schema.sql`)**

Defined the full Phase 2 relational schema with:
- `public.profiles` — extends `auth.users`, stores `role`, `display_name`, `is_active`. Triggered from `auth.users` via `on_auth_user_created` trigger.
- `public.cases` — victim cases with `case_ref`, `status`, `victim_id`, `counselor_id`.
- `public.check_ins` — periodic check-in submissions with free text.
- `public.interactions` — multi-channel interaction records (VOICE_CALL, SMS, IN_APP_CHECK_IN, etc.)
- `public.consents` — victim consent lifecycle (GIVEN / WITHDRAWN / PENDING).
- `public.alerts` — distress signals with severity (LOW / MEDIUM / HIGH) and status (NEW / UNDER_REVIEW / REVIEWED).
- `public.risk_scores` — illustrative distress prioritization signals (NOT clinical diagnosis; 0–100 score with human_reviewed flag).
- `public.follow_ups` — counselor-assigned follow-up tasks with due dates.
- `public.audit_logs` — append-only system activity log.
- Helper functions: `set_updated_at()`, `get_my_role()` (security definer, cached role lookup).
- RLS enabled on all tables with `TO authenticated` policies using `auth.uid()` ownership predicates and role-checked staff policies.

**Seed data (`supabase/seed.sql`)**

Inserted 6 synthetic demo users (1 admin, 1 counselor, 4 victims), 4 cases, 2 alerts, 2 risk score entries, 2 check-ins, and 2 follow-ups. All data is clearly labelled synthetic/demo.

**Supabase client setup (`lib/supabase/`)**

- `server.ts` — SSR server-side client using `@supabase/ssr` and Next.js `cookies()`.
- `client.ts` — browser-side client using `@supabase/ssr`.
- `admin.ts` — service-role admin client using `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- `proxy.ts` — session refresh + RBAC middleware logic, imported by `middleware.ts`.

**Auth server actions (`app/actions/auth.ts`)**

- `signInAction` — validates credentials, fetches role from `public.profiles`, redirects to the correct portal.
- `signOutAction` — signs out and redirects to `/login`.
- `signUpAction` — creates account via Supabase auth API with `display_name` and `role` in `user_metadata`.

**Role-based portal layouts**

Three protected portals, each with a dedicated layout and navigation component:
- `/admin` — Admin portal (user management, assignments, audit log).
- `/counselor` — Counselor dashboard (cases, alerts, follow-ups, reports, audit log).
- `/victim` — Victim portal (case status, check-in, support resources, data controls).

---

### 2026-09-05 — Phase 1 skeleton

**Type:** Feature  
**Files changed:** All initial Next.js project files, `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `LICENSE`.

**Status:** ✅ Done

Initial Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui scaffold. Public landing page with role overview cards (Victim, Counselor, Admin). Public header and footer. Responsive layout. `AGENTS.md` project checklist initialized.

---

*Journal maintained by: development team + AI agents. Last updated: 2026-09-08.*
