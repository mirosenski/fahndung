-- 🔐 Supabase Auth Setup SQL Script
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- 1. user_profiles Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT DEFAULT 'Allgemein',
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- 3. RLS aktivieren
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Bestehende Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow unauthenticated profile creation" ON public.user_profiles;

-- 5. Neue RLS-Policies erstellen

-- Benutzer können ihr eigenes Profil lesen
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Benutzer können ihr eigenes Profil aktualisieren
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins können alle Profile verwalten
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Neue Benutzer können ihr Profil erstellen
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Trigger für automatische Profil-Erstellung

-- Trigger-Funktion erstellen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Neuer Benutzer'),
    NEW.email,
    'user',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Admin-Benutzer erstellen (falls nicht vorhanden)
-- Ersetzen Sie 'admin@example.com' mit Ihrer Admin-E-Mail

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Admin User"}'::jsonb,
  true
) ON CONFLICT (email) DO NOTHING;

-- 8. Admin-Profil erstellen
INSERT INTO public.user_profiles (
  user_id,
  name,
  email,
  department,
  role,
  status
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'Admin User',
  'admin@example.com',
  'IT',
  'admin',
  'approved'
) ON CONFLICT (user_id) DO NOTHING;

-- 9. Benachrichtigungs-Tabelle erstellen (optional)
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. RLS für Benachrichtigungen
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Policies für Benachrichtigungen
CREATE POLICY "Admins can manage notifications" ON public.user_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- 11. Funktion zum Genehmigen/Ablehnen von Benutzern
CREATE OR REPLACE FUNCTION approve_user(user_email TEXT, approved BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_profiles
  SET status = CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
      updated_at = NOW()
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Funktion zum Abrufen aller Benutzer (für Admin-Panel)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  department TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.email,
    up.department,
    up.role,
    up.status,
    up.created_at
  FROM public.user_profiles up
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Berechtigungen für Funktionen
GRANT EXECUTE ON FUNCTION approve_user(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- 14. Test-Daten einfügen (optional)
INSERT INTO public.user_profiles (
  user_id,
  name,
  email,
  department,
  role,
  status
) VALUES 
  (gen_random_uuid(), 'Test User 1', 'test1@example.com', 'IT', 'user', 'pending'),
  (gen_random_uuid(), 'Test User 2', 'test2@example.com', 'Redaktion', 'editor', 'approved'),
  (gen_random_uuid(), 'Test User 3', 'test3@example.com', 'Polizei', 'user', 'rejected')
ON CONFLICT (email) DO NOTHING;

-- 15. Überprüfung der Konfiguration
SELECT 
  'user_profiles table' as check_item,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'RLS enabled' as check_item,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_profiles' AND rowsecurity = true) 
    THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status
UNION ALL
SELECT 
  'Trigger function' as check_item,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
  'Admin user' as check_item,
  CASE WHEN EXISTS (SELECT 1 FROM public.user_profiles WHERE role = 'admin') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 16. Erfolgsmeldung
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase Auth Setup erfolgreich abgeschlossen!';
  RAISE NOTICE '📧 Admin E-Mail: admin@example.com';
  RAISE NOTICE '🔑 Admin Passwort: admin123';
  RAISE NOTICE '🔐 Bitte ändern Sie das Admin-Passwort nach dem ersten Login!';
END $$; 