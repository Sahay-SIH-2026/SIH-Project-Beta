"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Download,
  Building2,
  Users,
  Activity,
  PhoneCall,
  Lock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface DistrictMetric {
  districtName: string;
  totalCases: number;
  criticalCases: number;
  elevatedCases: number;
  stableCases: number;
  avgScore: number;
}

interface CaseSummaryItem {
  id: string;
  caseRef: string;
  district: string;
  severity: "STABLE" | "CONCERN" | "ELEVATED" | "CRITICAL";
  score: number;
  lastInteractionDate: string;
  primaryChannel: string;
  protectionStatus: string;
}

interface OfficialAnalyticsViewProps {
  districts: DistrictMetric[];
  cases: CaseSummaryItem[];
  totalCases: number;
  criticalCount: number;
  elevatedCount: number;
  stableCount: number;
}

export function OfficialAnalyticsView({
  districts,
  cases,
  totalCases,
  criticalCount,
  elevatedCount,
  stableCount,
}: OfficialAnalyticsViewProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");

  const filteredCases = selectedDistrict === "ALL"
    ? cases
    : cases.filter((c) => c.district === selectedDistrict);

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  const concernCount = Math.max(0, totalCases - criticalCount - elevatedCount - stableCount);

  return (
    <div className="space-y-6 print:p-0">
      {/* Privacy Guardrail Assurance Banner */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary shrink-0" />
          <span>
            <strong>DPDP Act &amp; Victim Protection Compliance:</strong> Zero Personally Identifiable Information (PII) is exposed on authority dashboards. All data points are strictly anonymized and aggregated.
          </span>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 font-medium text-foreground hover:bg-secondary/80 transition print:hidden"
        >
          <Download className="h-3.5 w-3.5" />
          Export / Print Summary
        </button>
      </div>

      {/* Executive Key Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Monitored Complainants</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalCases}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Active longitudinal profiles</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">High / Critical Alerts</span>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-2 text-2xl font-bold text-destructive">{criticalCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Immediate escalation review</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Elevated Support Cohort</span>
            <Activity className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{elevatedCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Advisory check-in needed</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Stable Recovery Cohort</span>
            <Building2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stableCount}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Maintaining coping buffer</p>
        </div>
      </div>

      {/* Severity Distribution Visual Breakdown */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          State Caseload Distress Distribution
        </h3>
        <p className="text-xs text-muted-foreground">
          Normalized support tiers calculated dynamically across all continuous monitoring channels.
        </p>

        {/* Stacked Percentage Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary flex">
          {stableCount > 0 && (
            <div
              style={{ width: `${(stableCount / totalCases) * 100}%` }}
              className="bg-emerald-500 transition-all"
              title={`Stable: ${stableCount}`}
            />
          )}
          {concernCount > 0 && (
            <div
              style={{ width: `${(concernCount / totalCases) * 100}%` }}
              className="bg-blue-400 transition-all"
              title={`Concern: ${concernCount}`}
            />
          )}
          {elevatedCount > 0 && (
            <div
              style={{ width: `${(elevatedCount / totalCases) * 100}%` }}
              className="bg-amber-500 transition-all"
              title={`Elevated: ${elevatedCount}`}
            />
          )}
          {criticalCount > 0 && (
            <div
              style={{ width: `${(criticalCount / totalCases) * 100}%` }}
              className="bg-destructive transition-all"
              title={`Critical: ${criticalCount}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Stable (0–25): <strong>{stableCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            <span className="text-muted-foreground">Concern (26–50): <strong>{concernCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Elevated (51–75): <strong>{elevatedCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Critical (76–100): <strong>{criticalCount}</strong></span>
          </div>
        </div>
      </div>

      {/* District Hotspot Breakdown */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Regional &amp; District Hotspots
            </h3>
            <p className="text-xs text-muted-foreground">
              Cross-district comparison of vulnerable cases and average support urgency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Districts ({cases.length})</option>
              {districts.map((d) => (
                <option key={d.districtName} value={d.districtName}>
                  {d.districtName} ({d.totalCases})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {districts.map((d) => (
            <div
              key={d.districtName}
              className={`rounded-lg border p-3.5 text-xs transition ${
                selectedDistrict === d.districtName
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border/70 bg-card hover:bg-secondary/30"
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>{d.districtName}</span>
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {d.totalCases} cases
                </span>
              </div>

              <div className="mt-2.5 space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Critical Risk:</span>
                  <span className={d.criticalCases > 0 ? "font-bold text-destructive" : ""}>
                    {d.criticalCases}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Elevated:</span>
                  <span className={d.elevatedCases > 0 ? "font-bold text-amber-600" : ""}>
                    {d.elevatedCases}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mean Distress Score:</span>
                  <span className="font-medium text-foreground">{d.avgScore} / 100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anonymized Case Registry */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Anonymized Longitudinal Case Registry
          </h3>
          <span className="text-xs text-muted-foreground">
            Showing {filteredCases.length} records (PII Protected)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Case Reference</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Distress Level</th>
                <th className="py-2.5 px-3">Latest Score</th>
                <th className="py-2.5 px-3">Ingestion Channel</th>
                <th className="py-2.5 px-3">Protection Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/20 transition">
                  <td className="py-3 px-3 font-semibold text-foreground">{c.caseRef}</td>
                  <td className="py-3 px-3 text-muted-foreground">{c.district}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.severity === "CRITICAL"
                          ? "bg-destructive text-destructive-foreground"
                          : c.severity === "ELEVATED"
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200"
                          : c.severity === "CONCERN"
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200"
                          : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200"
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-foreground">{c.score} / 100</td>
                  <td className="py-3 px-3 text-muted-foreground flex items-center gap-1 mt-1">
                    <PhoneCall className="h-3 w-3 text-primary" />
                    {c.primaryChannel}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{c.protectionStatus}</td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/counselor/cases/${c.id}`}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      View Workspace
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
