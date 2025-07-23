-- Supabase Storage Bucket Setup für Media Gallery
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Erstelle den media-gallery Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-gallery',
  'media-gallery',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/mkv',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Erstelle RLS Policies für den media-gallery Bucket

-- Erlaube authentifizierten Benutzern das Lesen aller Dateien
CREATE POLICY "Authenticated users can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube öffentlichen Lesezugriff für veröffentlichte Medien
CREATE POLICY "Public can read published media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  EXISTS (
    SELECT 1 FROM public.media 
    WHERE file_path = name AND is_public = true
  )
);

-- Erlaube Admins und Editoren das Hochladen von Dateien
CREATE POLICY "Admins and editors can upload media files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaube Admins und Editoren das Aktualisieren von Dateien
CREATE POLICY "Admins and editors can update media files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaube Admins und Editoren das Löschen von Dateien
CREATE POLICY "Admins and editors can delete media files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 3. Erstelle die media Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  directory VARCHAR(100) DEFAULT 'allgemein',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Erstelle Indexe für bessere Performance (ohne CONCURRENTLY für Transaktionen)
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON public.media(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON public.media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_directory ON public.media(directory);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON public.media(is_public);
CREATE INDEX IF NOT EXISTS idx_media_file_size ON public.media(file_size);
CREATE INDEX IF NOT EXISTS idx_media_tags_gin ON public.media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media(uploaded_by);

-- 5. Aktiviere Row Level Security auf der media Tabelle
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 6. Erstelle RLS Policies für die media Tabelle
CREATE POLICY "Users can view public media" ON public.media
FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all media" ON public.media
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and editors can insert media" ON public.media
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins and editors can update media" ON public.media
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can delete media" ON public.media
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. Erstelle eine Funktion für automatische Thumbnail-Generierung (Platzhalter)
CREATE OR REPLACE FUNCTION generate_media_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  -- Dies ist ein Platzhalter für die Thumbnail-Generierung
  -- In einer echten Implementierung würden Sie eine Edge-Funktion
  -- oder einen Background-Job auslösen
  
  IF NEW.media_type = 'image' THEN
    -- Logge dass Thumbnail-Generierung stattfinden sollte
    INSERT INTO public.admin_actions (
      admin_id, 
      action_type, 
      details
    ) VALUES (
      NEW.uploaded_by,
      'thumbnail_generation_queued',
      jsonb_build_object(
        'media_id', NEW.id,
        'file_path', NEW.file_path
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Erstelle Trigger für Thumbnail-Generierung
DROP TRIGGER IF EXISTS trigger_generate_thumbnail ON public.media;
CREATE TRIGGER trigger_generate_thumbnail
  AFTER INSERT ON public.media
  FOR EACH ROW
  WHEN (NEW.media_type = 'image')
  EXECUTE FUNCTION generate_media_thumbnail();

-- 9. Erstelle eine Funktion für Volltext-Suche
CREATE OR REPLACE FUNCTION search_media(
  search_query text,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  original_name varchar,
  description text,
  media_type varchar,
  directory varchar,
  file_size integer,
  uploaded_at timestamptz,
  tags text[],
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.original_name,
    m.description,
    m.media_type,
    m.directory,
    m.file_size,
    m.uploaded_at,
    m.tags,
    ts_rank(
      setweight(to_tsvector('german', COALESCE(m.original_name, '')), 'A') ||
      setweight(to_tsvector('german', COALESCE(m.description, '')), 'B'),
      plainto_tsquery('german', search_query)
    ) as rank
  FROM public.media m
  WHERE 
    (
      setweight(to_tsvector('german', COALESCE(m.original_name, '')), 'A') ||
      setweight(to_tsvector('german', COALESCE(m.description, '')), 'B')
    ) @@ plainto_tsquery('german', search_query)
    OR m.tags && string_to_array(search_query, ' ')
  ORDER BY rank DESC, m.uploaded_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Erstelle eine Funktion für Medien-Statistiken
CREATE OR REPLACE FUNCTION get_media_statistics()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_items', COUNT(*),
    'total_size', COALESCE(SUM(file_size), 0),
    'by_type', jsonb_object_agg(media_type, type_count),
    'by_directory', jsonb_object_agg(directory, dir_count),
    'recent_uploads', (
      SELECT COUNT(*) 
      FROM public.media 
      WHERE uploaded_at > NOW() - INTERVAL '7 days'
    )
  ) INTO stats
  FROM (
    SELECT 
      media_type,
      directory,
      file_size,
      COUNT(*) OVER (PARTITION BY media_type) as type_count,
      COUNT(*) OVER (PARTITION BY directory) as dir_count
    FROM public.media
  ) grouped;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 11. Erstelle eine Funktion zum Bereinigen verwaister Dateien
CREATE OR REPLACE FUNCTION cleanup_orphaned_media_files()
RETURNS integer AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Lösche Medien-Einträge die älter als 1 Jahr sind und als gelöscht markiert sind
  DELETE FROM public.media 
  WHERE uploaded_at < NOW() - INTERVAL '1 year'
    AND metadata->>'deleted' = 'true';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Erstelle Beispieldaten für Tests (optional)
INSERT INTO public.media (
  original_name,
  file_name,
  file_path,
  file_size,
  mime_type,
  width,
  height,
  media_type,
  directory,
  uploaded_by,
  tags,
  description,
  is_public,
  metadata
) VALUES
(
  'sample-image-1.jpg',
  'allgemein/sample-image-1.jpg',
  'allgemein/sample-image-1.jpg',
  1024000,
  'image/jpeg',
  1920,
  1080,
  'image',
  'allgemein',
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['sample', 'test', 'image'],
  'Ein Beispielbild für die Medien-Galerie',
  true,
  '{"aspectRatio": 1.777, "quality": "high"}'::jsonb
),
(
  'sample-document.pdf',
  'dokumente/sample-document.pdf',
  'dokumente/sample-document.pdf',
  2048000,
  'application/pdf',
  null,
  null,
  'document',
  'dokumente',
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['sample', 'document', 'pdf'],
  'Ein Beispieldokument für die Medien-Galerie',
  true,
  '{"pages": 5}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 13. Erstelle admin_actions Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- 14. Erstelle Indexe für admin_actions (ohne CONCURRENTLY für Transaktionen)
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_status ON public.admin_actions(status);

-- 15. Aktiviere RLS auf admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- 16. Erstelle RLS Policies für admin_actions
CREATE POLICY "Admins can view admin actions" ON public.admin_actions
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert admin actions" ON public.admin_actions
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update admin actions" ON public.admin_actions
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Bestätigung
SELECT 'Storage Bucket Setup erfolgreich abgeschlossen!' as status; 