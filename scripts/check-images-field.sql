-- Überprüfe und füge das images Feld zur investigations Tabelle hinzu
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Überprüfe die aktuelle Tabellenstruktur
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'investigations' 
AND table_schema = 'public'
AND column_name = 'images'
ORDER BY ordinal_position;

-- 2. Falls das images Feld nicht existiert, füge es hinzu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investigations' 
    AND table_schema = 'public'
    AND column_name = 'images'
  ) THEN
    -- Füge das images Feld hinzu
    ALTER TABLE public.investigations 
    ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    
    RAISE NOTICE 'images Feld zur investigations Tabelle hinzugefügt';
  ELSE
    RAISE NOTICE 'images Feld existiert bereits in der investigations Tabelle';
  END IF;
END $$;

-- 3. Überprüfe die aktuelle Tabellenstruktur erneut
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'investigations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Zeige Beispieldaten für Fahndungen mit Bildern
SELECT 
  id,
  title,
  case_number,
  CASE 
    WHEN images IS NULL THEN 'Keine Bilder'
    WHEN jsonb_array_length(images) = 0 THEN 'Leeres Bilder-Array'
    ELSE 'Hat ' || jsonb_array_length(images) || ' Bild(er)'
  END as bilder_status
FROM public.investigations 
ORDER BY created_at DESC 
LIMIT 10;