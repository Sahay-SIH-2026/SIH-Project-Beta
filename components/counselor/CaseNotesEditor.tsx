"use client";

import { useState } from "react";
import { updateCaseNotesAction } from "@/app/actions/cases";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface CaseNotesEditorProps {
  caseId: string;
  initialNotes: string | null;
}

export function CaseNotesEditor({ caseId, initialNotes }: CaseNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updateCaseNotesAction(caseId, notes);
      if (res.success) {
        setFeedback({ text: res.message || "Notes saved successfully." });
      } else {
        setFeedback({ text: res.error || "Failed to save notes.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error saving notes.",
        error: true,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <textarea
        rows={5}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter confidential case notes, observations, or ongoing support requirements…"
        className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {feedback && (
            <div
              className={`flex items-center gap-1.5 text-xs ${
                feedback.error ? "text-destructive" : "text-emerald-700"
              }`}
            >
              {feedback.error ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-3 w-3" /> Save Notes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
