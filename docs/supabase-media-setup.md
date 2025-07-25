# Supabase Media Gallery Setup

## 🚀 Einrichtung der Medien-Funktionalität

### 1. Supabase Storage Bucket erstellen

1. **Gehen Sie zu Ihrem Supabase Dashboard**
   - Öffnen Sie https://supabase.com/dashboard
   - Wählen Sie Ihr Projekt aus

2. **Storage Bucket erstellen**
   - Navigieren Sie zu "Storage" → "Buckets"
   - Klicken Sie auf "New Bucket"
   - Name: `media-gallery`
   - Public bucket: ✅ Aktiviert
   - File size limit: 50MB (oder nach Bedarf)
   - Allowed MIME types: `image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **RLS Policies für Storage**

   ```sql
   -- Erlaube öffentlichen Zugriff auf Medien
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'media-gallery');

   -- Erlaube authentifizierten Benutzern das Hochladen
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'media-gallery' AND auth.role() = 'authenticated');

   -- Erlaube Benutzern das Löschen ihrer eigenen Dateien
   CREATE POLICY "Users can delete own files" ON storage.objects
   FOR DELETE USING (bucket_id = 'media-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 2. Datenbank-Migration ausführen

1. **Migration ausführen**

   ```bash
   # Im Projektverzeichnis
   npx supabase db push
   ```

2. **Oder manuell über SQL Editor**
   - Gehen Sie zu "SQL Editor" in Ihrem Supabase Dashboard
   - Führen Sie die Migration `20250124_add_media_gallery.sql` aus

3. **⚠️ Wichtig**: Falls Sie den Fehler "column investigation_id does not exist" erhalten:
   - Das ist normal, da die `investigations` Tabelle noch nicht existiert
   - Die Media-Galerie funktioniert trotzdem ohne Verknüpfung zu Investigations
   - Später können Sie die Verknüpfung mit `20250124_link_media_to_investigations.sql` herstellen

### 3. Environment Variables prüfen

Stellen Sie sicher, dass diese Variablen in Ihrer `.env.local` gesetzt sind:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Storage Bucket Permissions

1. **Gehen Sie zu Storage → Policies**
2. **Fügen Sie diese Policies hinzu:**

```sql
-- Öffentlicher Zugriff auf Medien
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media-gallery');

-- Authentifizierte Benutzer können hochladen
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media-gallery'
  AND auth.role() = 'authenticated'
  AND (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']))
);

-- Benutzer können ihre eigenen Dateien löschen
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media-gallery'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. Testen der Funktionalität

1. **Starten Sie die Entwicklungsumgebung**

   ```bash
   npm run dev
   ```

2. **Testen Sie die Media-Galerie**
   - Gehen Sie zu `/dashboard`
   - Navigieren Sie zum Media-Tab
   - Testen Sie das Hochladen von Bildern
   - Testen Sie die Galerie-Funktionalität

### 6. Troubleshooting

#### Problem: "Upload failed"

- **Lösung**: Prüfen Sie die Storage Bucket Policies
- **Lösung**: Stellen Sie sicher, dass der Bucket `media-gallery` existiert

#### Problem: "Database insert failed"

- **Lösung**: Führen Sie die Migration erneut aus
- **Lösung**: Prüfen Sie die RLS Policies für die `media` Tabelle

#### Problem: "Gallery items not loading"

- **Lösung**: Prüfen Sie die `media_gallery` View
- **Lösung**: Stellen Sie sicher, dass Medien in der Datenbank vorhanden sind

#### Problem: "column investigation_id does not exist"

- **Lösung**: Das ist normal! Die `investigations` Tabelle existiert noch nicht
- **Lösung**: Die Media-Galerie funktioniert trotzdem ohne Verknüpfung
- **Lösung**: Später können Sie die Verknüpfung mit der separaten Migration herstellen

### 7. Erweiterte Konfiguration

#### Custom Storage Bucket

Falls Sie einen anderen Bucket-Namen verwenden möchten:

1. **Ändern Sie in `src/lib/media-service.ts`:**

   ```typescript
   private bucketName = 'your-custom-bucket-name';
   ```

2. **Erstellen Sie den entsprechenden Bucket in Supabase**

#### File Size Limits

- **Standard**: 50MB pro Datei
- **Ändern**: In Supabase Dashboard → Storage → Buckets → Settings

#### Allowed File Types

- **Standard**: Bilder (jpg, png, gif, webp) und Dokumente (pdf, doc, docx)
- **Ändern**: In Storage Policies oder MediaService-Konfiguration

### 8. Performance-Optimierung

#### Image Optimization

```typescript
// In media-service.ts hinzufügen
const optimizeImage = async (file: File): Promise<File> => {
  // Implementierung für Bildoptimierung
  return file;
};
```

#### Caching

```typescript
// Cache für Galerie-Items
const galleryCache = new Map<string, MediaItem[]>();
```

### 9. Monitoring

#### Supabase Dashboard

- **Storage**: Überwachen Sie Speicherverbrauch
- **Database**: Überwachen Sie Medien-Tabellen
- **Logs**: Überwachen Sie Upload-Fehler

#### Application Logs

```typescript
// In media-service.ts
console.log("Media upload:", { fileName, size, type });
console.log("Gallery loaded:", { count: items.length });
```

### 10. Backup & Recovery

#### Datenbank-Backup

```sql
-- Backup der Medien-Metadaten
SELECT * FROM media WHERE created_at > NOW() - INTERVAL '30 days';
```

#### Storage-Backup

- Verwenden Sie Supabase CLI für Storage-Backups
- Oder implementieren Sie automatische Backups

---

## ✅ Checkliste

- [ ] Supabase Storage Bucket `media-gallery` erstellt
- [ ] RLS Policies für Storage konfiguriert
- [ ] Datenbank-Migration ausgeführt
- [ ] Environment Variables gesetzt
- [ ] MediaService getestet
- [ ] Upload-Funktionalität getestet
- [ ] Galerie-Funktionalität getestet
- [ ] Navigation zwischen Steps getestet

## 🎯 Nächste Schritte

1. **Testen Sie die vollständige Funktionalität**
2. **Optimieren Sie die Performance**
3. **Implementieren Sie erweiterte Features** (Bildoptimierung, Thumbnails)
4. **Überwachen Sie die Nutzung**
5. **Planen Sie Backups**
