# Remote Supabase Setup

Dieses Projekt wurde für die ausschließliche Verwendung von Remote-Supabase konfiguriert. Alle lokalen Supabase-Komponenten wurden entfernt.

## 🚀 Schnellstart

### 1. Environment-Variablen konfigurieren

Bearbeiten Sie die `.env.local` Datei und konfigurieren Sie Ihre Remote-Supabase-URLs:

```bash
# Remote Supabase URLs
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here

# Datenbank URL (Remote)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Service Role Key (Remote)
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here
```

### 2. Anwendung starten

```bash
pnpm dev
```

### 3. Benutzer einrichten

1. Gehen Sie zu `http://localhost:3000/login`
2. Klicken Sie auf "Alle Benutzer einrichten"
3. Melden Sie sich mit `admin@fahndung.local` / `admin123` an

## 📋 Voraussetzungen

### Remote Supabase Projekt

Sie benötigen ein Remote-Supabase-Projekt mit:

1. **Datenbank-Tabellen:**
   - `user_profiles`
   - `investigations`
   - `media`
   - `investigation_media`

2. **Storage Buckets:**
   - `media-gallery` (für Medien-Uploads)

3. **Authentication:**
   - Email/Password Authentication aktiviert
   - Redirect URLs konfiguriert

### Environment-Variablen

Stellen Sie sicher, dass alle erforderlichen Environment-Variablen in `.env.local` gesetzt sind:

```bash
# Supabase URLs (Remote)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here

# Datenbank URL (Remote)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Service Role Key (Remote)
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here

# Admin E-Mail für Benachrichtigungen
ADMIN_EMAIL=ptlsweb@gmail.com

# App URLs
NEXT_PUBLIC_APP_URL=https://fahndung.vercel.app

# Upload-Konfiguration
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Sicherheit
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://fahndung.vercel.app

# Entwicklung
NODE_ENV=development

# Remote Supabase Einstellungen
NEXT_PUBLIC_USE_LOCAL_SUPABASE=false
```

## 🔧 Setup-Scripts

### Automatisches Setup

```bash
# Vollständiges Remote-Supabase-Setup
pnpm run setup:remote

# Oder direkt
bash scripts/setup-remote-supabase.sh setup
```

### Verbindungstest

```bash
# Teste Remote-Supabase-Verbindung
pnpm run test:remote

# Oder direkt
bash scripts/setup-remote-supabase.sh test
```

### Lokale Komponenten entfernen

```bash
# Entferne lokale Supabase-Komponenten
bash scripts/setup-remote-supabase.sh clean
```

## 📁 Projektstruktur

Nach dem Setup wurden folgende lokale Komponenten entfernt:

- ❌ `supabase/` - Lokale Supabase-Konfiguration
- ❌ `start-database.sh` - Lokales Datenbank-Script
- ❌ `fix_local_supabase.sql` - Lokales SQL-Script
- ❌ `scripts/supabase-local.sh` - Lokales Supabase-Script

## 🔄 Migration von Lokal zu Remote

Falls Sie von einer lokalen Supabase-Installation migrieren:

1. **Backup erstellen:**

   ```bash
   cp .env.local .env.local.backup
   ```

2. **Remote-Supabase konfigurieren:**
   - Erstellen Sie ein neues Supabase-Projekt
   - Konfigurieren Sie die Environment-Variablen
   - Führen Sie die Datenbank-Migrationen aus

3. **Setup ausführen:**
   ```bash
   pnpm run setup:remote
   ```

## 🐛 Troubleshooting

### Fehler: "Missing Supabase environment variables"

**Lösung:** Stellen Sie sicher, dass alle erforderlichen Environment-Variablen in `.env.local` gesetzt sind.

### Fehler: "Invalid Supabase URL"

**Lösung:** Überprüfen Sie die `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`. Sie sollte mit `https://` beginnen.

### Fehler: "Authentication failed"

**Lösung:**

1. Überprüfen Sie die `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Stellen Sie sicher, dass Email/Password Authentication aktiviert ist
3. Konfigurieren Sie die Redirect URLs in Ihrem Supabase-Projekt

### Fehler: "Storage bucket not found"

**Lösung:** Erstellen Sie den `media-gallery` Bucket in Ihrem Supabase-Projekt:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-gallery', 'media-gallery', true);
```

## 📞 Support

Bei Problemen:

1. Überprüfen Sie die Browser-Konsole für Fehlermeldungen
2. Prüfen Sie die Network-Tab für fehlgeschlagene Requests
3. Stellen Sie sicher, dass alle Environment-Variablen korrekt gesetzt sind
4. Testen Sie die Verbindung mit `pnpm run test:remote`

## 🔒 Sicherheit

- Alle Supabase-Keys werden über Environment-Variablen verwaltet
- Lokale Supabase-Komponenten wurden vollständig entfernt
- Backup-Dateien wurden erstellt (`.env.local.backup.*`)
- Die Anwendung verwendet ausschließlich Remote-Supabase
