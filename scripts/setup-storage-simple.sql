-- Storage Bucket Setup für Media Gallery
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Storage Bucket erstellen (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-gallery',
  'media-gallery',
  true,
  52428800, -- 50MB
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies für Storage Bucket
-- Öffentlichen Zugriff erlauben
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media-gallery');

-- Authentifizierte Benutzer können hochladen
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media-gallery' 
  AND auth.role() = 'authenticated'
);

-- Benutzer können ihre eigenen Dateien aktualisieren
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media-gallery' 
  AND auth.role() = 'authenticated'
);

-- Benutzer können ihre eigenen Dateien löschen
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media-gallery' 
  AND auth.role() = 'authenticated'
);

-- Erfolgsmeldung
SELECT 'Storage Bucket "media-gallery" erfolgreich eingerichtet!' as status; 