/**
 * /admin/assignments — Administrative Case Allocation & Workload Distribution
 */

import type { Metadata } from "next";
import { getCases } from "@/lib/db/cases";
import { listProfilesByRole } from "@/lib/db/profiles";
import { CaseAssignmentManager } from "@/components/admin/CaseAssignmentManager";
import type { CaseRow, ProfileRow } from "@/types/database.types";

import { CreateVictimForm } from "@/components/management/CreateVictimForm";

export const metadata: Metadata = { title: "Case Assignments" };

type CaseWithRelations = CaseRow & {
  victim?: { id: string; display_name: string } | null;
  counselor?: { id: string; display_name: string } | null;
};

export default async function AdminAssignmentsPage() {
  let cases: CaseWithRelations[] = [];
  let counselors: ProfileRow[] = [];

  try {
    const [casesData, counselorProfiles] = await Promise.all([
      getCases().catch(() => []),
      listProfilesByRole("COUNSELOR").catch(() => []),
    ]);

    cases = (casesData as unknown as CaseWithRelations[]) || [];
    counselors = (counselorProfiles as unknown as ProfileRow[]) || [];
  } catch (e) {
    console.error("Error loading admin assignment data:", e);
  }

  return (
    <div className="space-y-6">
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Administrative Authority:</strong> Assigning a case grants the authorized counselor access to confidential notes and check-in history.
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Case Assignments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Allocate incoming victim cases to certified support counselors and monitor district caseloads.
          </p>
        </div>
        <CreateVictimForm isAdmin={true} counselors={counselors} />
      </div>

      <CaseAssignmentManager
        initialCases={cases}
        counselors={counselors.map((c) => ({ id: c.id, display_name: c.display_name }))}
      />
    </div>
  );
}
