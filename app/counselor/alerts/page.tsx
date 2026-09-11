/**
 * /counselor/alerts — Government-Grade Support Alerts & Monitoring Queue
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getAlerts } from "@/lib/db/alerts";
import { AlertsListView } from "@/components/counselor/AlertsListView";
import { DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import { ShieldAlert, ChevronRight } from "lucide-react";
import type { AlertRow } from "@/types/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Support Alerts | Counselor Portal" };

type AlertWithRelations = AlertRow & {
  case?: { id: string; case_ref: string; status: string } | null;
  reviewer?: { id: string; display_name: string } | null;
};

export default async function CounselorAlertsPage() {
  let alerts: AlertWithRelations[] = [];

  try {
    const data = await getAlerts();
    alerts = (data as unknown as AlertWithRelations[]) || [];
  } catch (e) {
    console.error("Error loading counselor alerts:", e);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Contextual Header & Breadcrumb */}
      <div className="space-y-1.5 border-b border-border/70 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Link href="/counselor" className="hover:text-foreground transition-colors no-underline">
            Counselor Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
          <span className="text-foreground font-semibold">Support Alerts</span>
        </nav>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Support Alerts
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Active distress flags and automated monitoring signals requiring mandatory counselor triage and human review.
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Decision-Support Notice */}
      <div className="rounded-lg border border-amber-200/90 bg-amber-50/80 p-3.5 text-xs text-amber-950 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-amber-100 p-1.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 shrink-0 mt-0.5">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold tracking-wider uppercase text-[11px] text-amber-800 dark:text-amber-300 block">
              Decision-Support Notice
            </span>
            <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
              {DISTRESS_SIGNAL_DISCLAIMER} Automated signals prioritize queue ordering only and do not constitute a clinical psychiatric diagnosis. Counselor confirmation is required for all actions.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Alerts Workspace (Summary Stats, Filter Toolbar, Redesigned Alert Cards) */}
      <AlertsListView initialAlerts={alerts} />
    </div>
  );
}
