# Ayush Journal

## 2026-09-11 — Counselor assignment access control

Implemented case-level access control so counselors can view and modify only
cases assigned to them. Administrators retain oversight and assignment rights.

- Removed unassigned cases from counselor dashboard and caseload queries.
- Added server-side case ownership checks for case details, notes, status changes,
  interactions, follow-ups, and risk-review actions.
- Added `20260911000000_enforce_counselor_case_scope.sql` to enforce the same
  boundary through Supabase RLS for cases, associated records, and linked victim
  profiles.
- Counselor-created cases must be assigned to the creating counselor.

## Deployment note

Run `supabase/migrations/20260911000000_enforce_counselor_case_scope.sql` in
the Supabase SQL Editor before using this change in a deployed environment.
