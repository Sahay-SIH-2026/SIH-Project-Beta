"use client";

import { useState } from "react";
import { completeFollowUpAction, createFollowUpAction } from "@/app/actions/follow-ups";
import type { FollowUpRow, FollowUpStatus } from "@/types/database.types";
import { formatDateOnly } from "@/lib/utils";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  Loader2,
  CheckCheck,
} from "lucide-react";

export interface ExtendedFollowUp extends FollowUpRow {
  case?: {
    id: string;
    case_ref: string;
    status: string;
    victim?: { id: string; display_name: string } | null;
  } | null;
}


interface FollowUpListViewProps {
  initialFollowUps: ExtendedFollowUp[];
  availableCases: Array<{ id: string; case_ref: string; victimName: string }>;
}

export function FollowUpListView({ initialFollowUps, availableCases }: FollowUpListViewProps) {
  const [followUps, setFollowUps] = useState<ExtendedFollowUp[]>(initialFollowUps);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [caseId, setCaseId] = useState(availableCases[0]?.id || "");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!caseId || !title.trim() || !dueDate) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createFollowUpAction(caseId, title, dueDate, description);
      if (res.success) {
        setFeedback({ text: res.message || "Follow-up scheduled successfully." });
        setTitle("");
        setDescription("");
        setDueDate("");
        setIsOpen(false);
      } else {
        setFeedback({ text: res.error || "Failed to schedule follow-up.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error creating follow-up.",
        error: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete(id: string) {
    setCompletingId(id);
    setFeedback(null);

    try {
      const res = await completeFollowUpAction(id);
      if (res.success) {
        setFollowUps((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "COMPLETED" as FollowUpStatus } : f))
        );
        setFeedback({ text: res.message || "Marked as completed." });
      } else {
        setFeedback({ text: res.error || "Failed to complete.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error completing follow-up.",
        error: true,
      });
    } finally {
      setCompletingId(null);
    }
  }

  const filtered = followUps.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const pendingCount = followUps.filter((f) => f.status === "PENDING").length;
  const completedCount = followUps.filter((f) => f.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pending Tasks
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Completed Tasks
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{completedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total Follow-Ups
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{followUps.length}</p>
        </div>
      </div>

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

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg">
          {(["ALL", "PENDING", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                filter === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {availableCases.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            {isOpen ? "Cancel" : "Schedule New Follow-Up"}
          </button>
        )}
      </div>

      {/* Create form modal/accordion */}
      {isOpen && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-border bg-card p-5 space-y-3 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Schedule Case Follow-Up
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Target Case
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {availableCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_ref} ({c.victimName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Follow-Up Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. In-person counselling check-in or legal review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description / Action Items (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specific notes or referrals to verify…"
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !dueDate}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </>
              ) : (
                "Save Follow-Up"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground italic">
            No follow-up tasks match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => {
              const isCompleted = item.status === "COMPLETED";
              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-secondary/20 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {item.case?.case_ref ? (
                          <Link
                            href={`/counselor/cases/${item.case_id}`}
                            className="hover:underline"
                          >
                            {item.case.case_ref}
                          </Link>
                        ) : (
                          "Case"
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.case?.victim?.display_name || "Client"})
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-medium ${
                        isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}

                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                      <Clock className="h-3 w-3" /> Due by {formatDateOnly(item.due_date)}
                      {item.completed_at && (
                        <span className="text-emerald-700 ml-2">
                          (Completed on {formatDateOnly(item.completed_at)})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCompleted ? (
                      <button
                        type="button"
                        disabled={completingId === item.id}
                        onClick={() => handleComplete(item.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                      >
                        {completingId === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        Mark Complete
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                        <CheckCheck className="h-4 w-4" /> Completed
                      </span>
                    )}

                    {item.case_id && (
                      <Link
                        href={`/counselor/cases/${item.case_id}`}
                        className="rounded border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground no-underline"
                      >
                        Case View &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
