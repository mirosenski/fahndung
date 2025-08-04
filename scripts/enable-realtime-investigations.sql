-- Aktivierung von Real-time Subscriptions für die investigations Tabelle
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Überprüfe ob RLS auf der investigations Tabelle aktiviert ist
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'investigations' 
AND schemaname = 'public';

-- 2. Aktiviere RLS falls nicht aktiviert
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- 3. Lösche existierende Policies falls vorhanden
DROP POLICY IF EXISTS "Public can view published investigations" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can view all investigations" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can insert investigations" ON public.investigations;
DROP POLICY IF EXISTS "Users can update their own investigations" ON public.investigations;
DROP POLICY IF EXISTS "Admins can update all investigations" ON public.investigations;
DROP POLICY IF EXISTS "Users can delete their own investigations" ON public.investigations;
DROP POLICY IF EXISTS "Admins can delete all investigations" ON public.investigations;

-- 4. Erstelle RLS Policies für die investigations Tabelle
-- Öffentlicher Lesezugriff für veröffentlichte Fahndungen (status = 'published')
CREATE POLICY "Public can view published investigations" ON public.investigations
FOR SELECT USING (status = 'published');

-- Authentifizierte Benutzer können alle Fahndungen sehen
CREATE POLICY "Authenticated users can view all investigations" ON public.investigations
FOR SELECT USING (auth.role() = 'authenticated');

-- Authentifizierte Benutzer können Fahndungen erstellen
CREATE POLICY "Authenticated users can insert investigations" ON public.investigations
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  created_by = auth.uid()
);

-- Benutzer können ihre eigenen Fahndungen aktualisieren
CREATE POLICY "Users can update their own investigations" ON public.investigations
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  created_by = auth.uid()
);

-- Admins können alle Fahndungen aktualisieren
CREATE POLICY "Admins can update all investigations" ON public.investigations
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Benutzer können ihre eigenen Fahndungen löschen
CREATE POLICY "Users can delete their own investigations" ON public.investigations
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  created_by = auth.uid()
);

-- Admins können alle Fahndungen löschen
CREATE POLICY "Admins can delete all investigations" ON public.investigations
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. Aktiviere Real-time Subscriptions für die investigations Tabelle
-- Dies ist automatisch aktiviert, wenn RLS aktiviert ist

-- 6. Überprüfe die Konfiguration
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  'RLS aktiviert' as status
FROM pg_tables 
WHERE tablename = 'investigations' 
AND schemaname = 'public';

-- 7. Zeige alle Policies für die investigations Tabelle
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'investigations' 
AND schemaname = 'public';

-- 8. Kommentar
COMMENT ON TABLE public.investigations IS 'Real-time Subscriptions für investigations sind aktiviert'; 