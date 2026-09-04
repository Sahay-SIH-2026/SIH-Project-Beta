/**
 * /admin/users — User management
 */

import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage counselor accounts, create users, and assign roles.
      </p>
      <div className="mt-8">
        <ComingSoon plannedPhase="Phase 3 — Authentication + RBAC" />
      </div>
    </div>
  );
}
