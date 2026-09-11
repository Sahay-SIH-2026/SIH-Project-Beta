import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
/**
 * Creates a Supabase admin client using the service role key.
 * Used ONLY on the server for privileged administrative operations.
 * NEVER import or expose in client-side code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "CONFIGURATION ERROR: Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL.\n\n" +
      "To fix this:\n" +
      "1. Open your .env.local file.\n" +
      "2. Add your SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key_here].\n" +
      "3. You must restart the Next.js server (npm run dev) after updating .env.local for server-side secrets to load!"
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
