import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type CheckInRow = Database["public"]["Tables"]["check_ins"]["Row"];
export type CheckInInsert = Database["public"]["Tables"]["check_ins"]["Insert"];

export async function getCheckInsByCaseId(caseId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("check_ins")
    .select("*, victim:profiles!check_ins_victim_id_fkey(id, display_name)")
    .eq("case_id", caseId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCheckInsByVictimId(victimId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("check_ins")
    .select("*, case:cases!check_ins_case_id_fkey(id, case_ref, status)")
    .eq("victim_id", victimId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCheckIn(data: CheckInInsert) {
  const supabase = await createServerClient();
  const { data: newCheckIn, error } = await supabase
    .from("check_ins")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newCheckIn;
}
