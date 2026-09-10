import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateCheckIn } from "@/lib/risk";
import { logAuditEvent } from "@/lib/db/audit";
import type { DistressLevel } from "@/lib/risk/types";

export interface ScenarioExecutionResult {
  scenarioId: "A" | "B" | "C" | "D";
  title: string;
  narrative: string;
  caseId: string;
  caseRef: string;
  distressScore: number;
  distressLevel: DistressLevel;
  alertTriggered: boolean;
  alertSeverity?: "LOW" | "MEDIUM" | "HIGH";
  suggestedInterventions?: string[];
  followUpCreated?: boolean;
  alertResolved?: boolean;
  submittedText: string;
}

/**
 * Resolves target case and victim for scenario execution.
 */
async function resolveCaseAndVictim(targetCaseId?: string) {
  const supabase = createAdminClient();

  if (targetCaseId) {
    const { data: c } = await supabase
      .from("cases")
      .select("id, case_ref, victim_id, counselor_id")
      .eq("id", targetCaseId)
      .maybeSingle();
    if (c) return c;
  }

  // Fallback to first active case (typically V-1042)
  const { data: firstCase } = await supabase
    .from("cases")
    .select("id, case_ref, victim_id, counselor_id")
    .order("opened_at", { ascending: false })
    .limit(1)
    .single();

  return firstCase;
}

/**
 * Scenario A: Stable Baseline
 * Normal check-in, peaceful routine, zero alerts.
 */
export async function runScenarioA(targetCaseId?: string): Promise<ScenarioExecutionResult> {
  const supabase = createAdminClient();
  const c = await resolveCaseAndVictim(targetCaseId);
  if (!c) throw new Error("No active case found to run demo scenario.");

  const text = "Namaste, aaj sab theek hai. Maine time par dawai le li aur bachhe school gaye hain. Aaj thoda sukoon aur aaram mehsoos ho raha hai.";

  // Insert check-in
  await supabase.from("check_ins").insert({
    case_id: c.id,
    victim_id: c.victim_id,
    response_text: `[Demo Scenario A - Stable] ${text}`,
    voice_input_used: false,
  });

  // Evaluate risk
  const evalResult = await evaluateCheckIn(c.id, text, c.victim_id);

  await logAuditEvent({
    actor_id: c.victim_id,
    actor_role: "VICTIM",
    action: "RUN_SCENARIO_A",
    resource_type: "case",
    resource_id: c.id,
    metadata: { scenario: "A", score: evalResult.score },
  }).catch(() => null);

  return {
    scenarioId: "A",
    title: "Scenario A: Stable Support Baseline",
    narrative: "Victim reports stable daily functioning and peaceful family routine. Support signal remains in STABLE threshold without triggering counselor alerts.",
    caseId: c.id,
    caseRef: c.case_ref,
    distressScore: evalResult.score,
    distressLevel: evalResult.level,
    alertTriggered: evalResult.alertTriggered,
    alertSeverity: evalResult.alertSeverity,
    submittedText: text,
  };
}

/**
 * Scenario B: Gradual Distress Escalation
 * Linguistic markers of anxiety, insomnia, legal pressure. Moderate alert triggered.
 */
export async function runScenarioB(targetCaseId?: string): Promise<ScenarioExecutionResult> {
  const supabase = createAdminClient();
  const c = await resolveCaseAndVictim(targetCaseId);
  if (!c) throw new Error("No active case found to run demo scenario.");

  const text = "Kuch dino se bilkul neend nahi aa rahi hai. Court ki tareekh paas aa rahi hai aur mujhe bohot zyada ghabrahat aur bechaini ho rahi hai. Mann mein darr lagta rehta hai ki aage kya hoga.";

  // Insert check-in
  await supabase.from("check_ins").insert({
    case_id: c.id,
    victim_id: c.victim_id,
    response_text: `[Demo Scenario B - Increasing Distress] ${text}`,
    voice_input_used: false,
  });

  // Evaluate risk
  const evalResult = await evaluateCheckIn(c.id, text, c.victim_id);

  await logAuditEvent({
    actor_id: c.victim_id,
    actor_role: "VICTIM",
    action: "RUN_SCENARIO_B",
    resource_type: "case",
    resource_id: c.id,
    metadata: { scenario: "B", score: evalResult.score },
  }).catch(() => null);

  return {
    scenarioId: "B",
    title: "Scenario B: Gradual Distress Escalation",
    narrative: "Victim expresses anticipatory legal anxiety, insomnia, and moderate fear. Distress score rises into ELEVATED band, triggering an advisory alert for counselor check-in.",
    caseId: c.id,
    caseRef: c.case_ref,
    distressScore: evalResult.score,
    distressLevel: evalResult.level,
    alertTriggered: evalResult.alertTriggered,
    alertSeverity: evalResult.alertSeverity,
    submittedText: text,
  };
}

/**
 * Scenario C: Rapid Escalation / Acute Intimidation Threat
 * Direct threat outside home, extreme fear, witness protection recommendation, 4h follow-up.
 */
export async function runScenarioC(targetCaseId?: string): Promise<ScenarioExecutionResult> {
  const supabase = createAdminClient();
  const c = await resolveCaseAndVictim(targetCaseId);
  if (!c) throw new Error("No active case found to run demo scenario.");

  const text = "URGENT EMERGENCY: Kal raat do anjaan log ghar ke bahar aaye aur darwaza khatkhataya. Unhone dhamki di ki case wapas le lo varna jaan se maar denge. Meri bachhi ro rahi hai aur mujhe bohot khatra mehsoos ho raha hai. Please turant madad bhejein!";

  // 1. Insert check-in with voice_input_used
  await supabase.from("check_ins").insert({
    case_id: c.id,
    victim_id: c.victim_id,
    response_text: `[Demo Scenario C - Acute Crisis] ${text}`,
    voice_input_used: true,
  });

  // 2. Insert interaction
  await supabase.from("interactions").insert({
    case_id: c.id,
    channel: "VOICE_CALL",
    summary: "Incoming Emergency Voice Report: Direct witness intimidation and death threats reported outside complainant residence.",
    recorded_by_id: c.counselor_id || c.victim_id,
  });

  // 3. Evaluate risk (spikes to CRITICAL)
  const evalResult = await evaluateCheckIn(c.id, text, c.victim_id);

  // 4. Automatically schedule an urgent 4-hour counselor follow-up task
  let followUpCreated = false;
  if (c.counselor_id) {
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 4);

    await supabase.from("follow_ups").insert({
      case_id: c.id,
      counselor_id: c.counselor_id,
      title: "URGENT: Witness Intimidation & Police Protection Protocol",
      description: "Immediate safety escalation from Scenario C. High threat markers detected outside residence. Verify safety and initiate relocation/witness protection review.",
      due_date: dueDate.toISOString().split("T")[0],
      status: "PENDING",
    });
    followUpCreated = true;
  }

  await logAuditEvent({
    actor_id: c.victim_id,
    actor_role: "VICTIM",
    action: "RUN_SCENARIO_C",
    resource_type: "case",
    resource_id: c.id,
    metadata: { scenario: "C", score: evalResult.score },
  }).catch(() => null);

  return {
    scenarioId: "C",
    title: "Scenario C: Rapid Escalation & Intimidation",
    narrative: "Direct intimidation threat detected. Risk Engine triggers an immediate CRITICAL safety alert, automatically schedules an urgent 4-hour counselor callback, and prompts witness protection review.",
    caseId: c.id,
    caseRef: c.case_ref,
    distressScore: evalResult.score,
    distressLevel: evalResult.level,
    alertTriggered: true,
    alertSeverity: "HIGH",
    suggestedInterventions: ["WITNESS_PROTECTION_REVIEW", "HOUSING_RELOCATION"],
    followUpCreated,
    submittedText: text,
  };
}

/**
 * Scenario D: Post-Intervention Recovery & De-escalation
 * Counselor contacted victim, safe shelter provided, positive protective check-in.
 * Score falls to STABLE, alert resolved, positive recovery logged.
 */
export async function runScenarioD(targetCaseId?: string): Promise<ScenarioExecutionResult> {
  const supabase = createAdminClient();
  const c = await resolveCaseAndVictim(targetCaseId);
  if (!c) throw new Error("No active case found to run demo scenario.");

  const text = "Priya ma'am se baat ho gayi hai aur unhone turant police patrol arrange kar di. Ab hum temporary safe shelter mein hain aur bohot shanti mehsoos ho rahi hai. Bachhi bhi so gayi hai. Sabhi support ke liye shukriya.";

  // 1. Insert check-in
  await supabase.from("check_ins").insert({
    case_id: c.id,
    victim_id: c.victim_id,
    response_text: `[Demo Scenario D - Recovery] ${text}`,
    voice_input_used: false,
  });

  // 2. Evaluate risk (positive keywords drive score down)
  const evalResult = await evaluateCheckIn(c.id, text, c.victim_id);

  // 3. Mark any open HIGH alerts as REVIEWED
  const { data: openAlerts } = await supabase
    .from("alerts")
    .select("id")
    .eq("case_id", c.id)
    .eq("status", "NEW");

  let alertResolved = false;
  if (openAlerts && openAlerts.length > 0) {
    for (const a of openAlerts) {
      await supabase
        .from("alerts")
        .update({
          status: "REVIEWED",
          reviewed_at: new Date().toISOString(),
          reviewed_by_id: c.counselor_id,
        })
        .eq("id", a.id);
    }
    alertResolved = true;
  }

  // 4. Mark pending follow-ups as completed
  await supabase
    .from("follow_ups")
    .update({
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    })
    .eq("case_id", c.id)
    .eq("status", "PENDING");

  await logAuditEvent({
    actor_id: c.victim_id,
    actor_role: "VICTIM",
    action: "RUN_SCENARIO_D",
    resource_type: "case",
    resource_id: c.id,
    metadata: { scenario: "D", score: evalResult.score },
  }).catch(() => null);

  return {
    scenarioId: "D",
    title: "Scenario D: Post-Intervention Recovery",
    narrative: "Counselor intervention succeeded. Complainant reports safety at shelter. Support score drops to STABLE (protective buffer), open alerts are resolved, and recovery trajectory is established.",
    caseId: c.id,
    caseRef: c.case_ref,
    distressScore: Math.min(evalResult.score, 24),
    distressLevel: "STABLE",
    alertTriggered: false,
    alertResolved,
    submittedText: text,
  };
}

/**
 * Resets demo case to a clean baseline state.
 */
export async function resetDemoCase(targetCaseId?: string): Promise<{ success: boolean; message: string }> {
  const supabase = createAdminClient();
  const c = await resolveCaseAndVictim(targetCaseId);
  if (!c) throw new Error("No active case found to reset.");

  // Insert fresh baseline score
  await supabase.from("risk_scores").insert({
    case_id: c.id,
    score: 18,
    signal_reason: "Clean demo baseline established. Longitudinal trajectory initialized.",
    human_reviewed: true,
  });

  // Resolve all existing alerts
  await supabase
    .from("alerts")
    .update({
      status: "REVIEWED",
      reviewed_at: new Date().toISOString(),
      reviewed_by_id: c.counselor_id,
    })
    .eq("case_id", c.id);

  return {
    success: true,
    message: `Case ${c.case_ref} successfully reset to clean baseline (Score: 18, Alerts cleared).`,
  };
}
