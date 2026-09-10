"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/db/profiles";
import { generateCaseInsights } from "@/lib/ai/service";
import { logAuditEvent } from "@/lib/db/audit";
import type { AIInsightsResult } from "@/lib/ai/types";

export async function generateCaseInsightsAction(caseId: string): Promise<{
  success: boolean;
  insights?: AIInsightsResult;
  error?: string;
}> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    if (profile.role !== "COUNSELOR" && profile.role !== "ADMIN") {
      return {
        success: false,
        error: "Forbidden. Only authorized counselors and administrators can access AI case synthesis.",
      };
    }

    const insights = await generateCaseInsights(caseId);

    // Record audit log
    await logAuditEvent({
      actor_id: profile.id,
      actor_role: profile.role,
      action: "GENERATE_AI_INSIGHTS",
      resource_type: "case",
      resource_id: caseId,
      metadata: {
        provider: insights.providerUsed,
        escalationLevel: insights.escalation.level,
        detectedLanguage: insights.multilingual.detectedLanguage,
      },
    }).catch((e: unknown) => console.error("Audit log error:", e));

    revalidatePath(`/counselor/cases/${caseId}`);
    return { success: true, insights };
  } catch (err: unknown) {
    console.error("Error generating case insights:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate AI case insights.",
    };
  }
}
