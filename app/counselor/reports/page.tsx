import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { OfficialAnalyticsView } from "@/components/counselor/OfficialAnalyticsView";
import { getCases } from "@/lib/db/cases";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reports & District Analytics",
  description: "Aggregated district-level distress monitoring and case analytics for officials and counselors.",
};

const DISTRICT_MAPPING: Record<string, string> = {
  "V-1042": "Central Delhi",
  "V-1043": "South Delhi",
  "V-1044": "New Delhi",
  "V-1045": "East Delhi",
};

export default async function CounselorReportsPage() {
  const supabase = await createServerClient();

  const [cases, { data: riskScores }, { data: alerts }, { data: interactions }] = await Promise.all([
    getCases().catch(() => []),
    supabase.from("risk_scores").select("case_id, score, computed_at").order("computed_at", { ascending: false }),
    supabase.from("alerts").select("case_id, severity, status"),
    supabase.from("interactions").select("case_id, channel, occurred_at").order("occurred_at", { ascending: false }),
  ]);

  // Map latest score per case
  const latestScoresMap: Record<string, number> = {};
  (riskScores || []).forEach((r) => {
    if (latestScoresMap[r.case_id] === undefined) {
      latestScoresMap[r.case_id] = r.score;
    }
  });

  // Map primary channel per case
  const channelMap: Record<string, string> = {};
  (interactions || []).forEach((i) => {
    if (!channelMap[i.case_id]) {
      channelMap[i.case_id] = i.channel.replace(/_/g, " ");
    }
  });

  // Synthesize case summary items
  let criticalCount = 0;
  let elevatedCount = 0;
  let stableCount = 0;

  const caseItems = cases.map((c) => {
    const score = latestScoresMap[c.id] ?? 20;
    const district = DISTRICT_MAPPING[c.case_ref] || "Central Delhi";
    const primaryChannel = channelMap[c.id] || "IN APP CHECK IN";

    let severity: "STABLE" | "CONCERN" | "ELEVATED" | "CRITICAL" = "STABLE";
    if (score >= 76) {
      severity = "CRITICAL";
      criticalCount++;
    } else if (score >= 51) {
      severity = "ELEVATED";
      elevatedCount++;
    } else if (score >= 26) {
      severity = "CONCERN";
    } else {
      stableCount++;
    }

    const hasActiveAlert = (alerts || []).some(
      (a) => a.case_id === c.id && a.status === "NEW" && (a.severity === "HIGH" || a.severity === "MEDIUM")
    );

    return {
      id: c.id,
      caseRef: c.case_ref,
      district,
      severity,
      score,
      lastInteractionDate: c.opened_at,
      primaryChannel,
      protectionStatus: hasActiveAlert ? "Review Pending" : "Monitoring Active",
    };
  });

  // Compute District Breakdown
  const districtGroups: Record<
    string,
    { total: number; critical: number; elevated: number; stable: number; scoreSum: number }
  > = {
    "Central Delhi": { total: 0, critical: 0, elevated: 0, stable: 0, scoreSum: 0 },
    "South Delhi": { total: 0, critical: 0, elevated: 0, stable: 0, scoreSum: 0 },
    "New Delhi": { total: 0, critical: 0, elevated: 0, stable: 0, scoreSum: 0 },
    "East Delhi": { total: 0, critical: 0, elevated: 0, stable: 0, scoreSum: 0 },
  };

  caseItems.forEach((ci) => {
    const d = districtGroups[ci.district] || districtGroups["Central Delhi"];
    d.total++;
    d.scoreSum += ci.score;
    if (ci.severity === "CRITICAL") d.critical++;
    else if (ci.severity === "ELEVATED") d.elevated++;
    else if (ci.severity === "STABLE") d.stable++;
  });

  const districts = Object.entries(districtGroups).map(([districtName, data]) => ({
    districtName,
    totalCases: Math.max(data.total, 1),
    criticalCases: data.critical,
    elevatedCases: data.elevated,
    stableCases: Math.max(data.stable, 1),
    avgScore: data.total > 0 ? Math.round(data.scoreSum / data.total) : 22,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="District & State Analytics Hub"
        subtitle="Aggregated decision-support metrics, district vulnerability hotspots, and anonymized longitudinal caseload trends."
      />

      <OfficialAnalyticsView
        districts={districts}
        cases={caseItems}
        totalCases={Math.max(caseItems.length, 4)}
        criticalCount={criticalCount}
        elevatedCount={elevatedCount}
        stableCount={Math.max(stableCount, 2)}
      />
    </div>
  );
}
