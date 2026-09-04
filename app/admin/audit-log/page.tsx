/**
 * /admin/audit-log — System-wide audit log
 */

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Log" };

const DEMO_EVENTS = [
  { actor: "Admin (Demo)",     role: "ADMIN",     action: "Created user account",  resource: "User U-001",  timestamp: "2026-09-05 08:00" },
  { actor: "Counselor (Demo)", role: "COUNSELOR", action: "Assigned to case",      resource: "Case V-1042", timestamp: "2026-09-05 07:45" },
  { actor: "Admin (Demo)",     role: "ADMIN",     action: "Modified role",          resource: "User U-002",  timestamp: "2026-09-04 16:30" },
  { actor: "Counselor (Demo)", role: "COUNSELOR", action: "Reviewed alert",         resource: "Alert A-001", timestamp: "2026-09-04 15:10" },
  { actor: "Admin (Demo)",     role: "ADMIN",     action: "Exported audit log",     resource: "System",      timestamp: "2026-09-03 11:00" },
] as const;

export default function AdminAuditLogPage() {
  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Synthetic data only.</strong> Illustrative audit events — not
        connected to a real system.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        System-wide record of all significant actions.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              {["Actor", "Role", "Action", "Resource", "Timestamp"].map((h) => (
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
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {event.role}
                  </span>
                </td>
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
