-- Fix für die media Tabelle - Füge fehlende Spalten hinzu
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Füge created_at Spalte hinzu falls sie nicht existiert
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.media ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Füge updated_at Spalte hinzu falls sie nicht existiert
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.media ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Aktualisiere bestehende Einträge mit created_at und updated_at falls sie NULL sind
UPDATE public.media 
SET 
    created_at = COALESCE(created_at, uploaded_at),
    updated_at = COALESCE(updated_at, uploaded_at)
WHERE created_at IS NULL OR updated_at IS NULL;

-- 4. Erstelle Indexe falls sie nicht existieren
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_updated_at ON public.media(updated_at DESC);

-- 5. Bestätigung
SELECT 'Media Tabelle erfolgreich repariert!' as status; 