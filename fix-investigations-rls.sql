-- Fix RLS Policies for Investigations Table
-- Execute this in Supabase SQL Editor

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
WHERE tablename = 'investigations';

-- 6. Test: Try to insert a test investigation
INSERT INTO public.investigations (
  title,
  description,
  status,
  priority,
  category,
  location,
  case_number,
  short_description,
  station,
  features,
  date,
  created_by,
  assigned_to,
  tags,
  metadata,
  created_at,
  updated_at
) VALUES (
  'TEST: RLS Fix Test',
  'This is a test investigation to verify RLS policies work',
  'active',
  'normal',
  'MISSING_PERSON',
  'Berlin',
  'F-TEST-001',
  'Test investigation',
  'Test Station',
  'Test features',
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  ARRAY['test', 'rls'],
  '{}',
  NOW(),
  NOW()
);

-- 7. Verify the test investigation was created
SELECT id, title, status, created_at FROM public.investigations WHERE title LIKE 'TEST: RLS Fix Test%';

-- 8. Clean up test data
DELETE FROM public.investigations WHERE title LIKE 'TEST: RLS Fix Test%'; 