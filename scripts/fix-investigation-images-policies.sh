#!/bin/bash

# Fix RLS Policies für investigation_images Tabelle
# Führt das SQL-Script im Supabase SQL Editor aus

echo "🔧 Fix RLS Policies für investigation_images Tabelle"
echo "===================================================="

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
if [ ! -f "scripts/update-investigation-images-policies.sql" ]; then
    echo "❌ SQL-Script nicht gefunden: scripts/update-investigation-images-policies.sql"
    exit 1
fi

echo ""
echo "📋 Führe SQL-Script aus..."
echo "⚠️  Bitte führe das folgende SQL-Script im Supabase SQL Editor aus:"
echo ""
echo "=== SQL-Script Start ==="
cat scripts/update-investigation-images-policies.sql
echo "=== SQL-Script Ende ==="
echo ""

echo "📝 Anleitung:"
echo "1. Öffne dein Supabase Dashboard"
echo "2. Gehe zu SQL Editor"
echo "3. Kopiere das obige SQL-Script"
echo "4. Führe es aus"
echo "5. Teste die uploadInvestigationImage Mutation erneut"
echo ""

echo "🔍 Nach dem Ausführen des Scripts:"
echo "1. Führe das Test-Script aus: node scripts/test-investigation-images.js"
echo "2. Teste die uploadInvestigationImage Mutation in der App"
echo "3. Prüfe die Browser-Konsole auf Fehler"

echo ""
echo "✅ Setup abgeschlossen!"
echo "🎯 Die RLS-Policies sollten jetzt korrekt konfiguriert sein"
echo "🚀 Der Bild-Upload sollte jetzt funktionieren"