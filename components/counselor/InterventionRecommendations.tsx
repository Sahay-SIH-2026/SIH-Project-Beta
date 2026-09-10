"use client";

import { useState } from "react";
import { createFollowUpAction } from "@/app/actions/follow-ups";
import type { SuggestedIntervention } from "@/lib/risk/types";
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarPlus,
} from "lucide-react";

interface InterventionRecommendationsProps {
  caseId: string;
  recommendations: SuggestedIntervention[];
}

function getSuggestedDueDate(urgency: string): string {
  const daysToAdd = urgency === "URGENT" ? 1 : 3;
  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);
  return target.toISOString().split("T")[0];
}

export function InterventionRecommendations({
  caseId,
  recommendations,
}: InterventionRecommendationsProps) {
  const [scheduledIds, setScheduledIds] = useState<string[]>([]);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleAccept(rec: SuggestedIntervention) {
    setSchedulingId(rec.id);
    setFeedback(null);

    const dueDate = getSuggestedDueDate(rec.urgency);

    try {
      const res = await createFollowUpAction(
        caseId,
        `Follow-Up: ${rec.title}`,
        dueDate,
        `${rec.reason} (Supporting signals: ${rec.supportingSignals.join(", ")})`
      );

      if (res.success) {
        setScheduledIds((prev) => [...prev, rec.id]);
        setFeedback({
          text: `Follow-up scheduled: "${rec.title}" due by ${dueDate}.`,
        });
      } else {
        setFeedback({ text: res.error || "Failed to schedule follow-up.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error creating follow-up.",
        error: true,
      });
    } finally {
      setSchedulingId(null);
    }
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center text-xs text-muted-foreground italic">
        Routine support continuity in progress. No special intervention referrals indicated.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-600" /> Suggested Support Interventions
        </h4>
        <span className="text-[10px] text-muted-foreground">Human review required</span>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-2.5 text-xs ${
            feedback.error ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.error ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="space-y-2.5">
        {recommendations.map((rec) => {
          const isScheduled = scheduledIds.includes(rec.id);
          const isBusy = schedulingId === rec.id;

          const urgencyColor =
            rec.urgency === "URGENT"
              ? "bg-red-100 text-red-800 border-red-300"
              : rec.urgency === "PRIORITY"
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-blue-100 text-blue-800 border-blue-300";

          return (
            <div
              key={rec.id}
              className="rounded-lg border border-border bg-card p-3.5 shadow-sm space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-semibold text-foreground">
                      {rec.title}
                    </h5>
                    <span className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold ${urgencyColor}`}>
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {rec.reason}
                  </p>
                </div>

                <div>
                  {isScheduled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Scheduled
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleAccept(rec)}
                      className="inline-flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/80 disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CalendarPlus className="h-3 w-3 text-primary" />
                      )}
                      Schedule Follow-Up
                    </button>
                  )}
                </div>
              </div>

              {rec.supportingSignals.length > 0 && (
                <div className="text-[10px] text-muted-foreground bg-secondary/30 px-2 py-1 rounded">
                  <strong>Supporting signals:</strong> {rec.supportingSignals.join("; ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
