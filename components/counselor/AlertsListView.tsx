"use client";

import { useState } from "react";
import { reviewAlertAction } from "@/app/actions/alerts";
import type { AlertRow, AlertStatus, AlertSeverity } from "@/types/database.types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
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

const SEVERITY_CLASSES: Record<AlertSeverity, string> = {
  HIGH: "bg-red-100 text-red-800 border-red-300",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-300",
  LOW: "bg-blue-100 text-blue-800 border-blue-300",
};

const STATUS_CLASSES: Record<AlertStatus, string> = {
  NEW: "bg-red-50 text-red-700 border-red-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  REVIEWED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function AlertsListView({ initialAlerts }: AlertsListViewProps) {
  const [alerts, setAlerts] = useState<ExtendedAlert[]>(initialAlerts);
  const [statusFilter, setStatusFilter] = useState<"ALL" | AlertStatus>("ALL");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

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
        setFeedback({ text: res.message || "Alert acknowledged and reviewed." });
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

  const filtered = alerts.filter((a) => {
    if (statusFilter === "ALL") return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-xs ${
            feedback.error ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.error ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg w-fit">
        {(["ALL", "NEW", "UNDER_REVIEW", "REVIEWED"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              statusFilter === st
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground italic">
          No alerts found matching this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const isReviewed = alert.status === "REVIEWED";
            return (
              <div
                key={alert.id}
                className="rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-primary/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">
                        {alert.case?.case_ref || "Case"}
                      </span>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          SEVERITY_CLASSES[alert.severity]
                        }`}
                      >
                        {alert.severity} Priority
                      </span>
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_CLASSES[alert.status]
                        }`}
                      >
                        {alert.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-foreground">
                      {alert.signal_description}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Raised {formatDate(alert.raised_at)}
                      {alert.reviewed_at && (
                        <span className="ml-2 text-emerald-700">
                          &bull; Reviewed {formatDate(alert.reviewed_at)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isReviewed && (
                      <button
                        type="button"
                        disabled={reviewingId === alert.id}
                        onClick={() => handleReview(alert.id)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50"
                      >
                        {reviewingId === alert.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Mark as Reviewed
                      </button>
                    )}

                    {alert.case_id && (
                      <Link
                        href={`/counselor/cases/${alert.case_id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 no-underline"
                      >
                        View Case <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
