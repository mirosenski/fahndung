#!/usr/bin/env bash
# Remote Supabase Setup Script
# Dieses Script richtet das Projekt für Remote-Supabase ein

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
    # Lade .env.local
    if [ -f ".env.local" ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_error "Supabase Environment-Variablen fehlen!"
        print_info "Bitte stellen Sie sicher, dass .env.local die folgenden Variablen enthält:"
        print_info "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co"
        print_info "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here"
        exit 1
    fi
    
    print_success "Supabase Environment-Variablen gefunden"
    print_info "URL: $NEXT_PUBLIC_SUPABASE_URL"
    print_info "Anon Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
}

# Entferne lokale Supabase-Komponenten
remove_local_supabase() {
    print_info "Entferne lokale Supabase-Komponenten..."
    
    # Entferne Supabase-Verzeichnis
    if [ -d "supabase" ]; then
        rm -rf supabase/
        print_success "Supabase-Verzeichnis entfernt"
    fi
    
    # Entferne lokale Scripts
    if [ -f "start-database.sh" ]; then
        rm -f start-database.sh
        print_success "start-database.sh entfernt"
    fi
    
    if [ -f "fix_local_supabase.sql" ]; then
        rm -f fix_local_supabase.sql
        print_success "fix_local_supabase.sql entfernt"
    fi
    
    if [ -f "scripts/supabase-local.sh" ]; then
        rm -f scripts/supabase-local.sh
        print_success "scripts/supabase-local.sh entfernt"
    fi
}

# Aktualisiere .env.local für Remote-Supabase
update_env_file() {
    print_info "Aktualisiere .env.local für Remote-Supabase..."
    
    if [ ! -f ".env.local" ]; then
        print_error ".env.local Datei nicht gefunden!"
        print_info "Bitte kopieren Sie env.local.example zu .env.local und konfigurieren Sie Ihre Remote-Supabase-URLs"
        exit 1
    fi
    
    # Backup erstellen
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backup von .env.local erstellt"
    
    print_info "Bitte konfigurieren Sie Ihre Remote-Supabase-URLs in .env.local:"
    print_info "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co"
    print_info "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here"
    print_info "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
    print_info "SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here"
}

# Prüfe Remote-Supabase-Verbindung
test_remote_connection() {
    print_info "Teste Remote-Supabase-Verbindung..."
    
    # Starte temporär die Anwendung für den Test
    print_info "Starte Anwendung für Verbindungstest..."
    timeout 30s pnpm dev > /dev/null 2>&1 &
    local app_pid=$!
    
    # Warte kurz
    sleep 5
    
    # Prüfe ob die Anwendung läuft
    if kill -0 $app_pid 2>/dev/null; then
        print_success "Anwendung gestartet - Verbindungstest läuft"
        print_info "Öffnen Sie http://localhost:3000 um die Verbindung zu testen"
        
        # Warte auf Benutzer-Input
        read -p "Drücken Sie Enter um den Test zu beenden..."
        
        # Stoppe Anwendung
        kill $app_pid 2>/dev/null || true
        print_success "Verbindungstest beendet"
    else
        print_error "Anwendung konnte nicht gestartet werden"
        exit 1
    fi
}

# Zeige Setup-Anweisungen
show_setup_instructions() {
    print_info "🚀 Remote Supabase Setup abgeschlossen!"
    print_info ""
    print_info "Nächste Schritte:"
    print_info "1. Konfigurieren Sie Ihre Remote-Supabase-URLs in .env.local"
    print_info "2. Führen Sie 'pnpm dev' aus um die Anwendung zu starten"
    print_info "3. Gehen Sie zu http://localhost:3000/login"
    print_info "4. Klicken Sie auf 'Alle Benutzer einrichten'"
    print_info "5. Melden Sie sich mit admin@fahndung.local / admin123 an"
    print_info ""
    print_info "Wichtige Hinweise:"
    print_info "- Alle lokalen Supabase-Komponenten wurden entfernt"
    print_info "- Das Projekt verwendet jetzt ausschließlich Remote-Supabase"
    print_info "- Backup-Dateien wurden erstellt (.env.local.backup.*)"
}

# Hilfe anzeigen
show_help() {
    echo "Remote Supabase Setup Script"
    echo ""
    echo "Verwendung: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Vollständiges Remote-Supabase-Setup"
    echo "  test      - Teste Remote-Supabase-Verbindung"
    echo "  clean     - Entferne lokale Supabase-Komponenten"
    echo "  help      - Zeige diese Hilfe"
    echo ""
    echo "Beispiele:"
    echo "  $0 setup"
    echo "  $0 test"
    echo "  $0 clean"
}

# Hauptfunktion
main() {
    case "${1:-setup}" in
        "setup")
            print_info "🚀 Starte Remote Supabase Setup..."
            remove_local_supabase
            update_env_file
            check_env
            show_setup_instructions
            ;;
        "test")
            check_env
            test_remote_connection
            ;;
        "clean")
            remove_local_supabase
            print_success "Lokale Supabase-Komponenten entfernt"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unbekannter Befehl: $1"
            show_help
            exit 1
            ;;
    esac
}

# Script ausführen
main "$@" 