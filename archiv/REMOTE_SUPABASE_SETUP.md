# Remote Supabase Setup für Media-Upload

## Übersicht

Diese Anleitung ist speziell für Remote Supabase konfiguriert und optimiert für die Media-Upload-Funktionalität.

## Voraussetzungen

- Remote Supabase Projekt
- Korrekte Environment-Variablen
- Admin-Account

## Environment-Variablen

Stellen Sie sicher, dass in `.env.local` folgende Variablen gesetzt sind:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here
```

## Automatisches Setup

### 1. Storage Bucket Setup

```bash
# Im Projektverzeichnis
chmod +x scripts/setup-storage.sh
./scripts/setup-storage.sh
```

### 2. Manuelles Setup (falls automatisches fehlschlägt)

1. Gehen Sie zu Ihrem Supabase Dashboard
2. Klicken Sie auf "SQL Editor"
3. Kopieren Sie den Inhalt von `scripts/setup-storage-bucket.sql`
4. Führen Sie das Script aus

## Admin-Account erstellen

### 1. Benutzer registrieren

```sql
-- Im Supabase SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'admin@example.com',
  crypt('your-password', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

### 2. Profil erstellen

```sql
-- Im Supabase SQL Editor
INSERT INTO public.user_profiles (
  user_id,
  name,
  role,
  department,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'Administrator',
  'admin',
  'IT',
  now(),
  now()
);
```

## RLS-Policies überprüfen

Stellen Sie sicher, dass folgende Policies existieren:

### Storage Policies

```sql
-- Erlaube Admins und Editoren das Hochladen
CREATE POLICY "Admins and editors can upload media files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaube authentifizierten Benutzern das Lesen
CREATE POLICY "Authenticated users can read media files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'media-gallery' AND
  auth.role() = 'authenticated'
);
```

### Media Table Policies

```sql
-- Erlaube Admins und Editoren das Einfügen
CREATE POLICY "Admins and editors can insert media" ON public.media
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Erlaube authentifizierten Benutzern das Lesen
CREATE POLICY "Authenticated users can view all media" ON public.media
FOR SELECT USING (auth.role() = 'authenticated');
```

## Test-Prozedur

### 1. Anmeldung testen

```javascript
// In der Browser-Konsole
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session);
```

### 2. Admin-Rechte testen

```javascript
// In der Browser-Konsole
const result = await fetch("/api/trpc/auth.getSession", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
console.log("tRPC Session:", await result.json());
```

### 3. Media-Upload testen

1. Als Admin anmelden
2. Zur Medien-Galerie navigieren
3. Datei hochladen
4. Browser-Konsole für Fehler prüfen

## Debug-Tools

### SessionDebug-Komponente

Fügen Sie temporär in Ihre Anwendung ein:

```tsx
import SessionDebug from "~/components/debug/SessionDebug";

// In Ihrer Komponente
{
  process.env.NODE_ENV === "development" && <SessionDebug />;
}
```

### Browser-Konsole Befehle

```javascript
// Session-Status prüfen
console.log("Session:", await supabase.auth.getSession());

// LocalStorage prüfen
const supabaseKeys = Object.keys(localStorage).filter((key) =>
  key.includes("supabase"),
);
console.log("Supabase Keys:", supabaseKeys);

// tRPC Auth testen
const result = await fetch("/api/trpc/auth.getSession", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
console.log("tRPC Auth:", await result.json());
```

## Häufige Probleme

### Problem: "UNAUTHORIZED"

**Lösung:**

1. Session bereinigen: `await supabase.auth.signOut()`
2. Browser-Cache leeren
3. Neu anmelden

### Problem: "FORBIDDEN"

**Lösung:**

1. Admin-Rolle setzen:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'ihre-email@example.com'
);
```

### Problem: "illegal path"

**Lösung:**

1. Storage Bucket Setup ausführen
2. RLS-Policies überprüfen

## Performance-Optimierungen

### 1. Connection Pooling

Die Konfiguration verwendet bereits optimiertes Connection Pooling.

### 2. Token-Caching

Tokens werden automatisch zwischengespeichert und erneuert.

### 3. Error-Handling

MessagePort-Fehler werden automatisch behandelt.

## Monitoring

### Browser-Konsole

Überprüfen Sie regelmäßig:

- Session-Status
- Token-Gültigkeit
- Upload-Fehler

### Supabase Dashboard

Überwachen Sie:

- Storage-Bucket-Nutzung
- Auth-Logs
- RLS-Policy-Violations

## Sicherheit

### 1. RLS-Policies

Alle Tabellen haben Row Level Security aktiviert.

### 2. Token-Validierung

Tokens werden bei jedem Request validiert.

### 3. Admin-Access

Nur Admins und Editoren können Dateien hochladen.

## Support

Bei Problemen:

1. Überprüfen Sie die Browser-Konsole
2. Verwenden Sie die Debug-Komponente
3. Prüfen Sie die Supabase-Logs
4. Stellen Sie sicher, dass alle Environment-Variablen korrekt sind

## Nächste Schritte

Nach erfolgreicher Implementierung:

1. Entfernen Sie Debug-Komponenten aus der Produktion
2. Implementieren Sie automatische Token-Erneuerung
3. Fügen Sie Error-Tracking hinzu
4. Überwachen Sie die Performance
