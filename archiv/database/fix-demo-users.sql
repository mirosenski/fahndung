-- Fix für Demo-User Erstellung
-- Führe das in Supabase SQL Editor aus

-- 1. RLS temporär deaktivieren für Demo-User Erstellung
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Bestehende Demo-Profile löschen (falls vorhanden)
DELETE FROM public.user_profiles WHERE email IN (
  'admin@fahndung.local',
  'editor@fahndung.local', 
  'user@fahndung.local'
);

-- 3. Demo-User in auth.users erstellen (falls nicht vorhanden)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'admin@fahndung.local', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'editor@fahndung.local', crypt('editor123', gen_salt('bf')), NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'user@fahndung.local', crypt('user123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 4. Demo-Profile erstellen mit korrekten user_ids
INSERT INTO public.user_profiles (user_id, email, role, name, department, status)
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email = 'admin@fahndung.local' THEN 'admin'
    WHEN u.email = 'editor@fahndung.local' THEN 'editor'
    ELSE 'user'
  END,
  CASE 
    WHEN u.email = 'admin@fahndung.local' THEN 'Administrator'
    WHEN u.email = 'editor@fahndung.local' THEN 'Editor'
    ELSE 'Benutzer'
  END,
  CASE 
    WHEN u.email = 'admin@fahndung.local' THEN 'IT'
    WHEN u.email = 'editor@fahndung.local' THEN 'Redaktion'
    ELSE 'Allgemein'
  END,
  'approved'
FROM auth.users u
WHERE u.email IN ('admin@fahndung.local', 'editor@fahndung.local', 'user@fahndung.local')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  status = 'approved';

-- 5. RLS wieder aktivieren
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Bestätigung
SELECT 
  'Demo-User erstellt' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_users,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_users
FROM public.user_profiles 
WHERE email IN ('admin@fahndung.local', 'editor@fahndung.local', 'user@fahndung.local'); 