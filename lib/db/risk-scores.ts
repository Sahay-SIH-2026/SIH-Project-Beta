import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type RiskScoreRow = Database["public"]["Tables"]["risk_scores"]["Row"];
export type RiskScoreInsert = Database["public"]["Tables"]["risk_scores"]["Insert"];

export async function getRiskScoresByCaseId(caseId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("risk_scores")
    .select("*")
    .eq("case_id", caseId)
    .order("computed_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createRiskScore(data: RiskScoreInsert) {
  const supabase = await createServerClient();
  const { data: newScore, error } = await supabase
    .from("risk_scores")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newScore;
}
