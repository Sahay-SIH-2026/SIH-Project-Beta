/**
 * AdminNav — minimal sidebar navigation for the Admin portal.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitMerge, ClipboardList } from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.admin.root,        label: "Dashboard",   icon: LayoutDashboard },
  { href: ROUTES.admin.users,       label: "Users",       icon: Users           },
  { href: ROUTES.admin.assignments, label: "Assignments", icon: GitMerge        },
  { href: ROUTES.admin.auditLog,    label: "Audit Log",   icon: ClipboardList   },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Admin portal navigation"
      className="flex h-full w-56 flex-col border-r bg-sidebar text-sidebar-foreground"
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-5">
        <span className="text-base font-bold tracking-wide text-sidebar-primary">
          {APP_NAME}
        </span>
        <span className="ml-2 text-xs text-sidebar-foreground/60">Admin</span>
      </div>

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
    </aside>
  );
}
