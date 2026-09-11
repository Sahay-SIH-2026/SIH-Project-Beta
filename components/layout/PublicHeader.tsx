/**
 * PublicHeader — lightweight header for public/landing pages.
 */

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="luma-container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label="LUMA — Home"
        >
          {/* Simple wordmark — no government seals */}
          <span className="text-lg font-bold tracking-wide text-primary">
            {APP_NAME}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Victim Support Continuity Platform
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-3">
          <span className="hidden sm:inline-block rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Prototype — Dev Build
          </span>
          <Link
            href="/login"
            className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 no-underline shadow-xs"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
