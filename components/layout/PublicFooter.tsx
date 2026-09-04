/**
 * PublicFooter — minimal footer for public/landing pages.
 */

import { APP_NAME, CURRENT_PHASE_LABEL } from "@/lib/constants";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="sahay-container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
        <p>
          &copy; {year} {APP_NAME}. For demonstration purposes only.
        </p>
        <p>{CURRENT_PHASE_LABEL}</p>
      </div>
    </footer>
  );
}
