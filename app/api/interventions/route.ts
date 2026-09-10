import { NextResponse } from "next/server";
import { suggestInterventions } from "@/lib/risk/intervention-engine";
import { getCheckInsByCaseId } from "@/lib/db/check-ins";
import { getRiskScoresByCaseId } from "@/lib/db/risk-scores";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("case_id");

    if (!caseId) {
      return NextResponse.json({ error: "case_id query parameter is required" }, { status: 400 });
    }

    const [checkIns, riskScores] = await Promise.all([
      getCheckInsByCaseId(caseId),
      getRiskScoresByCaseId(caseId),
    ]);

    const latestCheckIn = checkIns[0]?.response_text || "";
    const latestScore = riskScores[0]?.score ?? 20;

    const recommendations = suggestInterventions({
      distressScore: latestScore,
      recentText: latestCheckIn,
      trendTrajectory: latestScore > 50 ? "WORSENING" : "STABLE",
    });

    return NextResponse.json({ recommendations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to suggest interventions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, counselor_id, intervention_type, title, reason, due_days } = body;

    if (!case_id || !counselor_id || !intervention_type) {
      return NextResponse.json(
        { error: "case_id, counselor_id, and intervention_type are required fields" },
        { status: 400 }
      );
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (due_days || 1));

    const supabase = await createServerClient();
    const { data: followUp, error } = await supabase
      .from("follow_ups")
      .insert({
        case_id,
        counselor_id,
        title: title || `Action: ${intervention_type.replace(/_/g, " ")}`,
        description: reason || `Intervention action initiated for ${intervention_type}`,
        due_date: dueDate.toISOString().split("T")[0],
        status: "PENDING",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, followUp }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to action intervention";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
