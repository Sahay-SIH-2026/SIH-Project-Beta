import { getCurrentProfile } from "@/lib/db/profiles";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Enforces the application-side counterpart to the cases RLS policies.
 * Counselors may work only on cases assigned to them; admins retain oversight.
 */
export async function requireCaseAccess(caseId: string) {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "COUNSELOR" && profile.role !== "ADMIN")) {
    throw new Error("Forbidden: you are not authorized to access this case.");
  }

  const supabase = await createServerClient();
  const { data: caseRecord, error } = await supabase
    .from("cases")
    .select("id, counselor_id")
    .eq("id", caseId)
    .maybeSingle();

  if (error || !caseRecord) {
    throw new Error("Forbidden: you are not authorized to access this case.");
  }

  if (profile.role === "COUNSELOR" && caseRecord.counselor_id !== profile.id) {
    throw new Error("Forbidden: this case is not assigned to you.");
  }

  return { profile, caseRecord };
}
