/**
 * /victim/check-in — Well-being check-in workflow.
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { CheckInForm } from "@/components/victim/CheckInForm";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getCheckInsByVictimId } from "@/lib/db/check-ins";
import { formatDate } from "@/lib/utils";
import { History, Mic } from "lucide-react";

export const metadata: Metadata = { title: "Daily Check-In" };

export default async function VictimCheckInPage() {
  const profile = await getCurrentProfile();
  let pastCheckIns: Array<{
    id: string;
    response_text: string | null;
    submitted_at: string;
    voice_input_used: boolean;
  }> = [];

  if (profile) {
    try {
      const data = await getCheckInsByVictimId(profile.id);
      pastCheckIns = data || [];
    } catch (e) {
      console.error("Error fetching victim check-in history:", e);
    }
  }

  return (
    <div className="luma-container max-w-2xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Today&rsquo;s Check-In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your responses are private and help your support worker understand your emotional well-being over time.
        </p>
      </div>

      {/* Main interactive form */}
      <CheckInForm />

      {/* Voice check-in notice */}
      <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-5">
        <div className="flex items-center gap-2 font-medium text-foreground text-sm">
          <Mic className="h-4 w-4 text-primary" /> Voice Check-In Option
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Speak your check-in instead of typing.
        </p>
        <div className="mt-3">
          <ComingSoon
            title="Voice Check-In — In Development"
            description="Voice transcription and stress signal research are scheduled for Phase 7–8. Please use the secure text input above."
            plannedPhase="Phase 7–8 — Voice & Multi-channel"
          />
        </div>
      </div>

      {/* Check-in History */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
          <History className="h-5 w-5 text-primary" />
          <span>Your Recent Check-Ins</span>
        </div>

        {pastCheckIns.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            You have not submitted any check-ins yet. Submitting your first check-in will help your support team provide timely care.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {pastCheckIns.map((ci) => (
              <div key={ci.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{formatDate(ci.submitted_at)}</span>
                  {ci.voice_input_used && (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                      Voice input
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {ci.response_text || "(No text provided)"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
