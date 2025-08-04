-- Überprüfung des Real-time Subscription Status
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Überprüfe ob Real-time für die investigations Tabelle aktiviert ist
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  'Real-time verfügbar' as realtime_status
FROM pg_tables 
WHERE tablename = 'investigations' 
AND schemaname = 'public';

-- 2. Überprüfe die Replication Logs (für Real-time Events)
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'investigations' 
AND schemaname = 'public';

-- 3. Überprüfe ob die Tabelle für Replication konfiguriert ist
SELECT 
  c.relname as table_name,
  c.relreplident as replication_identity,
  'Replication konfiguriert' as status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'investigations' 
AND n.nspname = 'public';

-- 4. Zeige die aktuellen Replication Slots (falls vorhanden)
SELECT 
  slot_name,
  plugin,
  slot_type,
  active,
  restart_lsn,
  confirmed_flush_lsn
FROM pg_replication_slots
WHERE slot_name LIKE '%investigations%' OR slot_name LIKE '%realtime%';

-- 5. Überprüfe die WAL (Write-Ahead Log) Konfiguration
SHOW wal_level;
SHOW max_wal_senders;
SHOW max_replication_slots;

-- 6. Kommentar
COMMENT ON TABLE public.investigations IS 'Real-time Subscriptions Status überprüft'; 