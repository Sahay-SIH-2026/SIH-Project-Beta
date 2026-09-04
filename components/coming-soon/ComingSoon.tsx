/**
 * ComingSoon — Reusable placeholder for unimplemented features.
 *
 * Every route or section that is not yet implemented renders this component
 * instead of fake or non-functional UI.
 *
 * @phase 1 — Skeleton
 */

import { Clock } from "lucide-react";

interface ComingSoonProps {
  /** Title override. Defaults to "Coming Soon". */
  title?: string;
  /** Custom description. Falls back to the standard skeleton message. */
  description?: string;
  /** Optional planned phase label, e.g. "Phase 3 — Authentication". */
  plannedPhase?: string;
}

export function ComingSoon({
  title = "Coming Soon",
  description = "This module will be available in a future development phase.",
  plannedPhase,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
        <Clock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>

      <h2 className="text-xl font-semibold text-foreground">{title}</h2>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>

      {plannedPhase && (
        <p className="mt-4 rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          Planned: {plannedPhase}
        </p>
      )}
    </div>
  );
}
