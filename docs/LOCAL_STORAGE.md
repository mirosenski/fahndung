# Lokale Bildverwaltung

Diese Funktionalität ermöglicht es, Bilder sowohl in Supabase als auch lokal im `/public/images/` Ordner zu speichern und zu verwalten.

## Übersicht

Die Dual-Storage-Funktionalität bietet folgende Vorteile:

- **Flexibilität**: Wahl zwischen Cloud- und lokaler Speicherung
- **Performance**: Lokale Bilder sind schneller verfügbar
- **Offline-Funktionalität**: Lokale Bilder funktionieren ohne Internetverbindung
- **Kostenkontrolle**: Lokale Speicherung ohne Cloud-Kosten

## Komponenten

### 1. LocalStorageService (`src/lib/services/local-storage.service.ts`)

Verwaltet die lokale Bildspeicherung im `/public/images/` Ordner.

**Hauptfunktionen:**

- `uploadImage()`: Lädt Bilder lokal hoch
- `getAllImages()`: Holt alle lokalen Bilder
- `deleteImage()`: Löscht lokale Bilder
- `searchImages()`: Sucht in lokalen Bildern
- `getStats()`: Statistiken über lokale Bilder

### 2. LocalMediaRouter (`src/server/api/routers/local-media.ts`)

tRPC Router für die lokale Bildverwaltung.

**Endpoints:**

- `uploadLocalImage`: Upload zu lokalem Storage
- `getAllLocalImages`: Alle lokalen Bilder abrufen
- `getLocalImage`: Spezifisches Bild abrufen
- `deleteLocalImage`: Lokales Bild löschen
- `updateLocalImageMetadata`: Metadaten aktualisieren
- `searchLocalImages`: Bilder durchsuchen
- `getLocalImageStats`: Statistiken abrufen

### 3. DualStorageUpload (`src/components/media/DualStorageUpload.tsx`)

Upload-Komponente mit Auswahl zwischen lokaler und Supabase-Speicherung.

**Features:**

- Toggle zwischen lokaler und Supabase-Speicherung
- Drag & Drop Support
- Progress-Anzeige
- Fehlerbehandlung

### 4. LocalImageGallery (`src/components/media/LocalImageGallery.tsx`)

Galerie-Komponente für die Anzeige lokaler Bilder.

**Features:**

- Grid-Layout für Bilder
- Suchfunktion
- Statistiken
- Detail-Ansicht
- Download-Funktion
- Lösch-Funktion

## Verwendung

### 1. Upload zu lokalem Storage

```tsx
import DualStorageUpload from "~/components/media/DualStorageUpload";

<DualStorageUpload
  onUploadComplete={(result) => {
    console.log("Upload erfolgreich:", result);
  }}
/>;
```

### 2. Lokale Bilder anzeigen

```tsx
import LocalImageGallery from "~/components/media/LocalImageGallery";

<LocalImageGallery />;
```

### 3. API-Verwendung

```tsx
import { api } from "~/utils/api";

// Alle lokalen Bilder abrufen
const { data: images } = api.localMedia.getAllLocalImages.useQuery({
  limit: 50,
  offset: 0,
  search: "test",
});

// Lokales Bild hochladen
const uploadMutation = api.localMedia.uploadLocalImage.useMutation();
await uploadMutation.mutateAsync({
  file: base64Data,
  filename: "test.jpg",
  contentType: "image/jpeg",
  directory: "uploads",
  tags: ["test"],
  is_public: true,
});
```

## Dateistruktur

```
public/
  images/
    uploads/          # Hochgeladene Bilder
    thumbnails/       # Thumbnails (optional)
    .metadata.json    # Metadaten der Bilder
```

## Metadaten-Format

```json
{
  "id": "uuid",
  "originalName": "original-filename.jpg",
  "fileName": "timestamp_random.jpg",
  "filePath": "uploads/timestamp_random.jpg",
  "fileSize": 1024000,
  "mimeType": "image/jpeg",
  "uploadedAt": "2024-01-01T12:00:00Z",
  "tags": ["tag1", "tag2"],
  "description": "Optional description",
  "isPublic": true
}
```

## Demo-Seite

Besuchen Sie `/demo/local-storage` um die Funktionalität zu testen.

## Konfiguration

### Umgebungsvariablen

Keine zusätzlichen Umgebungsvariablen erforderlich für lokale Speicherung.

### Berechtigungen

Lokale Speicherung erfordert Schreibrechte im `/public/images/` Ordner.

## Sicherheit

- Dateigrößen-Limit: 8MB
- Unterstützte Formate: JPG, PNG, GIF, WebP
- Validierung der Dateitypen
- Sichere Dateinamen-Generierung

## Performance

- Lokale Bilder sind sofort verfügbar
- Keine Netzwerk-Latenz
- Optimierte Thumbnail-Generierung (optional)

## Backup

Lokale Bilder sollten regelmäßig gesichert werden:

```bash
# Backup des images Ordners
tar -czf images-backup-$(date +%Y%m%d).tar.gz public/images/
```

## Migration

Um Bilder von Supabase zu lokal zu migrieren:

1. Bilder aus Supabase herunterladen
2. Mit `LocalStorageService.uploadImage()` lokal hochladen
3. Metadaten entsprechend anpassen

## Troubleshooting

### Häufige Probleme

1. **Berechtigungsfehler**: Prüfen Sie Schreibrechte im `/public/images/` Ordner
2. **Datei nicht gefunden**: Prüfen Sie, ob die Datei im richtigen Verzeichnis liegt
3. **Metadaten-Fehler**: Prüfen Sie die `.metadata.json` Datei auf Korrektheit

### Debugging

```bash
# Prüfen Sie die Logs
tail -f logs/app.log

# Prüfen Sie die Metadaten
cat public/images/.metadata.json
```

## Erweiterungen

Mögliche Erweiterungen:

- Thumbnail-Generierung
- Bildkompression
- Wasserzeichen
- EXIF-Daten-Extraktion
- Automatische Kategorisierung
- Backup-Integration
