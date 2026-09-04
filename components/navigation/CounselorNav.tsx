/**
 * CounselorNav — sidebar navigation for the Counselor portal.
 * Desktop: fixed left sidebar. Mobile: top bar with hamburger (skeleton-only).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Bell,
  CalendarCheck,
  FileText,
  ClipboardList,
  Settings,
  HelpCircle,
} from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.counselor.root,      label: "Dashboard",  icon: LayoutDashboard },
  { href: ROUTES.counselor.cases,     label: "Cases",      icon: FolderOpen      },
  { href: ROUTES.counselor.alerts,    label: "Alerts",     icon: Bell            },
  { href: ROUTES.counselor.followUps, label: "Follow-ups", icon: CalendarCheck   },
  { href: ROUTES.counselor.reports,   label: "Reports",    icon: FileText        },
  { href: ROUTES.counselor.auditLog,  label: "Audit Log",  icon: ClipboardList   },
] as const;

const BOTTOM_ITEMS = [
  { href: "#", label: "Settings", icon: Settings   },
  { href: "#", label: "Help",     icon: HelpCircle },
] as const;

export function CounselorNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Counselor portal navigation"
      className="flex h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground"
    >
      {/* Wordmark */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-5">
        <span className="text-base font-bold tracking-wide text-sidebar-primary">
          {APP_NAME}
        </span>
        <span className="ml-2 text-xs text-sidebar-foreground/60">Counselor</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul role="list" className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom items */}
      <div className="border-t border-sidebar-border py-3">
        <ul role="list" className="space-y-0.5 px-2">
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/50 no-underline hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
