/**
 * /counselor/cases — Real case list for counselors.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getCases } from "@/lib/db/cases";
import { getCurrentProfile } from "@/lib/db/profiles";
import { formatDateOnly } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CreateVictimForm } from "@/components/management/CreateVictimForm";

import type { CaseStatus } from "@/types/database.types";

export const metadata: Metadata = { title: "Cases" };

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 border-emerald-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
  OPEN: "bg-blue-50 text-blue-800 border-blue-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
  REFERRED: "bg-purple-50 text-purple-800 border-purple-200",
};

interface CasesPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function CounselorCasesPage({
  searchParams,
}: CasesPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const filterStatus = resolvedParams?.status as CaseStatus | undefined;

  let cases: Array<{
    id: string;
    case_ref: string;
    status: CaseStatus;
    opened_at: string;
    victim: { id: string; display_name: string } | null;
    counselor: { id: string; display_name: string } | null;
  }> = [];

  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "COUNSELOR") {
      return null;
    }
    const data = await getCases({
      counselorId: profile.id,
      status: filterStatus,
    });
    cases = (data as unknown as typeof cases) || [];
  } catch (e) {
    console.error("Error loading counselor cases:", e);
  }

  const statuses = ["ALL", "ACTIVE", "UNDER_REVIEW", "OPEN", "CLOSED"];

  return (
    <div>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Synthetic data only.</strong> All cases and victim names
        represent synthetic test records.
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Caseload Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your assigned cases and review ongoing client continuity.
          </p>
        </div>
        <CreateVictimForm isAdmin={false} />
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {statuses.map((st) => {
          const isActive =
            (!filterStatus && st === "ALL") || filterStatus === st;
          const href =
            st === "ALL" ? "/counselor/cases" : `/counselor/cases?status=${st}`;
          return (
            <Link key={st} href={href} className="no-underline">
              <Button
                variant={isActive ? "default" : "secondary"}
                size="sm"
                className="text-xs font-semibold"
              >
                {st}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Cases Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Case Ref
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Victim / Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assigned Counselor
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Opened
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground italic"
                >
                  No cases found matching the current filter.
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/30 transition">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">
                    <Link
                      href={`/counselor/cases/${c.id}`}
                      className="hover:underline"
                    >
                      {c.case_ref}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.victim?.display_name || "Unlinked"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGES[c.status] ||
                        "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.counselor?.display_name || (
                      <span className="italic text-amber-700">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateOnly(c.opened_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/counselor/cases/${c.id}`}
                      className="inline-flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/80 no-underline"
                    >
                      View Case <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
