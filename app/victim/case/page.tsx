/**
 * /victim/case — Victim case detail page
 */

import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Case" };

export default function VictimCasePage() {
  return (
    <div className="sahay-container py-8">
      <h1 className="text-2xl font-semibold text-foreground">My Case</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your case information is shown below.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Case ID */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Case Reference
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            V-1042
          </p>
        </div>

        {/* Status */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Active
          </p>
        </div>

        {/* Assigned support contact */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assigned Support Contact
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            — To be assigned by your support organisation —
          </p>
        </div>

        {/* Important updates */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Important Updates
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            No updates at this time.
          </p>
        </div>
      </div>
    </div>
  );
}
