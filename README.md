# LUMA — AI-Based Dynamic Mental Health Monitoring & Distress Prediction System

> **SIH-2026 Problem Statement SIH26094**  
> AI-based Dynamic Mental Health Monitoring and Distress Prediction System for victims and complainants.  
> **Status:** All 8 Phases Implemented & Verified ✅ • Production-Ready Hackathon Delivery

---

## What is LUMA?

**LUMA** (LUMA) is an AI-powered, human-in-the-loop **support-continuity and early-warning platform** designed to monitor the well-being and distress trajectories of victims and complainants over time. By combining **multilingual natural language processing (Hindi, Hinglish, and English)**, **dynamic longitudinal risk modeling**, and **inclusive last-mile communication channels (Web Speech-to-Text, basic feature-phone SMS, IVRS telephony, and National Helpline 14566 intake)**, LUMA ensures that emerging crises are caught early and addressed by dedicated human support workers.

### Essential Product Guardrails & Ethical Boundaries

- **Support-Prioritisation Only**: LUMA produces *Distress Signals* and *Support-Prioritization Indicators* — it does **not** make clinical psychiatric diagnoses or prescribe treatment.
- **Human-in-the-Loop Safeguard**: The system **never** triggers autonomous sensitive interventions (such as police relocation or involuntary hospitalization). Recommendations are advisory aids requiring counselor confirmation.
- **Observed Fact vs. Machine Inference Demarcation**: The system strictly separates verifiable facts (logged quotes, direct occurrences) from algorithmic hypotheses.
- **Privacy-by-Design (DPDP Act & Victim Protection)**: Authority and district dashboards aggregate data with **zero victim-level PII** (no names, phones, or verbatim text exposed).

---

## System Architecture

```text
INCLUSIVE INGESTION CHANNELS
├── 🎙️ Web Speech-to-Text (Web Speech API hi-IN / en-IN on /victim/check-in)
├── 💬 Two-Way SMS (Emergency shortcodes: 1=Safe, 2=Help, 911=Urgent via /api/channels/sms)
├── 📞 Automated IVRS Telephony (DTMF keypress 1-5 + recorded voicemail via /api/channels/ivrs)
├── 🏛️ National Helpline 14566 Intake (NHAA/Tele-MANAS referrals via /api/channels/helpline)
└── 🌐 Encrypted Web Portal (/victim/check-in)
                         │
                         ▼
             UNIFIED INGESTION LAYER (lib/channels/)
                         │
       ┌─────────────────┴─────────────────┐
       ▼                                   ▼
public.check_ins                   public.interactions
(voice_input_used: true)           (channel: 'VOICE_CALL' | 'SMS'...)
       │                                   │
       └─────────────────┬─────────────────┘
                         ▼
        DUAL-ENGINE RISK & INTELLIGENCE PIPELINE
  ┌─────────────────────────────────────────────────────────────┐
  │ • Rule & Trend Engine: Keyword weights & moving average     │
  │ • Multilingual Lexicon: English, Devanagari हिन्दी, Hinglish │
  │ • Google Gemini 2.5 Flash (Structured low-temp analysis)    │
  │ • Deterministic Local Heuristic ML (Zero-network fallback)  │
  │ • 72-Hour Escalation Forecasting & Non-Clinical Framing     │
  └─────────────────────────────────────────────────────────────┘
                         │
                         ▼
          COUNSELOR & AUTHORITY WORKSPACES
  ├── Counselor Workspace (/counselor/cases/[id]): AI Briefing & Observed Facts
  ├── Early-Warning Alert Queue (/counselor/alerts): Priority triage & review
  ├── Multi-Channel Gateway (/counselor/channels): Telephony & SMS simulator
  ├── 1-Click Demo Studio (/counselor/demo): Real-time judge evaluation suite
  └── District Analytics Hub (/counselor/reports): Non-PII regional hotspots
```

---

## Implemented Phases (1 to 8 Complete)

| Phase | Title | Key Features | Status |
|---|---|---|---|
| **Phase 1** | Foundation & UI Skeleton | Next.js 16 + TypeScript, Tailwind CSS v4, shadcn/ui components, accessible semantic layouts. | ✅ Done |
| **Phase 2** | Database & Migrations | PostgreSQL / Supabase schema (9 tables), Row-Level Security (RLS), synthetic seed datasets. | ✅ Done |
| **Phase 3** | Authentication & RBAC | Multi-role Auth (`VICTIM`, `COUNSELOR`, `ADMIN`), cookie-based sessions, route protection middleware. | ✅ Done |
| **Phase 4** | Core Support Workflows | Dynamic caseload management, check-in submission & timeline, counselor notes, follow-up scheduling, consent manager. | ✅ Done |
| **Phase 5** | Risk Engine v1 | 0–100 Distress Score, 7-day moving trend calculator (`STABLE`, `WORSENING`, `IMPROVING`), automated alert generator, SVG trend graphs. | ✅ Done |
| **Phase 6** | GenAI / ML Integration | Dual-mode architecture (Gemini 2.5 Flash + Local NLP fallback), Hindi/Hinglish lexicons, Observed Facts vs. Inferences separation, 72h escalation projection. | ✅ Done |
| **Phase 7** | Voice & Multi-Channel | Web Speech-to-Text microphone recording, inbound SMS webhook adapter, automated IVRS telephony adapter, National Helpline 14566 gateway. | ✅ Done |
| **Phase 8** | Hardening & Demo Studio | 1-Click Hackathon Demo Studio (Scenarios A, B, C, D), District & State Analytics Hub (`/counselor/reports`), DPDP compliance, live Admin KPIs. | ✅ Done |

---

## 1-Click Demo Studio for Hackathon Evaluators

For fast, high-impact demonstrations to SIH judges, navigate to **Demo Studio** in the counselor sidebar (`/counselor/demo`):

* **Scenario A — Stable Support Baseline**: Normal wellness check-in confirming medication and daily routine. Score remains ~18/100 (`STABLE`), zero alerts generated.
* **Scenario B — Gradual Distress Escalation**: Complainant develops insomnia and anticipatory legal anxiety before a court hearing. Score rises to ~55/100 (`ELEVATED`), triggering an advisory counselor alert.
* **Scenario C — Rapid Crisis & Death Threat**: Direct witness intimidation and death threats outside home. Score spikes to ~88/100 (`CRITICAL`), triggering an emergency alert, recommending **Witness Protection Review**, and auto-scheduling an **urgent 4-hour counselor callback task**!
* **Scenario D — Post-Intervention Recovery**: Counselor coordinates police patrol and transfer to a safe shelter. Subsequent check-in reports relief, score drops to safe levels (`STABLE`), and open alerts are marked **REVIEWED**.
* **Reset Baseline Button**: 1-click button to reset the demo case so evaluators can run the cycle again immediately.

---

## Application Route Index

### Victim Portal (`/victim`)
- `/victim` — Personalized victim support dashboard and check-in prompt.
- `/victim/check-in` — Privacy-first check-in form with **Web Speech-to-Text microphone recording** (`hi-IN` / `en-IN`).
- `/victim/case` — Case status summary, assigned counselor details, and emergency contacts.
- `/victim/data` — Interactive consent lifecycle manager (DPDP Act compliance).
- `/victim/support` — Verified 24/7 national helplines (Tele-MANAS, Women Helpline, Emergency).

### Counselor Portal (`/counselor`)
- `/counselor` — Live caseload KPIs and 7-day Caseload Support Signal Trend chart.
- `/counselor/cases` — Filterable case registry with priority indicators.
- `/counselor/cases/[id]` — Full Clinical Continuity Workspace: AI case briefing, Observed Facts vs. Inferences table, SVG longitudinal trend chart, multi-channel contact history, and intervention suggestions.
- `/counselor/alerts` — Early-warning alert triage queue with review controls and audit logging.
- `/counselor/channels` — Multi-Channel Gateway and interactive telephony/SMS webhook testing simulator.
- `/counselor/demo` — 1-Click Presentation Demo Studio executing Scenarios A, B, C, and D.
- `/counselor/follow-ups` — Interactive task queue with urgency-based deadlines (4h/24h).
- `/counselor/reports` — District & State Analytics Hub with regional hotspots and non-PII exportable summaries.
- `/counselor/audit-log` — Filterable record of counselor interventions and algorithm executions.

### System Administration (`/admin`)
- `/admin` — Live platform dashboard with real-time database counters.
- `/admin/users` — Staff credentials, roles, and activation controls.
- `/admin/assignments` — Workload distribution and counselor case allocation.
- `/admin/audit-log` — Immutable, system-wide cryptographic audit trail.

---

## Local Setup & Testing

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/your-team/luma.git
cd luma

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### 2. Run the Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Diagnostics & Verification

```bash
# Verify TypeScript compilation (0 errors guaranteed)
npx tsc --noEmit

# Run ESLint compliance (0 warnings guaranteed)
npm run lint

# Run Multi-Channel STT & Telephony unit tests
npm run test:channels

# Run Hackathon Scenarios A, B, C, D & Privacy guardrail audit
npm run test:scenarios

# Verify Supabase database schema and RLS tables
npm run test:db
```

---

## Demo Accounts

Pre-configured synthetic accounts for judging (passwords: `Password123!`):

| Role | Email | Purpose |
|---|---|---|
| **Counselor** | `counselor@luma.org` | Caseload triage, alerts, AI insights, Demo Studio |
| **Admin** | `admin@luma.org` | Workload assignments, system metrics, audit logs |
| **Victim 1** | `victim1@demo.luma.org` | Complainant Aarohi (`V-1042`), check-in submissions |
| **Victim 2** | `victim2@demo.luma.org` | Complainant Deepa (`V-1043`) |

---

## License & Attribution

Distributed under the [MIT License](./LICENSE). Built for the Smart India Hackathon (SIH 2026) under Problem Statement **SIH26094**.
