import { NextResponse } from "next/server";
import { getRiskScoresByCaseId } from "@/lib/db/risk-scores";
import { evaluateCheckIn, calculateLongitudinalTrend } from "@/lib/risk";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("case_id");

    if (!caseId) {
      return NextResponse.json({ error: "case_id query parameter is required" }, { status: 400 });
    }

    const scores = await getRiskScoresByCaseId(caseId);
    const trendAnalysis = calculateLongitudinalTrend(scores.map((s) => ({
      score: s.score,
      timestamp: s.computed_at,
    })));

    return NextResponse.json({
      scores,
      trend: trendAnalysis,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch risk trajectory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, text, victim_id } = body;

    if (!case_id || !text || !victim_id) {
      return NextResponse.json(
        { error: "case_id, text, and victim_id are required fields" },
        { status: 400 }
      );
    }

    const evaluation = await evaluateCheckIn(case_id, text, victim_id);
    return NextResponse.json({ evaluation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to evaluate risk";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
