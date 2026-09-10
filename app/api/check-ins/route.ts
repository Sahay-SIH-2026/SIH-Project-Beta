import { NextResponse } from "next/server";
import { getCheckInsByCaseId, createCheckIn } from "@/lib/db/check-ins";
import { evaluateCheckIn } from "@/lib/risk";
import { logAuditEvent } from "@/lib/db/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("case_id");

    if (!caseId) {
      return NextResponse.json({ error: "case_id query parameter is required" }, { status: 400 });
    }

    const checkIns = await getCheckInsByCaseId(caseId);
    return NextResponse.json({ checkIns });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch check-ins";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, victim_id, response_text, voice_input_used } = body;

    if (!case_id || !victim_id || !response_text) {
      return NextResponse.json(
        { error: "case_id, victim_id, and response_text are required fields" },
        { status: 400 }
      );
    }

    // 1. Insert check-in record
    const checkIn = await createCheckIn({
      case_id,
      victim_id,
      response_text,
      voice_input_used: Boolean(voice_input_used),
    });

    // 2. Evaluate risk using Risk Engine
    let riskEvaluation = null;
    try {
      riskEvaluation = await evaluateCheckIn(case_id, response_text, victim_id);
    } catch (riskErr) {
      console.error("Risk evaluation error:", riskErr);
    }

    // 3. Log audit event
    await logAuditEvent({
      actor_id: victim_id,
      actor_role: "VICTIM",
      action: "SUBMIT_CHECK_IN",
      resource_type: "check_in",
      resource_id: checkIn.id,
      metadata: { case_id, voice_input_used: Boolean(voice_input_used) },
    }).catch(() => null);

    return NextResponse.json(
      {
        checkIn,
        riskEvaluation: riskEvaluation
          ? {
              score: riskEvaluation.score,
              level: riskEvaluation.level,
              alertTriggered: riskEvaluation.alertTriggered,
              alertSeverity: riskEvaluation.alertSeverity,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit check-in";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
