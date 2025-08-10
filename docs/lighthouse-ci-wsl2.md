# Lighthouse CI in WSL2

Diese Anleitung erklärt, wie Lighthouse CI in einer WSL2-Umgebung konfiguriert wird, um Performance-Tests für die Next.js-Anwendung durchzuführen.

## Problem

Lighthouse CI hat in WSL2 zwei Hauptprobleme:

1. **Server-Start**: Der Next.js-Server wird nicht rechtzeitig als "bereit" erkannt
2. **Chrome-Zugriff**: Chrome ist im Windows-Host installiert, aber WSL2 kann nicht direkt darauf zugreifen

## Lösung

### 1. Konfiguration

Die `.lighthouserc.cjs` ist so konfiguriert, dass:

- `startServerCommand` ist leer (Server läuft bereits)
- Chrome-Flags für WSL2-Kompatibilität sind gesetzt
- Der Server wird nicht von Lighthouse CI gestartet

### 2. Chrome-Pfad

Das Setup-Script `scripts/setup-lighthouse-wsl2.sh`:

- Findet automatisch Chrome im Windows-Host
- Setzt die notwendigen Umgebungsvariablen
- Testet alternative Browser-Pfade

### 3. Verwendung

#### Development (Server läuft bereits)

```bash
# Terminal 1: Server starten
pnpm dev

# Terminal 2: Lighthouse CI ausführen
pnpm lhci:dev
```

#### Production (automatischer Server-Start)

```bash
# Startet Server automatisch und führt Tests aus
pnpm lhci:prod
```

#### Setup ausführen

```bash
# Nur Setup ausführen (ohne Tests)
pnpm lhci:setup
```

## Scripts

| Script            | Beschreibung                                |
| ----------------- | ------------------------------------------- |
| `pnpm lhci`       | Standard Lighthouse CI                      |
| `pnpm lhci:dev`   | Für Development (Server muss laufen)        |
| `pnpm lhci:prod`  | Für Production (startet Server automatisch) |
| `pnpm lhci:setup` | Nur Setup ausführen                         |

## Troubleshooting

### Chrome nicht gefunden

```bash
# Manuell Chrome-Pfad setzen
export CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
```

### Server nicht erreichbar

```bash
# Prüfen ob Server läuft
curl http://localhost:3010/

# Server manuell starten
pnpm dev
```

### WSL2-spezifische Probleme

```bash
# Chrome-Flags für WSL2
--no-sandbox --disable-dev-shm-usage
```

## Ergebnisse

Die Lighthouse CI Ergebnisse werden im `.lhci` Verzeichnis gespeichert und können im Browser geöffnet werden.
