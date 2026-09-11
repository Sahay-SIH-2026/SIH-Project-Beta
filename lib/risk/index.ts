import { createServerClient } from "@/lib/supabase/server";
import { evaluateSignalRules } from "./rule-engine";
import { checkAndTriggerAlert } from "./alert-generator";
import type { EvaluationResult } from "./types";
import { analyzeCheckInWithOllama } from "../ai/ollama";

export * from "./types";
export * from "./rule-engine";
export * from "./trend-calculator";
export * from "./intervention-engine";
export * from "./alert-generator";

export async function evaluateCheckIn(
  caseId: string,
  text: string,
  victimId: string
): Promise<EvaluationResult> {
  const supabase = await createServerClient();

  // 1. Fetch previous risk scores for longitudinal comparison
  const { data: pastScores } = await supabase
    .from("risk_scores")
    .select("score, computed_at")
    .eq("case_id", caseId)
    .order("computed_at", { ascending: false })
    .limit(5);

  const previousScores = (pastScores || []).map((s) => s.score);

  // 2. Fetch previous check-in to compute time delta
  const { data: pastCheckIns } = await supabase
    .from("check_ins")
    .select("submitted_at")
    .eq("case_id", caseId)
    .order("submitted_at", { ascending: false })
    .limit(2);

  let daysSinceLastCheckIn = 1;
  if (pastCheckIns && pastCheckIns.length > 1) {
    const prevDate = new Date(pastCheckIns[1].submitted_at).getTime();
    const currDate = new Date(pastCheckIns[0].submitted_at).getTime();
    daysSinceLastCheckIn = Math.max(1, Math.round((currDate - prevDate) / (1000 * 3600 * 24)));
  }

  // 3. Evaluate baseline rules
  const result = evaluateSignalRules({
    currentText: text,
    previousScores,
    daysSinceLastCheckIn,
  });

  // 4. Persist computed risk score to database
  const { error: insertScoreError } = await supabase
    .from("risk_scores")
    .insert({
      case_id: caseId,
      score: result.score,
      signal_reason: result.signalReason,
      human_reviewed: false,
    });

  if (insertScoreError) {
    console.error("Failed to insert computed risk score:", insertScoreError);
  }

  // 5. Trigger early warning alert if threshold crossed
  if (result.alertTriggered && result.alertSeverity) {
    await checkAndTriggerAlert({
      caseId,
      severity: result.alertSeverity,
      signalDescription: result.signalReason,
      actorId: victimId,
    }).catch((e) => console.error("Alert trigger error:", e));
  }

  return result;
}
