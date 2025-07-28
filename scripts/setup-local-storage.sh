#!/bin/bash

# Setup Script für lokale Bildverwaltung
# Erstellt die notwendigen Verzeichnisse und Dateien

set -e

echo "🔧 Setup für lokale Bildverwaltung"
echo "=================================="

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo "❌ Bitte führen Sie dieses Script im Projekt-Root aus"
    exit 1
fi

echo "✅ Projekt-Root gefunden"

# Erstelle Verzeichnisse
echo "📁 Erstelle Verzeichnisse..."

mkdir -p public/images/uploads
mkdir -p public/images/thumbnails

echo "✅ Verzeichnisse erstellt:"
echo "   - public/images/uploads"
echo "   - public/images/thumbnails"

# Erstelle .gitkeep Dateien
touch public/images/uploads/.gitkeep
touch public/images/thumbnails/.gitkeep

# Erstelle initiale Metadaten-Datei
if [ ! -f "public/images/.metadata.json" ]; then
    echo "📄 Erstelle initiale Metadaten-Datei..."
    cat > public/images/.metadata.json << 'EOF'
[]
EOF
    echo "✅ Metadaten-Datei erstellt"
else
    echo "ℹ️  Metadaten-Datei existiert bereits"
fi

# Prüfe Berechtigungen
echo "🔐 Prüfe Berechtigungen..."

if [ -w "public/images" ]; then
    echo "✅ Schreibrechte für public/images OK"
else
    echo "❌ Keine Schreibrechte für public/images"
    echo "   Führen Sie aus: chmod 755 public/images"
    exit 1
fi

# Erstelle .gitignore Einträge
echo "📝 Prüfe .gitignore..."

if ! grep -q "public/images/uploads/\*" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Lokale Bildverwaltung" >> .gitignore
    echo "public/images/uploads/*" >> .gitignore
    echo "public/images/thumbnails/*" >> .gitignore
    echo "!public/images/uploads/.gitkeep" >> .gitignore
    echo "!public/images/thumbnails/.gitkeep" >> .gitignore
    echo "✅ .gitignore aktualisiert"
else
    echo "ℹ️  .gitignore Einträge existieren bereits"
fi

# Prüfe TypeScript-Konfiguration
echo "🔍 Prüfe TypeScript-Konfiguration..."

if [ -f "tsconfig.json" ]; then
    echo "✅ TypeScript-Konfiguration gefunden"
else
    echo "⚠️  TypeScript-Konfiguration nicht gefunden"
fi

# Erstelle Test-Bild (optional)
echo "🖼️  Erstelle Test-Bild..."

if command -v convert &> /dev/null; then
    # ImageMagick verfügbar - erstelle Test-Bild
    convert -size 100x100 xc:blue -pointsize 20 -fill white -gravity center -annotate 0 "TEST" public/images/uploads/test-image.png
    echo "✅ Test-Bild erstellt: public/images/uploads/test-image.png"
else
    echo "ℹ️  ImageMagick nicht verfügbar - überspringe Test-Bild"
fi

# Erstelle README für lokale Bilder
echo "📖 Erstelle README..."

cat > public/images/README.md << 'EOF'
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
EOF

echo "✅ README erstellt"

# Finale Prüfung
echo ""
echo "🎉 Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Starten Sie den Entwicklungsserver: npm run dev"
echo "2. Besuchen Sie: http://localhost:3000/demo/local-storage"
echo "3. Testen Sie die Upload-Funktionalität"
echo ""
echo "📁 Verzeichnisse:"
echo "   - public/images/uploads/ (Hochgeladene Bilder)"
echo "   - public/images/thumbnails/ (Thumbnails)"
echo "   - public/images/.metadata.json (Metadaten)"
echo ""
echo "🔗 Demo-Seite: /demo/local-storage"
echo "📚 Dokumentation: docs/LOCAL_STORAGE.md" 