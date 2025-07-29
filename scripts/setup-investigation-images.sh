#!/bin/bash

# Setup Script für investigation_images Tabelle
# Führt das SQL-Script im Supabase SQL Editor aus

echo "🔧 Setup für investigation_images Tabelle"
echo "=========================================="

# Prüfe ob Supabase CLI installiert ist
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI ist nicht installiert"
    echo "📦 Installiere Supabase CLI..."
    npm install -g supabase
fi

# Prüfe ob .env.local existiert
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local nicht gefunden"
    echo "📝 Erstelle .env.local aus .env.local.example..."
    cp env.local.example .env.local
    echo "⚠️  Bitte konfiguriere .env.local mit deinen Supabase-Credentials"
    exit 1
fi

# Lade Umgebungsvariablen
source .env.local

# Prüfe ob Supabase URL und Key gesetzt sind
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase URL oder Anon Key nicht in .env.local gefunden"
    echo "📝 Bitte konfiguriere:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key"
    exit 1
fi

echo "✅ Supabase Konfiguration gefunden"
echo "🌐 URL: $NEXT_PUBLIC_SUPABASE_URL"

# Prüfe ob SQL-Script existiert
if [ ! -f "scripts/create-investigation-images-table.sql" ]; then
    echo "❌ SQL-Script nicht gefunden: scripts/create-investigation-images-table.sql"
    exit 1
fi

echo ""
echo "📋 Führe SQL-Script aus..."
echo "⚠️  Bitte führe das folgende SQL-Script im Supabase SQL Editor aus:"
echo ""
echo "=== SQL-Script Start ==="
cat scripts/create-investigation-images-table.sql
echo "=== SQL-Script Ende ==="
echo ""

echo "📝 Anleitung:"
echo "1. Öffne dein Supabase Dashboard"
echo "2. Gehe zu SQL Editor"
echo "3. Kopiere das obige SQL-Script"
echo "4. Führe es aus"
echo "5. Prüfe die Tabelle in der Database Sektion"
echo ""

echo "🔍 Prüfe ob Tabelle erstellt wurde..."
echo "Du kannst die Tabelle in Supabase unter Database > Tables > investigation_images finden"

echo ""
echo "✅ Setup abgeschlossen!"
echo "🎯 Die investigation_images Tabelle sollte jetzt verfügbar sein"
echo "🚀 Der Bild-Upload sollte jetzt funktionieren"