/**
 * /victim — Victim portal home
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, LifeBuoy, Lock } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Home",
  description: "Your SAHAY victim support home page.",
};

export default function VictimHomePage() {
  return (
    <div className="sahay-container py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your information is private. Only your assigned support worker can
          access it.
        </p>
      </div>

      {/* Case status placeholder */}
      <div className="mb-4 rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Current Case Status
        </p>
        <p className="mt-1.5 text-lg font-semibold text-foreground">Active</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Case ref: <span className="font-mono">V-1042</span>
        </p>
        <Link
          href={ROUTES.victim.case}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
        >
          View case details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* CTAs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.victim.checkIn}
          id="cta-check-in"
          className="group flex flex-col rounded-lg border border-border bg-card p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
        >
          <ClipboardList
            className="mb-3 h-6 w-6 text-primary"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-foreground">
            Today&rsquo;s Check-In
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share how you are feeling. Takes about a minute.
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
          <LifeBuoy
            className="mb-3 h-6 w-6 text-primary"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-foreground">
            Support &amp; Contact
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View your support contact information.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            View support{" "}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      {/* Privacy reminder */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-secondary/60 p-4">
        <Lock
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">
          Your information is collected only to support your well-being. You can
          review what is stored and who has access from the{" "}
          <Link href={ROUTES.victim.data} className="font-medium text-foreground">
            My Data
          </Link>{" "}
          section.
        </p>
      </div>
    </div>
  );
}
