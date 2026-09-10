import { createServerClient } from "@/lib/supabase/server";
import type { Database, UserRole } from "@/types/database.types";

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export async function getAuditLogs(
  options?: number | {
    limit?: number;
    actorRole?: UserRole;
    action?: string;
  }
) {
  const supabase = await createServerClient();
  const limit = typeof options === "number" ? options : options?.limit ?? 50;

  let query = supabase
    .from("audit_logs")
    .select("*, actor:profiles!audit_logs_actor_id_fkey(id, display_name, role)")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (typeof options === "object" && options !== null) {
    if (options.actorRole) {
      query = query.eq("actor_role", options.actorRole);
    }
    if (options.action) {
      query = query.eq("action", options.action);
    }
  }

  const { data, error } = await query;
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
