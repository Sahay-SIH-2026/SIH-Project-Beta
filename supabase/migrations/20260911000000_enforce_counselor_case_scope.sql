-- LUMA — Enforce counselor case-level access
-- A counselor can view or change only a case assigned to that counselor.
-- Counselors creating a case must assign it to themselves; admins retain oversight.

-- Profiles: counselors need the identity of victims on their own caseload only.
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.counselor_id = (select auth.uid())
          and cases.victim_id = profiles.id
      )
    )
  );

-- Cases: no unassigned-caseload browsing, and no self-service reassignment.
drop policy if exists "cases_select_staff" on public.cases;
create policy "cases_select_staff" on public.cases
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and counselor_id = (select auth.uid())
    )
  );

drop policy if exists "cases_update_staff" on public.cases;
create policy "cases_update_staff" on public.cases
  for update to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and counselor_id = (select auth.uid())
    )
  )
  with check (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and counselor_id = (select auth.uid())
    )
  );

drop policy if exists "cases_insert_staff" on public.cases;
create policy "cases_insert_staff" on public.cases
  for insert to authenticated
  with check (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and counselor_id = (select auth.uid())
    )
  );

-- Related records inherit visibility from their parent case.
drop policy if exists "check_ins_select_staff" on public.check_ins;
create policy "check_ins_select_staff" on public.check_ins
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = check_ins.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "interactions_select_staff" on public.interactions;
create policy "interactions_select_staff" on public.interactions
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = interactions.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "alerts_select_staff" on public.alerts;
create policy "alerts_select_staff" on public.alerts
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = alerts.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "alerts_update_staff" on public.alerts;
create policy "alerts_update_staff" on public.alerts
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = alerts.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  )
  with check (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = alerts.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "risk_scores_select_staff" on public.risk_scores;
create policy "risk_scores_select_staff" on public.risk_scores
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = risk_scores.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "risk_scores_manage_staff" on public.risk_scores;
create policy "risk_scores_manage_staff" on public.risk_scores
  for all to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = risk_scores.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  )
  with check (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.id = risk_scores.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "consents_select_staff" on public.consents;
create policy "consents_select_staff" on public.consents
  for select to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and exists (
        select 1 from public.cases
        where cases.victim_id = consents.victim_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

-- Related writes must be constrained by the parent case as well as actor identity.
drop policy if exists "interactions_insert_staff" on public.interactions;
create policy "interactions_insert_staff" on public.interactions
  for insert to authenticated
  with check (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and recorded_by_id = (select auth.uid())
      and exists (
        select 1 from public.cases
        where cases.id = interactions.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );

drop policy if exists "follow_ups_all_staff" on public.follow_ups;
create policy "follow_ups_all_staff" on public.follow_ups
  for all to authenticated
  using (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and counselor_id = (select auth.uid())
      and exists (
        select 1 from public.cases
        where cases.id = follow_ups.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  )
  with check (
    (select public.get_my_role()) = 'ADMIN'
    or (
      (select public.get_my_role()) = 'COUNSELOR'
      and counselor_id = (select auth.uid())
      and exists (
        select 1 from public.cases
        where cases.id = follow_ups.case_id
          and cases.counselor_id = (select auth.uid())
      )
    )
  );
