-- 🔧 FIX für SUPER_ADMIN ROLE CONSTRAINT ERROR
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- ============================================
-- 1. CHECK CONSTRAINT AKTUALISIEREN
-- ============================================

-- Zuerst die alte Check-Constraint entfernen
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Neue Check-Constraint mit 'super_admin' hinzufügen
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('user', 'editor', 'admin', 'super_admin'));

-- ============================================
-- 2. SUPER-ADMIN ERSTELLEN (ptlsweb@gmail.com)
-- ============================================

-- Erstelle Super-Admin Benutzer falls nicht vorhanden
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'ptlsweb@gmail.com';
  
  IF admin_id IS NULL THEN
    -- Create admin user in auth.users
    -- WICHTIG: Ändern Sie 'IhrSicheresPasswort123!' zu einem sicheren Passwort
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      'ptlsweb@gmail.com',
      crypt('IhrSicheresPasswort123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"name": "Super Admin", "department": "IT"}'::jsonb,
      true,
      'authenticated'
    ) RETURNING id INTO admin_id;
    
    RAISE NOTICE '✅ Super-Admin erstellt: ptlsweb@gmail.com';
  ELSE
    RAISE NOTICE 'ℹ️ Super-Admin existiert bereits: ptlsweb@gmail.com';
  END IF;

  -- Create or update admin profile
  INSERT INTO public.user_profiles (
    user_id,
    name,
    email,
    department,
    role,
    status
  ) VALUES (
    admin_id,
    'Super Admin',
    'ptlsweb@gmail.com',
    'IT',
    'super_admin',
    'approved'
  ) ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    status = 'approved',
    updated_at = NOW();

END $$;

-- ============================================
-- 3. ÜBERPRÜFUNG
-- ============================================

-- Zeige Installationsstatus
SELECT 
  'user_profiles role constraint' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'user_profiles_role_check'
  ) THEN '✅ AKTUALISIERT' ELSE '❌ FEHLT' END as status
UNION ALL
SELECT 
  'Super-Admin ptlsweb@gmail.com',
  CASE WHEN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE email = 'ptlsweb@gmail.com' AND role = 'super_admin'
  ) THEN '✅ OK' ELSE '❌ FEHLT' END as status;

-- ============================================
-- 4. ERFOLGSMELDUNG
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ SUPER_ADMIN ROLE FIX ERFOLGREICH!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📧 SUPER-ADMIN ACCOUNT:';
  RAISE NOTICE '   E-Mail: ptlsweb@gmail.com';
  RAISE NOTICE '   Passwort: IhrSicheresPasswort123!';
  RAISE NOTICE '   ⚠️  BITTE ÄNDERN SIE DAS PASSWORT NACH DEM ERSTEN LOGIN!';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 ROLE CONSTRAINT:';
  RAISE NOTICE '   Jetzt unterstützt: user, editor, admin, super_admin';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$; 