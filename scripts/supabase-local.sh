#!/usr/bin/env bash
# Sicheres Supabase Local Development Script
# Dieses Skript startet Supabase lokal ohne die bestehende Konfiguration zu beeinträchtigen

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

# Prüfe Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker ist nicht installiert. Bitte installieren Sie Docker Desktop."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker läuft nicht. Bitte starten Sie Docker Desktop."
        exit 1
    fi

    print_success "Docker ist verfügbar"
}

# Prüfe Supabase CLI
check_supabase_cli() {
    if ! pnpm dlx supabase --version &> /dev/null; then
        print_error "Supabase CLI ist nicht verfügbar"
        exit 1
    fi

    print_success "Supabase CLI ist verfügbar"
}

# Sichere Backup-Funktion
create_backup() {
    print_info "Erstelle Backup der aktuellen Konfiguration..."
    
    if [ -d "supabase" ]; then
        cp -r supabase supabase.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Backup erstellt"
    fi
}

# Initialisiere Supabase (falls nicht vorhanden)
init_supabase() {
    if [ ! -d "supabase" ]; then
        print_info "Initialisiere Supabase für lokale Entwicklung..."
        pnpm dlx supabase init
        print_success "Supabase initialisiert"
    else
        print_info "Supabase-Konfiguration bereits vorhanden"
    fi
}

# Starte Supabase lokal
start_supabase() {
    print_info "Starte Supabase lokal..."
    
    # Prüfe ob bereits läuft
    if pnpm dlx supabase status &> /dev/null; then
        print_warning "Supabase läuft bereits"
        return
    fi
    
    # Starte Supabase
    pnpm dlx supabase start
    
    if [ $? -eq 0 ]; then
        print_success "Supabase erfolgreich gestartet"
        print_info "API URL: http://localhost:54321"
        print_info "Studio URL: http://localhost:54323"
        print_info "DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
    else
        print_error "Fehler beim Starten von Supabase"
        exit 1
    fi
}

# Stoppe Supabase
stop_supabase() {
    print_info "Stoppe Supabase..."
    pnpm dlx supabase stop
    print_success "Supabase gestoppt"
}

# Zeige Status
show_status() {
    print_info "Supabase Status:"
    pnpm dlx supabase status
}

# Reset Supabase (vorsichtig)
reset_supabase() {
    print_warning "ACHTUNG: Dies wird alle lokalen Daten löschen!"
    read -p "Sind Sie sicher? (y/N): " -r REPLY
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Resette Supabase..."
        pnpm dlx supabase stop --no-backup
        pnpm dlx supabase start
        print_success "Supabase zurückgesetzt"
    else
        print_info "Reset abgebrochen"
    fi
}

# Zeige Hilfe
show_help() {
    echo "Sicheres Supabase Local Development Script"
    echo ""
    echo "Verwendung: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Starte Supabase lokal"
    echo "  stop      - Stoppe Supabase"
    echo "  status    - Zeige Status"
    echo "  reset     - Reset Supabase (vorsichtig)"
    echo "  init      - Initialisiere Supabase (falls nicht vorhanden)"
    echo "  help      - Zeige diese Hilfe"
    echo ""
    echo "Beispiele:"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 stop"
}

# Hauptfunktion
main() {
    local command=${1:-help}
    
    case $command in
        start)
            check_docker
            check_supabase_cli
            create_backup
            init_supabase
            start_supabase
            ;;
        stop)
            stop_supabase
            ;;
        status)
            show_status
            ;;
        reset)
            reset_supabase
            ;;
        init)
            check_docker
            check_supabase_cli
            create_backup
            init_supabase
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unbekannter Befehl: $command"
            show_help
            exit 1
            ;;
    esac
}

# Führe Hauptfunktion aus
main "$@" 