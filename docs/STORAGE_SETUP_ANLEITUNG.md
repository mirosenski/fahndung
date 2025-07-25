# 🔧 Storage Bucket Setup - Manuelle Anleitung

## Problem

Der Fehler "Unable to add filesystem: <illegal path>" tritt auf, weil der Supabase Storage Bucket `media-gallery` nicht konfiguriert ist.

## ✅ Lösung: Manuelles Setup über Supabase Dashboard

### Schritt 1: Supabase Dashboard öffnen

1. Gehen Sie zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy
2. Klicken Sie auf "SQL Editor" in der linken Seitenleiste

### Schritt 2: SQL Script ausführen

1. Klicken Sie auf "New Query"
2. Kopieren Sie den gesamten Inhalt von `scripts/setup-storage-simple.sql`
3. Fügen Sie ihn in den SQL Editor ein
4. Klicken Sie auf "Run" (▶️)

### Schritt 3: Überprüfung

Nach dem Ausführen sollten Sie folgende Meldung sehen:

```
Storage Bucket Setup erfolgreich abgeschlossen!
```

### Schritt 4: Storage Bucket überprüfen

1. Gehen Sie zu "Storage" in der linken Seitenleiste
2. Sie sollten den Bucket `media-gallery` sehen
3. Klicken Sie darauf und prüfen Sie die Einstellungen:
   - **Public**: ✅ Aktiviert
   - **File size limit**: 50MB
   - **Allowed MIME types**: Alle Bild-, Video- und Dokument-Typen

## 🧪 Test nach dem Setup

### 1. Anwendung neu starten

```bash
# Stoppen Sie den Server (Ctrl+C)
# Dann neu starten:
pnpm dev
```

### 2. Test-Upload durchführen

1. Gehen Sie zu `http://localhost:3000/dashboard`
2. Melden Sie sich als Admin an
3. Gehen Sie zum "Media" Tab
4. Versuchen Sie ein Bild hochzuladen

### 3. Browser-Konsole prüfen

Öffnen Sie die Browser-Konsole und prüfen Sie:

- ✅ Keine "illegal path" Fehler
- ✅ Upload funktioniert
- ✅ Dateien werden im Storage angezeigt

## 🔍 Debug-Schritte

### Falls der Upload immer noch fehlschlägt:

#### 1. Session-Status prüfen

```javascript
// In der Browser-Konsole
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session);
```

#### 2. Storage Bucket prüfen

```javascript
// In der Browser-Konsole
const { data: buckets } = await supabase.storage.listBuckets();
console.log("Storage Buckets:", buckets);
```

#### 3. RLS Policies prüfen

```javascript
// In der Browser-Konsole
const { data, error } = await supabase.storage
  .from("media-gallery")
  .list("", { limit: 1 });
console.log("Storage Test:", { data, error });
```

## 🚨 Häufige Probleme

### Problem 1: "Bucket not found"

**Lösung**: SQL Script erneut ausführen

### Problem 2: "Permission denied"

**Lösung**:

1. Prüfen Sie ob Sie als Admin angemeldet sind
2. Prüfen Sie die RLS Policies im SQL Script

### Problem 3: "File too large"

**Lösung**:

1. Reduzieren Sie die Dateigröße (max 8MB)
2. Oder erhöhen Sie das Limit im SQL Script

## 📞 Support

Falls das Problem weiterhin besteht:

1. **Screenshots machen** von:
   - Supabase Dashboard Storage Tab
   - Browser-Konsole Fehler
   - SQL Editor Ausgabe

2. **Logs sammeln**:
   - Browser-Konsole
   - Terminal-Ausgabe
   - Network Tab in DevTools

3. **Environment-Variablen prüfen**:
   ```bash
   cat .env.local
   ```

## ✅ Erfolgs-Kriterien

Nach dem Setup sollten Sie sehen:

- ✅ **Keine "illegal path" Fehler**
- ✅ **Upload funktioniert in Step 3**
- ✅ **Dateien werden im Storage angezeigt**
- ✅ **Bilder werden in der Vorschau angezeigt**
- ✅ **Weiterleitung zu Step 4 funktioniert**
