-- ==============================================================================
-- LUMA — RLS Fix Migration for Broken Object Level Authorization
-- Migration: 20260908000001_fix_counselor_rls.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Fix Cases
-- ------------------------------------------------------------------------------
drop policy if exists "cases_select_staff" on public.cases;
create policy "cases_select_staff" on public.cases
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or ((select public.get_my_role()) = 'COUNSELOR' and counselor_id = (select auth.uid()))
  );

drop policy if exists "cases_update_staff" on public.cases;
create policy "cases_update_staff" on public.cases
  for update to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or ((select public.get_my_role()) = 'COUNSELOR' and counselor_id = (select auth.uid()))
  )
  with check (
    (select public.get_my_role()) = 'ADMIN' 
    or ((select public.get_my_role()) = 'COUNSELOR' and counselor_id = (select auth.uid()))
  );

-- ------------------------------------------------------------------------------
-- Fix Check-Ins (derived from cases)
-- ------------------------------------------------------------------------------
drop policy if exists "check_ins_select_staff" on public.check_ins;
create policy "check_ins_select_staff" on public.check_ins
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------
-- Fix Interactions (derived from cases)
-- ------------------------------------------------------------------------------
drop policy if exists "interactions_select_staff" on public.interactions;
create policy "interactions_select_staff" on public.interactions
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------
-- Fix Alerts (derived from cases)
-- ------------------------------------------------------------------------------
drop policy if exists "alerts_select_staff" on public.alerts;
create policy "alerts_select_staff" on public.alerts
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  );

drop policy if exists "alerts_update_staff" on public.alerts;
create policy "alerts_update_staff" on public.alerts
  for update to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  )
  with check (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------
-- Fix Risk Scores (derived from cases)
-- ------------------------------------------------------------------------------
drop policy if exists "risk_scores_select_staff" on public.risk_scores;
create policy "risk_scores_select_staff" on public.risk_scores
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  );

drop policy if exists "risk_scores_manage_staff" on public.risk_scores;
create policy "risk_scores_manage_staff" on public.risk_scores
  for all to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  )
  with check (
    (select public.get_my_role()) = 'ADMIN' 
    or (
      (select public.get_my_role()) = 'COUNSELOR' 
      and case_id in (select id from public.cases where counselor_id = (select auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------
-- Fix Follow-Ups
-- ------------------------------------------------------------------------------
drop policy if exists "follow_ups_all_staff" on public.follow_ups;
create policy "follow_ups_all_staff" on public.follow_ups
  for all to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN' 
    or ((select public.get_my_role()) = 'COUNSELOR' and counselor_id = (select auth.uid()))
  )
  with check (
    (select public.get_my_role()) = 'ADMIN' 
    or ((select public.get_my_role()) = 'COUNSELOR' and counselor_id = (select auth.uid()))
  );
