/**
 * /admin/assignments — Case assignment management
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Assignments" };

export default function AdminAssignmentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Assignments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Assign cases to counselors and manage workload distribution.
      </p>
      <div className="mt-8">
        <ComingSoon plannedPhase="Phase 5 — Core UI" />
      </div>
    </div>
  );
}
