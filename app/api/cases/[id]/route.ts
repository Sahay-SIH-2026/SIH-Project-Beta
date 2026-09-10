import { NextResponse } from "next/server";
import { getCaseById, updateCaseStatus, assignCase } from "@/lib/db/cases";
import { getCheckInsByCaseId } from "@/lib/db/check-ins";
import { getInteractionsByCaseId } from "@/lib/db/interactions";
import { getRiskScoresByCaseId } from "@/lib/db/risk-scores";
import type { CaseStatus } from "@/types/database.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const caseRecord = await getCaseById(id);

    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const [checkIns, interactions, riskScores] = await Promise.all([
      getCheckInsByCaseId(id).catch(() => []),
      getInteractionsByCaseId(id).catch(() => []),
      getRiskScoresByCaseId(id).catch(() => []),
    ]);

    return NextResponse.json({
      case: caseRecord,
      checkIns,
      interactions,
      riskScores,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch case dossier";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, counselor_id } = body;

    let updatedCase;
    if (status) {
      updatedCase = await updateCaseStatus(id, status as CaseStatus);
    }
    if (counselor_id !== undefined) {
      updatedCase = await assignCase(id, counselor_id);
    }

    return NextResponse.json({ case: updatedCase });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
