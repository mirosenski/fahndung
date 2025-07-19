# 🛡️ Supabase CLI - Sichere Lokale Entwicklung

## ⚡ **Schnellstart**

```bash
# 1. Supabase lokal starten
./scripts/supabase-local.sh start

# 2. Anwendung starten
pnpm dev

# 3. Studio öffnen
# http://localhost:54323
```

## 🔧 **Verfügbare Befehle**

```bash
# Starte Supabase lokal
./scripts/supabase-local.sh start

# Zeige Status
./scripts/supabase-local.sh status

# Stoppe Supabase
./scripts/supabase-local.sh stop

# Reset (vorsichtig!)
./scripts/supabase-local.sh reset

# Hilfe
./scripts/supabase-local.sh help
```

## 🌐 **Lokale Services**

| Service | URL | Beschreibung |
|---------|-----|--------------|
| **API** | http://localhost:54321 | Supabase API |
| **Studio** | http://localhost:54323 | Supabase Studio |
| **Database** | postgresql://postgres:postgres@localhost:54322/postgres | PostgreSQL |
| **Inbucket** | http://localhost:54324 | E-Mail Testing |

## ⚠️ **Wichtige Hinweise**

- **Sicher**: Lokale Entwicklung beeinträchtigt nicht die Produktion
- **Backup**: Automatische Backups vor Änderungen
- **Isoliert**: Separate Datenbank und Konfiguration
- **Testdaten**: Automatisch erstellte Beispieldaten

## 📖 **Detaillierte Anleitung**

Siehe: [SUPABASE-LOCAL-ANLEITUNG.md](./SUPABASE-LOCAL-ANLEITUNG.md)

## 🔐 **Sicherheits-Schlüssel (Lokal)**

```bash
# Anon Key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## 🎯 **Nächste Schritte**

1. **Docker Desktop installieren** (falls nicht vorhanden)
2. **Lokale Konfiguration erstellen**: `cp env.local.example .env.local`
3. **Supabase starten**: `./scripts/supabase-local.sh start`
4. **Anwendung testen**: `pnpm dev`
5. **Studio öffnen**: http://localhost:54323

---

**🛡️ Sicherheitshinweis:** Diese lokale Entwicklungsumgebung ist vollständig von der Produktionsumgebung getrennt. 