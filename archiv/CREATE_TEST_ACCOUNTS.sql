-- Test-Accounts für Supabase Auth erstellen
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Admin Account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@fahndung.local',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 2. Editor Account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'editor@fahndung.local',
  crypt('editor123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 3. User Account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@fahndung.local',
  crypt('user123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 4. PTLS Web Account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ptlsweb@gmail.com',
  crypt('Heute-2025!sp', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 5. User Profiles erstellen (falls Tabelle existiert)
-- Admin Profile
INSERT INTO public.user_profiles (user_id, email, role, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  'admin',
  'Admin User',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@fahndung.local';

-- Editor Profile
INSERT INTO public.user_profiles (user_id, email, role, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  'editor',
  'Editor User',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'editor@fahndung.local';

-- User Profile
INSERT INTO public.user_profiles (user_id, email, role, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  'user',
  'Normal User',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'user@fahndung.local';

-- PTLS Web Profile
INSERT INTO public.user_profiles (user_id, email, role, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  'admin',
  'PTLS Web Admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'ptlsweb@gmail.com';

-- 6. Storage Bucket erstellen (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB
  ARRAY['image/*', 'video/*', 'application/pdf', 'text/*']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies
-- Erlaube authentifizierten Benutzern Upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

-- Erlaube öffentlichen Download
CREATE POLICY "Public download" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Erlaube Benutzer das Löschen ihrer eigenen Dateien
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'media');

-- 8. Bestätige die Erstellung
SELECT 'Test-Accounts erfolgreich erstellt!' as status; 