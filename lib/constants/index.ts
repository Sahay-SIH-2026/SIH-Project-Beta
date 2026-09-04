/**
 * SAHAY Application Constants
 * @phase 1 — Skeleton
 */

export const APP_NAME = "SAHAY" as const;
export const APP_TAGLINE = "Victim Support & Well-being Continuity Platform" as const;
export const APP_DESCRIPTION =
  "A human-centered platform that helps authorized support workers identify changing support needs over time." as const;

/** The current development phase */
export const CURRENT_PHASE = 1 as const;
export const CURRENT_PHASE_LABEL = "Phase 1 — Skeleton" as const;

/**
 * Planned development phases.
 * Update as phases are completed.
 */
export const PHASES = [
  { phase: 1, label: "Skeleton",                  status: "current"   },
  { phase: 2, label: "Database",                  status: "upcoming"  },
  { phase: 3, label: "Authentication + RBAC",     status: "upcoming"  },
  { phase: 4, label: "API",                        status: "upcoming"  },
  { phase: 5, label: "Core UI",                    status: "upcoming"  },
  { phase: 6, label: "Risk Engine",                status: "upcoming"  },
  { phase: 7, label: "ML Integration",             status: "upcoming"  },
  { phase: 8, label: "Voice + Notifications",     status: "upcoming"  },
] as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  home: "/",

  victim: {
    root:    "/victim",
    case:    "/victim/case",
    checkIn: "/victim/check-in",
    data:    "/victim/data",
    support: "/victim/support",
  },

  counselor: {
    root:     "/counselor",
    cases:    "/counselor/cases",
    alerts:   "/counselor/alerts",
    followUps:"/counselor/follow-ups",
    reports:  "/counselor/reports",
    auditLog: "/counselor/audit-log",
  },

  admin: {
    root:        "/admin",
    users:       "/admin/users",
    assignments: "/admin/assignments",
    auditLog:    "/admin/audit-log",
  },

  api: {
    health: "/api/health",
  },
} as const;

// ─── Demo data — Synthetic only, no real victim information ───────────────────

/**
 * Synthetic case reference numbers used in demo UI.
 * These do not correspond to real cases.
 */
export const DEMO_CASE_REFS = [
  "V-1042",
  "V-1043",
  "V-1044",
  "V-1045",
] as const;

// ─── UI Labels ────────────────────────────────────────────────────────────────

export const ALERT_SIGNAL_LABEL = "Support review recommended" as const;

/**
 * Disclaimer shown alongside any distress-signal visualisation.
 */
export const DISTRESS_SIGNAL_DISCLAIMER =
  "Illustrative support-prioritisation signal — not a clinical diagnosis. Human review is mandatory." as const;
