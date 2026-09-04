/**
 * /counselor/reports — Reports and exports.
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Reports" };

export default function CounselorReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Generate and export case reports and trend summaries.
      </p>
      <div className="mt-8">
        <ComingSoon plannedPhase="Phase 5 — Core UI" />
      </div>
    </div>
  );
}
