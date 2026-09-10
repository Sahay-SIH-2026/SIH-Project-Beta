"use client";

import { useState } from "react";
import { updateConsentAction } from "@/app/actions/consents";
import type { ConsentStatus } from "@/types/database.types";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";


interface ConsentItem {
  purpose: string;
  title: string;
  description: string;
  status: ConsentStatus;
}

interface ConsentManagerProps {
  initialConsents: ConsentItem[];
}

export function ConsentManager({ initialConsents }: ConsentManagerProps) {
  const [consents, setConsents] = useState<ConsentItem[]>(initialConsents);
  const [pendingPurpose, setPendingPurpose] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleToggle(purpose: string, newStatus: ConsentStatus) {
    setPendingPurpose(purpose);
    setFeedback(null);

    try {
      const res = await updateConsentAction(purpose, newStatus);
      if (res.success) {
        setConsents((prev) =>
          prev.map((c) => (c.purpose === purpose ? { ...c, status: newStatus } : c))
        );
        setFeedback({ text: res.message || "Consent updated successfully." });
      } else {
        setFeedback({ text: res.error || "Failed to update consent.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "An error occurred.",
        error: true,
      });
    } finally {
      setPendingPurpose(null);
    }
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-sm ${
            feedback.error
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
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

      {consents.map((item) => {
        const isGiven = item.status === "GIVEN";
        const isWithdrawn = item.status === "WITHDRAWN";
        const isBusy = pendingPurpose === item.purpose;

        return (
          <div
            key={item.purpose}
            className="rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-primary/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isGiven
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : isWithdrawn
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isGiven ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggle(item.purpose, "WITHDRAWN")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                  >
                    {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
                    Withdraw Consent
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggle(item.purpose, "GIVEN")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
                    Grant Consent
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
