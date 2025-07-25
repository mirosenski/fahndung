# Integration Guide: Step3 mit Media-Galerie

## 🎯 Übersicht

Die neue Step3-Komponente erweitert den Fahndungs-Wizard um die Möglichkeit, Bilder aus der bestehenden Media-Galerie auszuwählen. Dies spart Zeit und vermeidet doppelte Uploads.

## 🚀 Features

1. **Drag & Drop Upload** - Wie bisher
2. **"Aus Galerie wählen" Button** - NEU!
3. **Media-Galerie Modal** mit:
   - Suchfunktion
   - Ordner-Filter
   - Mehrfachauswahl
   - Vorschau
4. **Automatische Konvertierung** von Galerie-Bildern zu File-Objekten

## 📦 Installation

### 1. Komponente erstellen

Erstellen Sie die Datei: `src/components/fahndungs-wizard/Step3-MediaGallery.tsx`

```typescript
// Kopieren Sie den Code aus dem Step3MediaGallery Artifact
```

### 2. Wizard anpassen

In `src/app/fahndungen/neu/step3/page.tsx`:

```typescript
import Step3MediaGallery from "~/components/fahndungs-wizard/Step3-MediaGallery";

// In der Page-Komponente:
<Step3MediaGallery
  mainImage={formData.mainImage}
  additionalImages={formData.additionalImages}
  documents={formData.documents}
  onUpdate={(data) => {
    setFormData({ ...formData, ...data });
  }}
  errors={errors}
/>
```

### 3. Types anpassen

In `src/types/fahndung-wizard.ts`:

```typescript
export interface Step3Data {
  mainImage: File | null;
  additionalImages: File[];
  documents: File[];
  // Optional: Referenzen zu Media-IDs
  mediaReferences?: string[];
}
```

## 🔧 Konfiguration

### Media Service erweitern

In `src/lib/services/media.service.ts`:

```typescript
// Methode zum Abrufen von Bildern für die Galerie
async getImagesForGallery(directory?: string): Promise<Media[]> {
  let query = this.supabase
    .from("media")
    .select("*")
    .eq("media_type", "image")
    .order("uploaded_at", { ascending: false });

  if (directory && directory !== "all") {
    query = query.eq("directory", directory);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Add public URLs
  return (data || []).map(item => ({
    ...item,
    url: this.getPublicUrl(item.file_path)
  }));
}

// Methode zum Konvertieren von Media zu File
async mediaToFile(mediaItem: Media): Promise<File> {
  const response = await fetch(mediaItem.url!);
  const blob = await response.blob();
  return new File([blob], mediaItem.original_name, {
    type: mediaItem.mime_type
  });
}
```

## 🎨 UI/UX Verbesserungen

### 1. Galerie-Modal Features

- **Responsive Grid**: 2-5 Spalten je nach Bildschirmgröße
- **Hover-Effekte**: Zeigt Dateinamen bei Hover
- **Auswahl-Indikator**: Blaues Häkchen für ausgewählte Bilder
- **Zähler**: Zeigt Anzahl ausgewählter Bilder

### 2. Hauptbild-Logik

- Erstes ausgewähltes Bild wird automatisch Hauptbild (wenn keins vorhanden)
- "Als Hauptbild setzen" Button bei weiteren Bildern
- Drag & Drop behält bisherige Funktionalität

### 3. Performance

- Lazy Loading für große Galerien
- Thumbnail-URLs statt volle Auflösung
- Pagination bei > 50 Bildern

## 📝 Verwendung

### Benutzer-Workflow

1. **Option 1: Neue Bilder hochladen**
   - Drag & Drop oder "Dateien auswählen"
   - Wie bisher

2. **Option 2: Aus Galerie wählen** (NEU!)
   - Klick auf "Aus Galerie wählen"
   - Modal öffnet sich
   - Suche/Filter nutzen
   - Bilder auswählen (Mehrfachauswahl)
   - "Auswahl übernehmen" klicken

3. **Kombination möglich**
   - Erst aus Galerie wählen
   - Dann weitere Bilder hochladen
   - Oder umgekehrt

## 🐛 Fehlerbehandlung

### Häufige Probleme

1. **"Unable to fetch media"**

   ```typescript
   // Prüfen Sie die RLS Policies:
   CREATE POLICY "Public can read media" ON media
   FOR SELECT USING (is_public = true);
   ```

2. **CORS-Fehler beim Fetch**

   ```typescript
   // Storage Bucket muss public sein:
   UPDATE storage.buckets
   SET public = true
   WHERE id = 'media-gallery';
   ```

3. **Große Dateien**
   ```typescript
   // Timeout erhöhen:
   const response = await fetch(url, {
     signal: AbortSignal.timeout(30000), // 30 Sekunden
   });
   ```

## 🔒 Sicherheit

### Berechtigungen prüfen

```typescript
// In der Komponente:
const {
  data: { user },
} = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from("user_profiles")
  .select("role")
  .eq("user_id", user.id)
  .single();

// Nur Editoren und Admins können Galerie nutzen
if (!["editor", "admin"].includes(profile.role)) {
  setShowGalleryButton(false);
}
```

## 📊 Datenbank-Schema

Falls noch nicht vorhanden:

```sql
-- Media-Tabelle mit allen notwendigen Feldern
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  media_type VARCHAR(20) NOT NULL,
  directory VARCHAR(100) DEFAULT 'allgemein',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- Index für schnelle Suche
CREATE INDEX idx_media_directory ON media(directory);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_uploaded ON media(uploaded_at DESC);
```

## ✅ Testing

### Test-Szenarios

1. **Leere Galerie**
   - Zeigt "Keine Bilder gefunden"
   - Upload funktioniert weiterhin

2. **Große Galerie (100+ Bilder)**
   - Performance bleibt gut
   - Suche/Filter funktionieren

3. **Gemischte Auswahl**
   - 2 aus Galerie + 3 neue Uploads
   - Reihenfolge bleibt erhalten

4. **Fehlerhafte Bilder**
   - Broken URLs werden übersprungen
   - Fehlermeldung wird angezeigt
   - Andere Bilder funktionieren weiter

### Unit Tests

```typescript
// src/components/fahndungs-wizard/__tests__/Step3-MediaGallery.test.tsx

describe('Step3MediaGallery', () => {
  it('should open gallery modal on button click', async () => {
    render(<Step3MediaGallery {...props} />);
    fireEvent.click(screen.getByText('Aus Galerie wählen'));
    expect(screen.getByText('Medien aus Galerie wählen')).toBeInTheDocument();
  });

  it('should allow multiple image selection', async () => {
    render(<Step3MediaGallery {...props} />);
    // Test implementation
  });

  it('should convert gallery items to File objects', async () => {
    // Test implementation
  });
});
```

## 🚀 Deployment

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_STORAGE_BUCKET=media-gallery
```

### Build-Optimierungen

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ["your-supabase-url.supabase.co"],
    formats: ["image/avif", "image/webp"],
  },
};
```

## 📱 Mobile Optimierungen

### Touch-Gesten

```typescript
// Swipe zum Schließen der Galerie
const [touchStart, setTouchStart] = useState(0);

const handleTouchStart = (e: TouchEvent) => {
  setTouchStart(e.touches[0].clientY);
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchEnd = e.changedTouches[0].clientY;
  if (touchStart - touchEnd > 150) {
    setShowGallery(false);
  }
};
```

### Responsive Breakpoints

```css
/* Mobile: 2 Spalten */
@media (max-width: 640px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet: 3 Spalten */
@media (min-width: 641px) and (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop: 4-5 Spalten */
@media (min-width: 769px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
```

## 🎯 Best Practices

### 1. Performance

- **Virtualisierung** bei > 100 Bildern
- **Lazy Loading** für Bilder außerhalb des Viewports
- **Debounced Search** (300ms Verzögerung)

### 2. UX

- **Loading States** während API-Calls
- **Error Boundaries** für robuste Fehlerbehandlung
- **Keyboard Navigation** (Tab, Enter, Escape)

### 3. Accessibility

```typescript
// ARIA Labels
<button
  aria-label="Bild aus Galerie auswählen"
  aria-expanded={showGallery}
  aria-controls="media-gallery-modal"
>
  Aus Galerie wählen
</button>

// Keyboard Navigation
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showGallery) {
      setShowGallery(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showGallery]);
```

## 🔄 Migration von bestehenden Daten

### SQL Migration Script

```sql
-- Migration: Füge media_references zu investigations hinzu
ALTER TABLE investigations
ADD COLUMN media_references TEXT[] DEFAULT '{}';

-- Verknüpfe bestehende Bilder
UPDATE investigations i
SET media_references = ARRAY(
  SELECT m.id
  FROM media m
  WHERE m.file_path LIKE '%' || i.case_number || '%'
);
```

## 📈 Analytics & Monitoring

### Track Usage

```typescript
// Analytics Events
const trackGalleryUsage = (action: string, details?: any) => {
  // Plausible, Mixpanel, etc.
  analytics.track("MediaGallery", {
    action,
    ...details,
  });
};

// Verwendung
trackGalleryUsage("opened");
trackGalleryUsage("selected", { count: selectedItems.length });
trackGalleryUsage("applied", {
  fromGallery: selectedItems.length,
  newUploads: additionalImages.length,
});
```

## 🎉 Zusammenfassung

Die neue Media-Galerie-Integration bietet:

✅ **Zeitersparnis** - Keine doppelten Uploads
✅ **Bessere UX** - Intuitive Bildauswahl
✅ **Performance** - Optimiert für große Galerien
✅ **Flexibilität** - Kombination von Upload & Galerie
✅ **Zukunftssicher** - Erweiterbar für Videos/Dokumente

## 🆘 Support & Hilfe

Bei Problemen:

1. **Console Logs prüfen**

   ```typescript
   console.log("Gallery Items:", galleryItems);
   console.log("Selected:", selectedGalleryItems);
   ```

2. **Network Tab checken**
   - Supabase API Calls
   - Storage URLs
   - CORS Headers

3. **Browser Kompatibilität**
   - Chrome/Edge: ✅ Voll unterstützt
   - Firefox: ✅ Voll unterstützt
   - Safari: ⚠️ Fetch API Limits beachten

4. **Fallback Optionen**
   ```typescript
   // Falls Galerie nicht lädt
   if (galleryError) {
     return <UploadOnly />;
   }
   ```

## 🔧 Integration in bestehende Step3-Komponente

### Schritt 1: Step3-Komponente erweitern

```typescript
// src/app/components/fahndungs-wizard/Step3-ImagesDocuments.tsx

import Step3MediaGallery from "~/components/fahndungs-wizard/Step3MediaGallery";

// In der Komponente:
const [useEnhancedGallery, setUseEnhancedGallery] = useState(true);

// Render-Logik:
{useEnhancedGallery ? (
  <Step3MediaGallery
    mainImage={data.mainImage}
    additionalImages={data.additionalImages}
    documents={data.documents}
    onUpdate={onUpdate}
    errors={errors}
  />
) : (
  // Bestehende Upload-Logik
  <div>Klassischer Upload...</div>
)}
```

### Schritt 2: Toggle zwischen Modi

```typescript
// Toggle-Button hinzufügen
<div className="mb-4 flex items-center justify-between">
  <h2 className="text-2xl font-bold">Bilder & Dokumente</h2>
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={useEnhancedGallery}
      onChange={(e) => setUseEnhancedGallery(e.target.checked)}
      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    <span className="text-sm font-medium">Erweiterte Galerie verwenden</span>
  </label>
</div>
```

### Schritt 3: Error Handling

```typescript
// Fallback bei Galerie-Fehlern
const [galleryError, setGalleryError] = useState(false);

useEffect(() => {
  if (galleryError) {
    setUseEnhancedGallery(false);
    console.warn("Galerie nicht verfügbar, verwende klassischen Upload");
  }
}, [galleryError]);
```

## 🎯 Nächste Schritte

1. **Storage Bucket Setup ausführen** (siehe `STORAGE_SETUP_ANLEITUNG.md`)
2. **Step3-Komponente testen** mit der neuen Galerie
3. **Performance optimieren** bei großen Galerien
4. **Mobile Testing** durchführen
5. **Analytics einrichten** für Usage-Tracking

## 📞 Support

Bei Fragen oder Problemen:

1. **Console-Logs prüfen** für detaillierte Fehlermeldungen
2. **Network Tab** für API-Call-Probleme
3. **Storage Debug-Komponente** verwenden
4. **Fallback auf klassischen Upload** bei Problemen

---

**Hinweis**: Diese Integration ist vollständig rückwärtskompatibel. Bestehende Upload-Funktionalität bleibt erhalten, während die neue Galerie-Funktion optional hinzugefügt wird.
