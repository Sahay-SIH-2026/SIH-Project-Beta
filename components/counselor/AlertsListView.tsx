"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { reviewAlertAction } from "@/app/actions/alerts";
import type { AlertRow, AlertStatus, AlertSeverity } from "@/types/database.types";
import { formatDate, relativeTime } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Search,
  X,
  Clock,
  Inbox,
  FolderOpen,
  Check,
} from "lucide-react";

interface ExtendedAlert extends AlertRow {
  case?: {
    id: string;
    case_ref: string;
    status: string;
  } | null;
  reviewer?: {
    id: string;
    display_name: string;
  } | null;
}

interface AlertsListViewProps {
  initialAlerts: ExtendedAlert[];
}

type SortOption = "newest" | "oldest" | "severity";

function SignalDescriptionView({ description }: { description: string }) {
  if (description.includes("Query:") && description.includes("AI Analysis:")) {
    const queryIdx = description.indexOf("Query:");
    const aiIdx = description.indexOf("AI Analysis:");

    const title = description.slice(0, queryIdx).trim();
    const queryPart = description.slice(queryIdx + 6, aiIdx).trim();
    const aiPart = description.slice(aiIdx + 12).trim();

    const tokens = aiPart
      .split(/\s*-\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedFields: Array<{ label: string; value: string }> = [];
    tokens.forEach((token) => {
      const colonIdx = token.indexOf(":");
      if (colonIdx !== -1) {
        parsedFields.push({
          label: token.slice(0, colonIdx).trim(),
          value: token.slice(colonIdx + 1).trim(),
        });
      } else {
        parsedFields.push({ label: "Detail", value: token });
      }
    });

    return (
      <div className="space-y-2.5">
        {title && (
          <p className="text-sm font-semibold text-foreground tracking-tight">
            {title}
          </p>
        )}

        {queryPart && (
          <div className="rounded-md border border-border/80 bg-muted/40 px-3 py-2 text-xs">
            <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-0.5">
              Client / User Input
            </span>
            <p className="italic text-foreground">{queryPart.replace(/^"|"$/g, "")}</p>
          </div>
        )}

        {parsedFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {parsedFields.map((field, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 rounded border border-border/70 bg-secondary/60 px-2 py-0.5 text-[11px]"
              >
                <span className="font-medium text-muted-foreground">{field.label}:</span>
                <span className="font-semibold text-foreground">{field.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm font-semibold text-foreground leading-snug tracking-tight">
      {description}
    </p>
  );
}

const SEVERITY_BADGE_CLASSES: Record<AlertSeverity, string> = {
  HIGH: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  MEDIUM: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  LOW: "bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
};

const STATUS_BADGE_CLASSES: Record<AlertStatus, string> = {
  NEW: "bg-rose-50 text-rose-700 border-rose-200 font-semibold dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200 font-medium dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  REVIEWED: "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
};

export function AlertsListView({ initialAlerts }: AlertsListViewProps) {
  const [alerts, setAlerts] = useState<ExtendedAlert[]>(initialAlerts);
  const [statusFilter, setStatusFilter] = useState<"ALL" | AlertStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  // Derived Summary Metric Counts
  const totalCount = alerts.length;
  const newCount = useMemo(() => alerts.filter((a) => a.status === "NEW").length, [alerts]);
  const underReviewCount = useMemo(() => alerts.filter((a) => a.status === "UNDER_REVIEW").length, [alerts]);
  const reviewedCount = useMemo(() => alerts.filter((a) => a.status === "REVIEWED").length, [alerts]);

  async function handleReview(id: string) {
    setReviewingId(id);
    setFeedback(null);

    try {
      const res = await reviewAlertAction(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: "REVIEWED" as AlertStatus,
                  reviewed_at: new Date().toISOString(),
                }
              : a
          )
        );
        setFeedback({ text: res.message || "Alert acknowledged and marked as reviewed." });
      } else {
        setFeedback({ text: res.error || "Failed to review alert.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error reviewing alert.",
        error: true,
      });
    } finally {
      setReviewingId(null);
    }
  }

  // Filter & Sort Pipeline
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        // Status filter
        if (statusFilter !== "ALL" && alert.status !== statusFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const caseRef = alert.case?.case_ref?.toLowerCase() || "";
          const desc = alert.signal_description?.toLowerCase() || "";
          const status = alert.status.toLowerCase();
          const severity = alert.severity.toLowerCase();
          const reviewer = alert.reviewer?.display_name?.toLowerCase() || "";
          return (
            caseRef.includes(q) ||
            desc.includes(q) ||
            status.includes(q) ||
            severity.includes(q) ||
            reviewer.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.raised_at).getTime() - new Date(a.raised_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.raised_at).getTime() - new Date(b.raised_at).getTime();
        }
        if (sortBy === "severity") {
          const rank: Record<AlertSeverity, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return rank[b.severity] - rank[a.severity];
        }
        return 0;
      });
  }, [alerts, statusFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* 1. Derived Summary Metric Blocks */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Alerts */}
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`rounded-lg border p-3.5 text-left transition-all hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            statusFilter === "ALL"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border/80 bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
              Total Alerts
            </span>
            <Inbox className="h-3.5 w-3.5 text-muted-foreground/70" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</span>
            <span className="text-[11px] text-muted-foreground">All signals</span>
          </div>
        </button>

        {/* New Alerts */}
        <button
          type="button"
          onClick={() => setStatusFilter("NEW")}
          className={`rounded-lg border p-3.5 text-left transition-all hover:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            statusFilter === "NEW"
              ? "border-rose-400 bg-rose-50/70 shadow-xs dark:bg-rose-950/30"
              : "border-border/80 bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-rose-700 dark:text-rose-400">
              New Alerts
            </span>
            <span className="relative flex h-2 w-2">
              {newCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${newCount > 0 ? "bg-rose-600" : "bg-muted"}`} />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
              {newCount}
            </span>
            <span className="text-[11px] text-muted-foreground">Needs review</span>
          </div>
        </button>

        {/* Under Review */}
        <button
          type="button"
          onClick={() => setStatusFilter("UNDER_REVIEW")}
          className={`rounded-lg border p-3.5 text-left transition-all hover:border-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            statusFilter === "UNDER_REVIEW"
              ? "border-amber-400 bg-amber-50/70 shadow-xs dark:bg-amber-950/30"
              : "border-border/80 bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-amber-800 dark:text-amber-400">
              Under Review
            </span>
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-800 dark:text-amber-400">
              {underReviewCount}
            </span>
            <span className="text-[11px] text-muted-foreground">In progress</span>
          </div>
        </button>

        {/* Reviewed */}
        <button
          type="button"
          onClick={() => setStatusFilter("REVIEWED")}
          className={`rounded-lg border p-3.5 text-left transition-all hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            statusFilter === "REVIEWED"
              ? "border-emerald-400 bg-emerald-50/70 shadow-xs dark:bg-emerald-950/30"
              : "border-border/80 bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide uppercase text-emerald-800 dark:text-emerald-400">
              Reviewed
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
              {reviewedCount}
            </span>
            <span className="text-[11px] text-muted-foreground">Completed</span>
          </div>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-lg border p-3 text-xs transition-all ${
            feedback.error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.error ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss feedback"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Management Toolbar (Filters, Search, Sort, Counter) */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* Status Segmented Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter alerts by status"
          className="flex flex-wrap items-center gap-1 rounded-md bg-secondary/80 p-1"
        >
          {(
            [
              { key: "ALL", label: "All", count: totalCount },
              { key: "NEW", label: "New", count: newCount },
              { key: "UNDER_REVIEW", label: "Under Review", count: underReviewCount },
              { key: "REVIEWED", label: "Reviewed", count: reviewedCount },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case, signal, or reviewer..."
              className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort alerts"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">Highest Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result Counter & Active Filter Indicators */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          Showing <strong className="text-foreground">{filteredAlerts.length}</strong> of {alerts.length} alerts
          {statusFilter !== "ALL" && (
            <span> in <strong className="text-foreground">{statusFilter.replace(/_/g, " ")}</strong></span>
          )}
          {searchQuery && (
            <span> matching &ldquo;<strong className="text-foreground">{searchQuery}</strong>&rdquo;</span>
          )}
        </span>

        {(statusFilter !== "ALL" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setSearchQuery("");
            }}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* 3. Redesigned Structured Alert List */}
      {filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-card p-12 text-center">
          <div className="rounded-full bg-muted/60 p-3 text-muted-foreground mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No alerts found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? "No alerts match your current keyword search. Try clearing the search term or adjusting filters."
              : `There are currently no alerts in the "${statusFilter.replace(/_/g, " ")}" category.`}
          </p>
          {(statusFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              View all alerts
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isReviewed = alert.status === "REVIEWED";

            return (
              <article
                key={alert.id}
                aria-label={`Alert for ${alert.case?.case_ref || "Case"}`}
                className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left Column: Identifiers, Signal Title, Description & Metadata */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Top Identifiers Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Case Ref Badge */}
                      {alert.case_id ? (
                        <Link
                          href={`/counselor/cases/${alert.case_id}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/80 px-2 py-0.5 font-mono text-xs font-bold text-foreground hover:bg-secondary hover:text-primary transition-colors no-underline"
                          title="Open case workspace"
                        >
                          <FolderOpen className="h-3.5 w-3.5 text-primary" />
                          <span>{alert.case?.case_ref || "Case"}</span>
                        </Link>
                      ) : (
                        <span className="font-mono font-bold text-foreground">
                          {alert.case?.case_ref || "Case"}
                        </span>
                      )}

                      {/* Case Status */}
                      {alert.case?.status && (
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Status: <strong className="text-foreground">{alert.case.status}</strong>
                        </span>
                      )}

                      <span className="text-muted-foreground/40">•</span>

                      {/* Priority Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                          SEVERITY_BADGE_CLASSES[alert.severity]
                        }`}
                      >
                        {alert.severity === "HIGH" ? (
                          <AlertCircle className="h-3 w-3 shrink-0" />
                        ) : alert.severity === "MEDIUM" ? (
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                        ) : null}
                        <span>{alert.severity} Priority</span>
                      </span>

                      {/* Alert Lifecycle Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${
                          STATUS_BADGE_CLASSES[alert.status]
                        }`}
                      >
                        {alert.status === "NEW" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                        )}
                        {alert.status === "REVIEWED" && (
                          <Check className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span>{alert.status.replace(/_/g, " ")}</span>
                      </span>
                    </div>

                    {/* Main Signal Description */}
                    <div>
                      <SignalDescriptionView description={alert.signal_description} />
                    </div>

                    {/* Metadata & Timestamp Row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                        <span>
                          Raised {formatDate(alert.raised_at)}{" "}
                          <span className="text-muted-foreground/70">
                            ({relativeTime(alert.raised_at)})
                          </span>
                        </span>
                      </div>

                      {alert.reviewed_at && (
                        <>
                          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Reviewed {formatDate(alert.reviewed_at)}
                            {alert.reviewer?.display_name && (
                              <span className="text-muted-foreground">
                                {" "}by {alert.reviewer.display_name}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
                    {!isReviewed ? (
                      <button
                        type="button"
                        disabled={reviewingId === alert.id}
                        onClick={() => handleReview(alert.id)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                      >
                        {reviewingId === alert.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
                        )}
                        <span>Mark as Reviewed</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Actioned
                      </span>
                    )}

                    {alert.case_id && (
                      <Link
                        href={`/counselor/cases/${alert.case_id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors no-underline shadow-2xs"
                      >
                        <span>View Case</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
