"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";

export interface AlertActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function reviewAlertAction(
  alertId: string
): Promise<AlertActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
      return { error: "Unauthorized: only staff can review alerts." };
    }

    const supabase = await createServerClient();
    const now = new Date().toISOString();

    const { data: updatedAlert, error } = await supabase
      .from("alerts")
      .update({
        status: "REVIEWED",
        reviewed_at: now,
        reviewed_by_id: profile.id,
      })
      .eq("id", alertId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "REVIEW_ALERT",
      resource_type: "alert",
      resource_id: alertId,
      metadata: { case_id: updatedAlert.case_id },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/counselor");
    revalidatePath("/counselor/alerts");
    revalidatePath(`/counselor/cases/${updatedAlert.case_id}`);

    return {
      success: true,
      message: "Alert marked as reviewed.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to review alert.";
    return { error: message };
  }
}
