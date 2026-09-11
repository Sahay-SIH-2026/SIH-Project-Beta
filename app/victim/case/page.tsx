/**
 * /victim/case — Dynamic victim case detail page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserCheck, Calendar, FileText, Info } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/db/profiles";
import { createServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My Case Details" };

interface VictimDetailedCaseInfo {
  id: string;
  case_ref: string;
  status: string;
  opened_at: string;
  notes: string | null;
  counselor: { display_name: string } | null;
}

export default async function VictimCasePage() {
  const profile = await getCurrentProfile();
  let caseData: VictimDetailedCaseInfo | null = null;
  let checkInCount = 0;

  if (profile) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("cases")
        .select("id, case_ref, status, opened_at, notes, counselor:profiles!cases_counselor_id_fkey(display_name)")
        .eq("victim_id", profile.id)
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        caseData = data as unknown as VictimDetailedCaseInfo;

        const { count } = await supabase
          .from("check_ins")
          .select("*", { count: "exact", head: true })
          .eq("case_id", data.id);
        checkInCount = count || 0;
      }
    } catch (e) {
      console.error("Error fetching victim case:", e);
    }
  }

  return (
    <div className="luma-container py-8 max-w-3xl">
      <Link
        href={ROUTES.victim.root}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Support Case</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Official support status and assigned worker information.
          </p>
        </div>
        {caseData && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {caseData.status}
          </span>
        )}
      </div>

      {caseData ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Case ID */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Case Reference
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold text-foreground">
                {caseData.case_ref}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use this reference when communicating with official helplines.
              </p>
            </div>

            {/* Opened Date */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Case Opened
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-base font-medium text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(caseData.opened_at)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Total check-ins recorded: <strong className="text-foreground">{checkInCount}</strong>
              </p>
            </div>

            {/* Assigned support contact */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assigned Support Counselor
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {caseData.counselor?.display_name || "Pending assignment by coordinator"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Authorized support worker under institutional mandate.
                  </p>
                </div>
              </div>
            </div>

            {/* Notes and updates */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Support Notes &amp; Updates
              </p>
              <p className="mt-2 text-sm text-foreground bg-secondary/40 p-4 rounded-md whitespace-pre-wrap">
                {caseData.notes || "No public case notes have been posted yet."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/50 p-4 text-xs text-muted-foreground flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div>
              LUMA ensures continuous care during investigation and trial phases. If your safety is at risk, immediately call <strong>14566</strong> or <strong>1091</strong>.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No case found for your user account.</p>
          <Link
            href={ROUTES.victim.support}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Contact Help Desk
          </Link>
        </div>
      )}
    </div>
  );
}
