-- Erstelle die investigation_images Tabelle für Fahndungsbilder
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Erstelle die investigation_images Tabelle
CREATE TABLE IF NOT EXISTS public.investigation_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Erstelle Indexe für bessere Performance
CREATE INDEX IF NOT EXISTS idx_investigation_images_investigation_id ON public.investigation_images(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_images_uploaded_at ON public.investigation_images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigation_images_is_primary ON public.investigation_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_investigation_images_is_public ON public.investigation_images(is_public);
CREATE INDEX IF NOT EXISTS idx_investigation_images_uploaded_by ON public.investigation_images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_investigation_images_tags_gin ON public.investigation_images USING GIN(tags);

-- 3. Aktiviere Row Level Security
ALTER TABLE public.investigation_images ENABLE ROW LEVEL SECURITY;

-- 4. Lösche existierende Policies falls vorhanden
DROP POLICY IF EXISTS "Public can view public investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can view all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can insert investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Users can update their own investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Admins can update all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Users can delete their own investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Admins can delete all investigation images" ON public.investigation_images;

-- 5. Erstelle neue RLS Policies für die investigation_images Tabelle
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

-- 6. Erstelle eine Funktion für automatische Aktualisierung des updated_at Timestamps
CREATE OR REPLACE FUNCTION update_investigation_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Erstelle Trigger für automatische updated_at Aktualisierung
DROP TRIGGER IF EXISTS trigger_update_investigation_images_updated_at ON public.investigation_images;
CREATE TRIGGER trigger_update_investigation_images_updated_at
  BEFORE UPDATE ON public.investigation_images
  FOR EACH ROW
  EXECUTE FUNCTION update_investigation_images_updated_at();

-- 8. Erstelle eine Funktion für die Bildstatistiken einer Fahndung
CREATE OR REPLACE FUNCTION get_investigation_image_stats(investigation_uuid UUID)
RETURNS TABLE (
  total_images INTEGER,
  primary_images INTEGER,
  total_size BIGINT,
  image_types TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_images,
    COUNT(*) FILTER (WHERE is_primary = true)::INTEGER as primary_images,
    COALESCE(SUM(file_size), 0)::BIGINT as total_size,
    ARRAY_AGG(DISTINCT mime_type) as image_types
  FROM public.investigation_images
  WHERE investigation_id = investigation_uuid;
END;
$$ LANGUAGE plpgsql;

-- 9. Kommentare für bessere Dokumentation
COMMENT ON TABLE public.investigation_images IS 'Speichert Metadaten für Bilder, die zu Fahndungen gehören';
COMMENT ON COLUMN public.investigation_images.investigation_id IS 'Referenz zur Fahndung';
COMMENT ON COLUMN public.investigation_images.file_name IS 'Eindeutiger Dateiname im Storage';
COMMENT ON COLUMN public.investigation_images.original_name IS 'Ursprünglicher Dateiname';
COMMENT ON COLUMN public.investigation_images.file_path IS 'Pfad im Storage Bucket';
COMMENT ON COLUMN public.investigation_images.is_primary IS 'Markiert das Hauptbild der Fahndung';
COMMENT ON COLUMN public.investigation_images.is_public IS 'Bestimmt ob das Bild öffentlich sichtbar ist';

-- 10. Erstelle eine View für einfacheren Zugriff auf Bilder (ohne URLs, da diese client-seitig generiert werden)
CREATE OR REPLACE VIEW public.investigation_images_with_metadata AS
SELECT 
  ii.*,
  i.title as investigation_title,
  i.status as investigation_status,
  up.name as uploaded_by_name,
  up.email as uploaded_by_email
FROM public.investigation_images ii
LEFT JOIN public.investigations i ON ii.investigation_id = i.id
LEFT JOIN public.user_profiles up ON ii.uploaded_by = up.user_id;

-- 11. Kommentar für die View
COMMENT ON VIEW public.investigation_images_with_metadata IS 'View für investigation_images mit zusätzlichen Metadaten';