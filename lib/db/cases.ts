import { createServerClient } from "@/lib/supabase/server";
import type { Database, CaseStatus } from "@/types/database.types";

export type CaseRow = Database["public"]["Tables"]["cases"]["Row"];
export type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"];
export type CaseUpdate = Database["public"]["Tables"]["cases"]["Update"];

export async function getCases(filters?: {
  counselorId?: string;
  victimId?: string;
  status?: CaseStatus;
}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("cases")
    .select("*, victim:profiles!cases_victim_id_fkey(id, display_name, role), counselor:profiles!cases_counselor_id_fkey(id, display_name, role)")
    .order("opened_at", { ascending: false });

  if (filters?.counselorId) {
    query = query.eq("counselor_id", filters.counselorId);
  }
  if (filters?.victimId) {
    query = query.eq("victim_id", filters.victimId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCaseById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*, victim:profiles!cases_victim_id_fkey(id, display_name, role), counselor:profiles!cases_counselor_id_fkey(id, display_name, role)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getCaseByRef(caseRef: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*, victim:profiles!cases_victim_id_fkey(id, display_name, role), counselor:profiles!cases_counselor_id_fkey(id, display_name, role)")
    .eq("case_ref", caseRef)
    .single();

  if (error) throw error;
  return data;
}

export async function createCase(data: CaseInsert) {
  const supabase = await createServerClient();
  const { data: newCase, error } = await supabase
    .from("cases")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return newCase;
}

export async function updateCase(id: string, updates: CaseUpdate) {
  const supabase = await createServerClient();
  const { data: updatedCase, error } = await supabase
    .from("cases")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updatedCase;
}

export async function assignCounselor(caseId: string, counselorId: string | null) {
  return updateCase(caseId, { counselor_id: counselorId });
}

export const assignCase = assignCounselor;

export async function updateCaseStatus(caseId: string, status: CaseStatus) {
  return updateCase(caseId, { status });
}

