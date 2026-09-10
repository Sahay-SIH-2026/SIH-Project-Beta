import { NextResponse } from "next/server";
import { getConsentsByVictimId, updateConsentStatus } from "@/lib/db/consents";
import { createServerClient } from "@/lib/supabase/server";
import type { ConsentStatus } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const victimId = searchParams.get("victim_id");

    if (!victimId) {
      return NextResponse.json({ error: "victim_id query parameter is required" }, { status: 400 });
    }

    const consents = await getConsentsByVictimId(victimId);
    return NextResponse.json({ consents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch consents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, victim_id, purpose, status } = body;

    if (!status) {
      return NextResponse.json({ error: "status is a required field" }, { status: 400 });
    }

    if (id) {
      const updated = await updateConsentStatus(id, status as ConsentStatus);
      return NextResponse.json({ consent: updated });
    }

    if (!victim_id || !purpose) {
      return NextResponse.json(
        { error: "victim_id and purpose are required when creating consent" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: newConsent, error } = await supabase
      .from("consents")
      .insert({
        victim_id,
        purpose,
        status: status as ConsentStatus,
        granted_at: status === "GIVEN" ? new Date().toISOString() : null,
        withdrawn_at: status === "WITHDRAWN" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ consent: newConsent }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save consent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
