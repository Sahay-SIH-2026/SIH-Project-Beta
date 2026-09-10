import { NextResponse } from "next/server";
import { assignCase, getCases } from "@/lib/db/cases";
import { listProfilesByRole } from "@/lib/db/profiles";

export async function GET() {
  try {
    const [cases, counselors] = await Promise.all([
      getCases(),
      listProfilesByRole("COUNSELOR"),
    ]);

    const workloadCounts: Record<string, number> = {};
    counselors.forEach((c) => {
      workloadCounts[c.id] = 0;
    });

    cases.forEach((caseItem) => {
      if (caseItem.counselor_id && workloadCounts[caseItem.counselor_id] !== undefined) {
        workloadCounts[caseItem.counselor_id]++;
      }
    });

    const counselorWorkloads = counselors.map((c) => ({
      id: c.id,
      displayName: c.display_name,
      activeCases: workloadCounts[c.id] || 0,
    }));

    return NextResponse.json({ workloads: counselorWorkloads });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch assignments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, counselor_id } = body;

    if (!case_id || !counselor_id) {
      return NextResponse.json(
        { error: "case_id and counselor_id are required fields" },
        { status: 400 }
      );
    }

    const updatedCase = await assignCase(case_id, counselor_id);
    return NextResponse.json({ success: true, case: updatedCase });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
