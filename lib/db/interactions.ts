import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type InteractionRow = Database["public"]["Tables"]["interactions"]["Row"];
export type InteractionInsert = Database["public"]["Tables"]["interactions"]["Insert"];

export async function getInteractionsByCaseId(caseId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("*, recorder:profiles!interactions_recorded_by_id_fkey(id, display_name, role)")
    .eq("case_id", caseId)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createInteraction(data: InteractionInsert) {
  const supabase = await createServerClient();
  const { data: newInteraction, error } = await supabase
    .from("interactions")
    .insert(data)
    .select("*, recorder:profiles!interactions_recorded_by_id_fkey(id, display_name, role)")
    .single();

  if (error) throw error;
  return newInteraction;
}
