/**
 * /counselor/audit-log — Real Audit Log for Counselor Actions
 */

import type { Metadata } from "next";
import { getAuditLogs } from "@/lib/db/audit";
import { formatDate } from "@/lib/utils";
import type { AuditLogRow } from "@/types/database.types";

export const metadata: Metadata = { title: "Audit Log" };

type AuditLogWithActor = AuditLogRow & {
  actor?: { id: string; display_name: string; role: string } | null;
};

export default async function CounselorAuditLogPage() {
  let logs: AuditLogWithActor[] = [];

  try {
    const data = await getAuditLogs(50);
    logs = (data as unknown as AuditLogWithActor[]) || [];
  } catch (e) {
    console.error("Error loading counselor audit logs:", e);
  }

  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Audit Trail:</strong> Immutable chronological log of recent actions recorded by the system.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Activity &amp; Audit Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review immutable records of case reviews, interactions logged, alerts acknowledged, and follow-ups updated.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resource
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                  No audit events recorded yet. Actions taken across the portal will be logged here.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/30 transition">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {log.actor?.display_name || "System"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground font-mono text-xs">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {log.resource_type}:{log.resource_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
