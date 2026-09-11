"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { requireCaseAccess } from "@/lib/auth/case-access";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";

export interface FollowUpActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function createFollowUpAction(
  caseId: string,
  title: string,
  dueDate: string,
  description?: string
): Promise<FollowUpActionState> {
  try {
    const { profile } = await requireCaseAccess(caseId);

    if (!title || title.trim().length === 0) {
      return { error: "Please enter a title for the follow-up." };
    }

    if (!dueDate) {
      return { error: "Please specify a due date." };
    }

    const supabase = await createServerClient();
    const { data: newFollowUp, error } = await supabase
      .from("follow_ups")
      .insert({
        case_id: caseId,
        counselor_id: profile.id,
        title: title.trim(),
        description: description?.trim() || null,
        due_date: new Date(dueDate).toISOString(),
        status: "PENDING",
      })
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "CREATE_FOLLOW_UP",
      resource_type: "follow_up",
      resource_id: newFollowUp.id,
      metadata: { case_id: caseId, title },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/counselor");
    revalidatePath("/counselor/follow-ups");
    revalidatePath(`/counselor/cases/${caseId}`);

    return { success: true, message: "Follow-up task scheduled successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to schedule follow-up.";
    return { error: message };
  }
}

export async function completeFollowUpAction(
  followUpId: string
): Promise<FollowUpActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
      return { error: "Unauthorized: only staff can complete follow-ups." };
    }

    const supabase = await createServerClient();
    const { data: updated, error } = await supabase
      .from("follow_ups")
      .update({
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
      })
      .eq("id", followUpId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "COMPLETE_FOLLOW_UP",
      resource_type: "follow_up",
      resource_id: followUpId,
      metadata: { case_id: updated.case_id },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/counselor");
    revalidatePath("/counselor/follow-ups");
    revalidatePath(`/counselor/cases/${updated.case_id}`);

    return { success: true, message: "Follow-up task marked as completed." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete follow-up.";
    return { error: message };
  }
}
