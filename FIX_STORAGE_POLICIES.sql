-- Storage Policies für den 'media' Bucket korrigieren
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Alle bestehenden Policies für den 'media' Bucket löschen
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public download" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;

-- 2. Neue, korrekte Policies erstellen

-- Policy für Upload (INSERT)
CREATE POLICY "Enable insert for authenticated users only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Policy für Download (SELECT) - öffentlich
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Policy für Update (UPDATE)
CREATE POLICY "Enable update for authenticated users only" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Policy für Delete (DELETE)
CREATE POLICY "Enable delete for authenticated users only" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- 3. Bucket-Einstellungen überprüfen
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'media';

-- 4. Bestätige die Korrektur
SELECT 'Storage Policies erfolgreich korrigiert!' as status; 