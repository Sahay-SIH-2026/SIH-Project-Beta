/**
 * /counselor/alerts — Support alerts for counselors.
 *
 * Language: "Support review recommended"
 * Never: "AI diagnosed" / clinical language.
 */

import type { Metadata } from "next";
import { ALERT_SIGNAL_LABEL, DISTRESS_SIGNAL_DISCLAIMER, DEMO_CASE_REFS } from "@/lib/constants";

export const metadata: Metadata = { title: "Alerts" };

const DEMO_ALERTS = [
  { id: "a1", caseRef: DEMO_CASE_REFS[1], status: "New",          severity: "High",   raisedAt: "2 hours ago"   },
  { id: "a2", caseRef: DEMO_CASE_REFS[0], status: "Under Review", severity: "Medium", raisedAt: "Yesterday"     },
  { id: "a3", caseRef: DEMO_CASE_REFS[3], status: "Reviewed",     severity: "Low",    raisedAt: "3 days ago"    },
] as const;

const STATUS_CLASSES: Record<string, string> = {
  New:            "status-badge-new",
  "Under Review": "status-badge-review",
  Reviewed:       "status-badge-reviewed",
};

const SEVERITY_CLASSES: Record<string, string> = {
  High:   "status-badge-urgent",
  Medium: "status-badge-review",
  Low:    "status-badge-reviewed",
};

export default function CounselorAlertsPage() {
  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Illustrative only.</strong> {DISTRESS_SIGNAL_DISCLAIMER}
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cases where a support review has been flagged.
      </p>

      <div className="mt-6 space-y-4">
        {DEMO_ALERTS.map(({ id, caseRef, status, severity, raisedAt }) => (
          <div
            key={id}
            id={`alert-${id}`}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {caseRef}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {ALERT_SIGNAL_LABEL}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Raised {raisedAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEVERITY_CLASSES[severity] ?? ""}`}
                >
                  {severity}
                </span>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status] ?? ""}`}
                >
                  {status}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="cursor-not-allowed rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground opacity-40"
              >
                Mark as Reviewed
              </button>
              <span className="flex items-center text-xs text-muted-foreground">
                (Action — Phase 5)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
