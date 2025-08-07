-- Performance-Optimierung für Fahndungsverwaltung
-- Führe diese Scripts im Supabase SQL Editor aus

-- 1. Indizes für bessere Query-Performance
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_category ON investigations(category);
CREATE INDEX IF NOT EXISTS idx_investigations_priority ON investigations(priority);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_created_by ON investigations(created_by);
CREATE INDEX IF NOT EXISTS idx_investigations_updated_at ON investigations(updated_at DESC);

-- Composite Indizes für häufige Filterungen
CREATE INDEX IF NOT EXISTS idx_investigations_status_category ON investigations(status, category);
CREATE INDEX IF NOT EXISTS idx_investigations_status_priority ON investigations(status, priority);
CREATE INDEX IF NOT EXISTS idx_investigations_category_priority ON investigations(category, priority);

-- Full-text Search Index für deutsche Suche
CREATE INDEX IF NOT EXISTS idx_investigations_search ON investigations 
USING gin(to_tsvector('german', 
  COALESCE(title, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(case_number, '') || ' ' ||
  COALESCE(location, '') || ' ' ||
  COALESCE(station, '')
));

-- Partial Indizes für aktive Fahndungen
CREATE INDEX IF NOT EXISTS idx_investigations_active ON investigations(created_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_investigations_published ON investigations(created_at DESC) 
WHERE status = 'published';

-- 2. Optimierte Tabellen-Struktur
-- Füge Spalten für bessere Performance hinzu (falls nicht vorhanden)

-- 3. Statistiken aktualisieren
ANALYZE investigations;

-- 4. Performance-Monitoring Views
CREATE OR REPLACE VIEW v_investigation_stats AS
SELECT 
  COUNT(*) as total_investigations,
  COUNT(*) FILTER (WHERE status = 'active') as active_investigations,
  COUNT(*) FILTER (WHERE status = 'published') as published_investigations,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_investigations,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_last_7_days,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '7 days') as updated_last_7_days,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days_to_update
FROM investigations;

-- 5. Query-Performance-View
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%investigations%'
ORDER BY mean_time DESC
LIMIT 10;

-- 6. Index-Nutzung-View
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'investigations'
ORDER BY idx_scan DESC;

-- 7. Real-time Performance-Optimierung
-- Aktiviere Logical Replication für Real-time Events
ALTER TABLE investigations REPLICA IDENTITY FULL;

-- 8. Connection-Pooling-Optimierung
-- Diese Einstellungen werden in der Supabase-Konfiguration gesetzt

-- 9. Cache-Optimierung
-- Erstelle Materialized View für häufig abgerufene Daten
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_recent_investigations AS
SELECT 
  id,
  title,
  case_number,
  status,
  priority,
  category,
  created_at,
  updated_at,
  created_by
FROM investigations 
WHERE status IN ('active', 'published')
ORDER BY created_at DESC
LIMIT 100;

-- Refresh-Funktion für Materialized View
CREATE OR REPLACE FUNCTION refresh_recent_investigations()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_recent_investigations;
END;
$$ LANGUAGE plpgsql;

-- 10. Automatische Cleanup-Funktion
CREATE OR REPLACE FUNCTION cleanup_old_investigations()
RETURNS void AS $$
BEGIN
  -- Lösche geschlossene Fahndungen älter als 2 Jahre
  DELETE FROM investigations 
  WHERE status = 'closed' 
  AND updated_at < NOW() - INTERVAL '2 years';
  
  -- Aktualisiere Materialized View
  PERFORM refresh_recent_investigations();
END;
$$ LANGUAGE plpgsql;

-- 11. Performance-Monitoring-Funktion
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_investigations', (SELECT COUNT(*) FROM investigations),
    'active_investigations', (SELECT COUNT(*) FROM investigations WHERE status = 'active'),
    'published_investigations', (SELECT COUNT(*) FROM investigations WHERE status = 'published'),
    'avg_query_time', (
      SELECT AVG(mean_time) 
      FROM pg_stat_statements 
      WHERE query LIKE '%investigations%'
    ),
    'index_usage', (
      SELECT jsonb_agg(jsonb_build_object(
        'index_name', indexname,
        'scans', idx_scan,
        'tuples_read', idx_tup_read
      ))
      FROM pg_stat_user_indexes 
      WHERE tablename = 'investigations'
    ),
    'slow_queries', (
      SELECT jsonb_agg(jsonb_build_object(
        'query', query,
        'mean_time', mean_time,
        'calls', calls
      ))
      FROM pg_stat_statements 
      WHERE query LIKE '%investigations%' 
      AND mean_time > 100
      ORDER BY mean_time DESC
      LIMIT 5
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 12. Kommentare für Dokumentation
COMMENT ON INDEX idx_investigations_status IS 'Index für Status-Filterung';
COMMENT ON INDEX idx_investigations_category IS 'Index für Kategorie-Filterung';
COMMENT ON INDEX idx_investigations_priority IS 'Index für Prioritäts-Filterung';
COMMENT ON INDEX idx_investigations_search IS 'Full-text Search Index für deutsche Suche';
COMMENT ON MATERIALIZED VIEW mv_recent_investigations IS 'Materialized View für häufig abgerufene aktive Fahndungen';

-- 13. Überprüfung der Indizes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'investigations'
ORDER BY indexname;

-- 14. Performance-Report
SELECT 
  'Performance-Optimierung abgeschlossen' as status,
  (SELECT COUNT(*) FROM investigations) as total_investigations,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'investigations') as total_indexes,
  (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE tablename = 'investigations') as active_indexes;
