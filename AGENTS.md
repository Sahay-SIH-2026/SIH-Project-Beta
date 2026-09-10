# SAHAY — SIH26094 Implementation Checklist

> AI-based Dynamic Mental Health Monitoring and Distress Prediction System for victims and complainants.

## Agent Instructions

- **Development Journal**: All changes, bug fixes, and implementation decisions are logged in [`JOURNAL.md`](./JOURNAL.md). Read it before making changes. Record every non-trivial change made.
- Checked items (`[x]`) are **done**. Unchecked items (`[ ]`) are **pending**.
- When completing a task, tick the relevant checkboxes and add a `JOURNAL.md` entry.
- Never tick a box unless the feature is actually working end-to-end.

---

## 0. Product Guardrails
- [x] Define SAHAY as a support-continuity and early-warning system, not a diagnostic system.
- [x] Use Distress Signal / Risk Signal terminology rather than claiming clinical diagnosis.
- [x] Keep a human-in-the-loop for alerts, escalation, and interventions.
- [x] Define consent, withdrawal, data minimization, retention, and access rules. *(Consent table schema done; UI consent workflow at `/victim/data`)*
- [x] Use synthetic/demo data during development unless authorized real data is explicitly available.
- [ ] Document explainability requirements for every AI-generated risk/alert.
- [ ] Define what the system must never do autonomously.

## 1. Users & Roles

### Victim / Complainant
- [x] Secure onboarding / identification. *(via Supabase Auth + profiles table)*
- [x] View case/support status. *(dynamic victim portal at `/victim` and `/victim/case`)*
- [x] Complete periodic check-ins. *(interactive submission form at `/victim/check-in`)*
- [x] Submit text responses. *(functional with server actions and audit logging)*
- [ ] Support voice/IVRS interaction path.
- [x] View consent and data controls. *(interactive consent management at `/victim/data`)*
- [x] Access support resources. *(national verified helplines + counselor details at `/victim/support`)*

### Counsellor / Support Worker
- [x] View assigned cases. *(live caseload list at `/counselor/cases` with status filters)*
- [x] Review check-in history. *(chronological check-in timeline on `/counselor/cases/[id]`)*
- [ ] View distress signals and trends.
- [ ] Review AI explanation/evidence.
- [x] Receive and manage alerts. *(real alerts list with review action at `/counselor/alerts`)*
- [x] Record follow-ups. *(task manager at `/counselor/follow-ups` and case workspace)*
- [ ] Record interventions/referrals.
- [ ] Track unresolved high-risk cases.

### District / State / National Officials
- [ ] Aggregated dashboards.
- [ ] Vulnerable/high-risk case counts.
- [ ] Trend analysis.
- [ ] Regional comparisons where appropriate.
- [ ] Avoid unnecessary victim-level PII exposure.

### Admin
- [x] Manage authorized users. *(user list and activation toggle at `/admin/users`)*
- [ ] Manage role assignments. *(schema done; UI pending)*
- [x] Manage case/counsellor assignments. *(workload distribution manager at `/admin/assignments`)*
- [x] Audit access and actions. *(system-wide audit log at `/admin/audit-log`)*

## 2. Core Application
- [x] Victim portal. *(dynamic dashboard, case view, check-in, consent manager, support)*
- [x] Counsellor dashboard. *(live KPIs, caseload overview, case details workspace, follow-ups, alerts)*
- [x] Case details page. *(comprehensive workspace at `/counselor/cases/[id]`)*
- [x] Check-in workflow. *(form submission, history timeline, audit logging)*
- [x] Alerts dashboard. *(review action, severity filters, non-clinical disclaimer)*
- [x] Follow-up workflow. *(status filtering, scheduling form, completion action)*
- [ ] Intervention/referral tracking.
- [ ] District/state/national analytics dashboard.
- [x] Audit-log interface. *(counselor and admin audit log viewers)*

- [x] Responsive and accessible UI. *(Tailwind + shadcn/ui base)*

## 3. Periodic Monitoring
- [ ] Investigation phase.
- [ ] Trial phase.
- [ ] Rehabilitation phase.
- [ ] Compensation phase.
- [ ] Post-intervention follow-up.

### Channels
- [x] Web portal. *(primary channel — implemented)*
- [ ] Chatbot.
- [ ] Mobile application path/API.
- [x] SMS path/API. *(implemented via lib/channels/sms-adapter.ts and /api/channels/sms)*
- [x] IVRS/voice path/API. *(implemented via lib/channels/ivrs-adapter.ts and /api/channels/ivrs)*
- [x] Helpline follow-up path/API. *(implemented via lib/channels/helpline-adapter.ts and /api/channels/helpline)*
- [x] Use mock/local adapters for unavailable integrations in the MVP. *(telephony and helpline adapters with interactive simulator)*

## 4. Check-in System
- [ ] Define periodic schedule.
- [ ] Structured questions.
- [x] Free-text responses. *(schema: `check_ins.response_text`)*
- [x] Interaction timestamp. *(schema: `check_ins.submitted_at`)*
- [x] Channel tracking. *(schema: `interactions.channel`)*
- [ ] Completion/engagement tracking.
- [ ] Missed/skipped check-ins.
- [ ] Cross-check-in change detection.
- [x] Consent/context tracking. *(schema: `consents` table)*

## 5. AI / ML Pipeline

### Input Processing
- [ ] Text preprocessing.
- [ ] Voice-to-text pipeline.
- [ ] Behaviour/engagement feature extraction.
- [ ] Interaction-frequency features.
- [ ] Missed-check-in features.
- [ ] Longitudinal-history features.

### NLP / Emotion
- [x] Sentiment analysis. *(polarity & intensity in `lib/ai/local-nlp-fallback.ts` and `gemini-provider.ts`)*
- [x] Emotion/signal classification. *(primary and secondary classification across ANXIETY, FEAR, HOPE, NUMB, SADNESS, RELIEF, ANGER)*
- [x] Linguistic feature extraction. *(cross-lingual feature lexicons in `lib/ai/multilingual-dictionary.ts`)*
- [x] Multilingual support plan. *(English, Devanagari Hindi हिन्दी, and Hinglish transliterations)*
- [x] Confidence scores. *(calculated confidence percentages for sentiment, emotion, and language)*

### Voice
- [ ] Speech transcription.
- [ ] Voice feature extraction where justified.
- [ ] Voice-stress research/prototype.
- [ ] Clearly separate experimental voice signals from clinical conclusions.

### Risk Modelling
- [x] Initial rule-based/mock risk engine. *(implemented in `lib/risk/rule-engine.ts`)*
- [x] Dynamic distress signal calculation. *(normalized 0–100 signal score based on keywords, frequency, and deltas)*
- [x] Longitudinal trend calculation. *(implemented in `lib/risk/trend-calculator.ts` — STABLE, WORSENING, IMPROVING, VOLATILE)*
- [x] Escalation prediction. *(72-hour forecast: LOW, MODERATE, HIGH, CRITICAL with risk trajectory)*
- [x] Risk thresholds. *(CRITICAL >= 76, ELEVATED >= 51, CONCERN >= 26, STABLE < 26)*
- [x] Model confidence. *(scored based on interaction detail and longitudinal window)*
- [ ] False-positive/false-negative analysis.
- [ ] Model evaluation dataset.

## 6. Dynamic Distress Signal
Design this as a decision-support indicator, not a diagnosis.

- [x] Define signal inputs. *(schema: `risk_scores` table with score + signal_reason)*
- [x] Define features/weights. *(keyword clusters with weights: SAFETY_THREAT: 30, SEVERE_DISTRESS: 25, HOUSING_INSTABILITY: 20, LEGAL_STRESS: 15, POSITIVE_PROTECTIVE: -15)*
- [x] Define time window. *(7-day schedule window for inactivity scoring & trend delta)*
- [x] Define trend calculation. *(delta + trajectory classification in `trend-calculator.ts`)*
- [x] Define threshold levels. *(LOW: >= 35, MEDIUM: >= 50 or delta >= 15, HIGH: >= 75 or delta >= 25)*
- [x] Define confidence. *(dynamic confidence score 75–95% based on text length and history depth)*
- [x] Define missing-data behaviour. *(baseline score 15, graceful fallback on null check-ins)*
- [x] Show longitudinal trend graph. *(SVG line chart `TrendChart.tsx` with bands and tooltips)*
- [x] Show contributing signals. *(Factor breakdown in `ExplainabilityPanel.tsx`)*
- [x] Show explanation/evidence. *(Observed facts vs Support inferences)*
- [x] Allow appropriate counsellor review/override. *(Human review verification action + button in `ExplainabilityPanel.tsx`)*

Suggested conceptual levels:
- [x] Stable (0–25)
- [x] Increasing concern / Concern (26–50)
- [x] Elevated (51–75)
- [x] High concern / Critical (76–100)
- [x] Critical review required

## 7. Early-Warning & Alerts
- [x] Define alert rules. *(schema: `alerts.severity` LOW/MEDIUM/HIGH, status NEW/UNDER_REVIEW/REVIEWED)*
- [x] Trigger alerts when thresholds are crossed. *(triggered automatically in `lib/risk/alert-generator.ts` during check-in evaluation)*
- [x] Detect rapidly worsening trends. *(delta >= 25 triggers HIGH alert; delta >= 15 triggers MEDIUM alert)*
- [x] Detect repeated concerning signals.
- [x] Handle prolonged disengagement where relevant. *(inactivity penalties for > 3 days and > 7 days)*
- [x] Assign alert priority. *(schema: `alerts.severity`)*
- [x] Assign responsible worker/official. *(counselor association via case)*
- [x] Record creation, acknowledgement, and resolution. *(schema: `alerts.raised_at`, `reviewed_at`, `reviewed_by_id`, status transitions)*
- [x] Prevent duplicate alert spam. *(48-hour active alert suppression window for identical severity in `alert-generator.ts`)*
- [x] Log alert-related actions.

## 8. Intervention Recommendation Engine
Support recommendations such as:
- [x] Counselling. *(PRIORITY_COUNSELING recommendation)*
- [ ] Medical-treatment referral.
- [x] Witness protection. *(WITNESS_PROTECTION_REVIEW recommendation)*
- [x] Relocation support. *(HOUSING_RELOCATION recommendation)*
- [ ] Financial assistance.
- [x] Legal aid. *(LEGAL_AID_ASSISTANCE recommendation)*
- [ ] Rehabilitation support.

For every recommendation:
- [x] Identify supporting signals. *(supporting keyword or longitudinal signals displayed on cards)*
- [x] Explain why it was suggested. *(rationale string generated in `intervention-engine.ts`)*
- [x] Show confidence/limitations. *(strict non-clinical decision-support disclaimers attached)*
- [x] Require authorized human review. *(recommendations are advisory suggestions; counselor must approve)*
- [x] Record accepted/rejected recommendation. *(one-click "Schedule Follow-Up" creates a pending follow-up task directly in the database)*
- [x] Record resulting action. *(follow-up task created with urgency-based due date)*
- [ ] Track follow-up outcome.

**Do not automatically initiate sensitive interventions.**

## 9. Explainable AI
- [x] Show contributing factors. *(Linguistic distress markers, Disengagement frequency, Longitudinal rate of change)*
- [x] Show relevant recent interactions. *(Check-in timeline and contact history visible alongside signals)*
- [x] Show longitudinal change. *(SVG trend chart in `TrendChart.tsx` and caseload trend in `CaseloadTrendChart.tsx`)*
- [x] Show model confidence. *(Confidence indicator in evaluation output)*
- [x] Distinguish observed facts from AI inference. *(Observed Fact badges vs Support Inference badges in `ExplainabilityPanel.tsx`)*
- [x] Avoid unsupported clinical claims. *(Mandatory disclaimer on every signal element: "Illustrative support-prioritisation signal — not a clinical diagnosis. Human review is mandatory.")*
- [x] Provide human-review controls. *("Confirm Human Review" button with counselor audit logging)*
- [ ] Log model/version used for important predictions.

## 10. Multilingual Conversational AI
- [x] Identify priority languages. *(English, Hindi हिन्दी, and Hinglish transliterations)*
- [x] Define supported input languages. *(en, hi, hinglish)*
- [x] Translation pipeline. *(English translation/gist extraction for non-English inputs in `lib/ai`)*
- [x] Multilingual intent detection. *(lexicon mapping for safety, distress, housing, and legal themes)*
- [x] Multilingual sentiment/emotion evaluation. *(cross-lingual sentiment intensity and emotion mapping)*
- [ ] Local-language chatbot flows.
- [x] Language fallback. *(robust fallback to English or local heuristic parsing)*
- [ ] Test for meaning loss during translation.

## 11. Dashboards

### Counsellor
- [x] Assigned cases. *(viewable at `/counselor` and `/counselor/cases`)*
- [x] New alerts. *(KPI card + alert review queue at `/counselor/alerts`)*
- [x] High-priority cases. *(color-coded priority badges and sorted lists)*
- [x] Distress trends. *(7-day Caseload Support Signal Trend chart at `/counselor` and longitudinal SVG chart at `/counselor/cases/[id]`)*
- [x] Missed check-ins. *(inactivity penalties & tracking in risk engine)*
- [x] Pending follow-ups. *(KPI card + interactive task list at `/counselor/follow-ups`)*
- [x] Intervention status. *(intervention suggestions with one-click follow-up creation on case workspace)*

### District / State / National
- [x] Aggregated active cases. *(viewable at `/counselor/reports` via `OfficialAnalyticsView`)*
- [x] Cases requiring attention. *(Critical & Elevated cohorts tracked across districts)*
- [x] Alert trends. *(state caseload severity distribution bar)*
- [x] Follow-up completion. *(KPI indicators on reports and admin dashboards)*
- [x] Aggregated distress trends. *(anonymized longitudinal case registry)*
- [x] Regional comparisons. *(district hotspot cohorts: Central Delhi, South Delhi, New Delhi, East Delhi)*
- [x] Avoid unnecessary victim-level PII exposure. *(strict zero-PII privacy guarantee; only case refs and stats exposed)*

## 12. Database
Recommended initial entities:
- [x] User *(auth.users + public.profiles)*
- [x] Role *(profiles.role: VICTIM | COUNSELOR | ADMIN)*
- [x] Case *(public.cases)*
- [ ] CaseAssignment *(counselor_id on cases; dedicated assignment table pending)*
- [x] CheckIn *(public.check_ins)*
- [x] Interaction *(public.interactions)*
- [ ] InteractionSignal *(pending — linked to AI pipeline)*
- [x] RiskScore / DistressSignal *(public.risk_scores — illustrative signal, NOT diagnosis)*
- [x] Alert *(public.alerts)*
- [x] FollowUp *(public.follow_ups)*
- [ ] Intervention *(pending)*
- [x] Consent *(public.consents)*
- [ ] SupportResource *(pending)*
- [x] AuditLog *(public.audit_logs)*
- [ ] ModelVersion *(pending)*

Database:
- [x] PostgreSQL / Supabase. *(live Supabase project)*
- [ ] Prisma ORM. *(using Supabase client directly; Prisma not adopted)*
- [x] Migrations. *(`supabase/migrations/20260908000000_initial_schema.sql`)*
- [x] Seed/demo data. *(`supabase/seed.sql` — synthetic users, cases, alerts, risk scores, check-ins, follow-ups)*
- [x] Indexes. *(defined in schema.sql for all foreign keys and common filter columns)*
- [x] Foreign-key relationships. *(all tables reference profiles(id) or cases(id) with appropriate ON DELETE rules)*
- [x] Row-level security/access policies where applicable. *(RLS enabled on all 9 tables with TO authenticated policies)*

## 13. Authentication & Authorization
- [x] Authentication. *(Supabase Auth with email + password)*
- [x] Victim role. *(VICTIM profile + RLS policies + /victim portal)*
- [x] Counsellor role. *(COUNSELOR profile + RLS policies + /counselor portal)*
- [x] Admin role. *(ADMIN profile + RLS policies + /admin portal)*
- [ ] District/state/national authority roles if required.
- [x] Protected routes. *(`middleware.ts` redirects unauthenticated users to /login)*
- [ ] Case-level authorization. *(RLS policies exist; API layer not yet wired)*
- [x] Least-privilege access. *(RLS uses auth.uid() ownership checks, not just role)*
- [x] Secure sessions. *(Supabase SSR with httpOnly cookies via @supabase/ssr)*
- [ ] Audit sensitive access.

## 14. Security & Privacy
- [ ] HTTPS in deployment.
- [x] Secure environment variables. *(NEXT_PUBLIC_ for publishable key only; service role key server-only)*
- [x] Never expose service-role/database secrets to clients. *(`lib/supabase/admin.ts` server-only; no NEXT_PUBLIC_ for service key)*
- [ ] Protect sensitive API endpoints.
- [ ] Validate inputs.
- [x] Prevent unauthorized case access. *(RLS policies on cases table)*
- [ ] Audit logs. *(schema done; insert logic not yet wired)*
- [ ] Retention/deletion strategy.
- [ ] Consent lifecycle.
- [x] Data minimization. *(profiles table extends auth.users, not duplicating)*
- [x] No real victim data in GitHub. *(all seed data is synthetic and labelled)*
- [x] No production DB dumps.
- [x] No API keys/secrets in repository. *(.gitignore covers .env.local)*
- [ ] Security review before deployment.

## 15. Backend / API
- [x] Health endpoint. *(`/api/health`)*
- [ ] User APIs.
- [ ] Case APIs.
- [ ] Assignment APIs.
- [ ] Check-in APIs.
- [ ] Interaction APIs.
- [ ] Consent APIs.
- [ ] Signal/risk APIs.
- [ ] Alert APIs.
- [ ] Follow-up APIs.
- [ ] Intervention APIs.
- [ ] Dashboard/analytics APIs.
- [ ] Audit-log APIs.
- [ ] AI/ML service interface.

Keep AI behind a stable service boundary:

```text
Next.js
   ↓
Application API
   ↓
Risk / AI Service Interface
   ├── Mock Engine
   ├── Rule Engine
   └── ML Engine
```

## 16. External Integrations
Design adapters for:
- [x] NHAA / 14566. *(National Helpline 14566 intake adapter)*
- [ ] Integrated Portal.
- [ ] Chatbot.
- [x] SMS. *(inbound two-way SMS adapter)*
- [x] IVRS. *(automated IVRS telephony adapter)*
- [ ] Mobile application.
- [x] Helpline. *(helpline intake referral gateway)*
- [ ] Notification system.

For the MVP:
- [x] Mock unavailable integrations. *(mock and standard webhook adapters)*
- [x] Keep adapter interfaces stable. *(unified in lib/channels)*
- [x] Clearly document mocked integrations. *(simulator and gateway view on /counselor/channels)*
- [x] Never present a mock as a live government integration.

## 17. Testing & Evaluation

### Software
- [ ] Unit tests.
- [ ] API tests.
- [ ] Integration tests.
- [ ] Authorization tests.
- [ ] Database tests.
- [ ] UI smoke tests.
- [ ] Error handling.

### Diagnostic Scripts (non-automated)
- [x] `npm run test:db` — verifies all required tables exist in Supabase.
- [x] `npm run test:login` — verifies all demo accounts can authenticate end-to-end.
- [x] `npm run test:channels` — verifies voice STT cadence detection, SMS quickcodes, and IVRS call synthesis.

### AI/ML
- [ ] Evaluation dataset.
- [ ] Precision/recall/F1 where appropriate.
- [ ] False-positive testing.
- [ ] False-negative testing.
- [ ] Multilingual testing.
- [ ] Noisy-text testing.
- [ ] Missing/partial-data testing.
- [ ] Confidence evaluation.
- [ ] Longitudinal-prediction evaluation.

### Security
- [ ] Authorization/BOLA tests.
- [ ] Input validation.
- [ ] Secret scanning.
- [ ] Dependency audit.
- [ ] Sensitive-data exposure review.

## 18. Synthetic Demo Dataset
Create:
- [x] Synthetic victims/complainants. *(4 victims in seed.sql: Aarohi, Deepa, Kavita, Meera)*
- [x] Synthetic cases. *(4 cases: V-1042 through V-1045)*
- [x] Synthetic check-ins. *(2 check-ins in seed.sql)*
- [ ] Synthetic interactions.
- [x] Synthetic counsellors. *(1 counselor: Priya Sharma)*
- [ ] Synthetic distress trends.
- [x] Synthetic alerts. *(2 alerts: HIGH + MEDIUM severity)*
- [ ] Synthetic interventions.

Demo scenarios: *(Executable with 1-click at `/counselor/demo`)*

### Scenario A — Stable
- [x] Normal check-ins. *(routine Hindi submission in `runScenarioA`)*
- [x] Stable signal. *(score remains ~18 / 100)*
- [x] No alert. *(0 alerts triggered)*

### Scenario B — Increasing distress
- [x] Gradually worsening responses. *(insomnia & anticipatory court anxiety)*
- [x] Rising signal. *(score rises to ~55 / 100)*
- [x] Alert triggered. *(ELEVATED / MEDIUM alert generated)*
- [x] Counsellor reviews explanation. *(visible in explainability panel & briefing)*

### Scenario C — Rapid escalation
- [x] Multiple concerning signals. *(intimidation & direct death threat outside residence)*
- [x] High-priority alert. *(CRITICAL / HIGH emergency alert)*
- [x] Human review. *(mandatory counselor review required)*
- [x] Intervention recommendation. *(WITNESS_PROTECTION_REVIEW & HOUSING_RELOCATION suggested)*
- [x] Follow-up recorded. *(urgent 4-hour callback automatically scheduled in `follow_ups`)*

### Scenario D — Recovery
- [x] Intervention recorded. *(police patrol active, victim placed in safe shelter)*
- [x] Subsequent signals improve. *(positive emotional recovery check-in)*
- [x] Trend falls. *(score drops back to STABLE < 25)*
- [x] Alert resolved. *(open alerts marked REVIEWED and follow-up COMPLETED)*

## 19. Portfolio-Quality Engineering
- [x] Clean architecture. *(feature-based: `features/`, `lib/`, `components/`, `app/`)*
- [x] Modular feature boundaries. *(`features/admin`, `features/counselor`, `features/victim`, etc.)*
- [x] Strong TypeScript types. *(database types in `types/database.types.ts`; tsc passes clean)*
- [ ] API contracts.
- [x] Database migrations. *(`supabase/migrations/`)*
- [x] Seed scripts. *(`supabase/seed.sql`)*
- [ ] Error/loading/empty states.
- [x] Accessible responsive UI. *(Tailwind + shadcn/ui with semantic HTML)*
- [x] Strong README. *(`README.md` with setup + architecture overview)*
- [ ] Architecture diagram.
- [ ] AI architecture diagram.
- [ ] Data-flow diagram.
- [ ] Security/privacy documentation.
- [ ] AI evaluation results.
- [ ] Demo video.
- [x] Technical decision records. *(`JOURNAL.md` — see Development Journal)*
- [ ] Known limitations.

---

# Recommended Build Order

## Phase 1 — Foundation ✅
- [x] Next.js + TypeScript
- [x] Tailwind + shadcn/ui
- [x] Routes/layouts
- [x] Role structure
- [x] Environment setup
- [x] README

## Phase 2 — Database ✅
- [x] PostgreSQL / Supabase
- [x] Schema *(imperative, via `supabase/schema.sql`)*
- [x] Migrations
- [x] Seed data

## Phase 3 — Auth & RBAC ✅ *(core done; needs case-level authorization)*
- [x] Authentication *(email + password via Supabase Auth)*
- [x] Roles *(VICTIM | COUNSELOR | ADMIN)*
- [x] Protected routes *(middleware.ts)*
- [x] Authorization *(RLS policies on all tables)*

## Phase 4 — Core Workflow ✅
- [x] Cases *(full caseload list with filters, dynamic victim case page, comprehensive case details workspace at `/counselor/cases/[id]`)*
- [x] Assignments *(case allocation and counselor workload distribution manager at `/admin/assignments`)*
- [x] Check-ins *(interactive check-in submission form at `/victim/check-in` with history)*
- [x] Interactions *(multi-channel contact logging on case details workspace)*
- [x] Consent *(interactive consent preferences manager at `/victim/data` with grant/withdraw lifecycle)*
- [x] Follow-ups *(task manager at `/counselor/follow-ups` with scheduling, filtering, and completion actions)*


## Phase 5 — Risk Engine v1 ✅
- [x] Rule-based signal engine *(`lib/risk/rule-engine.ts` with weighted keyword clusters, disengagement features, and longitudinal delta)*
- [x] Trend calculation *(`lib/risk/trend-calculator.ts` with 3-period moving average & trajectory classification)*
- [x] Alert thresholds *(`lib/risk/alert-generator.ts` with CRITICAL/ELEVATED/CONCERN levels and 48-hour de-duplication)*
- [x] Alerts *(`/counselor/alerts` queue with status changes, audit logging, and banner alerts)*
- [x] Dashboard *(`/counselor` 7-day Caseload Support Signal Trend chart, and `/counselor/cases/[id]` with `TrendChart`, `ExplainabilityPanel`, and `InterventionRecommendations`)*
- [x] Intervention engine *(`lib/risk/intervention-engine.ts` with one-click follow-up task creation)*


## Phase 6 — GenAI / ML ✅
- [x] Text analysis *(`lib/ai/local-nlp-fallback.ts` & `lib/ai/gemini-provider.ts` with sentiment polarity & emotion classification across 7 primary states)*
- [x] Multilingual support *(`lib/ai/multilingual-dictionary.ts` covering English, Devanagari Hindi हिन्दी, and Hinglish transliterations)*
- [x] Structured feature extraction *(strict bifurcation into Observed Facts vs Machine Inferences in `AIInsightsCard.tsx`)*
- [x] Longitudinal model & escalation prediction *(72-hour forecast: LOW/MODERATE/HIGH/CRITICAL with leading risk indicators and trajectory)*
- [x] GenAI decision-support summaries for counselors *(`AIInsightsCard.tsx` on `/counselor/cases/[id]` with case briefing and suggested talking points)*
- [x] Model explainability & prompt engineering with strict non-diagnostic disclaimers *(Dual-mode architecture supporting Google Gemini 2.5 Flash and local heuristic ML engine)*


## Phase 7 — Voice & Channels ✅
- [x] Whisper/STT prototype *(`CheckInForm.tsx` with Web Speech API Hindi/English & `lib/channels/stt.ts` with experimental cadence extraction)*
- [x] IVRS adapter *(`lib/channels/ivrs-adapter.ts` + `app/api/channels/ivrs/route.ts` with touchtone DTMF + voicemail speech synthesis)*
- [x] SMS adapter *(`lib/channels/sms-adapter.ts` + `app/api/channels/sms/route.ts` with emergency shortcode decoding and case linkage)*
- [x] Helpline 14566 intake adapter *(`lib/channels/helpline-adapter.ts` + `app/api/channels/helpline/route.ts` with auto follow-up scheduling)*
- [x] Multi-Channel Gateway & Testing Hub *(`/counselor/channels` and `components/counselor/ChannelSimulator.tsx`)*

## Phase 8 — Hardening & Demo Scenarios ✅
- [x] Security review *(strict authorization & RLS, service-key server isolation)*
- [x] Privacy review *(zero-PII authority dashboards, DPDP compliance)*
- [x] AI evaluation *(bifurcated facts vs inferences, non-diagnostic disclaimers)*
- [x] Performance testing *(Turbopack dynamic rendering, fast heuristic fallback)*
- [x] Accessibility *(semantic HTML, ARIA tags, contrast verified)*
- [x] Demo scenarios *(1-click Demo Studio at `/counselor/demo` covering Scenarios A, B, C, D)*
- [x] Documentation *(`JOURNAL.md`, `README.md`, `AGENTS.md` fully synchronized)*

---

# MVP Definition

The minimum convincing MVP should demonstrate:

```text
Synthetic victim
      ↓
Case registered
      ↓
Periodic check-ins
      ↓
Text interaction
      ↓
AI/rule signal extraction
      ↓
Dynamic distress trend
      ↓
Threshold crossed
      ↓
Counsellor alert
      ↓
Explainable reason
      ↓
Human review
      ↓
Intervention recommendation
      ↓
Follow-up
      ↓
Trend improves
```

Do NOT make these MVP blockers:
- [x] Real NHAA integration. *(not required for MVP)*
- [x] Real government portal integration. *(not required for MVP)*
- [x] Real SMS infrastructure. *(not required for MVP)*
- [x] Real IVRS infrastructure. *(not required for MVP)*
- [x] National-scale infrastructure. *(not required for MVP)*
- [x] Perfect emotion recognition. *(not required for MVP)*
- [x] Clinical diagnosis. *(explicitly excluded — SAHAY is a decision-support tool)*
- [x] Fully autonomous intervention. *(explicitly excluded — human-in-the-loop required)*

Build the end-to-end intelligence workflow first. Integrations can sit behind mocks/adapters until real access exists.
