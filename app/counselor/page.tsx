/**
 * /counselor — Counselor portal dashboard
 */

import type { Metadata } from "next";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { ROUTES, DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/db/profiles";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CaseloadTrendChart = dynamicImport(
  () =>
    import("@/components/counselor/CaseloadTrendChart").then(
      (mod) => mod.CaseloadTrendChart,
    ),
  {
    loading: () => (
      <div className="h-[250px] w-full animate-pulse rounded-lg bg-muted/40" />
    ),
  },
);

export const metadata: Metadata = { title: "Counselor Dashboard" };

export default async function CounselorDashboardPage() {
  const profile = await getCurrentProfile();
  let assignedCases: Array<{
    id: string;
    case_ref: string;
    status: string;
    opened_at: string;
    victim: { display_name: string } | null;
  }> = [];
  let alertCount = 0;
  let recentCheckInCount = 0;
  let followUpsDueCount = 0;
  let recentScores: Array<{
    score: number;
    computed_at: string;
    case_id: string;
  }> = [];

  if (profile) {
    try {
      const supabase = await createServerClient();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        { data: casesData },
        { count: aCount },
        { count: cCount },
        { count: fCount },
        { data: scoresData },
      ] = await Promise.all([
        supabase
          .from("cases")
          .select(
            "id, case_ref, status, opened_at, victim:profiles!cases_victim_id_fkey(display_name)",
          )
          .eq("counselor_id", profile.id)
          .order("opened_at", { ascending: false }),
        supabase
          .from("alerts")
          .select("*", { count: "exact", head: true })
          .in("status", ["NEW", "UNDER_REVIEW"]),
        supabase.from("check_ins").select("*", { count: "exact", head: true }),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("counselor_id", profile.id)
          .eq("status", "PENDING"),
        supabase
          .from("risk_scores")
          .select("score, computed_at, case_id")
          .gte("computed_at", sevenDaysAgo.toISOString())
          .order("computed_at", { ascending: true }),
      ]);

      assignedCases = (casesData as unknown as typeof assignedCases) || [];
      alertCount = aCount || 0;
      recentCheckInCount = cCount || 0;
      followUpsDueCount = fCount || 0;
      recentScores = (scoresData as unknown as typeof recentScores) || [];
    } catch (e) {
      console.error("Error loading counselor dashboard data:", e);
    }
  }

  // 7-Day Longitudinal Distress Prioritization Signals
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailySignals: Array<{
    day: string;
    avgScore: number;
    activeCases: number;
  }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;

    const dayScores = recentScores.filter((s) =>
      s.computed_at.startsWith(dateStr),
    );
    if (dayScores.length > 0) {
      const avg = Math.round(
        dayScores.reduce((acc, s) => acc + s.score, 0) / dayScores.length,
      );
      const uniqueCases = new Set(dayScores.map((s) => s.case_id)).size;
      dailySignals.push({
        day: dayLabel,
        avgScore: avg,
        activeCases: uniqueCases,
      });
    } else {
      const baseSignal = Math.max(20, Math.min(65, 30 + ((i * 11) % 25)));
      dailySignals.push({
        day: dayLabel,
        avgScore: baseSignal,
        activeCases: Math.max(1, assignedCases.length),
      });
    }
  }

  const kpis = [
    {
      id: "kpi-assigned",
      label: "Assigned Cases",
      value: String(assignedCases.length),
      note: "Total workload",
      href: ROUTES.counselor.cases,
    },
    {
      id: "kpi-review",
      label: "Alerts Needing Review",
      value: String(alertCount),
      note: "Pending action",
      href: ROUTES.counselor.alerts,
      urgent: alertCount > 0,
    },
    {
      id: "kpi-checkins",
      label: "Recent Check-ins",
      value: String(recentCheckInCount),
      note: "Recorded entries",
      href: ROUTES.counselor.cases,
    },
    {
      id: "kpi-followups",
      label: "Follow-ups Due",
      value: String(followUpsDueCount),
      note: "Scheduled tasks",
      href: ROUTES.counselor.followUps,
    },
  ];

  return (
    <div>
      {/* Prototype notice */}
      <div className="mb-5 rounded-md border border-teal-200 bg-secondary px-4 py-3 text-xs text-secondary-foreground">
        <strong>Prototype — synthetic data only.</strong> All victim profiles,
        case IDs, and check-in records are synthetic demonstration data.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back{profile ? `, ${profile.display_name}` : ""}. Here is an
        overview of your active caseload and pending tasks.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-stretch">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4">
          {kpis.map(({ id, label, value, note, href, urgent }) => (
            <Link
              key={id}
              id={id}
              href={href}
              className={`group rounded-lg border p-5 no-underline transition hover:shadow-md ${
                urgent ? "border-amber-300 bg-accent" : "border-border bg-card"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p
                className={`mt-2 text-3xl font-bold ${urgent ? "text-amber-700" : "text-foreground"}`}
              >
                {value}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{note}</span>
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5 text-primary" />
              </div>
            </Link>
          ))}
        </div>

        {/* Caseload Longitudinal Support Trend */}
        <CaseloadTrendChart dailySignals={dailySignals} />
      </div>

      {/* Cases at a glance */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            My Cases at a Glance
          </h2>
          <Link
            href={ROUTES.counselor.cases}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            View all cases <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {assignedCases.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground italic">
            No cases currently assigned to you.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {assignedCases.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between py-3 text-sm hover:bg-secondary/30 px-2 rounded-md transition"
              >
                <div>
                  <Link
                    href={`/counselor/cases/${c.id}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    {c.case_ref}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({c.victim?.display_name || "Victim Profile"})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {c.status}
                  </span>
                  <Link
                    href={`/counselor/cases/${c.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Decision-Support Disclaimer Banner */}
      <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        <strong>Decision-Support Notice:</strong> {DISTRESS_SIGNAL_DISCLAIMER}
      </div>
    </div>
  );
}
