/**
 * /counselor/alerts — Real Alert Management Workspace
 */

import type { Metadata } from "next";
import { getAlerts } from "@/lib/db/alerts";
import { AlertsListView } from "@/components/counselor/AlertsListView";
import { DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import { ShieldAlert } from "lucide-react";
import type { AlertRow } from "@/types/database.types";

export const metadata: Metadata = { title: "Alerts & Signals" };

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
    <div className="space-y-6">
      {/* Prototype / Disclaimer */}
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <span>
            <strong>Decision-Support Notice:</strong> {DISTRESS_SIGNAL_DISCLAIMER}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Support Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Flagged cases where automated checks indicate shifting response patterns or missed check-ins requiring human review.
        </p>
      </div>

      <AlertsListView initialAlerts={alerts} />
    </div>
  );
}
