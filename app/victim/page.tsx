/**
 * /victim — Victim portal home
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, LifeBuoy, Lock, Clock } from "lucide-react";



import { ROUTES } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: "Your LUMA victim support home page.",
};

interface VictimCaseInfo {
  id: string;
  case_ref: string;
  status: string;
  opened_at: string;
  counselor: { display_name: string } | null;
}

export default async function VictimHomePage() {
  const profile = await getCurrentProfile();
  let caseRecord: VictimCaseInfo | null = null;
  let latestCheckIn: {
    id: string;
    submitted_at: string;
  } | null = null;

  if (profile) {
    try {
      const supabase = await createServerClient();
      const [{ data: c }, { data: ci }] = await Promise.all([
        supabase
          .from("cases")
          .select("id, case_ref, status, opened_at, counselor:profiles!cases_counselor_id_fkey(display_name)")
          .eq("victim_id", profile.id)
          .order("opened_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("check_ins")
          .select("id, submitted_at")
          .eq("victim_id", profile.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (c) {
        caseRecord = c as unknown as VictimCaseInfo;
      }
      if (ci) {
        latestCheckIn = ci;
      }
    } catch (e) {
      console.error("Error loading victim home data:", e);
    }
  }

  return (
    <div className="luma-container py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back{profile ? `, ${profile.display_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your information is private. Only your assigned support worker can access your records.
        </p>
      </div>

      {/* Case status card */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current Case Status
          </p>
          {caseRecord && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {caseRecord.status}
            </span>
          )}
        </div>

        {caseRecord ? (
          <>
            <p className="mt-2 text-xl font-bold font-mono text-foreground">
              {caseRecord.case_ref}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Assigned Counselor:{" "}
              <strong className="text-foreground">
                {caseRecord.counselor?.display_name || "Pending assignment"}
              </strong>
            </p>
            {latestCheckIn && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Last check-in: {formatDate(latestCheckIn.submitted_at)}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <Link
                href={ROUTES.victim.case}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
              >
                View full case details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              No active case reference is currently linked to this profile.
            </p>
            <Link
              href={ROUTES.victim.support}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Contact support organization <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.victim.checkIn}
          id="cta-check-in"
          className="group flex flex-col rounded-lg border border-border bg-card p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
        >
          <ClipboardList className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">Today&rsquo;s Check-In</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share how you are feeling in private. Takes about a minute.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Start check-in{" "}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href={ROUTES.victim.support}
          id="cta-support"
          className="group flex flex-col rounded-lg border border-border bg-card p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
        >
          <LifeBuoy className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">Support &amp; Contact</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View emergency helplines, support worker contacts, and guidance.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            View support{" "}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {/* Privacy & Consent reminder */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-secondary/60 p-4">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="text-sm text-muted-foreground">
          Your information is collected only to support your well-being. You can review your consent choices and see who has access in the{" "}
          <Link href={ROUTES.victim.data} className="font-medium text-foreground underline underline-offset-2">
            My Data &amp; Consent
          </Link>{" "}
          section.
        </div>
      </div>
    </div>
  );
}
