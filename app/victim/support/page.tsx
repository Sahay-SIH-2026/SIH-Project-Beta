/**
 * /victim/support — Support and contact information.
 *
 * No real emergency numbers are invented.
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Support" };

export default function VictimSupportPage() {
  return (
    <div className="sahay-container py-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Support &amp; Contact
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Contact information for your assigned support worker.
      </p>

      {/* Assigned counselor */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">
          Your Assigned Counselor
        </h2>
        <ComingSoon
          description="Your assigned counselor details will appear here once connected in a future phase."
          plannedPhase="Phase 5 — Core UI"
        />
      </div>

      {/* Support contact */}
      <div className="mt-4 rounded-lg border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">
          Support Contact Details
        </h2>
        <ComingSoon
          description="Support contact information will be displayed here."
          plannedPhase="Phase 5 — Core UI"
        />
      </div>

      {/* Emergency information placeholder */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-base font-semibold text-amber-900">
          Emergency Information
        </h2>
        <p className="mt-2 text-sm text-amber-800">
          If you are in immediate danger, please contact your local emergency
          services directly. Emergency contact numbers provided by your support
          organisation will appear here.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          Note: SAHAY is not an emergency intervention service.
        </p>
      </div>
    </div>
  );
}
