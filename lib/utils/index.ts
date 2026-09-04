/**
 * SAHAY Utility Functions
 * @phase 1 — Skeleton
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui class merger */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO 8601 date string for display.
 * @example formatDate("2025-01-15T10:30:00Z") → "15 Jan 2025, 10:30"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format an ISO 8601 date string as date only.
 * @example formatDateOnly("2025-01-15T10:30:00Z") → "15 Jan 2025"
 */
export function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/**
 * Returns a relative time string.
 * @example relativeTime("2025-01-14T10:30:00Z") → "2 days ago"
 */
export function relativeTime(iso: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs  = new Date(iso).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);

  if (Math.abs(diffSec) < 60)  return rtf.format(diffSec, "second");
  if (Math.abs(diffSec) < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (Math.abs(diffSec) < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (Math.abs(diffSec) < 604800) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 604800), "week");
}

/**
 * Truncate a string to a max length, appending ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}
