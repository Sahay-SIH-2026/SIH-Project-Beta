import { createServerClient } from "@/lib/supabase/server";
import type { Database, FollowUpStatus } from "@/types/database.types";

export type FollowUpRow = Database["public"]["Tables"]["follow_ups"]["Row"];
export type FollowUpInsert = Database["public"]["Tables"]["follow_ups"]["Insert"];
export type FollowUpUpdate = Database["public"]["Tables"]["follow_ups"]["Update"];

export async function getFollowUps(filters?: {
  counselorId?: string;
  caseId?: string;
  status?: FollowUpStatus;
}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("follow_ups")
    .select(
      "*, case:cases!follow_ups_case_id_fkey(id, case_ref, status, victim:profiles!cases_victim_id_fkey(id, display_name)), counselor:profiles!follow_ups_counselor_id_fkey(id, display_name)"
    )
    .order("due_date", { ascending: true });

  if (filters?.counselorId) {
    query = query.eq("counselor_id", filters.counselorId);
  }
  if (filters?.caseId) {
    query = query.eq("case_id", filters.caseId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createFollowUp(data: FollowUpInsert) {
  const supabase = await createServerClient();
  const { data: newFollowUp, error } = await supabase
    .from("follow_ups")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newFollowUp;
}

export async function completeFollowUp(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .update({
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFollowUp(id: string, updates: FollowUpUpdate) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("follow_ups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
