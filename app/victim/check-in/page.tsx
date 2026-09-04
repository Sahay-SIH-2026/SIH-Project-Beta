/**
 * /victim/check-in — Well-being check-in UI shell.
 *
 * UI only. NLP / voice processing is NOT implemented.
 * Voice option is disabled and clearly marked Coming Soon.
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Check-In" };

export default function VictimCheckInPage() {
  return (
    <div className="sahay-container max-w-xl py-10">
      <h1 className="text-2xl font-semibold text-foreground">
        Today&rsquo;s Check-In
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your response is private and is only used to help your support worker
        understand how best to support you.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <label
          htmlFor="check-in-text"
          className="block text-sm font-medium text-foreground"
        >
          How are you feeling today?
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Write as much or as little as you like.
        </p>

        <textarea
          id="check-in-text"
          name="check-in-text"
          rows={5}
          placeholder="You can write anything here…"
          className="mt-3 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-describedby="check-in-note"
        />

        <p id="check-in-note" className="mt-1.5 text-xs text-muted-foreground">
          Your response will not be shared without your knowledge.
        </p>

        <div className="mt-5 flex items-center gap-3">
          {/* Continue button — wired in future phase */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground opacity-50 cursor-not-allowed"
          >
            Continue
          </button>
          <span className="text-xs text-muted-foreground">
            (Submission not yet connected — Phase 5)
          </span>
        </div>
      </div>

      {/* Voice option — Coming Soon */}
      <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-5">
        <p className="text-sm font-medium text-foreground">Voice Check-In</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Speak your check-in instead of typing.
        </p>
        <div className="mt-3">
          <ComingSoon
            title="Voice Input — Coming Soon"
            description="Voice check-in will be available in a future phase. Please use the text option above."
            plannedPhase="Phase 8 — Voice + Notifications"
          />
        </div>
      </div>
    </div>
  );
}
