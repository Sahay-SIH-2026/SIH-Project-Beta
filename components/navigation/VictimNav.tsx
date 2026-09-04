/**
 * VictimNav — mobile-first bottom navigation bar for the Victim portal.
 * Desktop shows as a top sub-nav bar.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Database, LifeBuoy } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.victim.root,    label: "Home",      icon: Home       },
  { href: ROUTES.victim.case,    label: "My Case",   icon: FolderOpen },
  { href: ROUTES.victim.data,    label: "My Data",   icon: Database   },
  { href: ROUTES.victim.support, label: "Support",   icon: LifeBuoy   },
] as const;

export function VictimNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sub-nav */}
      <nav
        aria-label="Victim portal navigation"
        className="hidden border-b border-border bg-white sm:block"
      >
        <div className="sahay-container flex h-11 items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors no-underline",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Victim portal navigation"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-white sm:hidden"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs no-underline transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
