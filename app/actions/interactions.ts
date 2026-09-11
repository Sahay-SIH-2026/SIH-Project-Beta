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

    const supabase = await createServerClient();
    const { data: newInteraction, error } = await supabase
      .from("interactions")
      .insert({
        case_id: caseId,
        channel,
        summary: summary.trim(),
        occurred_at: occurredAt || new Date().toISOString(),
        recorded_by_id: profile.id,
      })
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "LOG_INTERACTION",
      resource_type: "interaction",
      resource_id: newInteraction.id,
      metadata: { case_id: caseId, channel },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath(`/counselor/cases/${caseId}`);

    return { success: true, message: "Interaction recorded successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record interaction.";
    return { error: message };
  }
}
