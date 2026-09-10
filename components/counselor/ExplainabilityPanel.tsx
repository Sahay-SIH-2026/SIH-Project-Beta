"use client";

import { useState } from "react";
import {
  markRiskScoreReviewedAction,
  triggerManualEvaluationAction,
} from "@/app/actions/risk";
import type { RiskScoreRow } from "@/types/database.types";
import { formatDate } from "@/lib/utils";
import { DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  FileCheck,
} from "lucide-react";

interface ExplainabilityPanelProps {
  caseId: string;
  latestScore: RiskScoreRow | null;
}

export function ExplainabilityPanel({ caseId, latestScore }: ExplainabilityPanelProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isReviewed, setIsReviewed] = useState(latestScore?.human_reviewed ?? false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleReview() {
    if (!latestScore) return;
    setIsReviewing(true);
    setFeedback(null);

    try {
      const res = await markRiskScoreReviewedAction(latestScore.id, caseId);
      if (res.success) {
        setIsReviewed(true);
        setFeedback({ text: res.message || "Signal marked as human-reviewed." });
      } else {
        setFeedback({ text: res.error || "Failed to update review status.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error confirming review.",
        error: true,
      });
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleReEvaluate() {
    setIsEvaluating(true);
    setFeedback(null);

    try {
      const res = await triggerManualEvaluationAction(caseId);
      if (res.success) {
        setFeedback({ text: res.message || "Re-evaluation complete." });
      } else {
        setFeedback({ text: res.error || "Failed to trigger re-evaluation.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error triggering evaluation.",
        error: true,
      });
    } finally {
      setIsEvaluating(false);
    }
  }

  if (!latestScore) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-center text-xs text-muted-foreground italic">
        No active support signal evaluated yet. Click below to evaluate check-in data.
        <div className="mt-3">
          <button
            type="button"
            disabled={isEvaluating}
            onClick={handleReEvaluate}
            className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80"
          >
            {isEvaluating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Evaluate Available Data
          </button>
        </div>
      </div>
    );
  }

  const score = latestScore.score;
  let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  let label = "STABLE";

  if (score >= 76) {
    badgeColor = "bg-red-100 text-red-800 border-red-300";
    label = "CRITICAL";
  } else if (score >= 51) {
    badgeColor = "bg-orange-100 text-orange-800 border-orange-300";
    label = "ELEVATED";
  } else if (score >= 26) {
    badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
    label = "CONCERN";
  }

  return (
    <div className="space-y-4">
      {/* Disclaimer Banner */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900 leading-snug">
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
          <span>{DISTRESS_SIGNAL_DISCLAIMER}</span>
        </div>
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

      {/* Primary Score & Status Header */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Support Signal
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-foreground">
                {score}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
                {label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isEvaluating}
              onClick={handleReEvaluate}
              title="Re-run evaluation on recent check-ins"
              className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isEvaluating ? "animate-spin" : ""}`} />
              Re-evaluate
            </button>
          </div>
        </div>

        <p className="text-xs text-foreground bg-secondary/30 p-2.5 rounded-md">
          <strong>Signal Reason:</strong> {latestScore.signal_reason}
        </p>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
          <span>Computed: {formatDate(latestScore.computed_at)}</span>
          <div className="flex items-center gap-1.5">
            {isReviewed ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <FileCheck className="h-3.5 w-3.5" /> Verified by Support Counselor
              </span>
            ) : (
              <button
                type="button"
                disabled={isReviewing}
                onClick={handleReview}
                className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isReviewing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Confirm Human Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Explainability Breakdown (Observed Facts vs Inferences) */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-2.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary" /> Explainability &amp; Contributing Factors
        </h4>

        <div className="space-y-2 text-xs">
          <div className="rounded border border-border/70 bg-secondary/20 p-2.5">
            <div className="flex items-center justify-between font-medium">
              <span className="text-foreground">Linguistic Distress Markers</span>
              <span className="rounded bg-secondary px-1.5 py-0.2 text-[10px] text-muted-foreground">
                Observed Fact
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Extracted from victim check-in text via validated keyword cluster dictionary.
            </p>
          </div>

          <div className="rounded border border-border/70 bg-secondary/20 p-2.5">
            <div className="flex items-center justify-between font-medium">
              <span className="text-foreground">Disengagement &amp; Schedule Frequency</span>
              <span className="rounded bg-secondary px-1.5 py-0.2 text-[10px] text-muted-foreground">
                Observed Fact
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Days elapsed between scheduled submissions vs anticipated interval.
            </p>
          </div>

          <div className="rounded border border-border/70 bg-secondary/20 p-2.5">
            <div className="flex items-center justify-between font-medium">
              <span className="text-foreground">Longitudinal Rate of Change</span>
              <span className="rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[10px] font-medium">
                Support Inference
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dynamic delta calculated across a sliding window of historical signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
