-- Migration: Fix RLS Policies for Investigations Table
-- Date: 2025-01-25
-- Purpose: Allow anonymous users to create and view investigations

-- 1. Enable RLS on investigations table (if not already enabled)
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can create investigations" ON public.investigations;
DROP POLICY IF EXISTS "Anyone can view investigations" ON public.investigations;
DROP POLICY IF EXISTS "Anyone can create investigations" ON public.investigations;
DROP POLICY IF EXISTS "Anyone can update investigations" ON public.investigations;
DROP POLICY IF EXISTS "Anyone can delete investigations" ON public.investigations;

-- 3. Create new RLS policies for investigations table

-- Policy: Anyone can view investigations (public read access)
CREATE POLICY "Anyone can view investigations" ON public.investigations
FOR SELECT
USING (true);

-- Policy: Anyone can create investigations (public write access for now)
CREATE POLICY "Anyone can create investigations" ON public.investigations
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can update investigations (public update access for now)
CREATE POLICY "Anyone can update investigations" ON public.investigations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Anyone can delete investigations (public delete access for now)
CREATE POLICY "Anyone can delete investigations" ON public.investigations
FOR DELETE
USING (true);

-- 4. Create indexes for better performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_category ON public.investigations(category);
CREATE INDEX IF NOT EXISTS idx_investigations_priority ON public.investigations(priority);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at DESC);

-- 5. Verify the policies are created
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies for investigations table:';
  RAISE NOTICE '- Anyone can view investigations';
  RAISE NOTICE '- Anyone can create investigations';
  RAISE NOTICE '- Anyone can update investigations';
  RAISE NOTICE '- Anyone can delete investigations';
END $$; 