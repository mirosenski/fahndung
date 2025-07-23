-- Umfassende Storage-Schema-Korrektur
-- Diese Migration stellt sicher, dass alle Storage-Komponenten korrekt eingerichtet sind

-- 1. Erstelle Storage-Schema falls es nicht existiert
CREATE SCHEMA IF NOT EXISTS storage;

-- 2. Erstelle Storage-Buckets für das Projekt (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'local-media',
        'local-media',
        true,
        52428800, -- 50MB
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
    ),
    (
        'investigation-images',
        'investigation-images',
        true,
        52428800, -- 50MB
        ARRAY[
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ]
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Erstelle RLS-Policies für Storage Objects

-- Lösche bestehende Policies falls sie existieren
DROP POLICY IF EXISTS "Authenticated users can read local media files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read published local media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload local media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update local media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete local media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read investigation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload investigation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update investigation images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete investigation images" ON storage.objects;

-- Aktiviere RLS auf storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies für local-media Bucket
CREATE POLICY "Authenticated users can read local media files" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'local-media' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Public can read published local media files" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'local-media' AND
    EXISTS (
        SELECT 1 FROM public.media 
        WHERE file_path = name AND is_public = true
    )
);

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

-- Policies für investigation-images Bucket
CREATE POLICY "Authenticated users can read investigation images" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'investigation-images' AND
    auth.role() = 'authenticated'
);

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

-- 4. Erstelle Views für bessere Übersicht

-- View für alle Storage-Policies
CREATE OR REPLACE VIEW storage.policies AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- View für Bucket-Übersicht
CREATE OR REPLACE VIEW storage.bucket_overview AS
SELECT 
    b.id,
    b.name,
    b.public,
    b.file_size_limit,
    b.allowed_mime_types,
    COUNT(o.id) as object_count,
    b.created_at,
    b.updated_at
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
GROUP BY b.id, b.name, b.public, b.file_size_limit, b.allowed_mime_types, b.created_at, b.updated_at;

-- 5. Bestätigung
SELECT 
    'Storage Schema erfolgreich eingerichtet' as status,
    COUNT(*) as total_buckets,
    (SELECT COUNT(*) FROM storage.objects) as total_objects,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage') as total_policies
FROM storage.buckets;
