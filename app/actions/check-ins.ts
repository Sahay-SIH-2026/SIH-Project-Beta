"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import { analyzeCheckInWithOllama } from "@/lib/ai/ollama";

export interface CheckInActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function submitCheckInAction(
  _prevState: CheckInActionState | undefined,
  formData: FormData
): Promise<CheckInActionState> {
  const responseText = formData.get("responseText")?.toString().trim();
  const voiceInputUsed = formData.get("voiceInputUsed") === "true";

  if (!responseText) {
    return { error: "Please write a response before submitting." };
  }

  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "You must be signed in to submit a check-in." };
    }

    if (profile.role !== "VICTIM") {
      return { error: "Only victims or complainants can submit check-ins." };
    }

    const supabase = await createServerClient();

    // Find the victim's case
    const { data: caseRecord, error: caseError } = await supabase
      .from("cases")
      .select("id")
      .eq("victim_id", profile.id)
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (caseError) throw caseError;

    if (!caseRecord) {
      return {
        error: "No active case was found for your account. Please contact your support worker.",
      };
    }

    // Call Ollama local distress integration (Feature extraction only)
    const aiAnalysis = await analyzeCheckInWithOllama(responseText);

    const extractedSignals = aiAnalysis?.signals || [];
    const isImmediateDanger = aiAnalysis?.immediate_danger || false;

    // Fetch previous check_ins to determine trend and disengagement penalty
    const { data: previousCheckIns } = await supabase
      .from("check_ins")
      .select("distress_score, submitted_at")
      .eq("case_id", caseRecord.id)
      .not("distress_score", "is", null)
      .order("submitted_at", { ascending: false });

    const previousScores = (previousCheckIns || []).map(ci => ci.distress_score as number);
    let daysSinceLast = 0;
    if (previousCheckIns && previousCheckIns.length > 0) {
      const lastCheckInMs = new Date(previousCheckIns[0].submitted_at).getTime();
      daysSinceLast = (Date.now() - lastCheckInMs) / (1000 * 3600 * 24);
    }

    const { evaluateDeterministicRisk } = await import("@/lib/risk/formulas");
    const riskEval = evaluateDeterministicRisk(extractedSignals, previousScores, daysSinceLast);

    const calculatedLevel = riskEval.severity.toLowerCase();

    // Insert check-in record alongside deterministic AI evaluation
    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .insert({
        case_id: caseRecord.id,
        victim_id: profile.id,
        response_text: responseText,
        voice_input_used: voiceInputUsed,
        distress_level: calculatedLevel,
        distress_score: riskEval.score,
        immediate_danger: isImmediateDanger,
        distress_signals: extractedSignals,
        distress_reason: aiAnalysis?.reason || null,
      })
      .select()
      .single();

    if (checkInError) {
      console.error("Supabase check_ins insert error:", checkInError);
      throw checkInError;
    }

    // Log audit event
    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "SUBMIT_CHECK_IN",
      resource_type: "check_in",
      resource_id: checkIn.id,
      metadata: { case_id: caseRecord.id, voice_input_used: voiceInputUsed },
    }).catch((e) => console.error("Audit log error:", e));

    // If AI flagged critical danger or mathematical threshold crossed
    if (calculatedLevel === "critical" || isImmediateDanger || riskEval.alertTriggered) {
      try {
        const { checkAndTriggerAlert } = await import("@/lib/risk/alert-generator");
        
        const detailedDescription = `[URGENT] CRITICAL DISTRESS DETECTED
Query: "${responseText}"

AI Analysis:
- Level: ${calculatedLevel.toUpperCase()}
- Score: ${riskEval.score}
- Immediate Danger: ${isImmediateDanger ? 'YES' : 'NO'}
- Signals: ${extractedSignals.join(', ') || 'None'}
- Reason: ${aiAnalysis?.reason || 'Calculated mathematical trigger'}
- Trend: ${riskEval.trajectory.direction} (Δ ${riskEval.trajectory.delta})`;

        await checkAndTriggerAlert({
          caseId: caseRecord.id,
          severity: isImmediateDanger ? "HIGH" : (riskEval.alertSeverity || "MEDIUM"),
          signalDescription: detailedDescription,
          actorId: profile.id
        });
      } catch (alertErr) {
        console.error("AI Alert trigger error:", alertErr);
      }
    }

    revalidatePath("/victim");
    revalidatePath("/victim/check-in");
    revalidatePath("/counselor");
    revalidatePath("/counselor/alerts");
    revalidatePath("/counselor/cases");
    revalidatePath(`/counselor/cases/${caseRecord.id}`);

    return {
      success: true,
      message: "Thank you for sharing. Your check-in has been privately recorded for your support team.",
    };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit check-in.";
    return { error: message };
  }
}
