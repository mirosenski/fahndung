-- Storage Bucket für Uploads erstellen
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Bucket erstellen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10MB
  ARRAY['image/*', 'video/*', 'application/pdf', 'text/*', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies erstellen
-- Erlaube authentifizierten Benutzern Upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

-- Erlaube öffentlichen Download
CREATE POLICY "Public download" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Erlaube Benutzer das Löschen ihrer eigenen Dateien
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'media');

-- Erlaube Benutzer das Aktualisieren ihrer eigenen Dateien
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'media');

-- 3. Bestätige die Erstellung
SELECT 'Storage Bucket "media" erfolgreich erstellt!' as status; 