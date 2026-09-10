import { NextResponse } from "next/server";
import { getAlerts, updateAlertStatus } from "@/lib/db/alerts";
import type { AlertSeverity, AlertStatus } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity") as AlertSeverity | null;
    const status = searchParams.get("status") as AlertStatus | null;
    const caseId = searchParams.get("case_id") || undefined;

    const alerts = await getAlerts({
      severity: severity || undefined,
      status: status || undefined,
      caseId,
    });

    return NextResponse.json({ alerts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch alerts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, reviewed_by_id } = body;

    if (!id || !status || !reviewed_by_id) {
      return NextResponse.json(
        { error: "id, status, and reviewed_by_id are required fields" },
        { status: 400 }
      );
    }

    const updated = await updateAlertStatus(id, status as AlertStatus, reviewed_by_id);
    return NextResponse.json({ alert: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update alert";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
