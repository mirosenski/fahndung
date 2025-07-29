-- Update RLS Policies für investigation_images Tabelle
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Lösche existierende Policies
DROP POLICY IF EXISTS "Public can view public investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can view all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can insert investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Users can update their own investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Admins can update all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Users can delete their own investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Admins can delete all investigation images" ON public.investigation_images;

-- 2. Erstelle neue RLS Policies für die investigation_images Tabelle
-- Öffentlicher Lesezugriff für veröffentlichte Bilder
CREATE POLICY "Public can view public investigation images" ON public.investigation_images
FOR SELECT USING (is_public = true);

-- Authentifizierte Benutzer können alle Bilder sehen
CREATE POLICY "Authenticated users can view all investigation images" ON public.investigation_images
FOR SELECT USING (auth.role() = 'authenticated');

-- Authentifizierte Benutzer können Bilder zu Fahndungen hinzufügen (erlaubt für alle authentifizierten Benutzer)
CREATE POLICY "Authenticated users can insert investigation images" ON public.investigation_images
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  uploaded_by = auth.uid()
);

-- Benutzer können ihre eigenen Bilder aktualisieren
CREATE POLICY "Users can update their own investigation images" ON public.investigation_images
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  uploaded_by = auth.uid()
);

-- Admins können alle Bilder aktualisieren
CREATE POLICY "Admins can update all investigation images" ON public.investigation_images
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Benutzer können ihre eigenen Bilder löschen
CREATE POLICY "Users can delete their own investigation images" ON public.investigation_images
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  uploaded_by = auth.uid()
);

-- Admins können alle Bilder löschen
CREATE POLICY "Admins can delete all investigation images" ON public.investigation_images
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Kommentar
COMMENT ON TABLE public.investigation_images IS 'RLS Policies für investigation_images wurden aktualisiert';