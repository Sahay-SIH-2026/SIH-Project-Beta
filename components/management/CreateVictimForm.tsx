"use client";

import { useState } from "react";
import { createVictimAction } from "@/app/actions/management";
import { Loader2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ProfileRow } from "@/types/database.types";

interface CreateVictimFormProps {
  isAdmin: boolean;
  counselors?: ProfileRow[]; // Only passed if isAdmin is true
}

export function CreateVictimForm({ isAdmin, counselors = [] }: CreateVictimFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsBusy(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await createVictimAction(undefined, formData);
      if (res.success) {
        setFeedback({ text: "Victim successfully created (Default password: Password123!). Case mapped." });
        e.currentTarget.reset();
        setTimeout(() => setIsOpen(false), 4000);
      } else {
        setFeedback({ text: res.error || "Failed to create victim.", error: true });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFeedback({ text: errorMsg, error: true });
    } finally {
      setIsBusy(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition shadow-sm"
      >
        <Plus className="h-4 w-4" />
        New Victim / Case
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Create Victim Account</h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin 
              ? "Generate a new victim profile and assign a case." 
              : "Onboard a new victim directly into your caseload."}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          type="button"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Aarohi Sharma"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="aarohi@sahay.org"
          />
        </div>

        {isAdmin && (
          <div>
            <label htmlFor="counselorId" className="block text-sm font-medium text-foreground">
              Assign Counselor (Optional)
            </label>
            <select
              id="counselorId"
              name="counselorId"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">-- Unassigned --</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-md p-3 text-xs ${
              feedback.error ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {feedback.error ? (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isBusy ? "Creating..." : "Create Account & Case"}
        </button>
      </form>
    </div>
  );
}
