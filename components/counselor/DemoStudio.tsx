"use client";

import { useState } from "react";
import { runDemoScenarioAction, resetDemoCaseAction } from "@/app/actions/demo";
import type { ScenarioExecutionResult } from "@/lib/scenarios/demo-scenarios";
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Bell,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface CaseOption {
  id: string;
  victimName: string;
  caseNumber: string;
}

interface DemoStudioProps {
  cases: CaseOption[];
}

export function DemoStudio({ cases }: DemoStudioProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || "");
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScenarioExecutionResult | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleRun(scenarioId: "A" | "B" | "C" | "D") {
    setRunningScenario(scenarioId);
    setResetMessage(null);
    try {
      const res = await runDemoScenarioAction(scenarioId, selectedCaseId);
      setLastResult(res);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setRunningScenario(null);
    }
  }

  async function handleReset() {
    setRunningScenario("RESET");
    try {
      const res = await resetDemoCaseAction(selectedCaseId);
      setResetMessage(res.message);
      setLastResult(null);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setRunningScenario(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Target Case Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div>
          <span className="text-sm font-semibold text-foreground">Target Demo Subject</span>
          <p className="text-xs text-muted-foreground">
            Select the case file that will receive the simulated check-ins and state transitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCaseId}
            onChange={(e) => {
              setSelectedCaseId(e.target.value);
              setLastResult(null);
              setResetMessage(null);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={Boolean(runningScenario)}
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.victimName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReset}
            disabled={Boolean(runningScenario)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition disabled:opacity-50"
            title="Clear demo entries and reset baseline score"
          >
            {runningScenario === "RESET" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Reset Baseline
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* 4 Canonical Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario A */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-emerald-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Scenario A — Stable Baseline
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">Target Score: ~18</span>
            </div>

            <h3 className="mt-3 text-base font-semibold text-foreground">
              Normal Wellness Routine
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Complainant submits routine wellness check-in confirming medication adherence and children attending school. System confirms STABLE trajectory with 0 counselor alerts.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Alert: None • Trend: STABLE</span>
            <button
              type="button"
              onClick={() => handleRun("A")}
              disabled={Boolean(runningScenario)}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {runningScenario === "A" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Run Scenario A
            </button>
          </div>
        </div>

        {/* Scenario B */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-amber-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Scenario B — Gradual Distress
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">Target Score: ~55</span>
            </div>

            <h3 className="mt-3 text-base font-semibold text-foreground">
              Rising Legal & Emotional Anxiety
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Victim reports severe insomnia and intense fear preceding court hearing (*&quot;Court ki tareekh paas aa rahi hai aur bohot ghabrahat hai&quot;*). Triggers ELEVATED advisory alert.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Alert: MEDIUM • Trend: WORSENING</span>
            <button
              type="button"
              onClick={() => handleRun("B")}
              disabled={Boolean(runningScenario)}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {runningScenario === "B" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              Run Scenario B
            </button>
          </div>
        </div>

        {/* Scenario C */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-rose-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                <Flame className="h-3.5 w-3.5" />
                Scenario C — Rapid Crisis & Threat
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">Target Score: ~88</span>
            </div>

            <h3 className="mt-3 text-base font-semibold text-foreground">
              Physical Intimidation & Death Threat
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Active threat at residence (*&quot;Kal raat darwaza khatkhataya aur dhamki di&quot;*). Spikes to CRITICAL, raises urgent counselor alert, prompts Witness Protection & schedules 4h callback.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Alert: HIGH/CRITICAL • Auto 4h Task</span>
            <button
              type="button"
              onClick={() => handleRun("C")}
              disabled={Boolean(runningScenario)}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              {runningScenario === "C" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Flame className="h-3.5 w-3.5" />
              )}
              Run Scenario C
            </button>
          </div>
        </div>

        {/* Scenario D */}
        <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-blue-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                Scenario D — Post-Intervention Recovery
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">Target Score: ~20</span>
            </div>

            <h3 className="mt-3 text-base font-semibold text-foreground">
              Counselor Action & Safe Shelter
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Police patrol arranged, victim safe in shelter. Follow-up check-in demonstrates marked relief (*&quot;Police patrol start ho gayi, safe feel ho raha hai&quot;*). Alerts marked REVIEWED.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Trend: IMPROVING • Alerts Resolved</span>
            <button
              type="button"
              onClick={() => handleRun("D")}
              disabled={Boolean(runningScenario)}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {runningScenario === "D" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Run Scenario D
            </button>
          </div>
        </div>
      </div>

      {/* Live Inspection Result Card */}
      {lastResult && (
        <div
          className={`rounded-lg border p-6 shadow-md transition ${
            lastResult.alertSeverity === "HIGH"
              ? "border-destructive/50 bg-destructive/10"
              : lastResult.alertSeverity === "MEDIUM"
              ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/30"
              : "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <h4 className="text-base font-bold text-foreground">
                {lastResult.title} Execution Output
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Case {lastResult.caseRef}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  lastResult.distressLevel === "CRITICAL"
                    ? "bg-destructive text-destructive-foreground"
                    : lastResult.distressLevel === "ELEVATED"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200"
                    : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200"
                }`}
              >
                Score: {lastResult.distressScore} / 100 ({lastResult.distressLevel})
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-foreground/90 leading-relaxed font-medium">
            {lastResult.narrative}
          </p>

          <div className="mt-3 rounded bg-background/80 p-3 border border-border/60 text-xs">
            <span className="font-semibold text-muted-foreground">Ingested Victim Check-In Text:</span>
            <p className="mt-1 italic text-foreground">&ldquo;{lastResult.submittedText}&rdquo;</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs pt-2">
            {lastResult.alertTriggered && (
              <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                <Bell className="h-3.5 w-3.5" />
                {lastResult.alertSeverity} Early-Warning Alert Triggered
              </span>
            )}

            {lastResult.alertResolved && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Open Alerts Marked REVIEWED & Resolved
              </span>
            )}

            {lastResult.followUpCreated && (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <Clock className="h-3.5 w-3.5" />
                Urgent 4-Hour Follow-Up Scheduled in Task Queue
              </span>
            )}

            {lastResult.suggestedInterventions && (
              <span className="text-muted-foreground">
                <strong>Recommended Support:</strong> {lastResult.suggestedInterventions.join(", ")}
              </span>
            )}

            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/counselor/alerts"
                className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                Alerts Queue
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href={`/counselor/cases/${lastResult.caseId}`}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Open Case Workspace
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
