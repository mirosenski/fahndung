-- Storage Bucket Setup für Media Gallery
-- Führen Sie dieses Script in der Supabase SQL Console aus

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

-- 2. Erstelle einfache RLS Policies für den media-gallery Bucket

-- Erlaube authentifizierten Benutzern das Lesen aller Dateien
DROP POLICY IF EXISTS "Authenticated users can read media files" ON storage.objects;
CREATE POLICY "Authenticated users can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube öffentlichen Lesezugriff für alle Dateien im media-gallery Bucket
DROP POLICY IF EXISTS "Public can read media files" ON storage.objects;
CREATE POLICY "Public can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery'
);

-- Erlaube authentifizierten Benutzern das Hochladen von Dateien
DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
CREATE POLICY "Authenticated users can upload media files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube authentifizierten Benutzern das Aktualisieren von Dateien
DROP POLICY IF EXISTS "Authenticated users can update media files" ON storage.objects;
CREATE POLICY "Authenticated users can update media files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube authentifizierten Benutzern das Löschen von Dateien
DROP POLICY IF EXISTS "Authenticated users can delete media files" ON storage.objects;
CREATE POLICY "Authenticated users can delete media files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Bestätigung
SELECT 'media-gallery Bucket Setup abgeschlossen!' as status; 