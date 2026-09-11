"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireCaseAccess } from "@/lib/auth/case-access";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import type { InteractionChannel } from "@/types/database.types";

export interface InteractionActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function logInteractionAction(
  caseId: string,
  channel: InteractionChannel,
  summary: string,
  occurredAt?: string
): Promise<InteractionActionState> {
  try {
    const { profile } = await requireCaseAccess(caseId);

    if (!summary || summary.trim().length === 0) {
      return { error: "Please enter a summary of the interaction." };
    }

    const { analyzeCheckInWithOllama } = await import("@/lib/ai/ollama");
    const aiAnalysis = await analyzeCheckInWithOllama(summary);
    
    const extractedSignals = aiAnalysis?.signals || [];
    const isImmediateDanger = aiAnalysis?.immediate_danger || false;

    const supabase = await createServerClient();
    
    // Fetch previous interactions to determine trend (using either check-ins or interactions combined)
    const { data: previousCheckIns } = await supabase
      .from("check_ins")
      .select("distress_score, submitted_at")
      .eq("case_id", caseId)
      .not("distress_score", "is", null)
      .order("submitted_at", { ascending: false });
      
    const previousScores = (previousCheckIns || []).map(ci => ci.distress_score as number);
    let daysSinceLast = 0;
    if (previousCheckIns && previousCheckIns.length > 0) {
      const lastSessionMs = new Date(previousCheckIns[0].submitted_at).getTime();
      daysSinceLast = (Date.now() - lastSessionMs) / (1000 * 3600 * 24);
    }

    const { evaluateDeterministicRisk } = await import("@/lib/risk/formulas");
    const riskEval = evaluateDeterministicRisk(extractedSignals, previousScores, daysSinceLast);
    const calculatedLevel = riskEval.severity.toLowerCase();

    const { data: newInteraction, error } = await supabase
      .from("interactions")
      .insert({
        case_id: caseId,
        channel,
        summary: summary.trim(),
        occurred_at: occurredAt || new Date().toISOString(),
        recorded_by_id: profile.id,
        distress_level: calculatedLevel,
        distress_score: riskEval.score,
        immediate_danger: isImmediateDanger,
        distress_signals: extractedSignals,
        distress_reason: aiAnalysis?.reason || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase interaction insert error:", error);
      throw error;
    }

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "LOG_INTERACTION",
      resource_type: "interaction",
      resource_id: newInteraction.id,
      metadata: { case_id: caseId, channel },
    }).catch((e) => console.error("Audit log error:", e));

    if (calculatedLevel === "critical" || isImmediateDanger || riskEval.alertTriggered) {
      try {
        const { checkAndTriggerAlert } = await import("@/lib/risk/alert-generator");
        
        const detailedDescription = `[COUNSELOR SESSION] CRITICAL DISTRESS DETECTED
Query: "${summary}"
AI Analysis:
- Level: ${calculatedLevel.toUpperCase()}
- Score: ${riskEval.score}
- Immediate Danger: ${isImmediateDanger ? 'YES' : 'NO'}
- Signals: ${extractedSignals.join(', ') || 'None'}
- Reason: ${aiAnalysis?.reason || 'Calculated mathematical trigger'}
- Trend: ${riskEval.trajectory.direction} (Δ ${riskEval.trajectory.delta})`;

        await checkAndTriggerAlert({
          caseId,
          severity: isImmediateDanger ? "HIGH" : (riskEval.alertSeverity || "MEDIUM"),
          signalDescription: detailedDescription,
          actorId: profile.id
        });
      } catch (alertErr) {
        console.error("AI Alert trigger error:", alertErr);
      }
    }

    revalidatePath(`/counselor/cases/${caseId}`);

    return { success: true, message: "Interaction recorded and scored successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record interaction.";
    return { error: message };
  }
}
