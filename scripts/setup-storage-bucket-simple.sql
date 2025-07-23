-- Vereinfachtes Supabase Storage Setup für Media Gallery
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

-- 4. Aktiviere Row Level Security auf der media Tabelle
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 5. Erstelle RLS Policies für die media Tabelle
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

-- 6. Erstelle admin_actions Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- 7. Aktiviere RLS auf admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- 8. Erstelle RLS Policies für admin_actions
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