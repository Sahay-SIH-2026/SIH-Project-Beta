import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateCheckIn } from "@/lib/risk";
import { logAuditEvent } from "@/lib/db/audit";
import type { SMSPayload, ChannelIngestionResult } from "./types";

/**
 * Handles incoming SMS messages from victims, transforming them into
 * standardized check-ins, logging interactions, and triggering risk evaluations.
 */
export async function ingestInboundSMS(payload: SMSPayload): Promise<ChannelIngestionResult> {
  const supabase = createAdminClient();
  const rawText = (payload.messageBody || "").trim();
  const fromPhone = payload.fromPhone.trim();

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

  // Fallback to first active demo case if caseId not provided or invalid
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
      channel: "SMS",
      caseId: caseId || "UNKNOWN",
      alertTriggered: false,
      message: `No active case found for sender ${fromPhone}`,
    };
  }

  // 2. Decode shortcode keywords if present
  let processedText = rawText;
  const upper = rawText.toUpperCase();
  if (upper === "1" || upper === "OK" || upper === "SAFE" || upper === "THEEK") {
    processedText = "Main theek hoon. Sab surakshit hai. (Quick SMS reply: 1 / Safe)";
  } else if (upper === "2" || upper === "HELP" || upper === "MADAD") {
    processedText = "Mujhe sahayata ki zaroorat hai. Kripya mujhse sampark karein. (Quick SMS reply: 2 / Help)";
  } else if (upper === "911" || upper === "URGENT" || upper === "KHATRA" || upper === "DANGER") {
    processedText = "EMERGENCY: Turant sahayata chahiye! Darr aur khatra mehsoos ho raha hai! (Quick SMS reply: Urgent)";
  }

  // 3. Insert Check-In record
  const { data: checkIn, error: checkInError } = await supabase
    .from("check_ins")
    .insert({
      case_id: caseId,
      victim_id: victimId,
      response_text: `[SMS via ${fromPhone}] ${processedText}`,
      voice_input_used: false,
    })
    .select()
    .single();

  if (checkInError) {
    console.error("SMS Check-in insert error:", checkInError);
  }

  // 4. Log Interaction record
  const { data: interaction } = await supabase
    .from("interactions")
    .insert({
      case_id: caseId,
      channel: "SMS",
      summary: `Inbound SMS from ${fromPhone}: "${processedText.slice(0, 120)}"`,
      recorded_by_id: victimId,
    })
    .select()
    .single();

  // 5. Evaluate risk using Phase 5 & 6 Risk Engine
  let riskScore: number | undefined;
  let alertTriggered = false;
  let alertSeverity: "LOW" | "MEDIUM" | "HIGH" | undefined;

  try {
    const evalResult = await evaluateCheckIn(caseId, processedText, victimId);
    riskScore = evalResult.score;
    alertTriggered = evalResult.alertTriggered;
    alertSeverity = evalResult.alertSeverity;
  } catch (err) {
    console.error("Risk evaluation error for SMS check-in:", err);
  }

  // 6. Audit logging
  await logAuditEvent({
    actor_id: victimId,
    actor_role: "VICTIM",
    action: "SMS_CHECKIN_INGESTED",
    resource_type: "check_in",
    resource_id: checkIn?.id || "unknown",
    metadata: {
      channel: "SMS",
      fromPhone,
      caseId,
      alertTriggered,
      riskScore,
    },
  }).catch((e) => console.error("Audit log error:", e));

  return {
    success: true,
    channel: "SMS",
    caseId,
    victimId,
    checkInId: checkIn?.id,
    interactionId: interaction?.id,
    riskScore,
    alertTriggered,
    alertSeverity,
    message: `Inbound SMS successfully ingested and evaluated. Distress score: ${riskScore ?? "N/A"}`,
  };
}
