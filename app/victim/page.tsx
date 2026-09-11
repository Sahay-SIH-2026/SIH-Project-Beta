/**
 * /victim — Victim support hub
 *
 * Redesigned around a support-first experience:
 *   Welcome → Check-in → Support Status → What Happens Next →
 *   Recent Update → Get Support → Privacy
 *
 * This is a server component. All data is fetched via the existing
 * Supabase server client with RLS boundaries. No client components
 * are introduced here.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  LifeBuoy,
  Lock,
  FileText,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/db/profiles";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: "Your LUMA support home — check in, view your support, and access resources.",
};

/* ─── Data shapes ──────────────────────────────────────────────────────────── */

interface VictimCaseInfo {
  id: string;
  case_ref: string;
  status: string;
  opened_at: string;
  updated_at: string;
  counselor: { display_name: string } | null;
}

interface NextFollowUp {
  id: string;
  title: string;
  due_date: string;
  description: string | null;
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** True if the check-in was submitted less than 12 hours ago. */
function isRecentCheckIn(submittedAt: string): boolean {
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  return Date.now() - new Date(submittedAt).getTime() < TWELVE_HOURS_MS;
}

/**
 * Format a follow-up due date into a human-friendly string.
 * E.g. "Friday · 3:00 PM"
 */
function formatFollowUpDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-IN", { weekday: "long" });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} · ${time}`;
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default async function VictimHomePage() {
  const profile = await getCurrentProfile();

  let caseRecord: VictimCaseInfo | null = null;
  let latestCheckIn: { id: string; submitted_at: string } | null = null;
  let nextFollowUp: NextFollowUp | null = null;

  if (profile) {
    try {
      const supabase = await createServerClient();
      const [{ data: c }, { data: ci }, { data: fu }] = await Promise.all([
        /* Case info — reused from before, now also selects updated_at */
        supabase
          .from("cases")
          .select(
            "id, case_ref, status, opened_at, updated_at, counselor:profiles!cases_counselor_id_fkey(display_name)"
          )
          .eq("victim_id", profile.id)
          .order("opened_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        /* Latest check-in */
        supabase
          .from("check_ins")
          .select("id, submitted_at")
          .eq("victim_id", profile.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        /* Next pending follow-up (linked to any of the victim's cases) */
        supabase
          .from("follow_ups")
          .select("id, title, due_date, description, case:cases!follow_ups_case_id_fkey(victim_id)")
          .eq("status", "PENDING")
          .order("due_date", { ascending: true })
          .limit(10),
      ]);

      if (c) caseRecord = c as unknown as VictimCaseInfo;
      if (ci) latestCheckIn = ci;

      // Filter follow-ups to those belonging to this victim's cases
      if (fu && fu.length > 0) {
        const victimFollowUp = fu.find((f: Record<string, unknown>) => {
          const caseData = f.case as { victim_id: string } | null;
          return caseData?.victim_id === profile.id;
        });
        if (victimFollowUp) {
          nextFollowUp = {
            id: victimFollowUp.id as string,
            title: victimFollowUp.title as string,
            due_date: victimFollowUp.due_date as string,
            description: victimFollowUp.description as string | null,
          };
        }
      }
    } catch (e) {
      console.error("Error loading victim home data:", e);
    }
  }

  const firstName = profile?.display_name?.split(" ")[0] ?? "";
  const recentlyCheckedIn = latestCheckIn ? isRecentCheckIn(latestCheckIn.submitted_at) : false;
  const hasRecentUpdate =
    caseRecord && caseRecord.updated_at !== caseRecord.opened_at;

  return (
    <div className="luma-container py-6 sm:py-10">
      {/* ── Section 1: Welcome ─────────────────────────────────────────── */}
      <section className="mb-8" aria-labelledby="victim-welcome-heading">
        <h1
          id="victim-welcome-heading"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-relaxed max-w-lg">
          Your support is here whenever you need it.
        </p>
      </section>

      {/* ── Section 2: Persistent Check-in CTA ───────────────────────── */}
      <section className="mb-8" aria-labelledby="victim-need-to-talk-heading">
        <Link
          href={ROUTES.victim.checkIn}
          className="group relative block overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] p-6 no-underline shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {/* Decorative left accent bar */}
          <div
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-accent/80"
            aria-hidden="true"
          />
          <div className="flex items-start gap-4 pl-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="victim-need-to-talk-heading"
                className="text-lg font-semibold text-foreground"
              >
                Need to talk?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                If something is worrying you, or you just want to share how you&rsquo;re feeling, you can check in with your support team.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Share how I&rsquo;m feeling
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Section 2.5: Recent Check-in Status ────────────────────────────── */}
      {recentlyCheckedIn && (
        <section className="mb-8" aria-labelledby="victim-checkin-summary-heading">
          <div
            className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="victim-checkin-summary-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Thanks for checking in
                </h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Your check-in has been recorded. Your support team will review it.
                </p>
                {latestCheckIn && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted {relativeTime(latestCheckIn.submitted_at)}
                  </p>
                )}
                <Link
                  href={ROUTES.victim.checkInHistory}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 no-underline hover:underline"
                >
                  View check-in history
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Secondary sections — two-column on desktop ─────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* ── Section 3: Support Status ──────────────────────────────────── */}
        <section
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
          aria-labelledby="victim-support-heading"
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" aria-hidden="true" />
            <h2
              id="victim-support-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Your Support
            </h2>
          </div>

          {caseRecord ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Support active
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your support team is available to help you through the process.
              </p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>
                  Case: <span className="font-mono font-medium text-foreground">{caseRecord.case_ref}</span>
                </p>
                <p>
                  Counselor:{" "}
                  <span className="font-medium text-foreground">
                    {caseRecord.counselor?.display_name || "Pending assignment"}
                  </span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <Link
                  href={ROUTES.victim.case}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
                >
                  View my case
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No active support case is currently linked to your profile.
              </p>
              <Link
                href={ROUTES.victim.support}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
              >
                Contact support
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          )}
        </section>

        {/* ── Section 4: What Happens Next ────────────────────────────────── */}
        <section
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
          aria-labelledby="victim-next-heading"
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
            <h2
              id="victim-next-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              What happens next
            </h2>
          </div>

          {nextFollowUp ? (
            <>
              <p className="text-base font-semibold text-foreground">
                {formatFollowUpDate(nextFollowUp.due_date)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {nextFollowUp.title}
              </p>
              {nextFollowUp.description && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {nextFollowUp.description}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                Nothing scheduled right now
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Your support team will contact you when a follow-up is needed.
              </p>
            </>
          )}
        </section>
      </div>

      {/* ── Section 5: Recent Update ─────────────────────────────────────── */}
      {hasRecentUpdate && caseRecord && (
        <section
          className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm"
          aria-labelledby="victim-update-heading"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h2
              id="victim-update-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Recent update
            </h2>
          </div>
          <p className="text-sm text-foreground">
            Your support case was updated.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Last updated {relativeTime(caseRecord.updated_at)}
          </p>
          <Link
            href={ROUTES.victim.case}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
          >
            View update
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      )}

      {/* ── Section 6: Get Support ───────────────────────────────────────── */}
      <section
        className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm"
        aria-labelledby="victim-getsupport-heading"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="victim-getsupport-heading"
              className="text-base font-semibold text-foreground"
            >
              Need support?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Find verified resources or available support services.
            </p>
            <Link
              href={ROUTES.victim.support}
              id="cta-support"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:underline"
            >
              Get support
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 7: Privacy / Consent ─────────────────────────────────── */}
      <section
        className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4"
        aria-labelledby="victim-privacy-heading"
      >
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="text-sm text-muted-foreground leading-relaxed">
          <h2 id="victim-privacy-heading" className="sr-only">
            Privacy and consent
          </h2>
          Your information is handled according to your consent choices.{" "}
          <Link
            href={ROUTES.victim.data}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Manage data &amp; consent
          </Link>
        </div>
      </section>
    </div>
  );
}
