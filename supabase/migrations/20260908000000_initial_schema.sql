-- ==============================================================================
-- SAHAY — Initial Schema Migration
-- Migration: 20260908000000_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Helper Functions
-- ------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('VICTIM', 'COUNSELOR', 'ADMIN')) default 'VICTIM',
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

drop trigger if exists trigger_profiles_updated_at on public.profiles;
create trigger trigger_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name, is_active)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'VICTIM'),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'User'), '@', 1)),
    true
  )
  on conflict (id) do update set
    updated_at = now(),
    display_name = coalesce(excluded.display_name, public.profiles.display_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Cases Table
-- ------------------------------------------------------------------------------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_ref text not null unique,
  status text not null check (status in ('OPEN', 'ACTIVE', 'UNDER_REVIEW', 'CLOSED', 'REFERRED')) default 'OPEN',
  victim_id uuid not null references public.profiles(id) on delete restrict,
  counselor_id uuid references public.profiles(id) on delete set null,
  opened_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  notes text
);

create index if not exists cases_victim_id_idx on public.cases(victim_id);
create index if not exists cases_counselor_id_idx on public.cases(counselor_id);
create index if not exists cases_status_idx on public.cases(status);

drop trigger if exists trigger_cases_updated_at on public.cases;
create trigger trigger_cases_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 4. Check-Ins Table
-- ------------------------------------------------------------------------------
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  victim_id uuid not null references public.profiles(id) on delete restrict,
  response_text text,
  voice_input_used boolean not null default false,
  submitted_at timestamptz not null default now()
);

create index if not exists check_ins_case_id_idx on public.check_ins(case_id);
create index if not exists check_ins_victim_id_idx on public.check_ins(victim_id);
create index if not exists check_ins_submitted_at_idx on public.check_ins(submitted_at desc);

-- ------------------------------------------------------------------------------
-- 5. Interactions Table
-- ------------------------------------------------------------------------------
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  channel text not null check (channel in ('VOICE_CALL', 'SMS', 'IN_APP_CHECK_IN', 'EMAIL', 'IN_PERSON')),
  occurred_at timestamptz not null default now(),
  summary text,
  recorded_by_id uuid not null references public.profiles(id) on delete restrict
);

create index if not exists interactions_case_id_idx on public.interactions(case_id);
create index if not exists interactions_recorded_by_id_idx on public.interactions(recorded_by_id);
create index if not exists interactions_occurred_at_idx on public.interactions(occurred_at desc);

-- ------------------------------------------------------------------------------
-- 6. Consents Table
-- ------------------------------------------------------------------------------
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  victim_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null,
  status text not null check (status in ('GIVEN', 'WITHDRAWN', 'PENDING')) default 'PENDING',
  granted_at timestamptz,
  withdrawn_at timestamptz
);

create index if not exists consents_victim_id_idx on public.consents(victim_id);
create index if not exists consents_status_idx on public.consents(status);

-- ------------------------------------------------------------------------------
-- 7. Alerts Table
-- ------------------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  status text not null check (status in ('NEW', 'UNDER_REVIEW', 'REVIEWED')) default 'NEW',
  severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH')) default 'MEDIUM',
  signal_description text not null,
  raised_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_id uuid references public.profiles(id) on delete set null
);

create index if not exists alerts_case_id_idx on public.alerts(case_id);
create index if not exists alerts_status_idx on public.alerts(status);
create index if not exists alerts_severity_idx on public.alerts(severity);
create index if not exists alerts_reviewed_by_id_idx on public.alerts(reviewed_by_id);

-- ------------------------------------------------------------------------------
-- 8. Risk Scores Table
-- ------------------------------------------------------------------------------
create table if not exists public.risk_scores (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  computed_at timestamptz not null default now(),
  signal_reason text not null,
  human_reviewed boolean not null default false
);

create index if not exists risk_scores_case_id_idx on public.risk_scores(case_id);
create index if not exists risk_scores_computed_at_idx on public.risk_scores(computed_at desc);

-- ------------------------------------------------------------------------------
-- 9. Follow-Ups Table
-- ------------------------------------------------------------------------------
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  counselor_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  due_date timestamptz not null,
  status text not null check (status in ('PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED')) default 'PENDING',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists follow_ups_case_id_idx on public.follow_ups(case_id);
create index if not exists follow_ups_counselor_id_idx on public.follow_ups(counselor_id);
create index if not exists follow_ups_status_idx on public.follow_ups(status);
create index if not exists follow_ups_due_date_idx on public.follow_ups(due_date);

drop trigger if exists trigger_follow_ups_updated_at on public.follow_ups;
create trigger trigger_follow_ups_updated_at
  before update on public.follow_ups
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 10. Audit Logs Table
-- ------------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  actor_role text not null check (actor_role in ('VICTIM', 'COUNSELOR', 'ADMIN')),
  action text not null,
  resource_type text not null,
  resource_id text not null,
  timestamp timestamptz not null default now(),
  metadata jsonb
);

create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_resource_idx on public.audit_logs(resource_type, resource_id);
create index if not exists audit_logs_timestamp_idx on public.audit_logs(timestamp desc);

-- ==============================================================================
-- 11. Row Level Security (RLS) Configuration
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.check_ins enable row level security;
alter table public.interactions enable row level security;
alter table public.consents enable row level security;
alter table public.alerts enable row level security;
alter table public.risk_scores enable row level security;
alter table public.follow_ups enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILES POLICIES
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using ((select public.get_my_role()) = 'ADMIN')
  with check ((select public.get_my_role()) = 'ADMIN');

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

-- CASES POLICIES
drop policy if exists "cases_select_victim" on public.cases;
create policy "cases_select_victim" on public.cases
  for select to authenticated
  using ((select auth.uid()) = victim_id);

drop policy if exists "cases_select_staff" on public.cases;
create policy "cases_select_staff" on public.cases
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "cases_insert_staff" on public.cases;
create policy "cases_insert_staff" on public.cases
  for insert to authenticated
  with check ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "cases_insert_victim" on public.cases;
create policy "cases_insert_victim" on public.cases
  for insert to authenticated
  with check ((select auth.uid()) = victim_id);

drop policy if exists "cases_update_staff" on public.cases;
create policy "cases_update_staff" on public.cases
  for update to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'))
  with check ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

-- CHECK_INS POLICIES
drop policy if exists "check_ins_select_victim" on public.check_ins;
create policy "check_ins_select_victim" on public.check_ins
  for select to authenticated
  using ((select auth.uid()) = victim_id);

drop policy if exists "check_ins_select_staff" on public.check_ins;
create policy "check_ins_select_staff" on public.check_ins
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "check_ins_insert_victim" on public.check_ins;
create policy "check_ins_insert_victim" on public.check_ins
  for insert to authenticated
  with check ((select auth.uid()) = victim_id);

-- INTERACTIONS POLICIES
drop policy if exists "interactions_select_staff" on public.interactions;
create policy "interactions_select_staff" on public.interactions
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "interactions_insert_staff" on public.interactions;
create policy "interactions_insert_staff" on public.interactions
  for insert to authenticated
  with check (
    (select public.get_my_role()) in ('COUNSELOR', 'ADMIN')
    and (select auth.uid()) = recorded_by_id
  );

-- CONSENTS POLICIES
drop policy if exists "consents_select_victim" on public.consents;
create policy "consents_select_victim" on public.consents
  for select to authenticated
  using ((select auth.uid()) = victim_id);

drop policy if exists "consents_select_staff" on public.consents;
create policy "consents_select_staff" on public.consents
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "consents_insert_victim" on public.consents;
create policy "consents_insert_victim" on public.consents
  for insert to authenticated
  with check ((select auth.uid()) = victim_id);

drop policy if exists "consents_update_victim" on public.consents;
create policy "consents_update_victim" on public.consents
  for update to authenticated
  using ((select auth.uid()) = victim_id)
  with check ((select auth.uid()) = victim_id);

-- ALERTS POLICIES
drop policy if exists "alerts_select_staff" on public.alerts;
create policy "alerts_select_staff" on public.alerts
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "alerts_insert_staff" on public.alerts;
create policy "alerts_insert_staff" on public.alerts
  for insert to authenticated
  with check ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "alerts_update_staff" on public.alerts;
create policy "alerts_update_staff" on public.alerts
  for update to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'))
  with check ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

-- RISK_SCORES POLICIES
drop policy if exists "risk_scores_select_staff" on public.risk_scores;
create policy "risk_scores_select_staff" on public.risk_scores
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "risk_scores_manage_staff" on public.risk_scores;
create policy "risk_scores_manage_staff" on public.risk_scores
  for all to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'))
  with check ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

-- FOLLOW_UPS POLICIES
drop policy if exists "follow_ups_all_staff" on public.follow_ups;
create policy "follow_ups_all_staff" on public.follow_ups
  for all to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'))
  with check ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

-- AUDIT_LOGS POLICIES
drop policy if exists "audit_logs_select_staff" on public.audit_logs;
create policy "audit_logs_select_staff" on public.audit_logs
  for select to authenticated
  using ((select public.get_my_role()) in ('COUNSELOR', 'ADMIN'));

drop policy if exists "audit_logs_insert_authenticated" on public.audit_logs;
create policy "audit_logs_insert_authenticated" on public.audit_logs
  for insert to authenticated
  with check ((select auth.uid()) = actor_id);
