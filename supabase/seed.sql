-- ==============================================================================
-- LUMA — Synthetic Seed Data (Phase 2)
-- NOTE: ALL DATA IN THIS FILE IS SYNTHETIC FOR TESTING AND DEMONSTRATION.
-- NO REAL VICTIM OR CLIENT IDENTIFYING INFORMATION IS CONTAINED HEREIN.
-- ==============================================================================

-- 1. Insert synthetic users into auth.users (if not already present)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change, phone_change,
  phone_change_token, reauthentication_token
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'counselor@luma.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "COUNSELOR"}',
    '{"display_name": "Counselor Priya Sharma", "role": "COUNSELOR"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'victim1@demo.luma.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "VICTIM"}',
    '{"display_name": "Aarohi (V-1042)", "role": "VICTIM"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'victim2@demo.luma.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "VICTIM"}',
    '{"display_name": "Deepa (V-1043)", "role": "VICTIM"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'victim3@demo.luma.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "VICTIM"}',
    '{"display_name": "Kavita (V-1044)", "role": "VICTIM"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'victim4@demo.luma.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "VICTIM"}',
    '{"display_name": "Meera (V-1045)", "role": "VICTIM"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@luma.org',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "ADMIN"}',
    '{"display_name": "System Administrator", "role": "ADMIN"}',
    now(),
    now(),
    '', '', '', '', '', '', '', ''
  )
on conflict (id) do update set
  encrypted_password = excluded.encrypted_password,
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  email_change = '',
  phone_change = '',
  phone_change_token = '',
  reauthentication_token = '';

-- 1b. Insert corresponding identities into auth.identities
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"sub": "00000000-0000-0000-0000-000000000001", "email": "counselor@luma.org"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '{"sub": "00000000-0000-0000-0000-000000000002", "email": "victim1@demo.luma.org"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '{"sub": "00000000-0000-0000-0000-000000000003", "email": "victim2@demo.luma.org"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '{"sub": "00000000-0000-0000-0000-000000000004", "email": "victim3@demo.luma.org"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '{"sub": "00000000-0000-0000-0000-000000000005", "email": "victim4@demo.luma.org"}', 'email', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '{"sub": "00000000-0000-0000-0000-000000000006", "email": "admin@luma.org"}', 'email', now(), now(), now())
on conflict (id) do nothing;

-- 2. Upsert Profiles
insert into public.profiles (id, role, display_name, is_active)
values
  ('00000000-0000-0000-0000-000000000001', 'COUNSELOR', 'Counselor Priya Sharma', true),
  ('00000000-0000-0000-0000-000000000002', 'VICTIM',    'Aarohi (V-1042)',         true),
  ('00000000-0000-0000-0000-000000000003', 'VICTIM',    'Deepa (V-1043)',          true),
  ('00000000-0000-0000-0000-000000000004', 'VICTIM',    'Kavita (V-1044)',         true),
  ('00000000-0000-0000-0000-000000000005', 'VICTIM',    'Meera (V-1045)',          true),
  ('00000000-0000-0000-0000-000000000006', 'ADMIN',     'System Administrator',    true)
on conflict (id) do update set
  role = excluded.role,
  display_name = excluded.display_name;

-- 3. Insert Cases (matching DEMO_CASE_REFS)
insert into public.cases (id, case_ref, status, victim_id, counselor_id, opened_at, notes)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'V-1042',
    'ACTIVE',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    now() - interval '14 days',
    'Initial intake completed. Housing assistance support requested.'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'V-1043',
    'UNDER_REVIEW',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    now() - interval '7 days',
    'Follow-up scheduled regarding legal counseling referrals.'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'V-1044',
    'OPEN',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    now() - interval '2 days',
    'New intake pending primary needs assessment.'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'V-1045',
    'ACTIVE',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    now() - interval '21 days',
    'Ongoing weekly check-ins established.'
  )
on conflict (case_ref) do nothing;

-- 4. Insert Alerts
insert into public.alerts (id, case_id, status, severity, signal_description, raised_at)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'NEW',
    'HIGH',
    'Support review recommended — multiple missed scheduled check-ins detected.',
    now() - interval '3 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'UNDER_REVIEW',
    'MEDIUM',
    'Support review recommended — subtle shifts in response sentiment noted.',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

-- 5. Insert Risk Scores (Mandatory disclaimer: Illustrative signal, NOT diagnosis)
insert into public.risk_scores (id, case_id, score, signal_reason, human_reviewed)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    78,
    'Elevated review priority: 2 missed check-ins and self-reported housing instability.',
    false
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    45,
    'Moderate priority: Ongoing legal proceedings indicated in recent check-in.',
    true
  )
on conflict (id) do nothing;

-- 6. Insert Check-Ins
insert into public.check_ins (id, case_id, victim_id, response_text, voice_input_used, submitted_at)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Things have been difficult this week with housing, but I am in a safe temporary spot.',
    false,
    now() - interval '4 days'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'Meeting with the legal aid counsel on Thursday went well. Feeling somewhat relieved.',
    true,
    now() - interval '2 days'
  )
on conflict (id) do nothing;

-- 7. Insert Follow-ups
insert into public.follow_ups (id, case_id, counselor_id, title, description, due_date, status)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Review emergency housing aid status',
    'Verify if local shelter placement voucher has been disbursed.',
    now() + interval '1 day',
    'PENDING'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Check in on legal consultation outcome',
    'Follow up with legal aid partner organization.',
    now() + interval '3 days',
    'PENDING'
  )
on conflict (id) do nothing;
