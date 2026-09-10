"use client";

import { useState } from "react";
import { generateCaseInsightsAction } from "@/app/actions/ai";
import type { AIInsightsResult } from "@/lib/ai/types";
import { DISTRESS_SIGNAL_DISCLAIMER } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  HeartPulse,
  BrainCircuit,
  ShieldAlert,
  MessageSquareQuote,
  Lightbulb,
  FileText,
  HelpCircle,
} from "lucide-react";

interface AIInsightsCardProps {
  caseId: string;
  initialInsights: AIInsightsResult | null;
}

export function AIInsightsCard({ caseId, initialInsights }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<AIInsightsResult | null>(initialInsights);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleRefresh() {
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await generateCaseInsightsAction(caseId);
      if (res.success && res.insights) {
        setInsights(res.insights);
        setFeedback({ text: "AI insights updated successfully." });
      } else {
        setFeedback({ text: res.error || "Failed to update AI insights.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error generating AI insights.",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const escalationBadgeColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MODERATE":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  const sentimentBadgeColor = (polarity: string) => {
    switch (polarity) {
      case "POSITIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "NEGATIVE":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              GenAI Clinical Decision Support
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Multilingual sentiment analysis, escalation forecasting &amp; case synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {insights && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                insights.providerUsed === "GEMINI_2_5_FLASH"
                  ? "bg-purple-100 text-purple-800 border-purple-300"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {insights.providerUsed === "GEMINI_2_5_FLASH"
                ? "Gemini 2.5 Flash"
                : "Deterministic NLP Engine"}
            </span>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            {insights ? "Refresh Analysis" : "Generate Analysis"}
          </button>
        </div>
      </div>

      {/* Mandatory Non-Clinical Disclaimer */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 leading-snug">
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

      {!insights ? (
        <div className="rounded border border-dashed border-border bg-secondary/20 p-6 text-center text-xs text-muted-foreground">
          No automated AI case synthesis generated yet.
          <div className="mt-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Decision-Support Dossier
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Narrative Case Snapshot */}
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
              <MessageSquareQuote className="h-4 w-4" /> Counselor Briefing Snapshot
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {insights.summary}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            {/* Multilingual Detection */}
            <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-primary" /> Language
                </span>
                <span className="text-[10px] font-mono">{insights.multilingual.confidence}% conf</span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {insights.multilingual.languageLabel}
              </p>
              {insights.multilingual.translatedGist && (
                <p className="text-[10px] text-muted-foreground italic truncate">
                  {insights.multilingual.translatedGist}
                </p>
              )}
            </div>

            {/* Sentiment & Emotion */}
            <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HeartPulse className="h-3.5 w-3.5 text-primary" /> Tone &amp; Emotion
                </span>
                <span className="text-[10px] font-mono">{insights.sentiment.intensity}% intensity</span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold ${sentimentBadgeColor(insights.sentiment.polarity)}`}>
                  {insights.sentiment.polarity}
                </span>
                <span className="rounded-full border border-border bg-card px-2 py-0.2 text-[10px] font-semibold text-foreground">
                  {insights.emotionalTone.primary}
                </span>
              </div>
            </div>

            {/* 72-Hour Escalation Projection */}
            <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BrainCircuit className="h-3.5 w-3.5 text-primary" /> 72h Escalation
                </span>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-foreground">
                  {insights.escalation.trajectory === "ACCELERATING" && (
                    <TrendingUp className="h-3 w-3 text-red-600" />
                  )}
                  {insights.escalation.trajectory === "DE-ESCALATING" && (
                    <TrendingDown className="h-3 w-3 text-emerald-600" />
                  )}
                  {insights.escalation.trajectory === "STABLE" && (
                    <Minus className="h-3 w-3 text-muted-foreground" />
                  )}
                  {insights.escalation.trajectory}
                </span>
              </div>
              <div className="pt-0.5">
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${escalationBadgeColor(insights.escalation.level)}`}>
                  {insights.escalation.level} PRIORITY
                </span>
              </div>
            </div>
          </div>

          {/* 72h Leading Risk Indicators */}
          {insights.escalation.leadingIndicators.length > 0 && (
            <div className="rounded-md border border-border/70 bg-secondary/20 p-3 space-y-1.5 text-xs">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground">
                Leading Escalation Factors (72-Hour Window)
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                {insights.escalation.leadingIndicators.map((factor, i) => (
                  <li key={i} className="text-foreground">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Observed Facts vs Machine Inferences (Bifurcation Table) */}
          <div className="rounded-md border border-border bg-card p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Structured Demarcation
              </h4>
              <span className="text-[10px] text-muted-foreground">Observed Facts vs Machine Inferences</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-xs">
              {/* Observed Facts */}
              <div className="rounded border border-border/70 bg-secondary/20 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Observed Facts</span>
                  <span className="rounded bg-secondary px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                    Verifiable Records
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Direct quotes, logged timestamps, explicit statements.
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-foreground divide-y divide-border/40">
                  {insights.factsVsInferences.observedFacts.length === 0 ? (
                    <li className="italic text-muted-foreground py-1">No direct quotes recorded.</li>
                  ) : (
                    insights.factsVsInferences.observedFacts.map((fact, idx) => (
                      <li key={idx} className="py-1 first:pt-0 last:pb-0">
                        • {fact}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Machine Inferences */}
              <div className="rounded border border-primary/30 bg-primary/5 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">Support Inferences</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-mono text-primary font-medium">
                    Algorithmic Signal
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Hypothesized risk drivers, emotional states, advisory flags.
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-foreground divide-y divide-primary/10">
                  {insights.factsVsInferences.supportInferences.length === 0 ? (
                    <li className="italic text-muted-foreground py-1">No special inferences derived.</li>
                  ) : (
                    insights.factsVsInferences.supportInferences.map((inf, idx) => (
                      <li key={idx} className="py-1 first:pt-0 last:pb-0">
                        • {inf}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Suggested Counselor Talking Points */}
          {insights.suggestedTalkingPoints.length > 0 && (
            <div className="rounded-md border border-border bg-secondary/30 p-3.5 space-y-2">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" /> Suggested Talking Points for Next Interaction
              </h4>
              <ul className="space-y-1.5 text-xs text-foreground">
                {insights.suggestedTalkingPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-card p-2 rounded border border-border/60">
                    <span className="rounded-full bg-primary/10 text-primary font-bold text-[10px] h-4 w-4 flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
            <span>Generated: {formatDate(insights.generatedAt)}</span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> Certified counselor review required before clinical action
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
