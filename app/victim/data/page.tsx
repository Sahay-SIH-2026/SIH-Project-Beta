/**
 * /victim/data — My Data — transparency and consent information.
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "My Data" };

const DATA_SECTIONS = [
  {
    id: "data-collected",
    heading: "Information Collected",
    description: "A summary of information recorded about your case and check-ins.",
    phase: "Phase 4 — API",
  },
  {
    id: "data-why",
    heading: "Why It Is Collected",
    description: "The purpose of each piece of information collected.",
    phase: "Phase 5 — Core UI",
  },
  {
    id: "data-access",
    heading: "Who Can Access It",
    description: "A list of roles and people who have access to your information.",
    phase: "Phase 3 — Authentication + RBAC",
  },
  {
    id: "data-consent",
    heading: "Your Consent",
    description: "Review and manage the consents you have given.",
    phase: "Phase 5 — Core UI",
  },
  {
    id: "data-history",
    heading: "Access History",
    description: "A log of who has accessed your information and when.",
    phase: "Phase 4 — API",
  },
] as const;

export default function VictimDataPage() {
  return (
    <div className="sahay-container py-8">
      <h1 className="text-2xl font-semibold text-foreground">My Data</h1>
      <p className="mt-1 max-w-lg text-sm text-muted-foreground">
        You have the right to know what information is held about you, why it is
        held, and who can see it.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {DATA_SECTIONS.map(({ id, heading, description, phase }) => (
          <div
            key={id}
            id={id}
            className="rounded-lg border border-border bg-card p-5"
          >
            <h2 className="text-base font-semibold text-foreground">
              {heading}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <div className="mt-4">
              <ComingSoon plannedPhase={phase} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
