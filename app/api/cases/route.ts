import { NextResponse } from "next/server";
import { getCases, createCase } from "@/lib/db/cases";
import type { CaseStatus } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as CaseStatus | null;
    const counselorId = searchParams.get("counselor_id") || undefined;
    const victimId = searchParams.get("victim_id") || undefined;

    const cases = await getCases({
      status: status || undefined,
      counselorId,
      victimId,
    });

    return NextResponse.json({ cases });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch cases";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { case_ref, victim_id, counselor_id, status } = body;

    if (!case_ref || !victim_id) {
      return NextResponse.json(
        { error: "case_ref and victim_id are required fields" },
        { status: 400 }
      );
    }

    const newCase = await createCase({
      case_ref,
      victim_id,
      counselor_id: counselor_id || null,
      status: status || "OPEN",
    });

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create case";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
