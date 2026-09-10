import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateCheckIn } from "@/lib/risk";
import { logAuditEvent } from "@/lib/db/audit";
import type { IVRSPayload, ChannelIngestionResult } from "./types";

/**
 * Handles automated Interactive Voice Response System (IVRS) telephone calls,
 * combining touchtone (DTMF) health ratings with recorded speech transcripts.
 */
export async function ingestIVRSCall(payload: IVRSPayload): Promise<ChannelIngestionResult> {
  const supabase = createAdminClient();
  const callerPhone = payload.callerPhone.trim();

  // 1. Resolve case & victim
  let caseId = payload.caseId;
  let victimId: string | undefined;

  if (caseId) {
    const { data: caseRec } = await supabase
      .from("cases")
      .select("id, victim_id")
      .eq("id", caseId)
      .maybeSingle();

    if (caseRec) {
      victimId = caseRec.victim_id;
    }
  }

  // Fallback to demo case if caseId not provided or invalid
  if (!caseId || !victimId) {
    const { data: fallbackCase } = await supabase
      .from("cases")
      .select("id, victim_id")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackCase) {
      caseId = fallbackCase.id;
      victimId = fallbackCase.victim_id;
    }
  }

  if (!caseId || !victimId) {
    return {
      success: false,
      channel: "IVRS",
      caseId: caseId || "UNKNOWN",
      alertTriggered: false,
      message: `No active case found for IVRS caller ${callerPhone}`,
    };
  }

  // 2. Synthesize DTMF rating and speech transcript
  let dtmfNarrative = "";
  if (payload.dtmfScore !== undefined) {
    switch (payload.dtmfScore) {
      case 1:
        dtmfNarrative = "DTMF Keypress 1: Critical distress / Immediate help requested.";
        break;
      case 2:
        dtmfNarrative = "DTMF Keypress 2: High concern / Feeling unsafe or agitated.";
        break;
      case 3:
        dtmfNarrative = "DTMF Keypress 3: Moderate concern / Managing with difficulty.";
        break;
      case 4:
        dtmfNarrative = "DTMF Keypress 4: Mild distress / Coping adequately.";
        break;
      case 5:
        dtmfNarrative = "DTMF Keypress 5: Stable / Feeling safe and calm.";
        break;
      default:
        dtmfNarrative = `DTMF Keypress: ${payload.dtmfScore}`;
    }
  }

  const voiceSnippet = payload.speechTranscript ? payload.speechTranscript.trim() : "";
  const combinedText = `[IVRS Call - ${payload.durationSeconds ?? 30}s] ${dtmfNarrative} ${voiceSnippet ? `Recorded message: "${voiceSnippet}"` : ""}`.trim();

  // 3. Insert into check_ins
  const { data: checkIn, error: checkInError } = await supabase
    .from("check_ins")
    .insert({
      case_id: caseId,
      victim_id: victimId,
      response_text: combinedText,
      voice_input_used: Boolean(payload.speechTranscript && payload.speechTranscript.length > 0),
    })
    .select()
    .single();

  if (checkInError) {
    console.error("IVRS Check-in insert error:", checkInError);
  }

  // 4. Insert into interactions
  const { data: interaction } = await supabase
    .from("interactions")
    .insert({
      case_id: caseId,
      channel: "VOICE_CALL",
      summary: `Automated IVRS Wellness Call (${payload.durationSeconds ?? 30}s). ${dtmfNarrative} ${voiceSnippet ? `Voicemail transcribed.` : "No voicemail left."}`,
      recorded_by_id: victimId,
    })
    .select()
    .single();

  // 5. Evaluate risk using Risk Engine
  let riskScore: number | undefined;
  let alertTriggered = false;
  let alertSeverity: "LOW" | "MEDIUM" | "HIGH" | undefined;

  try {
    const evalResult = await evaluateCheckIn(caseId, combinedText, victimId);
    riskScore = evalResult.score;
    alertTriggered = evalResult.alertTriggered;
    alertSeverity = evalResult.alertSeverity;
  } catch (err) {
    console.error("Risk evaluation error for IVRS call:", err);
  }

  // 6. Audit logging
  await logAuditEvent({
    actor_id: victimId,
    actor_role: "VICTIM",
    action: "IVRS_CALL_INGESTED",
    resource_type: "interaction",
    resource_id: interaction?.id || "unknown",
    metadata: {
      channel: "IVRS",
      callerPhone,
      caseId,
      dtmfScore: payload.dtmfScore,
      durationSeconds: payload.durationSeconds,
      alertTriggered,
      riskScore,
    },
  }).catch((e) => console.error("Audit log error:", e));

  return {
    success: true,
    channel: "IVRS",
    caseId,
    victimId,
    checkInId: checkIn?.id,
    interactionId: interaction?.id,
    riskScore,
    alertTriggered,
    alertSeverity,
    message: `IVRS call processed. Call duration: ${payload.durationSeconds ?? 30}s, distress score: ${riskScore ?? "N/A"}`,
  };
}
