/**
 * /counselor/follow-ups — Follow-up task list.
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Follow-ups" };

export default function CounselorFollowUpsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Follow-ups</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Scheduled and overdue follow-up actions for your cases.
      </p>
      <div className="mt-8">
        <ComingSoon plannedPhase="Phase 5 — Core UI" />
      </div>
    </div>
  );
}
