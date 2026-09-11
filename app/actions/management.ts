"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export interface ManagementActionState {
  error?: string;
  success?: boolean;
}

/**
 * Ensures the caller has the required role (ADMIN or COUNSELOR)
 */
async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profileError || !profile) throw new Error("Unauthorized");
  
  const role = profile.role as UserRole;
  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden: Insufficient privileges");
  }

  return { userId: user.id, role };
}

/**
 * Generates a random secure password for newly created accounts.
 * In a real app this would trigger a password reset/invite flow.
 */
function generateTempPassword() {
  return "Password123!"; // Fixed for hackathon demo purposes based on requirements
}

function generateCaseRef() {
  return `V-${Math.floor(1000 + Math.random() * 9000)}`; 
}

export async function createCounselorAction(
  _prevState: ManagementActionState | undefined,
  formData: FormData
): Promise<ManagementActionState> {
  try {
    await requireRole(["ADMIN"]);

    const email = formData.get("email")?.toString().trim();
    const displayName = formData.get("displayName")?.toString().trim();

    if (!email || !displayName) {
      return { error: "Email and Name are required" };
    }

    const adminAuth = createAdminClient().auth.admin;
    const { error: createError } = await adminAuth.createUser({
      email,
      password: generateTempPassword(),
      email_confirm: true,
      user_metadata: {
        role: "COUNSELOR",
        display_name: displayName,
      },
    });

    if (createError) {
      return { error: createError.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function createVictimAction(
  _prevState: ManagementActionState | undefined,
  formData: FormData
): Promise<ManagementActionState> {
  try {
    const { userId, role } = await requireRole(["ADMIN", "COUNSELOR"]);

    const email = formData.get("email")?.toString().trim();
    const displayName = formData.get("displayName")?.toString().trim();
    // Counselors are forced to assign to themselves. Admins can optionally pick a counselor later.
    const counselorId = role === "COUNSELOR" ? userId : formData.get("counselorId")?.toString();

    if (!email || !displayName) {
      return { error: "Email and Name are required" };
    }

    const adminClient = createAdminClient();
    
    // 1. Create the Auth User
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: generateTempPassword(),
      email_confirm: true,
      user_metadata: {
        role: "VICTIM",
        display_name: displayName,
      },
    });

    if (createError || !newUser.user) {
      return { error: createError?.message || "Failed to create user" };
    }

    // wait for trigger to create profile (handle_new_user trigger in the DB)
    // 2. Create the associated case using the admin client (since RLS might act weird if we are doing this cross-role)
    const { error: caseError } = await adminClient
      .from("cases")
      .insert({
        case_ref: generateCaseRef(),
        status: "OPEN",
        victim_id: newUser.user.id,
        counselor_id: counselorId || null,
      });

    if (caseError) {
      return { error: "User created but failed to spawn case: " + caseError.message };
    }

    if (role === "ADMIN") {
      revalidatePath("/admin/assignments");
    } else {
      revalidatePath("/counselor/cases");
    }

    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function assignCounselorAction(
  _prevState: ManagementActionState | undefined,
  formData: FormData
): Promise<ManagementActionState> {
  try {
    await requireRole(["ADMIN"]);
    
    const caseId = formData.get("caseId")?.toString();
    const counselorId = formData.get("counselorId")?.toString() || null;

    if (!caseId) {
      return { error: "Case ID is required" };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("cases")
      .update({ counselor_id: counselorId })
      .eq("id", caseId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/assignments");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
