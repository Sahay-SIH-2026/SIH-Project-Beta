/**
 * /counselor/cases/[id] — Case Details & Clinical Continuity Workspace
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { getCaseById } from "@/lib/db/cases";
import { requireCaseAccess } from "@/lib/auth/case-access";
import { getCheckInsByCaseId } from "@/lib/db/check-ins";
import { getInteractionsByCaseId } from "@/lib/db/interactions";
import { getFollowUps } from "@/lib/db/follow-ups";
import { getRiskScoresByCaseId } from "@/lib/db/risk-scores";
import { formatDate, formatDateOnly } from "@/lib/utils";
import { CaseStatusChanger } from "@/components/counselor/CaseStatusChanger";
import { CaseNotesEditor } from "@/components/counselor/CaseNotesEditor";
import { LogInteractionForm } from "@/components/counselor/LogInteractionForm";
import { CaseFollowUpManager } from "@/components/counselor/CaseFollowUpManager";
import { TrendChart } from "@/components/counselor/TrendChart";
import { ExplainabilityPanel } from "@/components/counselor/ExplainabilityPanel";
import { InterventionRecommendations } from "@/components/counselor/InterventionRecommendations";
import { AIInsightsCard } from "@/components/counselor/AIInsightsCard";
import { RecordSessionStatement } from "@/components/counselor/RecordSessionStatement";
import { CaseHistoryGraph } from "@/components/counselor/CaseHistoryGraph";
import { generateCaseInsights } from "@/lib/ai/service";
import type { AIInsightsResult } from "@/lib/ai/types";
import { evaluateSignalRules } from "@/lib/risk/rule-engine";
import type { SuggestedIntervention } from "@/lib/risk/types";
import {
  ArrowLeft,
  Calendar,
  User,
  ClipboardList,
  MessageSquare,
  Radio,
  PhoneCall,
  Globe,
  Mic,
} from "lucide-react";

import type {
  CaseStatus,
  FollowUpRow,
  RiskScoreRow,
} from "@/types/database.types";

interface CaseDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CaseDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Case Details — ${id.slice(0, 8)}` };
}

export default async function CaseDetailsPage({
  params,
}: CaseDetailsPageProps) {
  const { id } = await params;

  let caseItem = null;
  let checkIns: Array<{
    id: string;
    response_text: string | null;
    submitted_at: string;
    voice_input_used: boolean;
    distress_level?: string | null;
    distress_score?: number | null;
    immediate_danger?: boolean | null;
    distress_signals?: string[] | null;
    distress_reason?: string | null;
  }> = [];

  let interactions: Array<{
    id: string;
    channel: string;
    occurred_at: string;
    summary: string | null;
    recorder: { display_name: string } | null;
    distress_level?: string | null;
    distress_score?: number | null;
    immediate_danger?: boolean | null;
    distress_signals?: string[] | null;
    distress_reason?: string | null;
  }> = [];
  let followUps: FollowUpRow[] = [];
  let riskScores: RiskScoreRow[] = [];

  try {
    await requireCaseAccess(id);
    caseItem = await getCaseById(id);
    if (!caseItem) {
      notFound();
    }

    const [ci, inter, fu, rs] = await Promise.all([
      getCheckInsByCaseId(id).catch(() => []),
      getInteractionsByCaseId(id).catch(() => []),
      getFollowUps({ caseId: id }).catch(() => []),
      getRiskScoresByCaseId(id).catch(() => []),
    ]);

    checkIns = (ci as unknown as typeof checkIns) || [];
    interactions = (inter as unknown as typeof interactions) || [];
    followUps = (fu as unknown as typeof followUps) || [];
    riskScores = (rs as unknown as typeof riskScores) || [];
  } catch (err) {
    console.error("Error loading case details:", err);
    notFound();
  }

  const victim = caseItem.victim as { id: string; display_name: string } | null;
  const counselor = caseItem.counselor as {
    id: string;
    display_name: string;
  } | null;

  // Longitudinal Signal & Intervention Analysis
  const sortedScores = [...riskScores].sort(
    (a, b) =>
      new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime(),
  );
  const latestScore = sortedScores[0] || null;

  let recommendations: SuggestedIntervention[] = [];
  const latestCheckIn = checkIns[0];
  const prevScores = sortedScores.slice(1).map((s) => s.score);
  const daysSinceLast = latestCheckIn
    ? Math.max(
        0,
        Math.floor(
          (new Date().getTime() -
            new Date(latestCheckIn.submitted_at).getTime()) /
            (1000 * 3600 * 24),
        ),
      )
    : 0;

  const evaluation = evaluateSignalRules({
    currentText:
      latestCheckIn?.response_text ||
      (latestScore ? latestScore.signal_reason : ""),
    previousScores: prevScores,
    daysSinceLastCheckIn: daysSinceLast,
  });
  recommendations = evaluation.suggestedInterventions;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/counselor/cases"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Caseload
        </Link>
      </div>

      {/* Case Header Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-2xl font-bold text-foreground">
                {caseItem.case_ref}
              </h1>
              <span className="rounded-full border border-border bg-secondary px-3 py-0.5 text-xs font-semibold text-foreground">
                {caseItem.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" /> Victim:{" "}
                <strong className="text-foreground">
                  {victim?.display_name || "Unlinked"}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Opened:{" "}
                <strong className="text-foreground">
                  {formatDateOnly(caseItem.opened_at)}
                </strong>
              </span>
              <span>
                Assigned to:{" "}
                <strong className="text-foreground">
                  {counselor?.display_name || "Unassigned"}
                </strong>
              </span>
            </div>
          </div>

          <CaseStatusChanger
            caseId={caseItem.id}
            initialStatus={caseItem.status as CaseStatus}
          />
        </div>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
        {/* Left Column (2 cols): Check-ins and Interactions */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <CaseHistoryGraph
            data={[
              ...checkIns
                .filter(
                  (ci) =>
                    ci.distress_score !== null &&
                    ci.distress_score !== undefined,
                )
                .map((ci) => ({
                  id: ci.id,
                  distress_score: ci.distress_score as number,
                  distress_level: ci.distress_level as string,
                  submitted_at: ci.submitted_at,
                  type: "check_in" as const,
                })),
              ...interactions
                .filter(
                  (inter) =>
                    inter.distress_score !== null &&
                    inter.distress_score !== undefined,
                )
                .map((inter) => ({
                  id: inter.id,
                  distress_score: inter.distress_score as number,
                  distress_level: inter.distress_level as string,
                  submitted_at: inter.occurred_at,
                  type: "interaction" as const,
                })),
            ]}
          />

          <RecordSessionStatement caseId={caseItem.id} />
          {/* Check-In History */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" /> Check-In
                Timeline
              </h3>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {checkIns.length} recorded
              </span>
            </div>

            {checkIns.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                No check-in submissions recorded yet for this case.
              </p>
            ) : (
              <div className="space-y-3">
                {checkIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="rounded-md border border-border/70 bg-secondary/20 p-4 transition hover:bg-secondary/40"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span className="font-medium text-foreground">
                        {formatDate(ci.submitted_at)}
                      </span>
                      {ci.response_text?.includes("[SMS via") ? (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950/50 dark:text-purple-300">
                          <MessageSquare className="h-3 w-3" /> SMS Ingestion
                        </span>
                      ) : ci.response_text?.includes("[IVRS Call") ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          <Radio className="h-3 w-3" /> IVRS Telephony
                        </span>
                      ) : ci.response_text?.includes("[14566 Helpline") ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                          <PhoneCall className="h-3 w-3" /> Helpline 14566
                        </span>
                      ) : ci.voice_input_used ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <Mic className="h-3 w-3" /> Voice / STT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                          <Globe className="h-3 w-3" /> Web Portal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {ci.response_text || "(No response text provided)"}
                    </p>

                    {ci.distress_level && (
                      <div className="mt-3 rounded-md bg-background/50 border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                          <span className="flex items-center gap-1">
                            AI Distress Analysis
                          </span>
                          {ci.immediate_danger && (
                            <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200 dark:bg-red-950/50 dark:border-red-900 flex items-center gap-1 animate-pulse">
                              Immediate Danger Warning
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground mr-1">
                              Level:
                            </span>
                            <span
                              className={`font-semibold ${
                                ci.distress_level.toLowerCase() ===
                                  "critical" ||
                                ci.distress_level.toLowerCase() === "high"
                                  ? "text-red-600 dark:text-red-400"
                                  : ci.distress_level.toLowerCase() ===
                                      "moderate"
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {ci.distress_level.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground mr-1">
                              Score:
                            </span>
                            <span className="font-mono font-medium">
                              {ci.distress_score?.toFixed(2) || "N/A"}
                            </span>
                          </div>
                        </div>

                        {ci.distress_signals &&
                          ci.distress_signals.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground mr-1">
                                Signals:
                              </span>
                              <span className="text-foreground">
                                {ci.distress_signals.join(", ")}
                              </span>
                            </div>
                          )}

                        {ci.distress_reason && (
                          <div className="text-xs mt-1">
                            <span className="text-muted-foreground mr-1">
                              Reason:
                            </span>
                            <span className="text-foreground italic">
                              {ci.distress_reason}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactions & Contact Log */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Multi-Channel
                Contact History
              </h3>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {interactions.length} contacts
              </span>
            </div>

            <LogInteractionForm caseId={caseItem.id} />

            {interactions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                No contact interactions recorded yet. Use the form above to log
                calls or in-person sessions.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {interactions.map((inter) => (
                  <div key={inter.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <div className="flex items-center gap-2">
                        {inter.summary?.includes("14566") ||
                        inter.summary?.includes("Helpline") ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                            <PhoneCall className="h-3 w-3" /> Helpline 14566
                          </span>
                        ) : inter.summary?.includes("IVRS") ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            <Radio className="h-3 w-3" /> IVRS Call
                          </span>
                        ) : inter.channel === "SMS" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/50 dark:text-purple-300">
                            <MessageSquare className="h-3 w-3" /> SMS
                          </span>
                        ) : inter.channel === "VOICE_CALL" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <Mic className="h-3 w-3" /> Voice Call
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">
                            {inter.channel.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <span>{formatDate(inter.occurred_at)}</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {inter.summary || "(No summary entered)"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Recorded by: {inter.recorder?.display_name || "Staff"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Notes, Follow-ups, Distress Signals */}
        <div className="min-w-0 space-y-6">
          {/* Case Notes */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Confidential Case Notes
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Visible only to authorized counselors handling this case.
            </p>
            <CaseNotesEditor
              caseId={caseItem.id}
              initialNotes={caseItem.notes}
            />
          </div>

          {/* Follow-Ups */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <CaseFollowUpManager
              caseId={caseItem.id}
              initialFollowUps={followUps}
            />
          </div>

          {/* GenAI Clinical Decision Support Dossier (Streamed via Suspense) */}
          <Suspense fallback={<AIInsightsSkeleton />}>
            <AsyncAIInsightsSection caseId={caseItem.id} />
          </Suspense>

          {/* Longitudinal Support Trajectory Chart */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
            <TrendChart scores={riskScores} />
          </div>

          {/* Explainability & Review Panel */}
          <ExplainabilityPanel caseId={caseItem.id} latestScore={latestScore} />

          {/* Actionable Support Recommendations */}
          <InterventionRecommendations
            caseId={caseItem.id}
            recommendations={recommendations}
          />
        </div>
      </div>
    </div>
  );
}

function AIInsightsSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>
      <div className="h-16 rounded-md bg-muted/40" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-12 rounded bg-muted/30" />
        <div className="h-12 rounded bg-muted/30" />
        <div className="h-12 rounded bg-muted/30" />
      </div>
    </div>
  );
}

async function AsyncAIInsightsSection({ caseId }: { caseId: string }) {
  let aiInsights: AIInsightsResult | null = null;
  try {
    aiInsights = await generateCaseInsights(caseId);
  } catch (e) {
    console.error("Error generating streamed AI insights:", e);
  }

  return <AIInsightsCard caseId={caseId} initialInsights={aiInsights} />;
}
