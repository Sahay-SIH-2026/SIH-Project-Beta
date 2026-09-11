import { createClient } from "@supabase/supabase-js";
import 'dotenv/config.js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("interactions")
    .select("distress_level, distress_score, immediate_danger, distress_signals, distress_reason")
    .limit(1);
    
  console.log("Error:", error);
}

main();
