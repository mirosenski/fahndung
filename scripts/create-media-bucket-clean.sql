-- Sauberes Skript zum Erstellen des media-gallery Storage Buckets
-- Führen Sie dieses Script im Supabase SQL Editor aus
-- Dieses Skript erstellt nur den Bucket, falls er nicht existiert

-- Erstelle den media-gallery Storage Bucket (nur falls er nicht existiert)
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

-- Bestätigung
SELECT 'media-gallery Bucket Setup abgeschlossen!' as status;