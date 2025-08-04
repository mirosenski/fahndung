# Real-time Subscriptions Setup

## Problem

Aktuell gibt es eine Verzögerung von etwa 10 Minuten zwischen dem Speichern von Änderungen in der Detailseite und dem Erscheinen der neuen Daten in den Karten über Supabase.

## Lösung

Aktivierung von Supabase Real-time Subscriptions für sofortige Updates. Wir unterstützen zwei Ansätze:

1. **Postgres Changes** (einfacher, empfohlen für den Start)
2. **Broadcast** (skalierbarer, für größere Anwendungen)

## Schritte zur Aktivierung

### Option 1: Postgres Changes (Einfach)

Führen Sie das Script `scripts/enable-realtime-investigations.sql` im Supabase SQL Editor aus:

```sql
-- Aktivierung von Real-time Subscriptions für die investigations Tabelle
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Überprüfe ob RLS auf der investigations Tabelle aktiviert ist
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'investigations'
AND schemaname = 'public';

-- 2. Aktiviere RLS falls nicht aktiviert
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- 3. Erstelle RLS Policies für die investigations Tabelle
-- (Das vollständige Script ist in scripts/enable-realtime-investigations.sql)
```

### Option 2: Broadcast (Skalierbar)

Führen Sie das Script `scripts/setup-broadcast-realtime.sql` im Supabase SQL Editor aus:

```sql
-- Setup für Broadcast-basierte Real-time Subscriptions
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Erstelle Broadcast Authorization Policy
CREATE POLICY "Authenticated users can receive broadcasts"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (true);

-- 2. Erstelle Trigger-Funktion für investigations Tabelle
-- (Das vollständige Script ist in scripts/setup-broadcast-realtime.sql)
```

### Supabase Dashboard

1. Gehen Sie zu Ihrem Supabase Dashboard
2. Navigieren Sie zu "Database" > "Replication"
3. Stellen Sie sicher, dass "Logical Replication" aktiviert ist
4. Überprüfen Sie, dass die `investigations` Tabelle für Real-time Events konfiguriert ist

### Überprüfung

Führen Sie das Script `scripts/check-realtime-status.sql` aus, um den Status zu überprüfen:

```sql
-- Überprüfung des Real-time Subscription Status
SELECT
  schemaname,
  tablename,
  rowsecurity,
  'Real-time verfügbar' as realtime_status
FROM pg_tables
WHERE tablename = 'investigations'
AND schemaname = 'public';
```

## Implementierte Verbesserungen

### 1. Real-time Sync Hook

- Neuer Hook `useRealtimeSync` für Supabase Real-time Subscriptions
- Automatische Reconnection bei Verbindungsfehlern
- Netzwerk-Status-Überwachung
- Unterstützung für beide Real-time Ansätze (Postgres Changes + Broadcast)

### 2. Reduzierte Polling-Intervalle

- Polling-Intervalle von 2 Sekunden auf 10 Sekunden reduziert
- Real-time Updates sind jetzt primär, Polling ist Fallback

### 3. Verbesserte Supabase-Konfiguration

- Erhöhte `eventsPerSecond` von 10 auf 50
- Häufigere Heartbeats und schnellere Reconnection

### 4. Optimierte Cache-Invalidierung

- Sofortige Cache-Invalidierung bei Real-time Events
- Spezifische Invalidierung für betroffene Investigations

### 5. Status-Anzeige

- Neue `RealtimeStatus` Komponente zeigt den Connection-Status
- Unterscheidung zwischen Postgres Changes und Broadcast
- Visuelle Indikatoren für verschiedene Verbindungszustände

## Erwartete Verbesserungen

Nach der Aktivierung sollten Sie folgende Verbesserungen bemerken:

1. **Sofortige Updates**: Änderungen in der Detailseite sollten sofort in den Karten sichtbar sein
2. **Keine 10-Minuten-Verzögerung**: Real-time Events ersetzen das langsame Polling
3. **Bessere Performance**: Reduzierte Server-Last durch weniger Polling-Requests
4. **Robuste Verbindung**: Automatische Reconnection bei Netzwerkproblemen
5. **Flexibilität**: Unterstützung für verschiedene Real-time Ansätze

## Troubleshooting

### Falls Real-time nicht funktioniert:

1. **Überprüfen Sie die RLS-Policies**:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'investigations';
   ```

2. **Überprüfen Sie die Replication-Konfiguration**:

   ```sql
   SHOW wal_level;
   SHOW max_wal_senders;
   ```

3. **Browser-Konsole prüfen**: Schauen Sie nach Real-time Subscription Logs

4. **Fallback aktiviert**: Polling funktioniert weiterhin als Fallback

5. **Connection-Type prüfen**: Die Status-Komponente zeigt an, welcher Real-time Ansatz verwendet wird

## Technische Details

### Real-time Event Flow:

1. Änderung in der Datenbank → Supabase Real-time Event
2. Event wird an alle verbundenen Clients gesendet
3. `useRealtimeSync` Hook empfängt das Event
4. Sofortige Cache-Invalidierung und Refetch
5. UI wird sofort aktualisiert

### Fallback-Mechanismus:

- Polling alle 10 Sekunden als Backup
- Automatische Reconnection bei Verbindungsfehlern
- Netzwerk-Status-Überwachung

### Unterschiede zwischen den Ansätzen:

**Postgres Changes:**

- Einfacher zu implementieren
- Weniger Setup erforderlich
- Gut für kleinere bis mittlere Anwendungen

**Broadcast:**

- Bessere Skalierbarkeit
- Mehr Kontrolle über Events
- Empfohlen für größere Anwendungen
- Erfordert Trigger-Funktionen in der Datenbank
