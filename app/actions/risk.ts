"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { logAuditEvent } from "@/lib/db/audit";
import { evaluateCheckIn } from "@/lib/risk";
import { revalidatePath } from "next/cache";

export interface RiskActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function markRiskScoreReviewedAction(
  scoreId: string,
  caseId: string
): Promise<RiskActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
      return { error: "Unauthorized: only support counselors can verify signals." };
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from("risk_scores")
      .update({ human_reviewed: true })
      .eq("id", scoreId);

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "REVIEW_DISTRESS_SIGNAL",
      resource_type: "risk_score",
      resource_id: scoreId,
      metadata: { case_id: caseId },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath(`/counselor/cases/${caseId}`);
    revalidatePath("/counselor");

    return {
      success: true,
      message: "Distress signal marked as human-reviewed.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to review score.";
    return { error: message };
  }
}

export async function triggerManualEvaluationAction(
  caseId: string
): Promise<RiskActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
      return { error: "Unauthorized: only staff can trigger re-evaluation." };
    }

    const supabase = await createServerClient();
    const { data: latestCheckIn } = await supabase
      .from("check_ins")
      .select("response_text, victim_id")
      .eq("case_id", caseId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestCheckIn || !latestCheckIn.response_text) {
      return { error: "No check-in text available to evaluate." };
    }

    const result = await evaluateCheckIn(
      caseId,
      latestCheckIn.response_text,
      latestCheckIn.victim_id
    );

    revalidatePath(`/counselor/cases/${caseId}`);
    revalidatePath("/counselor");
    revalidatePath("/counselor/alerts");

    return {
      success: true,
      message: `Re-evaluation complete. Current signal: ${result.score}/100 (${result.level}).`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Evaluation failed.";
    return { error: message };
  }
}
