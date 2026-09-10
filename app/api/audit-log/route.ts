import { NextResponse } from "next/server";
import { getAuditLogs, logAuditEvent } from "@/lib/db/audit";
import type { UserRole } from "@/types/database.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const actorRole = searchParams.get("actor_role") as UserRole | null;
    const action = searchParams.get("action") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const logs = await getAuditLogs({
      actorRole: actorRole || undefined,
      action,
      limit,
    });

    return NextResponse.json({ auditLogs: logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch audit logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actor_id, actor_role, action, resource_type, resource_id, metadata } = body;

    if (!actor_id || !actor_role || !action || !resource_type) {
      return NextResponse.json(
        { error: "actor_id, actor_role, action, and resource_type are required fields" },
        { status: 400 }
      );
    }

    const event = await logAuditEvent({
      actor_id,
      actor_role,
      action,
      resource_type,
      resource_id,
      metadata,
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record audit event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
