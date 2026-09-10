"use client";

import { useState } from "react";
import { toggleUserStatusAction } from "@/app/actions/assignments";
import type { ProfileRow } from "@/lib/db/profiles";
import { formatDateOnly } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";


interface UserManagerProps {
  initialProfiles: ProfileRow[];
}

const ROLE_BADGES: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-800 border-purple-200",
  COUNSELOR: "bg-blue-50 text-blue-800 border-blue-200",
  VICTIM: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export function UserManager({ initialProfiles }: UserManagerProps) {
  const [profiles, setProfiles] = useState<ProfileRow[]>(initialProfiles);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleToggleStatus(profile: ProfileRow) {
    setUpdatingId(profile.id);
    setFeedback(null);

    try {
      const res = await toggleUserStatusAction(profile.id, profile.is_active);
      if (res.success) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === profile.id ? { ...p, is_active: !p.is_active } : p))
        );
        setFeedback({ text: res.message || "User status updated." });
      } else {
        setFeedback({ text: res.error || "Failed to update status.", error: true });
      }
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error updating status.",
        error: true,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = profiles.filter((p) => {
    if (roleFilter === "ALL") return true;
    return p.role === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Role metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total Users
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{profiles.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Counselors
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {profiles.filter((p) => p.role === "COUNSELOR").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Victim / Complainants
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {profiles.filter((p) => p.role === "VICTIM").length}
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md p-3 text-xs ${
            feedback.error ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {feedback.error ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Role Filters */}
      <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg w-fit">
        {(["ALL", "COUNSELOR", "VICTIM", "ADMIN"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              roleFilter === r
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Display Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Account Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Registered
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                  No users found matching this filter.
                </td>
              </tr>
            ) : (
              filtered.map((profile) => {
                const isBusy = updatingId === profile.id;
                return (
                  <tr key={profile.id} className="hover:bg-secondary/30 transition">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {profile.display_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          ROLE_BADGES[profile.role] || "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          profile.is_active ? "text-emerald-700" : "text-destructive"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profile.is_active ? "bg-emerald-500" : "bg-destructive"
                          }`}
                        />
                        {profile.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateOnly(profile.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {profile.role !== "ADMIN" && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleStatus(profile)}
                          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                        >
                          {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
                          {profile.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
