/**
 * /admin/users — User Management Workspace
 */

import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { UserManager } from "@/components/admin/UserManager";
import { CreateCounselorForm } from "@/components/admin/CreateCounselorForm";
import type { ProfileRow } from "@/types/database.types";

export const metadata: Metadata = { title: "Users & Access" };

export default async function AdminUsersPage() {
  let profiles: ProfileRow[] = [];

  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    profiles = (data as unknown as ProfileRow[]) || [];
  } catch (e) {
    console.error("Error loading admin users:", e);
  }

  return (
    <div className="space-y-6">
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Administrative Notice:</strong> User credentials and authentication states are maintained securely via Supabase Auth. Profile records manage platform roles and system activation.
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage system access, verified counselor credentials, and complainant profiles.
          </p>
        </div>
        <CreateCounselorForm />
      </div>

      <UserManager initialProfiles={profiles} />
    </div>
  );
}
