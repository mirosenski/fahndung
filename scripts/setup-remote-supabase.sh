#!/usr/bin/env bash
# Remote Supabase Setup Script
# Dieses Script richtet die Remote-Supabase-Instanz für Media-Upload ein

set -e

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Prüfe Environment-Variablen
check_env() {
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_error "Supabase Environment-Variablen fehlen!"
        print_info "Bitte stellen Sie sicher, dass .env.local die folgenden Variablen enthält:"
        print_info "NEXT_PUBLIC_SUPABASE_URL=your-remote-supabase-url"
        print_info "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-supabase-anon-key"
        exit 1
    fi
    
    print_success "Supabase Environment-Variablen gefunden"
}

# Führe SQL-Script in Remote-Supabase aus
run_remote_sql() {
    local sql_file="$1"
    local description="$2"
    
    print_info "Führe $description aus..."
    
    # Verwende Supabase CLI für Remote-Ausführung
    if pnpm dlx supabase db push --db-url "$DATABASE_URL" --file "$sql_file"; then
        print_success "$description erfolgreich ausgeführt"
    else
        print_error "Fehler beim Ausführen von $description"
        return 1
    fi
}

# Hauptfunktion
main() {
    print_info "🚀 Starte Remote Supabase Setup..."
    
    # Prüfe Environment
    check_env
    
    # Führe Storage-Bucket-Setup aus
    if [ -f "medien-galerie/supabase_media_bucket_setup.sql" ]; then
        run_remote_sql "medien-galerie/supabase_media_bucket_setup.sql" "Storage-Bucket-Setup"
    else
        print_warning "Storage-Bucket-Setup SQL-Datei nicht gefunden"
    fi
    
    # Führe Benutzer-Setup aus
    print_info "Erstelle Demo-Benutzer in Remote-Supabase..."
    
    # Starte die Anwendung für automatisches Setup
    print_info "Starte Anwendung für automatisches Benutzer-Setup..."
    pnpm dev &
    local app_pid=$!
    
    # Warte kurz und öffne Browser
    sleep 5
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000/login"
    elif command -v open &> /dev/null; then
        open "http://localhost:3000/login"
    else
        print_info "Öffnen Sie manuell: http://localhost:3000/login"
    fi
    
    print_success "Remote Supabase Setup abgeschlossen!"
    print_info "Gehen Sie zu http://localhost:3000/login und klicken Sie auf 'Alle Benutzer einrichten'"
    print_info "Dann können Sie sich mit admin@fahndung.local / admin123 anmelden"
    
    # Warte auf Benutzer-Input zum Beenden
    read -p "Drücken Sie Enter um die Anwendung zu beenden..."
    kill $app_pid 2>/dev/null || true
}

# Hilfe anzeigen
show_help() {
    echo "Remote Supabase Setup Script"
    echo ""
    echo "Verwendung: $0"
    echo ""
    echo "Dieses Script:"
    echo "1. Prüft die Supabase Environment-Variablen"
    echo "2. Führt Storage-Bucket-Setup aus"
    echo "3. Startet die Anwendung für automatisches Benutzer-Setup"
    echo ""
    echo "Voraussetzungen:"
    echo "- .env.local mit Remote-Supabase-URLs"
    echo "- Supabase CLI installiert"
    echo "- Node.js und pnpm verfügbar"
}

# Argumente verarbeiten
case "${1:-}" in
    help|--help|-h)
        show_help
        exit 0
        ;;
    *)
        main
        ;;
esac 