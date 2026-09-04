/**
 * /counselor — Counselor portal dashboard
 */

import type { Metadata } from "next";
import { DEMO_CASE_REFS, DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

const KPI_CARDS = [
  { id: "kpi-assigned",  label: "Assigned Cases",        value: "4",  note: "Demo data" },
  { id: "kpi-review",    label: "Cases Needing Review",  value: "2",  note: "Demo data" },
  { id: "kpi-checkins",  label: "Recent Check-ins",       value: "7",  note: "Last 7 days" },
  { id: "kpi-followups", label: "Follow-ups Due",         value: "3",  note: "This week" },
] as const;

export default function CounselorDashboardPage() {
  return (
    <div>
      {/* Prototype notice */}
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Prototype — synthetic data only.</strong> No real case or victim
        information is shown. All figures are illustrative.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of your assigned cases and pending actions.
      </p>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map(({ id, label, value, note }) => (
          <div
            key={id}
            id={id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      {/* Trend chart placeholder */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Support Signal Trend
          </h2>
          <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
            Illustrative
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {DISTRESS_SIGNAL_DISCLAIMER}
        </p>

        {/* Chart area placeholder */}
        <div
          aria-label="Chart placeholder — not yet implemented"
          className="mt-4 flex h-48 items-center justify-center rounded border border-dashed border-border bg-secondary/50"
        >
          <p className="text-sm text-muted-foreground">
            Chart — Coming in Phase 5
          </p>
        </div>

        {/* Synthetic bar chart hint */}
        <div className="mt-4 flex items-end gap-1.5 px-2" aria-hidden="true">
          {[30, 45, 38, 60, 55, 70, 52].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/20"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between px-2 text-xs text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>

      {/* Cases at a glance */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">
          My Cases at a Glance
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {DEMO_CASE_REFS.map((ref) => (
            <li
              key={ref}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="font-mono font-medium text-foreground">{ref}</span>
              <span className="text-xs text-muted-foreground">Active</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
