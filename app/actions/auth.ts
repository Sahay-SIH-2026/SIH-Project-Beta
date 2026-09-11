"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types/database.types";

export interface AuthActionState {
  error?: string;
  success?: boolean;
}

export async function signInAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Authentication failed. No user found." };
  }

  // Fetch user role from profiles to redirect appropriately
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role =
    (profile?.role as UserRole) ??
    (data.user.app_metadata?.role as UserRole) ??
    (data.user.user_metadata?.role as UserRole) ??
    "VICTIM";

  let destination: string = ROUTES.victim.root;
  if (role === "COUNSELOR") {
    destination = ROUTES.counselor.root;
  } else if (role === "ADMIN") {
    destination = ROUTES.admin.root;
  } else if (role === "VICTIM") {
    destination = `${ROUTES.victim.root}?login=success`;
  }

  redirect(destination);
}

export async function signOutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signUpAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const displayName = formData.get("displayName")?.toString().trim();
  const role = (formData.get("role")?.toString().trim() as UserRole) || "VICTIM";

  if (!email || !password || !displayName) {
    return { error: "All fields are required." };
  }

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    // If auto-confirmed
    redirect(role === "COUNSELOR" ? ROUTES.counselor.root : (role === "VICTIM" ? `${ROUTES.victim.root}?login=success` : ROUTES.victim.root));
  }

  return {
    success: true,
    error: "Account created! If confirmation is required, please check your email before logging in.",
  };
}
