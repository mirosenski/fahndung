# Authentifizierungsproblem beim Media-Upload - Diagnose & Lösung

## Problem-Beschreibung

Die tRPC-Mutation `media.uploadMedia` schlägt mit einem Authentifizierungsfehler fehl, obwohl der Benutzer angemeldet ist.

## Versionen

- **Next.js:** 15.2.3
- **Supabase JS Client:** 2.52.0
- **tRPC:** 11.0.0

## Diagnose-Schritte

### 1. Session-Status überprüfen

Öffnen Sie die Browser-Konsole und führen Sie folgende Befehle aus:

```javascript
// Prüfe Supabase Session
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Supabase Session:", session);

// Prüfe localStorage
const supabaseKeys = Object.keys(localStorage).filter((key) =>
  key.includes("supabase"),
);
console.log("Supabase Keys:", supabaseKeys);

// Prüfe tRPC Auth
const result = await fetch("/api/trpc/auth.getSession", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
console.log("tRPC Auth Result:", await result.json());
```

### 2. Token-Übertragung testen

Die verbesserte tRPC-Konfiguration sollte jetzt automatisch den Auth-Token übertragen. Überprüfen Sie in der Browser-Konsole:

```javascript
// Prüfe ob Token in tRPC-Requests übertragen wird
console.log("🔍 tRPC: Token-Übertragung wird getestet...");
```

### 3. Admin-Rechte überprüfen

Stellen Sie sicher, dass Ihr Benutzer die Admin-Rolle hat:

```sql
-- Im Supabase SQL Editor ausführen
SELECT
  u.email,
  up.role,
  up.name
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'ihre-email@example.com';
```

## Lösungs-Schritte

### Schritt 1: Storage Bucket Setup

Führen Sie das automatische Setup aus:

```bash
# Im Projektverzeichnis
chmod +x scripts/setup-storage.sh
./scripts/setup-storage.sh
```

Oder manuell im Supabase Dashboard:

1. Gehen Sie zu Ihrem Supabase Dashboard
2. Klicken Sie auf "SQL Editor"
3. Kopieren Sie den Inhalt von `scripts/setup-storage-bucket.sql`
4. Führen Sie das Script aus

### Schritt 2: Session bereinigen

Falls die Session beschädigt ist:

```javascript
// In der Browser-Konsole
await supabase.auth.signOut();
window.location.reload();
```

### Schritt 3: Admin-Rolle setzen

```sql
-- Im Supabase SQL Editor
UPDATE public.user_profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'ihre-email@example.com'
);
```

### Schritt 4: Environment-Variablen prüfen

Stellen Sie sicher, dass in `.env.local` gesetzt sind:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here
```

## Debug-Komponente verwenden

Fügen Sie die Debug-Komponente temporär in Ihre Anwendung ein:

```tsx
import SessionDebug from "~/components/debug/SessionDebug";

// In Ihrer Komponente
{
  process.env.NODE_ENV === "development" && <SessionDebug />;
}
```

## Häufige Fehler und Lösungen

### Fehler: "UNAUTHORIZED"

**Ursache:** Token wird nicht korrekt übertragen oder ist abgelaufen.

**Lösung:**

1. Session bereinigen und neu anmelden
2. Browser-Cache leeren
3. Überprüfen Sie die tRPC-Token-Übertragung

### Fehler: "FORBIDDEN"

**Ursache:** Benutzer hat keine Admin-Rechte.

**Lösung:**

1. Admin-Rolle in der Datenbank setzen
2. Als Admin anmelden

### Fehler: "illegal path"

**Ursache:** Storage Bucket nicht konfiguriert.

**Lösung:**

1. Storage Bucket Setup ausführen
2. RLS-Policies überprüfen

## Verbesserungen in der aktuellen Version

### 1. Verbesserte Token-Übertragung

Die tRPC-Konfiguration wurde verbessert:

- Direkte Supabase Client-Integration
- Fallback auf localStorage
- Bessere Fehlerbehandlung

### 2. Erweiterte Debug-Informationen

- Detaillierte Logging in der Browser-Konsole
- Session-Status-Anzeige
- Token-Validierung

### 3. Automatisches Setup

- Script für Storage Bucket Setup
- SQL-Scripts für RLS-Policies
- Automatische Konfiguration

## Test-Prozedur

1. **Session-Status prüfen:**

   ```javascript
   console.log("Session:", await supabase.auth.getSession());
   ```

2. **tRPC Auth testen:**

   ```javascript
   // In der Anwendung
   const result = await api.auth.getSession.query();
   console.log("tRPC Session:", result);
   ```

3. **Media-Upload testen:**
   - Als Admin anmelden
   - Datei hochladen
   - Browser-Konsole für Fehler prüfen

## Support

Falls das Problem weiterhin besteht:

1. Überprüfen Sie die Browser-Konsole für detaillierte Fehlermeldungen
2. Verwenden Sie die Debug-Komponente
3. Prüfen Sie die Supabase-Logs im Dashboard
4. Stellen Sie sicher, dass alle Environment-Variablen korrekt gesetzt sind

## Nächste Schritte

Nach erfolgreicher Implementierung:

1. Entfernen Sie die Debug-Komponente aus der Produktion
2. Überprüfen Sie die RLS-Policies regelmäßig
3. Implementieren Sie automatische Token-Erneuerung
4. Fügen Sie Error-Tracking hinzu
