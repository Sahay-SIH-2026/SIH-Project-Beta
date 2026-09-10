import { createServerClient } from "@/lib/supabase/server";
import type { Database, ConsentStatus } from "@/types/database.types";

export type ConsentRow = Database["public"]["Tables"]["consents"]["Row"];
export type ConsentInsert = Database["public"]["Tables"]["consents"]["Insert"];
export type ConsentUpdate = Database["public"]["Tables"]["consents"]["Update"];

export async function getConsentsByVictimId(victimId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("consents")
    .select("*")
    .eq("victim_id", victimId)
    .order("purpose");

  if (error) throw error;
  return data;
}

export async function upsertConsent(
  victimId: string,
  purpose: string,
  status: ConsentStatus
) {
  const supabase = await createServerClient();
  const now = new Date().toISOString();

  // Check if existing record exists
  const { data: existing } = await supabase
    .from("consents")
    .select("id")
    .eq("victim_id", victimId)
    .eq("purpose", purpose)
    .maybeSingle();

  if (existing) {
    const updates: ConsentUpdate = {
      status,
      granted_at: status === "GIVEN" ? now : undefined,
      withdrawn_at: status === "WITHDRAWN" ? now : undefined,
    };

    const { data, error } = await supabase
      .from("consents")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("consents")
    .insert({
      victim_id: victimId,
      purpose,
      status,
      granted_at: status === "GIVEN" ? now : null,
      withdrawn_at: status === "WITHDRAWN" ? now : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
