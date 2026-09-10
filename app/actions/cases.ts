"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import type { CaseStatus } from "@/types/database.types";

export interface CaseActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function updateCaseStatusAction(
  caseId: string,
  newStatus: CaseStatus
): Promise<CaseActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
      return { error: "Unauthorized: only staff can update case status." };
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from("cases")
      .update({ status: newStatus })
      .eq("id", caseId);

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "UPDATE_CASE_STATUS",
      resource_type: "case",
      resource_id: caseId,
      metadata: { new_status: newStatus },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/counselor");
    revalidatePath("/counselor/cases");
    revalidatePath(`/counselor/cases/${caseId}`);
    revalidatePath("/victim");
    revalidatePath("/victim/case");

    return { success: true, message: `Case status updated to ${newStatus}.` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case status.";
    return { error: message };
  }
}

export async function updateCaseNotesAction(
  caseId: string,
  notes: string
): Promise<CaseActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
      return { error: "Unauthorized: only staff can update case notes." };
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from("cases")
      .update({ notes })
      .eq("id", caseId);

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "UPDATE_CASE_NOTES",
      resource_type: "case",
      resource_id: caseId,
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath(`/counselor/cases/${caseId}`);

    return { success: true, message: "Case notes updated successfully." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update notes.";
    return { error: message };
  }
}
