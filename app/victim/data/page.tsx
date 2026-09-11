/**
 * /victim/data — My Data & Consent Management
 */

import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getConsentsByVictimId } from "@/lib/db/consents";
import { ConsentManager } from "@/components/victim/ConsentManager";
import { ShieldCheck, Eye, Lock, FileText, UserCheck } from "lucide-react";
import type { ConsentStatus } from "@/types/database.types";

export const metadata: Metadata = { title: "My Data & Consent" };

const STANDARD_PURPOSES = [
  {
    purpose: "WELLBEING_MONITORING",
    title: "Periodic Well-being Check-Ins",
    description:
      "Allows the system to securely record your periodic check-in responses so your counselor can understand your well-being over time.",
  },
  {
    purpose: "LONGITUDINAL_ANALYSIS",
    title: "Support Review Prioritization",
    description:
      "Allows automated decision-support signals (illustrative distress indicators) to notify your counselor when you may need additional support.",
  },
  {
    purpose: "STAFF_ACCESS",
    title: "Assigned Counselor Access",
    description:
      "Permits your assigned support worker and authorized supervisory coordinator to view your check-ins and support notes.",
  },
];

export default async function VictimDataPage() {
  const profile = await getCurrentProfile();
  let existingConsents: Array<{ purpose: string; status: ConsentStatus }> = [];

  if (profile) {
    try {
      const data = await getConsentsByVictimId(profile.id);
      existingConsents = data || [];
    } catch (e) {
      console.error("Error fetching victim consents:", e);
    }
  }

  const initialConsents = STANDARD_PURPOSES.map((item) => {
    const found = existingConsents.find((c) => c.purpose === item.purpose);
    return {
      ...item,
      status: (found?.status as ConsentStatus) || "GIVEN",
    };
  });

  return (
    <div className="luma-container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">My Data &amp; Consent</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have full control over your data. You can review and update your consent choices at any time.
        </p>
      </div>

      {/* Consent management section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Active Consent Preferences
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Withdrawing consent prevents future automated reviews and limits counselor visibility for the selected purpose.
        </p>
        <ConsentManager initialConsents={initialConsents} />
      </section>

      {/* Data protection principles */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          How Your Data Is Protected
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lock className="h-4 w-4 text-primary" /> Data Minimization
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              We only collect information directly necessary for your personal safety and support continuity. No extraneous tracking occurs.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary" /> Strict Access Control
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Only your verified assigned counselor can access your notes. General public and unauthorized officials have zero access.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserCheck className="h-4 w-4 text-primary" /> Human-in-the-Loop
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              LUMA does not diagnose or make clinical determinations. Any algorithmic signal is strictly for support prioritization and must be reviewed by a human.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" /> Audit Transparency
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Every access to your case file and every consent modification is immutably recorded in the tamper-evident audit log.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
