"use client";

import { useState } from "react";
import { assignCounselorAction } from "@/app/actions/assignments";
import type { CaseRow } from "@/lib/db/cases";
import { formatDateOnly } from "@/lib/utils";
import {
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";


interface ExtendedCase extends CaseRow {
  victim?: { id: string; display_name: string } | null;
  counselor?: { id: string; display_name: string } | null;
}

interface CounselorProfile {
  id: string;
  display_name: string;
}

interface CaseAssignmentManagerProps {
  initialCases: ExtendedCase[];
  counselors: CounselorProfile[];
}

export function CaseAssignmentManager({
  initialCases,
  counselors,
}: CaseAssignmentManagerProps) {
  const [cases, setCases] = useState<ExtendedCase[]>(initialCases);
  const [selectedCounselors, setSelectedCounselors] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      initialCases.forEach((c) => {
        map[c.id] = c.counselor_id || "";
      });
      return map;
    }
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleAssign(caseId: string) {
    const counselorId = selectedCounselors[caseId] || null;
    setUpdatingId(caseId);
    setFeedback(null);

    try {
      const res = await assignCounselorAction(caseId, counselorId);
      if (res.success) {
        setCases((prev) =>
          prev.map((c) => {
            if (c.id === caseId) {
              const matched = counselors.find((cn) => cn.id === counselorId);
              return {
                ...c,
                counselor_id: counselorId,
                counselor: matched ? { id: matched.id, display_name: matched.display_name } : null,
              };
            }
            return c;
          })
        );
        setFeedback({ text: res.message || "Assignment updated successfully." });
      } else {
        setFeedback({ text: res.error || "Failed to update assignment.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error assigning case.",
        error: true,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  // Calculate workloads
  const workloadCounts: Record<string, number> = {};
  counselors.forEach((cn) => {
    workloadCounts[cn.id] = 0;
  });
  let unassignedCount = 0;
  cases.forEach((c) => {
    if (c.counselor_id && workloadCounts[c.counselor_id] !== undefined) {
      workloadCounts[c.counselor_id]++;
    } else {
      unassignedCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Workload Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {counselors.map((cn) => (
          <div key={cn.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <UserCheck className="h-4 w-4 text-primary" /> Counselor Workload
            </div>
            <p className="mt-1.5 text-base font-semibold text-foreground truncate">
              {cn.display_name}
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {workloadCounts[cn.id] || 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">assigned cases</span>
            </p>
          </div>
        ))}

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-600" /> Unassigned Cases
          </div>
          <p className="mt-1.5 text-base font-semibold text-foreground">
            Pending Allocation
          </p>
          <p className={`mt-2 text-2xl font-bold ${unassignedCount > 0 ? "text-amber-800" : "text-foreground"}`}>
            {unassignedCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">need counselor</span>
          </p>
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

      {/* Cases Assignment Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Case Ref
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Victim Profile
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Opened
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assigned Counselor
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                  No cases found.
                </td>
              </tr>
            ) : (
              cases.map((c) => {
                const currentVal = selectedCounselors[c.id] ?? "";
                const isDifferent = (c.counselor_id || "") !== currentVal;
                const isBusy = updatingId === c.id;

                return (
                  <tr key={c.id} className="hover:bg-secondary/30 transition">
                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                      {c.case_ref}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.victim?.display_name || "Unlinked"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateOnly(c.opened_at)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={currentVal}
                        onChange={(e) =>
                          setSelectedCounselors((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        className="w-full max-w-xs rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">— Unassigned —</option>
                        {counselors.map((cn) => (
                          <option key={cn.id} value={cn.id}>
                            {cn.display_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={isBusy || !isDifferent}
                        onClick={() => handleAssign(c.id)}
                        className={`inline-flex items-center gap-1 rounded px-3 py-1 text-xs font-semibold transition ${
                          isDifferent
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                        }`}
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
