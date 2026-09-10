import { NextResponse } from "next/server";
import { getInteractionsByCaseId } from "@/lib/db/interactions";
import { createServerClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/db/audit";
import type { InteractionChannel } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("case_id");

    if (!caseId) {
      return NextResponse.json({ error: "case_id query parameter is required" }, { status: 400 });
    }

    const interactions = await getInteractionsByCaseId(caseId);
    return NextResponse.json({ interactions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch interactions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, channel, summary, recorded_by_id } = body;

    if (!case_id || !channel || !summary || !recorded_by_id) {
      return NextResponse.json(
        { error: "case_id, channel, summary, and recorded_by_id are required fields" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: newInteraction, error } = await supabase
      .from("interactions")
      .insert({
        case_id,
        channel: channel as InteractionChannel,
        summary: summary.trim(),
        recorded_by_id,
      })
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      actor_id: recorded_by_id,
      actor_role: "COUNSELOR",
      action: "LOG_INTERACTION",
      resource_type: "interaction",
      resource_id: newInteraction.id,
      metadata: { case_id, channel },
    }).catch(() => null);

    return NextResponse.json({ interaction: newInteraction }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record interaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
