"use client";

import { useState } from "react";
import { updateCaseStatusAction } from "@/app/actions/cases";
import type { CaseStatus } from "@/types/database.types";
import { Loader2 } from "lucide-react";

interface CaseStatusChangerProps {
  caseId: string;
  initialStatus: CaseStatus;
}

const ALL_STATUSES: CaseStatus[] = [
  "OPEN",
  "ACTIVE",
  "UNDER_REVIEW",
  "CLOSED",
  "REFERRED",
];

export function CaseStatusChanger({ caseId, initialStatus }: CaseStatusChangerProps) {
  const [status, setStatus] = useState<CaseStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleStatusChange(newStatus: CaseStatus) {
    if (newStatus === status) return;
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await updateCaseStatusAction(caseId, newStatus);
      if (res.success) {
        setStatus(newStatus);
        setMessage(res.message || `Status updated to ${newStatus}`);
      } else {
        setMessage(res.error || "Failed to update status");
      }
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Error updating status");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 sm:items-end">
      <div className="flex items-center gap-2">
        <label htmlFor="case-status-select" className="text-xs font-semibold text-muted-foreground uppercase">
          Status:
        </label>
        <div className="relative">
          <select
            id="case-status-select"
            value={status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
            className="rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
        {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
      </div>
      {message && (
        <span className="text-[11px] text-muted-foreground">{message}</span>
      )}
    </div>
  );
}
