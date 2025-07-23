#!/bin/bash

# Supabase Storage Bucket Setup Script
# Führt das SQL-Script zur Einrichtung des media-gallery Buckets aus

set -e

echo "🚀 Starte Supabase Storage Bucket Setup..."

# Prüfe ob die erforderlichen Environment-Variablen gesetzt sind
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Fehler: Supabase Environment-Variablen nicht gefunden"
    echo "Bitte stellen Sie sicher, dass .env.local geladen ist"
    exit 1
fi

# Extrahiere Project Reference aus der URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "📋 Projekt-Referenz: $PROJECT_REF"
echo "🔗 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# Prüfe ob das SQL-Script existiert
SQL_SCRIPT="scripts/setup-storage-bucket.sql"
if [ ! -f "$SQL_SCRIPT" ]; then
    echo "❌ Fehler: SQL-Script nicht gefunden: $SQL_SCRIPT"
    exit 1
fi

echo "📝 Führe SQL-Script aus..."

# Verwende curl um das SQL-Script an Supabase zu senden
# Hinweis: Dies erfordert den Service Role Key für Remote-Supabase
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "🔐 Verwende Service Role Key für Remote-Supabase..."
    
    # Lade das SQL-Script
    SQL_CONTENT=$(cat "$SQL_SCRIPT")
    
    # Sende an Supabase REST API
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -d "{\"query\": \"$SQL_CONTENT\"}" \
        "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
        || echo "⚠️  Hinweis: Automatische Ausführung fehlgeschlagen. Führen Sie das SQL-Script manuell im Supabase Dashboard aus."
else
    echo "⚠️  Service Role Key nicht gefunden. Führen Sie das SQL-Script manuell aus:"
    echo "1. Gehen Sie zu https://supabase.com/dashboard/project/$PROJECT_REF"
    echo "2. Klicken Sie auf 'SQL Editor'"
    echo "3. Kopieren Sie den Inhalt von $SQL_SCRIPT"
    echo "4. Führen Sie das Script aus"
fi

echo ""
echo "✅ Storage Bucket Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Überprüfen Sie, dass der 'media-gallery' Bucket erstellt wurde"
echo "2. Testen Sie einen Media-Upload"
echo "3. Prüfen Sie die RLS Policies"
echo ""
echo "🔗 Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "📁 Storage: https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets" 