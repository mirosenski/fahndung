-- Setup für Broadcast-basierte Real-time Subscriptions
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Erstelle Broadcast Authorization Policy
-- Diese Policy erlaubt authentifizierten Benutzern, Broadcast-Nachrichten zu empfangen
CREATE POLICY "Authenticated users can receive broadcasts"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (true);

-- 2. Erstelle Trigger-Funktion für investigations Tabelle
CREATE OR REPLACE FUNCTION public.investigations_changes()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'topic:' || COALESCE(NEW.id, OLD.id)::text, -- topic - der Topic für Broadcasting
    TG_OP,                                       -- event - das Event das die Funktion ausgelöst hat
    TG_OP,                                       -- operation - die Operation die die Funktion ausgelöst hat
    TG_TABLE_NAME,                               -- table - die Tabelle die den Trigger verursacht hat
    TG_TABLE_SCHEMA,                             -- schema - das Schema der Tabelle die den Trigger verursacht hat
    NEW,                                         -- new record - der Record nach der Änderung
    OLD                                          -- old record - der Record vor der Änderung
  );
  RETURN NULL;
END;
$$;

-- 3. Erstelle Trigger für investigations Tabelle
-- Dieser Trigger führt die Funktion nach jeder Änderung an der Tabelle aus
DROP TRIGGER IF EXISTS handle_investigations_changes ON public.investigations;
CREATE TRIGGER handle_investigations_changes
  AFTER INSERT OR UPDATE OR DELETE
  ON public.investigations
  FOR EACH ROW
  EXECUTE FUNCTION public.investigations_changes();

-- 4. Aktiviere RLS auf der investigations Tabelle falls nicht aktiviert
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- 5. Erstelle RLS Policies für die investigations Tabelle
-- Öffentlicher Lesezugriff für veröffentlichte Fahndungen (status = 'published')
DROP POLICY IF EXISTS "Public can view published investigations" ON public.investigations;
CREATE POLICY "Public can view published investigations" ON public.investigations
FOR SELECT USING (status = 'published');

-- Authentifizierte Benutzer können alle Fahndungen sehen
DROP POLICY IF EXISTS "Authenticated users can view all investigations" ON public.investigations;
CREATE POLICY "Authenticated users can view all investigations" ON public.investigations
FOR SELECT USING (auth.role() = 'authenticated');

-- Authentifizierte Benutzer können Fahndungen erstellen
DROP POLICY IF EXISTS "Authenticated users can insert investigations" ON public.investigations;
CREATE POLICY "Authenticated users can insert investigations" ON public.investigations
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  created_by = auth.uid()
);

-- Benutzer können ihre eigenen Fahndungen aktualisieren
DROP POLICY IF EXISTS "Users can update their own investigations" ON public.investigations;
CREATE POLICY "Users can update their own investigations" ON public.investigations
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  created_by = auth.uid()
);

-- Admins können alle Fahndungen aktualisieren
DROP POLICY IF EXISTS "Admins can update all investigations" ON public.investigations;
CREATE POLICY "Admins can update all investigations" ON public.investigations
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Benutzer können ihre eigenen Fahndungen löschen
DROP POLICY IF EXISTS "Users can delete their own investigations" ON public.investigations;
CREATE POLICY "Users can delete their own investigations" ON public.investigations
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  created_by = auth.uid()
);

-- Admins können alle Fahndungen löschen
DROP POLICY IF EXISTS "Admins can delete all investigations" ON public.investigations;
CREATE POLICY "Admins can delete all investigations" ON public.investigations
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. Überprüfe die Konfiguration
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  'Broadcast Real-time aktiviert' as status
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
COMMENT ON TABLE public.investigations IS 'Broadcast Real-time Subscriptions für investigations sind aktiviert';
COMMENT ON FUNCTION public.investigations_changes IS 'Trigger-Funktion für Broadcast Real-time Events'; 