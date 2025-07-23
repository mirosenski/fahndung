# 🔧 SOFORTIGE LÖSUNG: tRPC createCallerFactory Problem

## Problem identifiziert!

Der Fehler lag **NICHT** bei der Authentifizierung, sondern bei einem fehlenden Export in der tRPC-Konfiguration:

- `createCallerFactory` wurde in `root.ts` importiert
- Aber nicht in `trpc.ts` exportiert
- Das verursachte einen **500 Internal Server Error**
- Die gesamte tRPC-API war lahmgelegt

## ✅ Behoben!

Der fehlende Export wurde hinzugefügt:

```typescript
// In src/server/api/trpc.ts hinzugefügt:
export const createCallerFactory = t.createCallerFactory;
```

## 🧪 Test-Prozedur

### 1. Dev-Server neu starten

```bash
# Stoppen Sie den aktuellen Server (Ctrl+C)
# Dann neu starten:
pnpm dev
```

### 2. Test-Komponente verwenden

Fügen Sie temporär die Test-Komponente in Ihre Anwendung ein:

```tsx
import TRPCTest from "~/components/debug/TRPCTest";

// In Ihrer Komponente (z.B. Dashboard)
{
  process.env.NODE_ENV === "development" && <TRPCTest />;
}
```

### 3. Browser-Konsole prüfen

Öffnen Sie die Browser-Konsole und prüfen Sie:

```javascript
// Test 1: tRPC Hook
const result = await api.auth.getSession.query();
console.log("tRPC Hook Test:", result);

// Test 2: Direkter API-Call
const response = await fetch("/api/trpc/auth.getSession", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
console.log("Direkter API-Call:", await response.json());
```

## 🎯 Erwartetes Verhalten

Nach der Behebung sollten Sie sehen:

- ✅ **Keine 500 Internal Server Errors mehr**
- ✅ **tRPC Hooks funktionieren**
- ✅ **Direkte API-Calls funktionieren**
- ✅ **Media-Upload sollte jetzt möglich sein**

## 🔍 Debug-Schritte

### 1. Server-Logs prüfen

```bash
# Im Terminal, wo pnpm dev läuft
# Suchen Sie nach:
# ✅ "tRPC: Session erstellt"
# ✅ "Auth middleware: Session gefunden"
# ❌ KEINE "500 Internal Server Error"
```

### 2. Browser-Network-Tab

1. Öffnen Sie DevTools → Network
2. Führen Sie einen Media-Upload aus
3. Prüfen Sie, ob `/api/trpc/media.uploadMedia` erfolgreich ist

### 3. tRPC-Status prüfen

```javascript
// In der Browser-Konsole
console.log("🔍 Prüfe tRPC-Status...");

// Test 1: Auth
try {
  const authResult = await api.auth.getSession.query();
  console.log("✅ Auth tRPC funktioniert:", authResult);
} catch (error) {
  console.error("❌ Auth tRPC Fehler:", error);
}

// Test 2: Media
try {
  const mediaResult = await api.media.getDirectories.query();
  console.log("✅ Media tRPC funktioniert:", mediaResult);
} catch (error) {
  console.error("❌ Media tRPC Fehler:", error);
}
```

## 🚀 Nächste Schritte

Nach erfolgreicher Behebung:

1. **Media-Upload testen:**
   - Als Admin anmelden
   - Datei hochladen
   - Prüfen Sie die Browser-Konsole

2. **Debug-Komponenten entfernen:**

   ```tsx
   // Entfernen Sie diese Zeilen aus der Produktion:
   {
     process.env.NODE_ENV === "development" && <TRPCTest />;
   }
   {
     process.env.NODE_ENV === "development" && <SessionDebug />;
   }
   ```

3. **Storage Bucket Setup:**
   ```bash
   chmod +x scripts/setup-storage.sh
   ./scripts/setup-storage.sh
   ```

## 🎉 Erfolg!

Wenn Sie diese Schritte befolgt haben, sollte:

- ✅ Die tRPC-API wieder funktionieren
- ✅ Der Media-Upload funktionieren
- ✅ Keine 500 Internal Server Errors mehr auftreten

Das ursprüngliche Authentifizierungsproblem war in Wirklichkeit ein tRPC-Konfigurationsproblem, das jetzt behoben ist!
