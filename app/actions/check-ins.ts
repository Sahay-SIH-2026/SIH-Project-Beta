"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";

export interface CheckInActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function submitCheckInAction(
  _prevState: CheckInActionState | undefined,
  formData: FormData
): Promise<CheckInActionState> {
  const responseText = formData.get("responseText")?.toString().trim();
  const voiceInputUsed = formData.get("voiceInputUsed") === "true";

  if (!responseText) {
    return { error: "Please write a response before submitting." };
  }

  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "You must be signed in to submit a check-in." };
    }

    if (profile.role !== "VICTIM") {
      return { error: "Only victims or complainants can submit check-ins." };
    }

    const supabase = await createServerClient();

    // Find the victim's case
    const { data: caseRecord, error: caseError } = await supabase
      .from("cases")
      .select("id")
      .eq("victim_id", profile.id)
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (caseError) throw caseError;

    if (!caseRecord) {
      return {
        error: "No active case was found for your account. Please contact your support worker.",
      };
    }

    // Insert check-in record
    const { data: checkIn, error: checkInError } = await supabase
      .from("check_ins")
      .insert({
        case_id: caseRecord.id,
        victim_id: profile.id,
        response_text: responseText,
        voice_input_used: voiceInputUsed,
      })
      .select()
      .single();

    if (checkInError) throw checkInError;

    // Log audit event
    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "SUBMIT_CHECK_IN",
      resource_type: "check_in",
      resource_id: checkIn.id,
      metadata: { case_id: caseRecord.id, voice_input_used: voiceInputUsed },
    }).catch((e) => console.error("Audit log error:", e));

    // Evaluate support signal and trend through Risk Engine
    try {
      const { evaluateCheckIn } = await import("@/lib/risk");
      await evaluateCheckIn(caseRecord.id, responseText, profile.id);
    } catch (riskErr) {
      console.error("Risk evaluation hook error:", riskErr);
    }

    revalidatePath("/victim");
    revalidatePath("/victim/check-in");
    revalidatePath("/counselor");
    revalidatePath("/counselor/alerts");
    revalidatePath("/counselor/cases");
    revalidatePath(`/counselor/cases/${caseRecord.id}`);

    return {
      success: true,
      message: "Thank you for sharing. Your check-in has been privately recorded for your support team.",
    };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit check-in.";
    return { error: message };
  }
}
