#!/bin/bash

# Supabase Storage Bucket Setup Script
# Führt das SQL-Script automatisch aus

set -e

# Lade Environment-Variablen aus .env.local
if [ -f ".env.local" ]; then
    echo "📋 Lade Environment-Variablen aus .env.local..."
    export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "🚀 Supabase Storage Bucket Setup"
echo "=================================="

# Prüfe Environment-Variablen
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL ist nicht gesetzt"
    echo "Bitte setzen Sie die Environment-Variablen in .env.local"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt"
    echo "Bitte setzen Sie die Environment-Variablen in .env.local"
    exit 1
fi

# Extrahiere Project ID aus der URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "📋 Projekt ID: $PROJECT_ID"
echo "🔗 URL: $NEXT_PUBLIC_SUPABASE_URL"

# SQL Script ausführen
echo ""
echo "📝 Führe Storage Bucket Setup aus..."

# Verwende curl um das SQL-Script auszuführen
curl -X POST \
  "https://$PROJECT_ID.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @scripts/setup-storage-bucket.sql

echo ""
echo "✅ Storage Bucket Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Gehen Sie zu Ihrem Supabase Dashboard"
echo "2. Klicken Sie auf 'Storage'"
echo "3. Überprüfen Sie, ob der 'media-gallery' Bucket existiert"
echo "4. Testen Sie den Media-Upload in der Anwendung"
echo ""
echo "🔧 Falls Probleme auftreten:"
echo "- Prüfen Sie die Browser-Konsole für Fehlermeldungen"
echo "- Überprüfen Sie die RLS-Policies im Supabase Dashboard"
echo "- Stellen Sie sicher, dass Sie als Admin angemeldet sind" 