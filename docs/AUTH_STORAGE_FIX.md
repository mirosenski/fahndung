# 🔧 Auth & Storage Probleme - Sofortige Lösung

## Identifizierte Probleme

1. **AuthApiError: Invalid Refresh Token** - Supabase Auth Session ist ungültig
2. **Unable to add filesystem: <illegal path>** - Storage Bucket ist nicht konfiguriert
3. **400 Status** - Server-Fehler beim Erstellen der Fahndung

## ✅ Sofortige Lösung (5 Minuten)

### Schritt 1: Supabase Dashboard öffnen

1. Gehen Sie zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy
2. Klicken Sie auf "SQL Editor" in der linken Seitenleiste

### Schritt 2: Storage Bucket Setup

1. Klicken Sie auf "New Query"
2. Kopieren Sie den gesamten Inhalt von `scripts/setup-storage-simple.sql`
3. Fügen Sie ihn in den SQL Editor ein
4. Klicken Sie auf "Run" (▶️)

### Schritt 3: Auth Session bereinigen

1. Öffnen Sie die Browser-Konsole (F12)
2. Führen Sie folgende Befehle aus:

```javascript
// Session bereinigen
await supabase.auth.signOut();

// Zur Login-Seite weiterleiten
window.location.href = "/login";
```

### Schritt 4: Server neu starten

```bash
# Stoppen Sie den Server (Ctrl+C)
# Dann neu starten:
pnpm dev
```

### Schritt 5: Testen

1. Gehen Sie zu `http://localhost:3000/login`
2. Melden Sie sich als Admin an:
   - **E-Mail**: admin@fahndung.local
   - **Passwort**: admin123
3. Versuchen Sie eine neue Fahndung zu erstellen

## 🎯 Erwartetes Ergebnis

Nach dem Fix sollten Sie sehen:

- ✅ **Keine AuthApiError mehr**
- ✅ **Keine "illegal path" Fehler**
- ✅ **Fahndungen werden korrekt erstellt**
- ✅ **Media-Upload funktioniert**

## 🔧 Falls Probleme weiterhin bestehen

### 1. Browser-Cache leeren

```javascript
// In der Browser-Konsole
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### 2. Supabase Auth Status prüfen

```javascript
// In der Browser-Konsole
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session);
```

### 3. Storage Bucket Status prüfen

```javascript
// In der Browser-Konsole
const { data: buckets } = await supabase.storage.listBuckets();
console.log("Buckets:", buckets);
```

## 🚨 Wichtige Hinweise

- **Storage Bucket**: Der `media-gallery` Bucket muss in Supabase konfiguriert sein
- **Auth Session**: Bei Auth-Fehlern wird die Session automatisch bereinigt
- **Admin-Rechte**: Für Media-Uploads sind Admin- oder Editor-Rechte erforderlich

## 📞 Support

Falls die Probleme weiterhin bestehen:

1. Überprüfen Sie die Browser-Konsole auf Fehler
2. Prüfen Sie die Server-Logs im Terminal
3. Stellen Sie sicher, dass alle Environment-Variablen korrekt gesetzt sind
