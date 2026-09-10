"use client";

import { useState } from "react";
import { createFollowUpAction, completeFollowUpAction } from "@/app/actions/follow-ups";
import type { FollowUpRow, FollowUpStatus } from "@/types/database.types";
import { formatDateOnly } from "@/lib/utils";
import { Plus, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

interface CaseFollowUpManagerProps {
  caseId: string;
  initialFollowUps: FollowUpRow[];
}

export function CaseFollowUpManager({ caseId, initialFollowUps }: CaseFollowUpManagerProps) {
  const [followUps, setFollowUps] = useState<FollowUpRow[]>(initialFollowUps);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createFollowUpAction(caseId, title, dueDate, description);
      if (res.success) {
        setFeedback({ text: res.message || "Follow-up scheduled." });
        setTitle("");
        setDescription("");
        setDueDate("");
        setIsOpen(false);
      } else {
        setFeedback({ text: res.error || "Failed to schedule.", error: true });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Actionable Follow-Ups</h4>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
        >
          <Plus className="h-3.5 w-3.5" />
          {isOpen ? "Cancel" : "Add Follow-Up Task"}
        </button>
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

      {isOpen && (
        <form onSubmit={handleCreate} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule legal aid partner consultation"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key notes or instructions for this follow-up…"
              className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !dueDate}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Scheduling…
                </>
              ) : (
                "Save Follow-Up"
              )}
            </button>
          </div>
        </form>
      )}

      {followUps.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-3">
          No follow-up tasks scheduled for this case.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {followUps.map((f) => {
            const isCompleted = f.status === "COMPLETED";
            return (
              <div key={f.id} className="p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {f.title}
                    </p>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {f.status}
                    </span>
                  </div>
                  {f.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Due: {formatDateOnly(f.due_date)}
                  </p>
                </div>

                <div>
                  {!isCompleted && (
                    <button
                      type="button"
                      disabled={completingId === f.id}
                      onClick={() => handleComplete(f.id)}
                      className="inline-flex items-center gap-1 rounded border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                    >
                      {completingId === f.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      )}
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
