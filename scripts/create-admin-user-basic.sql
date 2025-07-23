-- Einfachstes Admin-Benutzer Script
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Prüfe ob Benutzer bereits existiert
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Prüfe ob Benutzer bereits existiert
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@fahndung.local';
  
  -- Erstelle Benutzer nur wenn er nicht existiert
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'admin@fahndung.local',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    );
    
    -- Hole die neue User-ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@fahndung.local';
    
    RAISE NOTICE 'Admin-Benutzer erstellt: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin-Benutzer existiert bereits: %', admin_user_id;
  END IF;
  
  -- Erstelle oder aktualisiere Profil
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (
      user_id,
      email,
      name,
      role,
      department
    ) VALUES (
      admin_user_id,
      'admin@fahndung.local',
      'Administrator',
      'admin',
      'IT'
    ) ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      department = EXCLUDED.department;
      
    RAISE NOTICE 'Admin-Profil erstellt/aktualisiert für User: %', admin_user_id;
  END IF;
END $$;

-- 2. Überprüfe den erstellten Benutzer
SELECT 
  u.email,
  u.email_confirmed_at,
  up.name,
  up.role,
  up.department
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'admin@fahndung.local'; 