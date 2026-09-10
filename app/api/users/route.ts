import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/db/profiles";
import type { UserRole } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as UserRole | null;

    const supabase = await createServerClient();
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ users: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, display_name, is_active, role } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updated = await updateProfile(id, { display_name, is_active, role });
    return NextResponse.json({ user: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
