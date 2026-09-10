"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";

export interface AssignmentActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function assignCounselorAction(
  caseId: string,
  counselorId: string | null
): Promise<AssignmentActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "ADMIN") {
      return { error: "Unauthorized: only administrators can reassign cases." };
    }

    const supabase = await createServerClient();
    const { data: updatedCase, error } = await supabase
      .from("cases")
      .update({ counselor_id: counselorId })
      .eq("id", caseId)
      .select("case_ref")
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "ASSIGN_CASE",
      resource_type: "case",
      resource_id: caseId,
      metadata: { counselor_id: counselorId, case_ref: updatedCase.case_ref },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/admin/assignments");
    revalidatePath("/counselor/cases");
    revalidatePath(`/counselor/cases/${caseId}`);

    return {
      success: true,
      message: counselorId
        ? `Case ${updatedCase.case_ref} assigned successfully.`
        : `Case ${updatedCase.case_ref} unassigned.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case assignment.";
    return { error: message };
  }
}

export async function toggleUserStatusAction(
  userId: string,
  currentStatus: boolean
): Promise<AssignmentActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "ADMIN") {
      return { error: "Unauthorized: only administrators can modify user status." };
    }

    const supabase = await createServerClient();
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newStatus })
      .eq("id", userId);

    if (error) throw error;

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: newStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER",
      resource_type: "profile",
      resource_id: userId,
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User account has been ${newStatus ? "activated" : "deactivated"}.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change user status.";
    return { error: message };
  }
}
