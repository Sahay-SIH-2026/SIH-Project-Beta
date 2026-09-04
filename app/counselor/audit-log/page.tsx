/**
 * /counselor/audit-log — Audit log for counselor actions.
 */

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Log" };

const DEMO_EVENTS = [
  { actor: "Counselor (Demo)", action: "Viewed case",          resource: "Case V-1042", timestamp: "2026-09-05 09:12" },
  { actor: "Counselor (Demo)", action: "Reviewed alert",       resource: "Alert A-001", timestamp: "2026-09-05 09:05" },
  { actor: "Counselor (Demo)", action: "Added interaction note", resource: "Case V-1043", timestamp: "2026-09-04 17:30" },
  { actor: "Counselor (Demo)", action: "Marked follow-up done", resource: "Case V-1042", timestamp: "2026-09-04 15:00" },
] as const;

export default function CounselorAuditLogPage() {
  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Synthetic data only.</strong> These audit events are illustrative
        and do not reflect real system activity.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A record of actions taken within the counselor portal.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              {["Actor", "Action", "Resource", "Timestamp"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DEMO_EVENTS.map((event, i) => (
              <tr key={i} className="hover:bg-secondary/30">
                <td className="px-4 py-3 text-foreground">{event.actor}</td>
                <td className="px-4 py-3 text-foreground">{event.action}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{event.resource}</td>
                <td className="px-4 py-3 text-muted-foreground">{event.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
