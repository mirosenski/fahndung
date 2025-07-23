# Troubleshooting: Media Upload Probleme

## Problem 1: "Unable to add filesystem: <illegal path>"

**Ursache:** Der `media-gallery` Storage Bucket ist nicht in Ihrem Supabase-Projekt konfiguriert.

**Lösung:**

### Option A: Automatisches Setup (empfohlen)

```bash
# Führen Sie das Setup-Script aus
./scripts/setup-storage.sh
```

### Option B: Manuelles Setup

1. Gehen Sie zu Ihrem Supabase Dashboard
2. Klicken Sie auf "SQL Editor"
3. Kopieren Sie den Inhalt von `scripts/setup-storage-bucket.sql`
4. Führen Sie das Script aus

### Option C: Über das Supabase Dashboard

1. Gehen Sie zu "Storage" in Ihrem Supabase Dashboard
2. Klicken Sie auf "New Bucket"
3. Erstellen Sie einen Bucket mit:
   - **Name:** `media-gallery`
   - **Public:** ✅ Aktiviert
   - **File size limit:** 50MB
   - **Allowed MIME types:** Alle Bild-, Video- und Dokument-Typen

## Problem 2: "Nicht authentifiziert - Bitte melden Sie sich an"

**Ursache:** Die Authentifizierung funktioniert nicht korrekt.

**Lösung:**

### 1. Überprüfen Sie die Session

```bash
# Prüfen Sie die Browser-Konsole für Session-Fehler
# Oder verwenden Sie das Debug-Script
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.auth.getSession().then(console.log);
"
```

### 2. Überprüfen Sie die Environment-Variablen

Stellen Sie sicher, dass in `.env.local` gesetzt sind:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here
```

### 3. Testen Sie die Authentifizierung

```bash
# Starten Sie die Anwendung neu
pnpm dev

# Gehen Sie zu http://localhost:3000/login
# Melden Sie sich als Admin an
```

## Problem 3: "Admin-Rechte erforderlich"

**Ursache:** Der angemeldete Benutzer hat keine Admin- oder Editor-Rolle.

**Lösung:**

### 1. Überprüfen Sie die Benutzer-Rolle

```sql
-- Im Supabase SQL Editor
SELECT
  u.email,
  up.role,
  up.name
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'ihre-email@example.com';
```

### 2. Setzen Sie die Admin-Rolle

```sql
-- Im Supabase SQL Editor
UPDATE public.user_profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'ihre-email@example.com'
);
```

## Problem 4: "Upload fehlgeschlagen"

**Ursache:** Allgemeiner Upload-Fehler.

**Lösung:**

### 1. Überprüfen Sie die Dateigröße

- Maximale Dateigröße: 50MB
- Unterstützte Formate: Bilder, Videos, PDF, DOC, DOCX

### 2. Überprüfen Sie die Netzwerk-Verbindung

```bash
# Testen Sie die Supabase-Verbindung
curl -I $NEXT_PUBLIC_SUPABASE_URL
```

### 3. Überprüfen Sie die Browser-Konsole

Suchen Sie nach spezifischen Fehlermeldungen in der Browser-Konsole.

## Debugging-Schritte

### 1. Überprüfen Sie die tRPC-Verbindung

```javascript
// In der Browser-Konsole
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Session:", await supabase.auth.getSession());
```

### 2. Testen Sie die Media-API

```javascript
// In der Browser-Konsole
const result = await fetch("/api/trpc/media.getMediaList", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
});
console.log("API Response:", await result.json());
```

### 3. Überprüfen Sie die Storage-Bucket-Konfiguration

```sql
-- Im Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'media-gallery';
SELECT * FROM storage.objects WHERE bucket_id = 'media-gallery' LIMIT 5;
```

## Häufige Fehler und Lösungen

### Fehler: "Invalid file type"

**Lösung:** Überprüfen Sie die erlaubten MIME-Typen im Storage Bucket.

### Fehler: "File too large"

**Lösung:** Erhöhen Sie das `file_size_limit` im Storage Bucket.

### Fehler: "Permission denied"

**Lösung:** Überprüfen Sie die RLS Policies für den Storage Bucket.

### Fehler: "Bucket not found"

**Lösung:** Erstellen Sie den `media-gallery` Bucket manuell im Supabase Dashboard.

## Nützliche Befehle

```bash
# Setup ausführen
./scripts/setup-storage.sh

# Anwendung neu starten
pnpm dev

# Environment-Variablen prüfen
cat .env.local | grep SUPABASE

# Logs anzeigen
tail -f .next/server.log
```

## Support

Bei weiteren Problemen:

1. Überprüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen
2. Prüfen Sie die Network-Tab für fehlgeschlagene Requests
3. Stellen Sie sicher, dass alle Environment-Variablen korrekt gesetzt sind
4. Testen Sie die Verbindung mit dem Supabase Dashboard
