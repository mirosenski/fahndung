-- Einfaches Skript zum Erstellen des media-gallery Storage Buckets
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- Erstelle den media-gallery Storage Bucket
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

-- Erstelle einfache RLS Policies für den media-gallery Bucket (nur wenn sie nicht existieren)

-- Erlaube authentifizierten Benutzern das Lesen aller Dateien
CREATE POLICY IF NOT EXISTS "Authenticated users can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube öffentlichen Lesezugriff für alle Dateien im media-gallery Bucket
CREATE POLICY IF NOT EXISTS "Public can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery'
);

-- Erlaube authentifizierten Benutzern das Hochladen von Dateien
CREATE POLICY IF NOT EXISTS "Authenticated users can upload media files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube authentifizierten Benutzern das Aktualisieren von Dateien
CREATE POLICY IF NOT EXISTS "Authenticated users can update media files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube authentifizierten Benutzern das Löschen von Dateien
CREATE POLICY IF NOT EXISTS "Authenticated users can delete media files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Bestätigung
SELECT 'media-gallery Bucket erfolgreich erstellt!' as status;