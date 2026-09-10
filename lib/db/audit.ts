import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export async function getAuditLogs(limit: number = 50) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*, actor:profiles!audit_logs_actor_id_fkey(id, display_name, role)")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function logAuditEvent(entry: AuditLogInsert) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}
