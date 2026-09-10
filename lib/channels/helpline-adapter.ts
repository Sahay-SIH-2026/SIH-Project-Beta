import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateCheckIn } from "@/lib/risk";
import { logAuditEvent } from "@/lib/db/audit";
import type { HelplineCallPayload, ChannelIngestionResult } from "./types";

/**
 * Handles intake referrals from National Helpline 14566 (NHAA / Tele-MANAS / Women Helpline),
 * automatically recording counselor interactions, scheduling immediate follow-up tasks,
 * and recalculating longitudinal risk trends.
 */
export async function ingestHelplineIntake(payload: HelplineCallPayload): Promise<ChannelIngestionResult> {
  const supabase = createAdminClient();
  const callerIdentifier = payload.callerIdentifier.trim();

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
      channel: "HELPLINE_14566",
      caseId: caseId || "UNKNOWN",
      alertTriggered: false,
      message: `No active case found for helpline caller ${callerIdentifier}`,
    };
  }

  // Fetch counselor id on case
  const { data: caseRecord } = await supabase
    .from("cases")
    .select("counselor_id")
    .eq("id", caseId)
    .single();

  const counselorId = caseRecord?.counselor_id;

  // 2. Insert interaction record
  const summaryText = `[National Helpline 14566 Intake] Tier: ${payload.reportedDistressTier}. Notes: ${payload.notes} ${payload.callerWantsCallBack ? "— Callback requested by complainant." : ""}`;
  
  const { data: interaction, error: interactionError } = await supabase
    .from("interactions")
    .insert({
      case_id: caseId,
      channel: "VOICE_CALL",
      summary: summaryText,
      recorded_by_id: counselorId || victimId,
    })
    .select()
    .single();

  if (interactionError) {
    console.error("Helpline interaction insert error:", interactionError);
  }

  // 3. If caller wants callback or high distress, automatically schedule an urgent Follow-Up task
  if (counselorId && (payload.callerWantsCallBack || payload.reportedDistressTier === "CRITICAL" || payload.reportedDistressTier === "ELEVATED")) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    await supabase.from("follow_ups").insert({
      case_id: caseId,
      counselor_id: counselorId,
      title: `14566 Callback: ${payload.reportedDistressTier} Intake`,
      description: `Urgent callback generated from 14566 Helpline Intake (${payload.reportedDistressTier}): ${payload.notes.slice(0, 150)}`,
      due_date: dueDate.toISOString().split("T")[0],
      status: "PENDING",
    });
  }

  // 4. Also record a check-in to incorporate notes into longitudinal AI distress trend
  const { data: checkIn } = await supabase
    .from("check_ins")
    .insert({
      case_id: caseId,
      victim_id: victimId,
      response_text: `[14566 Helpline Intake] ${payload.notes}`,
      voice_input_used: true,
    })
    .select()
    .single();

  // 5. Evaluate risk using Risk Engine
  let riskScore: number | undefined;
  let alertTriggered = false;
  let alertSeverity: "LOW" | "MEDIUM" | "HIGH" | undefined;

  try {
    const evalResult = await evaluateCheckIn(caseId, payload.notes, victimId);
    riskScore = evalResult.score;
    alertTriggered = evalResult.alertTriggered;
    alertSeverity = evalResult.alertSeverity;
  } catch (err) {
    console.error("Risk evaluation error for Helpline intake:", err);
  }

  // 6. Audit logging
  await logAuditEvent({
    actor_id: counselorId || victimId,
    actor_role: "COUNSELOR",
    action: "HELPLINE_CALL_INGESTED",
    resource_type: "interaction",
    resource_id: interaction?.id || "unknown",
    metadata: {
      channel: "HELPLINE_14566",
      callerIdentifier,
      caseId,
      reportedTier: payload.reportedDistressTier,
      alertTriggered,
      riskScore,
    },
  }).catch((e) => console.error("Audit log error:", e));

  return {
    success: true,
    channel: "HELPLINE_14566",
    caseId,
    victimId,
    checkInId: checkIn?.id,
    interactionId: interaction?.id,
    riskScore,
    alertTriggered,
    alertSeverity,
    message: `14566 Helpline referral logged successfully. Distress score: ${riskScore ?? "N/A"}`,
  };
}
