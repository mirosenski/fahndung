#!/bin/bash

# Supabase Storage Bucket Setup Script
# Führt das Setup für den media-gallery Storage Bucket aus

set -e

echo "🔧 Supabase Storage Bucket Setup"
echo "=================================="

# Prüfe ob Supabase CLI installiert ist
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI ist nicht installiert"
    echo "Installation: npm install -g supabase"
    exit 1
fi

# Prüfe Environment-Variablen
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Environment-Variablen nicht gesetzt"
    echo "Bitte setzen Sie in .env.local:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your-project-url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    exit 1
fi

echo "✅ Environment-Variablen gefunden"

# SQL Script für Storage Bucket Setup
cat > /tmp/setup-storage-bucket.sql << 'EOF'
-- Supabase Storage Bucket Setup für Media Gallery
-- Führt das Setup für den media-gallery Storage Bucket aus

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
DROP POLICY IF EXISTS "Authenticated users can read media files" ON storage.objects;
CREATE POLICY "Authenticated users can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Erlaube öffentlichen Lesezugriff für veröffentlichte Medien
DROP POLICY IF EXISTS "Public can read published media files" ON storage.objects;
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
DROP POLICY IF EXISTS "Admins and editors can upload media files" ON storage.objects;
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
DROP POLICY IF EXISTS "Admins and editors can update media files" ON storage.objects;
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
DROP POLICY IF EXISTS "Admins and editors can delete media files" ON storage.objects;
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

-- 3. Erstelle media Tabelle falls nicht vorhanden
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  width INTEGER,
  height INTEGER,
  directory TEXT DEFAULT 'allgemein',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Erstelle RLS Policies für media Tabelle
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Erlaube authentifizierten Benutzern das Lesen aller Medien
DROP POLICY IF EXISTS "Authenticated users can view all media" ON public.media;
CREATE POLICY "Authenticated users can view all media" ON public.media
FOR SELECT USING (auth.role() = 'authenticated');

-- Erlaube Admins und Editoren das Einfügen
DROP POLICY IF EXISTS "Admins and editors can insert media" ON public.media;
CREATE POLICY "Admins and editors can insert media" ON public.media
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaube Admins und Editoren das Aktualisieren
DROP POLICY IF EXISTS "Admins and editors can update media" ON public.media;
CREATE POLICY "Admins and editors can update media" ON public.media
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaube Admins und Editoren das Löschen
DROP POLICY IF EXISTS "Admins and editors can delete media" ON public.media;
CREATE POLICY "Admins and editors can delete media" ON public.media
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 5. Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_directory ON public.media(directory);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at);

-- 6. Erstelle Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_media_updated_at ON public.media;
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Bestätigung
SELECT 'Storage Bucket Setup abgeschlossen!' as status;
EOF

echo "📝 SQL Script erstellt"

# Führe SQL Script aus
echo "🚀 Führe Storage Bucket Setup aus..."

# Verwende curl um das SQL Script auszuführen
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -d "{\"query\": \"$(cat /tmp/setup-storage-bucket.sql | tr '\n' ' ' | sed 's/"/\\"/g')\"}" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql"

echo "✅ Storage Bucket Setup abgeschlossen!"

# Cleanup
rm -f /tmp/setup-storage-bucket.sql

echo ""
echo "🎉 Setup erfolgreich abgeschlossen!"
echo ""
echo "Nächste Schritte:"
echo "1. Starten Sie die Anwendung neu: pnpm dev"
echo "2. Melden Sie sich als Admin an"
echo "3. Testen Sie den Media-Upload"
echo ""
echo "Bei Problemen:"
echo "- Prüfen Sie die Browser-Konsole"
echo "- Verwenden Sie die Debug-Komponente"
echo "- Überprüfen Sie die Supabase-Logs" 