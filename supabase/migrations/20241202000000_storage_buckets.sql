-- Storage Buckets Setup für lokale Supabase-Entwicklung
-- Diese Migration erstellt die notwendigen Storage-Buckets für Media-Upload

-- 1. Erstelle den media-gallery Bucket für lokale Entwicklung
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'local-media',
  'local-media',
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

-- 2. Erstelle den investigation-images Bucket für Fahndungs-Bilder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'investigation-images',
  'investigation-images',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 3. RLS-Policies für local-media Bucket

-- Erlaubt authentifizierten Benutzern das Lesen aller Dateien
CREATE POLICY "Authenticated users can read local media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'local-media' AND
  auth.role() = 'authenticated'
);

-- Erlaubt öffentlichen Zugriff auf veröffentlichte Medien
CREATE POLICY "Public can read published local media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'local-media' AND
  EXISTS (
    SELECT 1 FROM public.media 
    WHERE file_path = name AND is_public = true
  )
);

-- Erlaubt Admins und Editoren das Hochladen von Dateien
CREATE POLICY "Admins and editors can upload local media files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'local-media' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaubt Admins und Editoren das Aktualisieren von Dateien
CREATE POLICY "Admins and editors can update local media files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'local-media' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaubt Admins und Editoren das Löschen von Dateien
CREATE POLICY "Admins and editors can delete local media files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'local-media' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 4. RLS-Policies für investigation-images Bucket

-- Erlaubt authentifizierten Benutzern das Lesen von Fahndungs-Bildern
CREATE POLICY "Authenticated users can read investigation images" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'investigation-images' AND
  auth.role() = 'authenticated'
);

-- Erlaubt Admins und Editoren das Hochladen von Fahndungs-Bildern
CREATE POLICY "Admins and editors can upload investigation images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'investigation-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaubt Admins und Editoren das Aktualisieren von Fahndungs-Bildern
CREATE POLICY "Admins and editors can update investigation images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'investigation-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaubt Admins und Editoren das Löschen von Fahndungs-Bildern
CREATE POLICY "Admins and editors can delete investigation images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'investigation-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 5. Bestätigung
SELECT 
  'Storage Buckets erfolgreich erstellt' as status,
  COUNT(*) as total_buckets
FROM storage.buckets 
WHERE id IN ('local-media', 'investigation-images'); 