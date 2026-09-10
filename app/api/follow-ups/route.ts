import { NextResponse } from "next/server";
import { getFollowUps, updateFollowUpStatus } from "@/lib/db/follow-ups";
import { createServerClient } from "@/lib/supabase/server";
import type { FollowUpStatus } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("case_id") || undefined;
    const counselorId = searchParams.get("counselor_id") || undefined;
    const status = searchParams.get("status") as FollowUpStatus | null;

    const followUps = await getFollowUps({
      caseId,
      counselorId,
      status: status || undefined,
    });

    return NextResponse.json({ followUps });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch follow-ups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_id, counselor_id, title, description, due_date } = body;

    if (!case_id || !counselor_id || !title || !due_date) {
      return NextResponse.json(
        { error: "case_id, counselor_id, title, and due_date are required fields" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: newFollowUp, error } = await supabase
      .from("follow_ups")
      .insert({
        case_id,
        counselor_id,
        title: title.trim(),
        description: description?.trim() || null,
        due_date,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ followUp: newFollowUp }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create follow-up";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required fields" }, { status: 400 });
    }

    const updated = await updateFollowUpStatus(id, status as FollowUpStatus);
    return NextResponse.json({ followUp: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update follow-up";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
