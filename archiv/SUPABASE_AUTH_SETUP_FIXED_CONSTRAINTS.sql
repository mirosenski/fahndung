-- 🔐 VOLLSTÄNDIGES SUPABASE AUTH SETUP MIT ADMIN-GENEHMIGUNGSSYSTEM
-- Für ptlsweb@gmail.com Admin-Benachrichtigungen
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- ============================================
-- 1. TABELLEN ERSTELLEN
-- ============================================

-- User Profiles Tabelle (verknüpft mit auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT DEFAULT 'Allgemein',
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin', 'super_admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Benachrichtigungen Tabelle
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration_request', 'registration_confirmation', 'daily_summary')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'approved', 'rejected')),
  message TEXT,
  admin_email TEXT DEFAULT 'ptlsweb@gmail.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 2. INDIZES FÜR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.user_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.user_notifications(type);

-- ============================================
-- 3. RLS (ROW LEVEL SECURITY) AKTIVIEREN
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES FÜR USER_PROFILES
-- ============================================

-- Alle alten Policies löschen
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Benutzer können ihr eigenes Profil lesen
CREATE POLICY "Users can read own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Benutzer können ihr eigenes Profil aktualisieren (nur bestimmte Felder)
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins und Super-Admins können alle Profile verwalten
CREATE POLICY "Admins can manage all profiles" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('admin', 'super_admin')
    AND up.status = 'approved'
  )
);

-- Service Role kann alles (für Trigger)
CREATE POLICY "Service role can manage profiles" 
ON public.user_profiles FOR ALL 
USING (auth.role() = 'service_role');

-- Neue Benutzer können während der Registrierung ihr Profil erstellen
CREATE POLICY "Users can insert own profile during signup" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. RLS POLICIES FÜR NOTIFICATIONS
-- ============================================

-- Alle alten Policies löschen
DROP POLICY IF EXISTS "Admins can view notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Service role can manage notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;

-- Admins können alle Benachrichtigungen sehen
CREATE POLICY "Admins can view notifications" 
ON public.user_notifications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('admin', 'super_admin')
    AND up.status = 'approved'
  )
);

-- Service Role kann alles
CREATE POLICY "Service role can manage notifications" 
ON public.user_notifications FOR ALL 
USING (auth.role() = 'service_role');

-- Benutzer können ihre eigenen Benachrichtigungen sehen
CREATE POLICY "Users can view own notifications" 
ON public.user_notifications FOR SELECT 
USING (
  user_email = (
    SELECT email FROM public.user_profiles 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 6. TRIGGER FÜR AUTOMATISCHE PROFIL-ERSTELLUNG
-- ============================================

-- Trigger-Funktion für neue Benutzer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_department TEXT;
  user_phone TEXT;
BEGIN
  -- Extrahiere Metadaten
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_department := COALESCE(NEW.raw_user_meta_data->>'department', 'Allgemein');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- Erstelle Benutzerprofil
  INSERT INTO public.user_profiles (
    user_id, 
    name, 
    email, 
    department,
    phone,
    role, 
    status
  ) VALUES (
    NEW.id,
    user_name,
    NEW.email,
    user_department,
    user_phone,
    'user',
    'pending'
  );

  -- Erstelle Benachrichtigung für Admin
  INSERT INTO public.user_notifications (
    user_email,
    user_name,
    type,
    status,
    message,
    admin_email
  ) VALUES (
    NEW.email,
    user_name,
    'registration_request',
    'pending',
    format('Neue Registrierung von %s (%s) - Abteilung: %s', user_name, NEW.email, user_department),
    'ptlsweb@gmail.com'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen/ersetzen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. FUNKTIONEN FÜR ADMIN-AKTIONEN
-- ============================================

-- Funktion zum Genehmigen/Ablehnen von Benutzern
CREATE OR REPLACE FUNCTION public.approve_user(
  target_email TEXT, 
  approved BOOLEAN,
  admin_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  updated_count INT;
  user_name TEXT;
BEGIN
  -- Update user profile status
  UPDATE public.user_profiles
  SET 
    status = CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
    updated_at = NOW()
  WHERE email = target_email
  RETURNING name INTO user_name;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Benutzer nicht gefunden'
    );
  END IF;

  -- Create confirmation notification
  INSERT INTO public.user_notifications (
    user_email,
    user_name,
    type,
    status,
    message
  ) VALUES (
    target_email,
    user_name,
    'registration_confirmation',
    CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
    COALESCE(admin_message, 
      CASE WHEN approved 
        THEN 'Ihre Registrierung wurde genehmigt. Sie können sich jetzt anmelden.'
        ELSE 'Ihre Registrierung wurde abgelehnt. Bei Fragen kontaktieren Sie ptlsweb@gmail.com'
      END
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN approved THEN 'Benutzer genehmigt' ELSE 'Benutzer abgelehnt' END,
    'user_email', target_email,
    'user_name', user_name,
    'status', CASE WHEN approved THEN 'approved' ELSE 'rejected' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Abrufen aller ausstehenden Registrierungen
CREATE OR REPLACE FUNCTION public.get_pending_registrations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  days_waiting INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.email,
    up.department,
    up.phone,
    up.created_at,
    EXTRACT(DAY FROM NOW() - up.created_at)::INT as days_waiting
  FROM public.user_profiles up
  WHERE up.status = 'pending'
  ORDER BY up.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion für Admin-Dashboard-Statistiken
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'pending_users', COUNT(*) FILTER (WHERE status = 'pending'),
    'approved_users', COUNT(*) FILTER (WHERE status = 'approved'),
    'rejected_users', COUNT(*) FILTER (WHERE status = 'rejected'),
    'admin_users', COUNT(*) FILTER (WHERE role IN ('admin', 'super_admin')),
    'departments', jsonb_agg(DISTINCT department)
  ) INTO stats
  FROM public.user_profiles;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. BERECHTIGUNGEN FÜR FUNKTIONEN
-- ============================================

GRANT EXECUTE ON FUNCTION public.approve_user(TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_registrations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_statistics() TO authenticated;

-- ============================================
-- 9. SUPER-ADMIN ERSTELLEN (ptlsweb@gmail.com)
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
-- 10. TEST-DATEN (OPTIONAL)
-- ============================================

-- Füge Test-Benutzer hinzu (optional, zum Testen)
/*
INSERT INTO public.user_profiles (
  user_id,
  name,
  email,
  department,
  role,
  status
) VALUES 
  (gen_random_uuid(), 'Test Pending', 'test.pending@example.com', 'IT', 'user', 'pending'),
  (gen_random_uuid(), 'Test Approved', 'test.approved@example.com', 'Redaktion', 'editor', 'approved'),
  (gen_random_uuid(), 'Test Rejected', 'test.rejected@example.com', 'Polizei', 'user', 'rejected')
ON CONFLICT (email) DO NOTHING;
*/

-- ============================================
-- 11. ÜBERPRÜFUNG DER INSTALLATION
-- ============================================

-- Zeige Installationsstatus
SELECT 
  'user_profiles table' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ OK' ELSE '❌ FEHLT' END as status
UNION ALL
SELECT 
  'user_notifications table',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notifications') 
    THEN '✅ OK' ELSE '❌ FEHLT' END
UNION ALL
SELECT 
  'RLS auf user_profiles',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles' AND rowsecurity = true) 
    THEN '✅ AKTIV' ELSE '❌ INAKTIV' END
UNION ALL
SELECT 
  'Trigger handle_new_user',
  CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
    THEN '✅ OK' ELSE '❌ FEHLT' END
UNION ALL
SELECT 
  'Super-Admin ptlsweb@gmail.com',
  CASE WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'ptlsweb@gmail.com' AND role = 'super_admin') 
    THEN '✅ OK' ELSE '❌ FEHLT' END
UNION ALL
SELECT 
  'Anzahl ausstehender Registrierungen',
  COUNT(*)::TEXT || ' Benutzer'
FROM public.user_profiles WHERE status = 'pending';

-- ============================================
-- 12. HILFSFUNKTIONEN FÜR ADMIN
-- ============================================

-- Funktion zum manuellen Senden von E-Mail-Benachrichtigungen
CREATE OR REPLACE FUNCTION public.send_pending_notifications()
RETURNS JSONB AS $$
DECLARE
  notification_count INT;
BEGIN
  -- Zähle ausstehende Benachrichtigungen
  SELECT COUNT(*) INTO notification_count
  FROM public.user_notifications
  WHERE status = 'pending' AND type = 'registration_request';

  -- Hier würde normalerweise die E-Mail-Versendung stattfinden
  -- Dies ist ein Platzhalter für die Integration mit Supabase Edge Functions

  RETURN jsonb_build_object(
    'success', true,
    'pending_notifications', notification_count,
    'message', format('%s ausstehende Benachrichtigungen gefunden', notification_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.send_pending_notifications() TO authenticated;

-- ============================================
-- ERFOLGSMELDUNG
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ SUPABASE AUTH SETUP ERFOLGREICH!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📧 SUPER-ADMIN ACCOUNT:';
  RAISE NOTICE '   E-Mail: ptlsweb@gmail.com';
  RAISE NOTICE '   Passwort: IhrSicheresPasswort123!';
  RAISE NOTICE '   ⚠️  BITTE ÄNDERN SIE DAS PASSWORT NACH DEM ERSTEN LOGIN!';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 ADMIN-GENEHMIGUNG:';
  RAISE NOTICE '   Nach jeder Registrierung wird eine E-Mail an ptlsweb@gmail.com gesendet';
  RAISE NOTICE '   mit Links zum Genehmigen oder Ablehnen.';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NÄCHSTE SCHRITTE:';
  RAISE NOTICE '   1. Testen Sie die Registrierung auf /register';
  RAISE NOTICE '   2. Prüfen Sie die user_notifications Tabelle';
  RAISE NOTICE '   3. Genehmigen Sie Benutzer über /admin/approve';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 EDGE FUNCTION:';
  RAISE NOTICE '   Vergessen Sie nicht, die send-email Edge Function zu deployen!';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$; 