/**
 * LUMA Alert Generator — Early-Warning Thresholds & De-duplication
 */

import { createServerClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/db/audit";
import type { AlertSeverity } from "@/types/database.types";

interface TriggerAlertInput {
  caseId: string;
  severity: AlertSeverity;
  signalDescription: string;
  actorId: string;
}

export async function checkAndTriggerAlert(
  input: TriggerAlertInput
): Promise<{ alertId?: string; wasTriggered: boolean; reason?: string }> {
  const { caseId, severity, signalDescription, actorId } = input;
  const supabase = await createServerClient();

  // De-duplication check: Is there already an active alert for this case within 48 hours?
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();

  const { data: existingAlerts, error: fetchErr } = await supabase
    .from("alerts")
    .select("id, severity, status, raised_at")
    .eq("case_id", caseId)
    .in("status", ["NEW", "UNDER_REVIEW"])
    .gte("raised_at", fortyEightHoursAgo);

  if (fetchErr) {
    console.error("Error checking existing alerts:", fetchErr);
  }

  // De-duplication rule: If an active alert of equal or higher severity already exists, do not duplicate
  if (existingAlerts && existingAlerts.length > 0) {
    const hasEqualOrHigher = existingAlerts.some((a) => {
      if (severity === "LOW") return true;
      if (severity === "MEDIUM") return a.severity === "MEDIUM" || a.severity === "HIGH";
      if (severity === "HIGH") return a.severity === "HIGH";
      return false;
    });

    if (hasEqualOrHigher) {
      return {
        wasTriggered: false,
        reason: "Duplicate suppressed: Active alert already pending review for this case.",
      };
    }
  }

  // Insert new alert
  const { data: newAlert, error: insertErr } = await supabase
    .from("alerts")
    .insert({
      case_id: caseId,
      status: "NEW",
      severity,
      signal_description: signalDescription,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("Failed to insert early warning alert:", insertErr);
    return { wasTriggered: false, reason: insertErr.message };
  }

  // Log audit trail
  await logAuditEvent({
    actor_id: actorId,
    actor_role: "ADMIN",
    action: "TRIGGER_DISTRESS_ALERT",
    resource_type: "alert",
    resource_id: newAlert.id,
    metadata: { case_id: caseId, severity, reason: signalDescription },
  }).catch((e) => console.error("Audit log error:", e));

  return {
    alertId: newAlert.id,
    wasTriggered: true,
  };
}
