/**
 * Victim portal loading skeleton — matches the redesigned support-hub layout.
 * Pure CSS animation, no client JavaScript.
 */

export default function VictimLoading() {
  return (
    <div className="luma-container py-6 sm:py-10" aria-busy="true" aria-label="Loading your support hub">
      {/* Welcome skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-72 animate-pulse rounded-md bg-muted/70" />
      </div>

      {/* Check-in CTA skeleton */}
      <div className="mb-8 rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-muted/70" />
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted/60 mt-3" />
          </div>
        </div>
      </div>

      {/* Two-column secondary sections skeleton */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Support status skeleton */}
        <div className="rounded-xl border border-border p-5">
          <div className="mb-3 h-4 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-muted/60 mb-2" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-full animate-pulse rounded-md bg-muted/50" />
            <div className="h-3.5 w-40 animate-pulse rounded-md bg-muted/50" />
          </div>
        </div>

        {/* What happens next skeleton */}
        <div className="rounded-xl border border-border p-5">
          <div className="mb-3 h-4 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-44 animate-pulse rounded-md bg-muted/60 mb-1" />
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted/50" />
        </div>
      </div>

      {/* Get support skeleton */}
      <div className="mt-5 rounded-xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded-md bg-muted/70" />
          </div>
        </div>
      </div>

      {/* Privacy skeleton */}
      <div className="mt-5 rounded-xl border border-border bg-secondary/50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted/60" />
        </div>
      </div>
    </div>
  );
}