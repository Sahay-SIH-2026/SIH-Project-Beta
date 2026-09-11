-- ==============================================================================
-- LUMA — Fix Supabase Auth Schema & Seed Users
--
-- PURPOSE:
-- Fixes the "500: Database error querying schema" error during login.
-- This error occurs because GoTrue's internal database driver cannot scan NULL
-- into non-nullable Go string fields for tokens, and expects corresponding
-- entries in auth.identities.
--
-- HOW TO RUN:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to SQL Editor -> New Query
-- 3. Paste this script and click "Run"
-- ==============================================================================

-- Step 1: Update NULL token and change columns to empty string ''
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE 
  confirmation_token IS NULL 
  OR recovery_token IS NULL 
  OR email_change_token_new IS NULL
  OR email_change_token_current IS NULL
  OR email_change IS NULL
  OR phone_change IS NULL
  OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;

-- Step 2: Ensure all users in auth.users have a corresponding email identity in auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  u.id::text,
  u.id,
  u.id::text,
  format('{"sub":"%s","email":"%s"}', u.id::text, u.email)::jsonb,
  'email',
  now(),
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email'
);

-- Step 3: Re-verify admin profile role
INSERT INTO public.profiles (id, role, display_name, is_active)
VALUES ('00000000-0000-0000-0000-000000000006', 'ADMIN', 'System Administrator', true)
ON CONFLICT (id) DO UPDATE SET
  role = 'ADMIN',
  display_name = 'System Administrator',
  is_active = true;
