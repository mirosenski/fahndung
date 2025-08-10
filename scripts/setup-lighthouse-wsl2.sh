#!/bin/bash

# Lighthouse CI Setup für WSL2
# Setzt Chrome-Pfad und andere notwendige Umgebungsvariablen

echo "🚀 Lighthouse CI WSL2 Setup..."

# Chrome-Pfad für Windows-Host setzen
export CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"

# Alternative Chrome-Pfade testen
if [ ! -f "$CHROME_PATH" ]; then
    echo "⚠️  Chrome nicht gefunden unter: $CHROME_PATH"
    
    # Alternative Pfade testen
    ALTERNATIVE_PATHS=(
        "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
        "/mnt/c/Users/$USER/AppData/Local/Google/Chrome/Application/chrome.exe"
        "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe"
    )
    
    for path in "${ALTERNATIVE_PATHS[@]}"; do
        if [ -f "$path" ]; then
            export CHROME_PATH="$path"
            echo "✅ Chrome gefunden unter: $CHROME_PATH"
            break
        fi
    done
    
    if [ ! -f "$CHROME_PATH" ]; then
        echo "❌ Chrome nicht gefunden. Bitte installiere Chrome im Windows-Host."
        exit 1
    fi
else
    echo "✅ Chrome gefunden unter: $CHROME_PATH"
fi

# Lighthouse CI Umgebungsvariablen setzen
export LHCI_COLLECT_START_SERVER_COMMAND=""
export LHCI_COLLECT_CHROME_PATH="$CHROME_PATH"

echo "🔧 Umgebungsvariablen gesetzt:"
echo "   CHROME_PATH: $CHROME_PATH"
echo "   LHCI_COLLECT_START_SERVER_COMMAND: $LHCI_COLLECT_START_SERVER_COMMAND"
echo "   LHCI_COLLECT_CHROME_PATH: $LHCI_COLLECT_CHROME_PATH"

echo "✅ Lighthouse CI WSL2 Setup abgeschlossen!"
echo ""
echo "Verwendung:"
echo "  # Für Development (Server muss bereits laufen)"
echo "  pnpm lhci:dev"
echo ""
echo "  # Für Production (startet Server automatisch)"
echo "  pnpm lhci:prod"
