-- Migration: Add Media Gallery and Storage Functionality
-- Date: 2025-01-24
-- Purpose: Enable media upload, storage, and gallery functionality

-- 1. Create media table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  media_type VARCHAR(50) NOT NULL DEFAULT 'image', -- 'image', 'document', 'video'
  directory VARCHAR(500) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add is_primary column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media' AND column_name = 'is_primary') THEN
    ALTER TABLE public.media ADD COLUMN is_primary BOOLEAN DEFAULT false;
  END IF;
  
  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media' AND column_name = 'metadata') THEN
    ALTER TABLE public.media ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add tags column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media' AND column_name = 'tags') THEN
    ALTER TABLE public.media ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media' AND column_name = 'description') THEN
    ALTER TABLE public.media ADD COLUMN description TEXT;
  END IF;
  
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media' AND column_name = 'created_at') THEN
    ALTER TABLE public.media ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'media' AND column_name = 'updated_at') THEN
    ALTER TABLE public.media ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_directory ON public.media(directory);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON public.media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON public.media(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON public.media(is_public);

-- 3. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_media_updated_at ON public.media;
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Create function to generate unique file path
CREATE OR REPLACE FUNCTION generate_unique_file_path(
  directory_path TEXT,
  original_filename TEXT,
  file_extension TEXT
)
RETURNS TEXT AS $$
DECLARE
  base_path TEXT;
  counter INTEGER := 0;
  final_path TEXT;
BEGIN
  -- Remove extension from original filename
  base_path := directory_path || '/' || SPLIT_PART(original_filename, '.', 1);
  
  -- Add timestamp to ensure uniqueness
  base_path := base_path || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  final_path := base_path || '.' || file_extension;
  
  -- Check if path exists and add counter if needed
  WHILE EXISTS(SELECT 1 FROM public.media WHERE file_path = final_path) LOOP
    counter := counter + 1;
    final_path := base_path || '_' || counter || '.' || file_extension;
  END LOOP;
  
  RETURN final_path;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to handle media upload
CREATE OR REPLACE FUNCTION handle_media_upload(
  p_file_name TEXT,
  p_original_name TEXT,
  p_file_size BIGINT,
  p_mime_type TEXT,
  p_directory TEXT,
  p_is_primary BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  file_extension TEXT;
  media_id UUID;
BEGIN
  -- Extract file extension
  file_extension := LOWER(SPLIT_PART(p_original_name, '.', -1));
  
  -- Determine media type based on mime type
  DECLARE
    media_type TEXT := 'document';
  BEGIN
    IF p_mime_type LIKE 'image/%' THEN
      media_type := 'image';
    ELSIF p_mime_type LIKE 'video/%' THEN
      media_type := 'video';
    END IF;
  END;
  
  -- Insert media record
  INSERT INTO public.media (
    file_name,
    original_name,
    file_path,
    file_size,
    mime_type,
    media_type,
    directory,
    is_primary,
    metadata
  ) VALUES (
    p_file_name,
    p_original_name,
    generate_unique_file_path(p_directory, p_original_name, file_extension),
    p_file_size,
    p_mime_type,
    media_type,
    p_directory,
    p_is_primary,
    p_metadata
  ) RETURNING id INTO media_id;
  
  RETURN media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create RLS policies for media table
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view public media
CREATE POLICY "Anyone can view public media" ON public.media
  FOR SELECT
  USING (is_public = true);

-- Allow authenticated users to upload media
CREATE POLICY "Authenticated users can upload media" ON public.media
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own media
CREATE POLICY "Users can update their own media" ON public.media
  FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own media" ON public.media
  FOR DELETE
  USING (auth.uid() = uploaded_by);

-- 8. Create view for media gallery
CREATE OR REPLACE VIEW public.media_gallery AS
SELECT 
  m.id,
  m.file_name,
  m.original_name,
  m.file_path,
  m.file_size,
  m.mime_type,
  m.media_type,
  m.directory,
  'media-gallery' as bucket_name,
  m.is_public,
  m.uploaded_by,
  m.uploaded_at,
  m.is_primary,
  m.metadata,
  m.tags,
  m.description,
  m.created_at,
  m.updated_at,
  -- Generate public URL (this will be handled by Supabase Storage)
  'https://media-gallery.supabase.co/storage/v1/object/public/' || m.file_path as public_url,
  -- Format file size
  CASE 
    WHEN m.file_size < 1024 THEN m.file_size::TEXT || ' B'
    WHEN m.file_size < 1024 * 1024 THEN (m.file_size / 1024.0)::TEXT || ' KB'
    ELSE (m.file_size / (1024.0 * 1024.0))::TEXT || ' MB'
  END as formatted_size
FROM public.media m
WHERE m.is_public = true
ORDER BY m.uploaded_at DESC;

-- 9. Grant permissions
GRANT SELECT ON public.media_gallery TO anon, authenticated;
GRANT ALL ON public.media TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Media gallery functionality successfully added!';
END $$; 