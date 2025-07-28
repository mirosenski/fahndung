# Lokale Bildverwaltung

Dieser Ordner enthält die lokalen Bilder der Anwendung.

## Struktur

- `uploads/` - Hochgeladene Bilder
- `thumbnails/` - Thumbnails (optional)
- `.metadata.json` - Metadaten der Bilder
- `README.md` - Diese Datei

## Wichtige Hinweise

- Bilder in `uploads/` werden automatisch verwaltet
- Löschen Sie keine Dateien manuell
- Verwenden Sie die API für alle Operationen
- Backup regelmäßig durchführen

## Backup

```bash
# Backup erstellen
tar -czf images-backup-$(date +%Y%m%d).tar.gz public/images/

# Backup wiederherstellen
tar -xzf images-backup-YYYYMMDD.tar.gz
```
