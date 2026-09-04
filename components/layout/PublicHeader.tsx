/**
 * PublicHeader — lightweight header for public/landing pages.
 */

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="sahay-container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label="SAHAY — Home"
        >
          {/* Simple wordmark — no government seals */}
          <span className="text-lg font-bold tracking-wide text-primary">
            {APP_NAME}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Victim Support Continuity Platform
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Prototype — Dev Build
          </span>
        </nav>
      </div>
    </header>
  );
}
