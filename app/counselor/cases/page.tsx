/**
 * /counselor/cases — Case list for the counselor.
 */

import type { Metadata } from "next";
import { DEMO_CASE_REFS } from "@/lib/constants";

export const metadata: Metadata = { title: "Cases" };

const DEMO_CASES = [
  { ref: DEMO_CASE_REFS[0], status: "Active",        lastCheckin: "2 hours ago",  priority: "Medium" },
  { ref: DEMO_CASE_REFS[1], status: "Under Review",  lastCheckin: "Yesterday",    priority: "High"   },
  { ref: DEMO_CASE_REFS[2], status: "Active",        lastCheckin: "3 days ago",   priority: "Low"    },
  { ref: DEMO_CASE_REFS[3], status: "Active",        lastCheckin: "5 hours ago",  priority: "Medium" },
] as const;

const PRIORITY_CLASSES: Record<string, string> = {
  High:   "status-badge-urgent",
  Medium: "status-badge-review",
  Low:    "status-badge-reviewed",
};

export default function CounselorCasesPage() {
  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Synthetic data only.</strong> Case references do not correspond
        to real individuals.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Cases</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your assigned cases are listed below.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              {["Case Ref", "Status", "Last Check-in", "Priority", "Action"].map((h) => (
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
            {DEMO_CASES.map(({ ref, status, lastCheckin, priority }) => (
              <tr key={ref} className="hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono font-medium text-foreground">
                  {ref}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{status}</td>
                <td className="px-4 py-3 text-muted-foreground">{lastCheckin}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_CLASSES[priority] ?? ""}`}
                  >
                    {priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Detail view — Phase 5
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
