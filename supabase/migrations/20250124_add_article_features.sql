-- Migration: Add Article Publishing Features to Investigations Table
-- Date: 2025-01-24
-- Purpose: Enable investigations to be published as blog articles

-- 1. Add article-related columns to investigations table
ALTER TABLE public.investigations 
ADD COLUMN IF NOT EXISTS published_as_article BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS article_slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS article_content JSONB,
ADD COLUMN IF NOT EXISTS article_meta JSONB DEFAULT '{
  "seo_title": null,
  "seo_description": null,
  "og_image": null,
  "keywords": [],
  "author": null,
  "reading_time": null
}'::jsonb,
ADD COLUMN IF NOT EXISTS article_published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS article_views INTEGER DEFAULT 0;

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_slug ON public.investigations(article_slug) WHERE article_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_published_articles ON public.investigations(published_as_article, status) WHERE published_as_article = true;
CREATE INDEX IF NOT EXISTS idx_article_published_at ON public.investigations(article_published_at DESC) WHERE published_as_article = true;

-- 3. Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_article_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  temp_slug TEXT;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9äöüÄÖÜß]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);
  
  -- Check if slug exists and add counter if needed
  temp_slug := slug;
  WHILE EXISTS(SELECT 1 FROM public.investigations WHERE article_slug = temp_slug) LOOP
    counter := counter + 1;
    temp_slug := slug || '-' || counter;
  END LOOP;
  
  RETURN temp_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-generate slug when publishing as article
CREATE OR REPLACE FUNCTION auto_generate_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if publishing as article and slug is empty
  IF NEW.published_as_article = true AND NEW.article_slug IS NULL THEN
    NEW.article_slug := generate_article_slug(NEW.title);
    NEW.article_published_at := COALESCE(NEW.article_published_at, NOW());
  END IF;
  
  -- Clear article fields if unpublishing
  IF NEW.published_as_article = false THEN
    NEW.article_slug := NULL;
    NEW.article_published_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS auto_generate_article_slug_trigger ON public.investigations;
CREATE TRIGGER auto_generate_article_slug_trigger
BEFORE INSERT OR UPDATE ON public.investigations
FOR EACH ROW
EXECUTE FUNCTION auto_generate_article_slug();

-- 6. Create view for published articles (convenience)
CREATE OR REPLACE VIEW public.published_articles AS
SELECT 
  id,
  title,
  article_slug,
  short_description,
  description,
  article_content,
  article_meta,
  article_published_at,
  article_views,
  category,
  tags,
  priority,
  created_at,
  updated_at,
  created_by,
  -- Calculate reading time (words per minute: 200)
  CEIL(LENGTH(COALESCE(description, '') || COALESCE(article_content::text, '')) / 1000.0) as estimated_reading_time
FROM public.investigations
WHERE published_as_article = true 
  AND status = 'published'
  AND article_slug IS NOT NULL;

-- 7. Grant permissions
GRANT SELECT ON public.published_articles TO anon, authenticated;

-- 8. Create RLS policies for article features
CREATE POLICY "Anyone can view published articles" ON public.investigations
  FOR SELECT
  USING (published_as_article = true AND status = 'published');

-- 9. Create function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.investigations 
  SET article_views = COALESCE(article_views, 0) + 1
  WHERE id = article_id AND published_as_article = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create sample article content structure (for reference)
COMMENT ON COLUMN public.investigations.article_content IS 'JSON structure for rich content:
{
  "blocks": [
    {
      "type": "paragraph",
      "content": "Text content..."
    },
    {
      "type": "heading",
      "level": 2,
      "content": "Section Title"
    },
    {
      "type": "image",
      "src": "/path/to/image.jpg",
      "alt": "Description",
      "caption": "Image caption"
    },
    {
      "type": "quote",
      "content": "Quote text",
      "author": "Author name"
    },
    {
      "type": "list",
      "ordered": false,
      "items": ["Item 1", "Item 2"]
    }
  ]
}';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Article features successfully added to investigations table!';
END $$; 