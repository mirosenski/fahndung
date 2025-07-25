-- Migration: Link Media Tables to Investigations
-- Date: 2025-01-24
-- Purpose: Add foreign key constraints to link media tables to investigations table

-- This migration should be run AFTER the investigations table is created

-- 1. Add foreign key constraint to media table
DO $$
BEGIN
  -- Check if investigations table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investigations' AND table_schema = 'public') THEN
    -- Add foreign key constraint to media table
    ALTER TABLE public.media 
    ADD CONSTRAINT fk_media_investigation_id 
    FOREIGN KEY (investigation_id) REFERENCES public.investigations(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint to media table';
  ELSE
    RAISE NOTICE 'Investigations table does not exist yet. Run this migration after creating the investigations table.';
  END IF;
END $$;

-- 2. Add foreign key constraint to investigation_images table
DO $$
BEGIN
  -- Check if investigations table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investigations' AND table_schema = 'public') THEN
    -- Add foreign key constraint to investigation_images table
    ALTER TABLE public.investigation_images 
    ADD CONSTRAINT fk_investigation_images_investigation_id 
    FOREIGN KEY (investigation_id) REFERENCES public.investigations(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint to investigation_images table';
  ELSE
    RAISE NOTICE 'Investigations table does not exist yet. Run this migration after creating the investigations table.';
  END IF;
END $$;

-- 3. Add foreign key constraint to investigation_documents table
DO $$
BEGIN
  -- Check if investigations table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investigations' AND table_schema = 'public') THEN
    -- Add foreign key constraint to investigation_documents table
    ALTER TABLE public.investigation_documents 
    ADD CONSTRAINT fk_investigation_documents_investigation_id 
    FOREIGN KEY (investigation_id) REFERENCES public.investigations(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint to investigation_documents table';
  ELSE
    RAISE NOTICE 'Investigations table does not exist yet. Run this migration after creating the investigations table.';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Media tables linked to investigations successfully!';
END $$; 