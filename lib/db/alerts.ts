import { createServerClient } from "@/lib/supabase/server";
import type { Database, AlertStatus, AlertSeverity } from "@/types/database.types";

export type AlertRow = Database["public"]["Tables"]["alerts"]["Row"];
export type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];

export async function getAlerts(filters?: {
  caseId?: string;
  status?: AlertStatus;
  severity?: AlertSeverity;
}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("alerts")
    .select("*, case:cases!alerts_case_id_fkey(id, case_ref, status), reviewer:profiles!alerts_reviewed_by_id_fkey(id, display_name)")
    .order("raised_at", { ascending: false });

  if (filters?.caseId) {
    query = query.eq("case_id", filters.caseId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.severity) {
    query = query.eq("severity", filters.severity);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function reviewAlert(id: string, reviewerId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("alerts")
    .update({
      status: "REVIEWED",
      reviewed_at: new Date().toISOString(),
      reviewed_by_id: reviewerId,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createAlert(data: AlertInsert) {
  const supabase = await createServerClient();
  const { data: newAlert, error } = await supabase
    .from("alerts")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newAlert;
}

export async function updateAlertStatus(
  id: string,
  status: AlertStatus,
  reviewedById?: string
) {
  const supabase = await createServerClient();
  const updateData: {
    status: AlertStatus;
    reviewed_at?: string;
    reviewed_by_id?: string;
  } = { status };

  if (reviewedById) {
    updateData.reviewed_by_id = reviewedById;
    updateData.reviewed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("alerts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
