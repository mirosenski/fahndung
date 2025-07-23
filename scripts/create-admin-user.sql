-- Admin-Benutzer erstellen
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Erstelle Admin-Benutzer (falls nicht vorhanden)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'admin@fahndung.local',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrator"}',
  false
) ON CONFLICT DO NOTHING;

-- 2. Hole die User-ID
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@fahndung.local';
  
  IF admin_user_id IS NOT NULL THEN
    -- 3. Erstelle Admin-Profil
    INSERT INTO public.user_profiles (
      user_id,
      email,
      name,
      role,
      department,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@fahndung.local',
      'Administrator',
      'admin',
      'IT',
      NOW(),
      NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      department = EXCLUDED.department,
      updated_at = NOW();
      
    RAISE NOTICE 'Admin-Benutzer erfolgreich erstellt/aktualisiert: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin-Benutzer konnte nicht erstellt werden';
  END IF;
END $$;

-- 4. Überprüfe den erstellten Benutzer
SELECT 
  u.email,
  u.email_confirmed_at,
  up.name,
  up.role,
  up.department
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'admin@fahndung.local'; 