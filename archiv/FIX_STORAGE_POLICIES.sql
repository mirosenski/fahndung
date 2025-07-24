-- 🔧 FIX FÜR STORAGE POLICIES (EXISTING POLICIES HANDLEN)
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- ============================================
-- 1. STORAGE POLICIES FÜR MEDIA-GALLERY FIXEN
-- ============================================

-- Alle alten Storage Policies löschen
DROP POLICY IF EXISTS "Authenticated users can read media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update media files" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete media files" ON storage.objects;

-- Neue Storage Policies erstellen
CREATE POLICY "Authenticated users can read media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload media files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update media files" ON storage.objects
FOR UPDATE USING (bucket_id = 'media-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete media files" ON storage.objects
FOR DELETE USING (bucket_id = 'media-gallery' AND auth.role() = 'authenticated');

-- Öffentlicher Lesezugriff für veröffentlichte Medien
CREATE POLICY "Public can read published media files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'media-gallery' AND
  EXISTS (
    SELECT 1 FROM public.media 
    WHERE file_path = name AND is_public = true
  )
);

-- ============================================
-- 2. MEDIA-GALLERY BUCKET ÜBERPRÜFEN
-- ============================================

-- Prüfe ob media-gallery Bucket existiert
SELECT 
  'media-gallery bucket' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'media-gallery'
  ) THEN '✅ EXISTIERT' ELSE '❌ FEHLT' END as status;

-- Erstelle Bucket falls nicht vorhanden
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

-- ============================================
-- 3. MEDIA TABELLE ÜBERPRÜFEN
-- ============================================

-- Prüfe ob media Tabelle existiert
SELECT 
  'media table' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'media' AND table_schema = 'public'
  ) THEN '✅ EXISTIERT' ELSE '❌ FEHLT' END as status;

-- Erstelle media Tabelle falls nicht vorhanden
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

-- RLS für media Tabelle aktivieren
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Alte media Policies löschen
DROP POLICY IF EXISTS "Users can view public media" ON public.media;
DROP POLICY IF EXISTS "Authenticated users can view all media" ON public.media;
DROP POLICY IF EXISTS "Admins and editors can insert media" ON public.media;
DROP POLICY IF EXISTS "Admins and editors can update media" ON public.media;
DROP POLICY IF EXISTS "Admins and editors can delete media" ON public.media;

-- Neue media Policies erstellen
CREATE POLICY "Users can view public media" ON public.media
FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all media" ON public.media
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and editors can insert media" ON public.media
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'super_admin')
  )
);

CREATE POLICY "Admins and editors can update media" ON public.media
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'super_admin')
  )
);

CREATE POLICY "Admins and editors can delete media" ON public.media
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor', 'super_admin')
  )
);

-- ============================================
-- 4. ÜBERPRÜFUNG DER KONFIGURATION
-- ============================================

SELECT '=== STORAGE KONFIGURATIONS-ÜBERPRÜFUNG ===' as test_section;

-- Prüfe Storage Bucket
SELECT 
  'media-gallery bucket' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'media-gallery'
  ) THEN '✅ EXISTIERT' ELSE '❌ FEHLT' END as status
UNION ALL
SELECT 
  'media table' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'media' AND table_schema = 'public'
  ) THEN '✅ EXISTIERT' ELSE '❌ FEHLT' END as status
UNION ALL
SELECT 
  'media RLS' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'media' AND rowsecurity = true
  ) THEN '✅ AKTIV' ELSE '❌ INAKTIV' END as status;

-- Zeige alle Storage Policies
SELECT 
  'Storage Policies:' as info;
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
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- 5. TEST DER STORAGE FUNKTIONALITÄT
-- ============================================

-- Test: Media Tabelle beschreiben
SELECT '=== TEST: MEDIA TABELLE ===' as test_section;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'media' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- ERFOLGSMELDUNG
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ STORAGE POLICIES FIX ERFOLGREICH!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📁 STORAGE KONFIGURATION:';
  RAISE NOTICE '   • media-gallery Bucket erstellt';
  RAISE NOTICE '   • Storage Policies korrekt gesetzt';
  RAISE NOTICE '   • Media Tabelle mit RLS aktiviert';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 NÄCHSTE SCHRITTE:';
  RAISE NOTICE '   1. Testen Sie Datei-Uploads';
  RAISE NOTICE '   2. Überprüfen Sie die Storage Policies';
  RAISE NOTICE '   3. Testen Sie die Media-Verwaltung';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$; 