"use server";

import { getCurrentProfile } from "@/lib/db/profiles";
import { upsertConsent } from "@/lib/db/consents";
import { logAuditEvent } from "@/lib/db/audit";
import { revalidatePath } from "next/cache";
import type { ConsentStatus } from "@/types/database.types";

export interface ConsentActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function updateConsentAction(
  purpose: string,
  newStatus: ConsentStatus
): Promise<ConsentActionState> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "You must be signed in to update consent preferences." };
    }

    if (profile.role !== "VICTIM") {
      return { error: "Only victims can manage their personal consent choices." };
    }

    const consent = await upsertConsent(profile.id, purpose, newStatus);

    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: newStatus === "GIVEN" ? "GRANT_CONSENT" : "WITHDRAW_CONSENT",
      resource_type: "consent",
      resource_id: consent.id,
      metadata: { purpose, status: newStatus },
    }).catch((e) => console.error("Audit log error:", e));

    revalidatePath("/victim/data");

    return {
      success: true,
      message: `Consent for "${purpose}" has been updated to ${newStatus}.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update consent.";
    return { error: message };
  }
}
