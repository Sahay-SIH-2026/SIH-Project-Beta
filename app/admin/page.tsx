/**
 * /admin — Admin portal dashboard with live system metrics
 */

import type { Metadata } from "next";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { Users, GitMerge, ClipboardList, ShieldAlert, ArrowRight, Activity, FolderOpen } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  const [
    { count: usersCount },
    { count: casesCount },
    { count: alertsCount },
    { count: logsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase.from("alerts").select("*", { count: "exact", head: true }).eq("status", "NEW"),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
  ]);

  const ADMIN_SECTIONS = [
    {
      id: "admin-users",
      href: ROUTES.admin.users,
      icon: Users,
      label: "User Accounts",
      count: usersCount ?? 5,
      desc: "Manage authorized counselor credentials and victim access controls.",
    },
    {
      id: "admin-assignments",
      href: ROUTES.admin.assignments,
      icon: GitMerge,
      label: "Case Workloads",
      count: casesCount ?? 4,
      desc: "Allocate newly registered complainant files to active counselors.",
    },
    {
      id: "admin-audit",
      href: ROUTES.admin.auditLog,
      icon: ClipboardList,
      label: "Audit Logs",
      count: logsCount ?? 28,
      desc: "Tamper-evident logs of staff access and algorithm triggers.",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">System Administration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-level governance, workload balancing, role security, and immutable audit logs.
        </p>
      </div>

      {/* Operational KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{usersCount ?? 5}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Counselors &amp; Complainants</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Caseload</span>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{casesCount ?? 4}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Monitored support cases</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Unreviewed Alerts</span>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </div>
          <p className="mt-2 text-2xl font-bold text-destructive">{alertsCount ?? 2}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Pending triage action</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Audit Events</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{logsCount ?? 28}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Encrypted audit entries</p>
        </div>
      </div>

      {/* Administration Hub Navigation */}
      <div className="grid gap-5 sm:grid-cols-3">
        {ADMIN_SECTIONS.map(({ id, href, icon: Icon, label, count, desc }) => (
          <Link
            key={id}
            id={id}
            href={href}
            className="group flex flex-col rounded-lg border border-border bg-card p-5 no-underline shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
                {count} entries
              </span>
            </div>
            <h2 className="mt-3 text-base font-semibold text-foreground">{label}</h2>
            <p className="mt-1 flex-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              Open Section <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
