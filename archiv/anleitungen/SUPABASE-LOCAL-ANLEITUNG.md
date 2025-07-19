# 🛡️ Sichere Supabase CLI - Lokale Entwicklung

## ⚠️ **WICHTIG: Vorsichtige Verwendung**

Diese Anleitung zeigt Ihnen, wie Sie Supabase CLI sicher für die lokale Entwicklung verwenden können, **ohne** Ihre bestehende Produktionskonfiguration zu beeinträchtigen.

## 📋 **Voraussetzungen**

### **1. Docker Desktop**
- **Windows**: [Docker Desktop für Windows](https://docs.docker.com/docker-for-windows/install/)
- **macOS**: [Docker Desktop für Mac](https://docs.docker.com/docker-for-mac/install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

### **2. Node.js & pnpm**
```bash
# Prüfe ob bereits installiert
node --version
pnpm --version
```

## 🚀 **Sichere Einrichtung**

### **Schritt 1: Supabase CLI verwenden**
```bash
# Verwende pnpm dlx für sichere Ausführung
pnpm dlx supabase --version
```

### **Schritt 2: Lokale Konfiguration erstellen**
```bash
# Kopiere die Beispiel-Konfiguration
cp env.local.example .env.local

# Bearbeite die Konfiguration für Ihre lokale Entwicklung
nano .env.local
```

### **Schritt 3: Supabase lokal starten**
```bash
# Verwende das sichere Skript
./scripts/supabase-local.sh start
```

## 🔧 **Verfügbare Befehle**

### **Sicheres Skript verwenden:**
```bash
# Starte Supabase lokal
./scripts/supabase-local.sh start

# Zeige Status
./scripts/supabase-local.sh status

# Stoppe Supabase
./scripts/supabase-local.sh stop

# Reset (vorsichtig!)
./scripts/supabase-local.sh reset

# Hilfe anzeigen
./scripts/supabase-local.sh help
```

### **Direkte CLI-Befehle:**
```bash
# Status prüfen
pnpm dlx supabase status

# Starten
pnpm dlx supabase start

# Stoppen
pnpm dlx supabase stop

# Reset (ACHTUNG: Löscht alle lokalen Daten!)
pnpm dlx supabase stop --no-backup
pnpm dlx supabase start
```

## 🌐 **Zugriff auf lokale Services**

Nach dem Start sind folgende Services verfügbar:

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **API** | http://localhost:54321 | Supabase API |
| **Studio** | http://localhost:54323 | Supabase Studio (Web-Interface) |
| **Database** | postgresql://postgres:postgres@localhost:54322/postgres | PostgreSQL Datenbank |
| **Inbucket** | http://localhost:54324 | E-Mail Testing |

## 🔐 **Sicherheits-Schlüssel**

### **Lokale Entwicklung:**
```bash
# Anon Key (öffentlich)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key (geheim - nur für Backend)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## 📊 **Datenbank-Schema**

Das lokale Schema ist identisch mit dem Produktionsschema:

### **Haupttabellen:**
- `user_profiles` - Benutzerprofile mit Rollen
- `investigations` - Fahndungen
- `investigation_images` - Bilder zu Fahndungen
- `media` - Medienverwaltung
- `admin_actions` - Admin-Logs
- `user_activities` - Benutzeraktivitäten
- `user_sessions` - Benutzer-Sessions

### **Sicherheitsrichtlinien (RLS):**
- Benutzer sehen nur ihre eigenen Daten
- Admins können alle Daten verwalten
- Öffentliche Fahndungen sind für alle sichtbar

## 🧪 **Testen der lokalen Entwicklung**

### **1. Anwendung starten:**
```bash
# In einem neuen Terminal
pnpm dev
```

### **2. Studio öffnen:**
```bash
# Öffne http://localhost:54323 im Browser
# Login mit: supabase@supabase.com / supabase
```

### **3. Datenbank prüfen:**
```bash
# Verbinde mit der lokalen Datenbank
psql postgresql://postgres:postgres@localhost:54322/postgres
```

## 🔄 **Migrationen verwalten**

### **Neue Migration erstellen:**
```bash
pnpm dlx supabase migration new migration_name
```

### **Migrationen anwenden:**
```bash
pnpm dlx supabase db reset
```

### **Schema-Diff erstellen:**
```bash
pnpm dlx supabase db diff -f migration_name
```

## ⚠️ **Wichtige Sicherheitshinweise**

### **1. Backup vor Änderungen:**
```bash
# Das Skript erstellt automatisch Backups
./scripts/supabase-local.sh start
```

### **2. Keine Produktionsdaten verwenden:**
- Lokale Entwicklung verwendet separate Daten
- Produktionsdaten bleiben unberührt
- Testdaten werden automatisch erstellt

### **3. Umgebungskonfiguration:**
```bash
# Verwende .env.local für lokale Entwicklung
# .env bleibt für Produktion unberührt
```

## 🐛 **Troubleshooting**

### **Problem: Docker läuft nicht**
```bash
# Prüfe Docker Status
docker info

# Starte Docker Desktop
# Windows/macOS: Docker Desktop App starten
# Linux: sudo systemctl start docker
```

### **Problem: Ports bereits belegt**
```bash
# Prüfe belegte Ports
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Stoppe andere Services oder ändere Ports in config.toml
```

### **Problem: Supabase startet nicht**
```bash
# Reset und neu starten
./scripts/supabase-local.sh reset

# Oder manuell
pnpm dlx supabase stop --no-backup
pnpm dlx supabase start
```

### **Problem: Datenbank-Verbindung fehlschlägt**
```bash
# Prüfe Datenbank-Status
pnpm dlx supabase status

# Reset Datenbank
pnpm dlx supabase db reset
```

## 📝 **Nützliche Befehle**

### **Datenbank-Operationen:**
```bash
# Datenbank-Dump erstellen
pnpm dlx supabase db dump --local --data-only > backup.sql

# Datenbank wiederherstellen
pnpm dlx supabase db reset

# Schema-Diff
pnpm dlx supabase db diff -f schema_changes
```

### **Logs anzeigen:**
```bash
# Supabase Logs
pnpm dlx supabase logs

# Spezifische Service-Logs
pnpm dlx supabase logs --service api
pnpm dlx supabase logs --service db
```

## 🎯 **Nächste Schritte**

1. **Lokale Entwicklung starten:**
   ```bash
   ./scripts/supabase-local.sh start
   ```

2. **Anwendung testen:**
   ```bash
   pnpm dev
   ```

3. **Studio öffnen:**
   - http://localhost:54323

4. **Datenbank prüfen:**
   - Verbinde mit PostgreSQL
   - Prüfe Tabellen und Daten

## ✅ **Checkliste**

- [ ] Docker Desktop installiert und läuft
- [ ] Supabase CLI verfügbar (`pnpm dlx supabase --version`)
- [ ] Lokale Konfiguration erstellt (`.env.local`)
- [ ] Supabase lokal gestartet (`./scripts/supabase-local.sh start`)
- [ ] Studio erreichbar (http://localhost:54323)
- [ ] Anwendung läuft mit lokaler Konfiguration (`pnpm dev`)

---

**🛡️ Sicherheitshinweis:** Diese lokale Entwicklungsumgebung ist vollständig von Ihrer Produktionsumgebung getrennt. Alle Änderungen bleiben lokal und beeinträchtigen nicht Ihre Produktionsdaten. 