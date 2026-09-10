import { NextResponse } from "next/server";
import { getCases } from "@/lib/db/cases";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const [cases, { data: riskScores }, { data: alerts }, { data: interactions }] =
      await Promise.all([
        getCases().catch(() => []),
        supabase.from("risk_scores").select("case_id, score, computed_at"),
        supabase.from("alerts").select("severity, status"),
        supabase.from("interactions").select("channel"),
      ]);

    const latestScores: Record<string, number> = {};
    (riskScores || []).forEach((r) => {
      if (latestScores[r.case_id] === undefined) {
        latestScores[r.case_id] = r.score;
      }
    });

    let stableCount = 0;
    let concernCount = 0;
    let elevatedCount = 0;
    let criticalCount = 0;

    cases.forEach((c) => {
      const score = latestScores[c.id] ?? 20;
      if (score >= 76) criticalCount++;
      else if (score >= 51) elevatedCount++;
      else if (score >= 26) concernCount++;
      else stableCount++;
    });

    // Channel breakdown
    const channelCounts: Record<string, number> = {
      IN_APP: 0,
      VOICE: 0,
      SMS: 0,
      IVRS: 0,
      HELPLINE: 0,
    };

    (interactions || []).forEach((i) => {
      if (i.channel === "SMS") channelCounts.SMS++;
      else if (i.channel === "VOICE_CALL") channelCounts.VOICE++;
      else channelCounts.IN_APP++;
    });

    return NextResponse.json({
      totalMonitoredCases: cases.length,
      severityDistribution: {
        stable: stableCount,
        concern: concernCount,
        elevated: elevatedCount,
        critical: criticalCount,
      },
      alertMetrics: {
        totalAlerts: alerts?.length || 0,
        unreviewedAlerts: alerts?.filter((a) => a.status === "NEW").length || 0,
        criticalAlerts: alerts?.filter((a) => a.severity === "HIGH").length || 0,
      },
      channelActivity: channelCounts,
      privacyCompliance: "DPDP_ACT_STRICT_ZERO_PII",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch analytics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
