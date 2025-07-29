-- Überprüfe und repariere die investigations Tabelle
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
ORDER BY ordinal_position;

-- 2. Überprüfe existierende Constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.investigations'::regclass;

-- 3. Erstelle UNIQUE-Constraint für case_number falls nicht vorhanden
DO $$
BEGIN
  -- Prüfe ob UNIQUE-Constraint für case_number bereits existiert
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.investigations'::regclass 
    AND contype = 'u' 
    AND pg_get_constraintdef(oid) LIKE '%case_number%'
  ) THEN
    -- Erstelle UNIQUE-Constraint
    ALTER TABLE public.investigations 
    ADD CONSTRAINT investigations_case_number_key UNIQUE (case_number);
    
    RAISE NOTICE 'UNIQUE-Constraint für case_number erstellt';
  ELSE
    RAISE NOTICE 'UNIQUE-Constraint für case_number existiert bereits';
  END IF;
END $$;

-- 4. Erstelle Index für case_number falls nicht vorhanden
CREATE INDEX IF NOT EXISTS idx_investigations_case_number 
ON public.investigations(case_number);

-- 5. Überprüfe auf doppelte case_numbers (sollte keine geben)
SELECT 
  case_number,
  COUNT(*) as count
FROM public.investigations 
GROUP BY case_number 
HAVING COUNT(*) > 1;

-- 6. Zeige die letzten 10 Fahndungen mit case_number
SELECT 
  id,
  title,
  case_number,
  created_at
FROM public.investigations 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Erstelle eine Funktion für die nächste Sequenznummer
CREATE OR REPLACE FUNCTION get_next_case_number_sequence(
  p_year INTEGER,
  p_subject TEXT
) RETURNS INTEGER AS $$
DECLARE
  next_sequence INTEGER;
BEGIN
  -- Finde die höchste Sequenznummer für das Jahr und Sachgebiet
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(case_number FROM 12 FOR 6) AS INTEGER)
  ), 0) + 1
  INTO next_sequence
  FROM public.investigations
  WHERE case_number LIKE CONCAT('POL-', p_year, '-', p_subject, '-%');
  
  RETURN next_sequence;
END;
$$ LANGUAGE plpgsql;

-- 8. Kommentar für die Funktion
COMMENT ON FUNCTION get_next_case_number_sequence IS 'Ermittelt die nächste verfügbare Sequenznummer für eine Aktennummer';