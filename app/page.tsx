import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  ROUTES,
} from "@/lib/constants";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
};

const PORTALS = [
  {
    id:          "portal-victim",
    role:        "Victim",
    href:        ROUTES.victim.root,
    icon:        ShieldCheck,
    heading:     "Victim Portal",
    description: "Access your case information, submit check-ins, review what data is collected, and reach your support contact.",
    tag:         "Demo — not connected",
  },
  {
    id:          "portal-counselor",
    role:        "Counselor",
    href:        ROUTES.counselor.root,
    icon:        Users,
    heading:     "Counselor Portal",
    description: "View assigned cases, review support-prioritisation signals, manage follow-ups, and document interactions.",
    tag:         "Demo — not connected",
  },
  {
    id:          "portal-admin",
    role:        "Admin",
    href:        ROUTES.admin.root,
    icon:        Settings,
    heading:     "Admin Portal",
    description: "Manage counselor accounts, configure case assignments, and review system audit logs.",
    tag:         "Demo — not connected",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="border-b border-border bg-primary py-16 sm:py-24"
        >
          <div className="sahay-container text-center">
            {/* Dev prototype badge */}
            <p className="mb-6 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              Phase 1 Prototype — For Development Review Only
            </p>

            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              {APP_NAME}
            </h1>

            <p className="mt-3 text-lg font-medium text-white/80 sm:text-xl">
              {APP_TAGLINE}
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
              {APP_DESCRIPTION}
            </p>

            {/* Disclaimer strip */}
            <p className="mx-auto mt-8 max-w-xl rounded-md border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
              SAHAY supports human counselors — it does not replace them. All
              support-prioritisation signals require mandatory human review.
            </p>
          </div>
        </section>

        {/* Portal navigation cards */}
        <section
          aria-labelledby="portals-heading"
          className="sahay-container py-14"
        >
          <h2
            id="portals-heading"
            className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Demo Portals
          </h2>
          <p className="mb-10 text-center text-xs text-muted-foreground">
            Select a portal to preview. Authentication is not implemented in
            this prototype.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {PORTALS.map(({ id, href, icon: Icon, heading, description, tag }) => (
              <Link
                key={id}
                id={id}
                href={href}
                className="group flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md no-underline"
                aria-label={heading}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>

                <h3 className="text-base font-semibold text-foreground">
                  {heading}
                </h3>

                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* About strip */}
        <section className="border-t border-border bg-secondary/40 py-10">
          <div className="sahay-container max-w-3xl text-center">
            <h2 className="text-base font-semibold text-foreground">
              What is SAHAY?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              SAHAY is a platform designed to help authorised support workers
              track changing well-being needs over time. It surfaces
              support-prioritisation signals — not clinical diagnoses — and
              always requires a human counsellor to review and act.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              SAHAY is not a replacement for police, courts, counsellors, or
              emergency services. It does not provide autonomous counselling.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
