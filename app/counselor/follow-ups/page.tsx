/**
 * /counselor/follow-ups — Follow-Up Task Management Workspace
 */

import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getFollowUps } from "@/lib/db/follow-ups";
import { getCases } from "@/lib/db/cases";
import {
  FollowUpListView,
  type ExtendedFollowUp,
} from "@/components/counselor/FollowUpListView";

export const metadata: Metadata = { title: "Follow-Up Tasks" };

interface CaseOption {
  id: string;
  case_ref: string;
  victim?: { display_name: string } | null;
}

export default async function CounselorFollowUpsPage() {
  const profile = await getCurrentProfile();
  let followUps: ExtendedFollowUp[] = [];
  let availableCases: Array<{ id: string; case_ref: string; victimName: string }> = [];

  if (profile) {
    try {
      const [fuData, casesData] = await Promise.all([
        getFollowUps({ counselorId: profile.id }).catch(() => []),
        getCases().catch(() => []),
      ]);

      followUps = (fuData as unknown as ExtendedFollowUp[]) || [];
      const rawCases = (casesData as unknown as CaseOption[]) || [];
      availableCases = rawCases.map((c) => ({
        id: c.id,
        case_ref: c.case_ref,
        victimName: c.victim?.display_name || "Unlinked Client",
      }));
    } catch (e) {
      console.error("Error loading follow-ups data:", e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Synthetic data only.</strong> Follow-ups and schedules are demonstration data.
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Follow-Up Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track scheduled interventions, legal aid referrals, and wellness consultations across your assigned cases.
        </p>
      </div>

      <FollowUpListView
        initialFollowUps={followUps}
        availableCases={availableCases}
      />
    </div>
  );
}
