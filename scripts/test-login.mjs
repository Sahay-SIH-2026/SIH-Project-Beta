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

const supabase = createClient(url, key);

const ACCOUNTS = [
  { role: "ADMIN", email: "admin@luma.org", password: "Password123!" },
  { role: "COUNSELOR", email: "counselor@luma.org", password: "Password123!" },
  { role: "VICTIM", email: "victim1@demo.luma.org", password: "Password123!" },
];

async function testAccounts() {
  console.log(`🔐 Testing Authentication against Supabase: ${url}\n`);

  let hasSchemaError = false;

  for (const acc of ACCOUNTS) {
    process.stdout.write(`Testing [${acc.role}] (${acc.email})... `);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (error) {
      if (error.message.includes("Database error querying schema")) {
        console.log(`❌ FAILED: "Database error querying schema"`);
        hasSchemaError = true;
      } else {
        console.log(`❌ FAILED: ${error.message} (status: ${error.status})`);
      }
    } else if (data.session) {
      console.log(`✅ SUCCESS! User ID: ${data.user.id}`);
      await supabase.auth.signOut();
    } else {
      console.log(`⚠️ NO ERROR, but no session returned.`);
    }
  }

  if (hasSchemaError) {
    const projectRef = url.split("//")[1]?.split(".")[0];
    console.log(`\n================================================================`);
    console.log(`🚨 "Database error querying schema" detected!`);
    console.log(`This is caused by NULL token columns and missing identities in auth.users.`);
    console.log(`\n👉 FIX: Run the SQL script located at 'supabase/fix-auth-users.sql'`);
    console.log(`   in your Supabase SQL Editor:`);
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log(`================================================================\n`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All tested accounts authenticated successfully!`);
  }
}

testAccounts();
