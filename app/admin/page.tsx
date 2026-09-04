/**
 * /admin — Admin portal dashboard
 */

import type { Metadata } from "next";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { Users, GitMerge, ClipboardList, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

const ADMIN_SECTIONS = [
  { id: "admin-users",       href: ROUTES.admin.users,       icon: Users,       label: "Users",       desc: "Manage counselor accounts and role assignments." },
  { id: "admin-assignments", href: ROUTES.admin.assignments, icon: GitMerge,    label: "Assignments", desc: "Assign cases to counselors and manage workloads." },
  { id: "admin-audit",       href: ROUTES.admin.auditLog,    icon: ClipboardList, label: "Audit Log", desc: "Review system-wide activity and access records." },
] as const;

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Prototype — Admin Portal.</strong> No real data is shown or
        processed. All management functions are Coming Soon.
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage users, case assignments, and system audit records.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {ADMIN_SECTIONS.map(({ id, href, icon: Icon, label, desc }) => (
          <Link
            key={id}
            id={id}
            href={href}
            className="group flex flex-col rounded-lg border border-border bg-card p-5 no-underline shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{label}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
              View <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
