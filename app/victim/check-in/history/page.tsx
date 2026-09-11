/**
 * /victim/check-in/history — Submitted check-in history.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, History, Plus } from "lucide-react";
import { getCheckInsByVictimId } from "@/lib/db/check-ins";
import { getCurrentProfile } from "@/lib/db/profiles";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Check-In History" };

export default async function VictimCheckInHistoryPage() {
  const profile = await getCurrentProfile();
  let pastCheckIns: Array<{
    id: string;
    response_text: string | null;
    submitted_at: string;
    voice_input_used: boolean;
  }> = [];

  if (profile) {
    try {
      const data = await getCheckInsByVictimId(profile.id);
      pastCheckIns = data || [];
    } catch (error) {
      console.error("Error fetching victim check-in history:", error);
    }
  }

  return (
    <div className="luma-container max-w-2xl py-6 sm:py-10">
      <Link
        href={ROUTES.victim.root}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="h-5 w-5 text-emerald-600" />
            <h1 className="text-2xl font-semibold text-foreground">Check-In History</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A secure record of your past check-ins.
          </p>
        </div>
        <Link
          href={ROUTES.victim.checkIn}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Submit a new check-in
        </Link>
      </div>

      {pastCheckIns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-medium text-foreground">No history yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven&apos;t submitted any check-ins yet. When you do, they will securely appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastCheckIns.map((checkIn) => {
            const date = new Date(checkIn.submitted_at);
            const timeOptions: Intl.DateTimeFormatOptions = { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            };
            const dateStr = date.toLocaleDateString("en-IN", {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const timeStr = date.toLocaleTimeString("en-IN", timeOptions);

            return (
              <div 
                key={checkIn.id} 
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="border-b border-border bg-secondary/30 px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {dateStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkIn.voice_input_used && (
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium border border-border">
                          Voice input
                        </span>
                      )}
                      <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  {checkIn.response_text ? (
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                        {checkIn.response_text}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No text response provided.
                    </p>
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