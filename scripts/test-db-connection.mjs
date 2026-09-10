import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const env = {};
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [k, ...v] = trimmed.split("=");
      env[k.trim()] = v.join("=").trim();
    }
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("❌ Missing Supabase URL or Publishable key in environment or .env.local");
  process.exit(1);
}

console.log(`📡 Connecting to Supabase: ${url}`);
const supabase = createClient(url, key);

async function check() {
  const tables = ["profiles", "cases", "check_ins", "alerts", "risk_scores", "audit_logs"];
  console.log("Checking tables in database schema...\n");

  let missingCount = 0;
  for (const table of tables) {
    const { error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      if (error.code === "PGRST205") {
        console.log(`  ❌ Table '${table}': NOT FOUND (run supabase/schema.sql in Supabase SQL editor)`);
        missingCount++;
      } else {
        // Table exists, but RLS denied anon access (which is expected and secure!)
        console.log(`  🔒 Table '${table}': Exists (RLS active: ${error.message})`);
      }
    } else {
      console.log(`  ✅ Table '${table}': OK`);
    }
  }

  if (missingCount > 0) {
    console.log(`\n👉 Action required: Apply the SQL schema at 'supabase/schema.sql' in your Supabase SQL Editor:`);
    console.log(`   https://supabase.com/dashboard/project/${url.split("//")[1]?.split(".")[0]}/sql/new`);
  } else {
    console.log(`\n🎉 All tables exist and database setup is verified!`);
  }
}

check();
