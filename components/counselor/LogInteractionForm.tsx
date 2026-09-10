"use client";

import { useState } from "react";
import { logInteractionAction } from "@/app/actions/interactions";
import type { InteractionChannel } from "@/types/database.types";
import { Loader2, Plus, CheckCircle2, AlertCircle } from "lucide-react";


interface LogInteractionFormProps {
  caseId: string;
}

const CHANNELS: { value: InteractionChannel; label: string }[] = [
  { value: "VOICE_CALL", label: "Voice Call" },
  { value: "IN_PERSON", label: "In-Person Session" },
  { value: "SMS", label: "SMS / Text" },
  { value: "EMAIL", label: "Email" },
  { value: "IN_APP_CHECK_IN", label: "In-App Check-In Review" },
];

export function LogInteractionForm({ caseId }: LogInteractionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState<InteractionChannel>("VOICE_CALL");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await logInteractionAction(caseId, channel, summary);
      if (res.success) {
        setFeedback({ text: res.message || "Interaction recorded." });
        setSummary("");
        setIsOpen(false);
      } else {
        setFeedback({ text: res.error || "Failed to record interaction.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error logging interaction.",
        error: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Multi-Channel Contact Log</h4>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
        >
          <Plus className="h-3.5 w-3.5" />
          {isOpen ? "Cancel" : "Record New Interaction"}
        </button>
      </div>

      {feedback && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-md p-2.5 text-xs ${
            feedback.error
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-50 text-emerald-800"
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-border pt-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Communication Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as InteractionChannel)}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CHANNELS.map((ch) => (
                <option key={ch.value} value={ch.value}>
                  {ch.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Interaction Summary
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Detail discussion topics, emotional state observed, safety concerns, or immediate next steps…"
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !summary.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </>
              ) : (
                "Save Entry"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
