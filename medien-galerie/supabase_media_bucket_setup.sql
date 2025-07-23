-- Supabase Storage Setup for Media Gallery
-- Run these commands in your Supabase SQL Editor

-- 1. Create the media-gallery storage bucket
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
);

-- 2. Create RLS policies for the media-gallery bucket

-- Allow authenticated users to read all files
CREATE POLICY "Authenticated users can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);

-- Allow public read access for published media
CREATE POLICY "Public can read published media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  EXISTS (
    SELECT 1 FROM public.media 
    WHERE file_path = name AND is_public = true
  )
);

-- Allow editors and admins to upload files
CREATE POLICY "Editors can upload media files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Allow editors and admins to update files
CREATE POLICY "Editors can update media files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Allow editors and admins to delete files
CREATE POLICY "Editors can delete media files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- 3. Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_uploaded_at ON public.media(uploaded_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_media_type ON public.media(media_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_directory ON public.media(directory);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_is_public ON public.media(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_file_size ON public.media(file_size);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_tags_gin ON public.media USING GIN(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_full_text ON public.media USING GIN((
  setweight(to_tsvector('german', COALESCE(original_name, '')), 'A') ||
  setweight(to_tsvector('german', COALESCE(description, '')), 'B')
));

-- 4. Create a function to automatically generate thumbnails (placeholder)
CREATE OR REPLACE FUNCTION generate_media_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for thumbnail generation
  -- In a real implementation, you would trigger an edge function
  -- or background job to generate thumbnails
  
  IF NEW.media_type = 'image' THEN
    -- Log that thumbnail generation should happen
    INSERT INTO public.admin_actions (
      admin_id, 
      action_type, 
      details
    ) VALUES (
      NEW.uploaded_by,
      'thumbnail_generation_queued',
      jsonb_build_object(
        'media_id', NEW.id,
        'file_path', NEW.file_path
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for thumbnail generation
CREATE TRIGGER trigger_generate_thumbnail
  AFTER INSERT ON public.media
  FOR EACH ROW
  WHEN (NEW.media_type = 'image')
  EXECUTE FUNCTION generate_media_thumbnail();

-- 6. Create a function for full-text search
CREATE OR REPLACE FUNCTION search_media(
  search_query text,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  original_name varchar,
  description text,
  media_type varchar,
  directory varchar,
  file_size integer,
  uploaded_at timestamptz,
  tags text[],
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.original_name,
    m.description,
    m.media_type,
    m.directory,
    m.file_size,
    m.uploaded_at,
    m.tags,
    ts_rank(
      setweight(to_tsvector('german', COALESCE(m.original_name, '')), 'A') ||
      setweight(to_tsvector('german', COALESCE(m.description, '')), 'B'),
      plainto_tsquery('german', search_query)
    ) as rank
  FROM public.media m
  WHERE 
    (
      setweight(to_tsvector('german', COALESCE(m.original_name, '')), 'A') ||
      setweight(to_tsvector('german', COALESCE(m.description, '')), 'B')
    ) @@ plainto_tsquery('german', search_query)
    OR m.tags && string_to_array(search_query, ' ')
  ORDER BY rank DESC, m.uploaded_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Create a function to get media statistics
CREATE OR REPLACE FUNCTION get_media_statistics()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_items', COUNT(*),
    'total_size', COALESCE(SUM(file_size), 0),
    'by_type', jsonb_object_agg(media_type, type_count),
    'by_directory', jsonb_object_agg(directory, dir_count),
    'recent_uploads', (
      SELECT COUNT(*) 
      FROM public.media 
      WHERE uploaded_at > NOW() - INTERVAL '7 days'
    )
  ) INTO stats
  FROM (
    SELECT 
      media_type,
      directory,
      file_size,
      COUNT(*) OVER (PARTITION BY media_type) as type_count,
      COUNT(*) OVER (PARTITION BY directory) as dir_count
    FROM public.media
  ) grouped;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media_files()
RETURNS integer AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Delete media records where the file no longer exists in storage
  -- This would need to be implemented with storage verification
  
  -- For now, just delete records older than 1 year that are marked as deleted
  DELETE FROM public.media 
  WHERE uploaded_at < NOW() - INTERVAL '1 year'
    AND metadata->>'deleted' = 'true';
    
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Sample data for testing (optional)
INSERT INTO public.media (
  original_name,
  file_name,
  file_path,
  file_size,
  mime_type,
  width,
  height,
  media_type,
  directory,
  uploaded_by,
  tags,
  description,
  is_public,
  metadata
) VALUES
(
  'sample-image-1.jpg',
  'allgemein/sample-image-1.jpg',
  'allgemein/sample-image-1.jpg',
  1024000,
  'image/jpeg',
  1920,
  1080,
  'image',
  'allgemein',
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['sample', 'test', 'image'],
  'Ein Beispielbild für die Medien-Galerie',
  true,
  '{"aspectRatio": 1.777, "quality": "high"}'::jsonb
),
(
  'sample-document.pdf',
  'dokumente/sample-document.pdf',
  'dokumente/sample-document.pdf',
  2048000,
  'application/pdf',
  null,
  null,
  'document',
  'dokumente',
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['sample', 'document', 'pdf'],
  'Ein Beispieldokument für die Medien-Galerie',
  true,
  '{"pages": 5}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 10. Enable Row Level Security on the media table (if not already enabled)
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;