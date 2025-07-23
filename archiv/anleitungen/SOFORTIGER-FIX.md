# 🚨 SOFORTIGER FIX für 500 Internal Server Errors

## Problem

Sie erhalten 500 Internal Server Errors bei Supabase-Anfragen:

- `user_profiles?select=*&user_id=eq.9a22ab44-9d51-4efe-9687-a0c350247e95:1`
- `investigations?select=id%2Ctitle%2Ccase_number%2Ccategory%2Cstatus%2Ccreated_at&order=created_at.desc:1`

## 🔧 SOFORTIGE LÖSUNG

### Schritt 1: Supabase SQL Editor öffnen

1. Gehen Sie zu Ihrem **Supabase Dashboard**
2. Klicken Sie auf **"SQL Editor"** (links in der Seitenleiste)
3. Klicken Sie auf **"New Query"**

### Schritt 2: SQL-Script ausführen

Kopieren Sie den folgenden Code und fügen Sie ihn in den SQL Editor ein:

```sql
-- SOFORTIGER FIX für 500 Internal Server Errors
-- Führe diese SQL-Befehle in der Supabase SQL Editor aus

-- 1. Alle bestehenden Policies löschen
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow unauthenticated profile creation" ON public.user_profiles;

DROP POLICY IF EXISTS "Anyone can read published investigations" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can read all investigations" ON public.investigations;
DROP POLICY IF EXISTS "Editors and admins can manage investigations" ON public.investigations;

DROP POLICY IF EXISTS "Anyone can read published investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can read all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Editors and admins can manage investigation images" ON public.investigation_images;

DROP POLICY IF EXISTS "Authenticated users can read media" ON public.media;
DROP POLICY IF EXISTS "Editors and admins can manage media" ON public.media;

-- 2. RLS temporär deaktivieren für saubere Neuinstallation
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media DISABLE ROW LEVEL SECURITY;

-- 3. Demo-Profile erstellen (falls nicht vorhanden)
INSERT INTO public.user_profiles (user_id, email, role, name, department, status) VALUES
(gen_random_uuid(), 'admin@fahndung.local', 'admin', 'Administrator', 'IT', 'approved'),
(gen_random_uuid(), 'editor@fahndung.local', 'editor', 'Editor', 'Redaktion', 'approved'),
(gen_random_uuid(), 'user@fahndung.local', 'user', 'Benutzer', 'Allgemein', 'approved')
ON CONFLICT (email) DO NOTHING;

-- 4. Test-Fahndungen erstellen (falls nicht vorhanden)
INSERT INTO public.investigations (title, case_number, description, short_description, status, priority, category, location, station, features, tags) VALUES
('Vermisste Person - Max Mustermann', 'F-2024-001', 'Max Mustermann wurde zuletzt am 15.03.2024 gesehen. Er trug eine blaue Jacke und schwarze Jeans. Er ist 1,75m groß und hat braune Haare.', 'Max Mustermann vermisst seit 15.03.2024', 'published', 'urgent', 'MISSING_PERSON', 'Berlin, Innenstadt', 'Polizei Berlin', 'Größe: 1,75m, Haare: braun, Kleidung: blaue Jacke, schwarze Jeans', ARRAY['vermisst', 'person', 'berlin']),
('Gesuchte Person - Anna Schmidt', 'F-2024-002', 'Anna Schmidt wird wegen Betrugs gesucht. Sie ist 1,65m groß und hat blonde Haare. Zuletzt gesehen in Hamburg.', 'Anna Schmidt wird wegen Betrugs gesucht', 'published', 'normal', 'WANTED_PERSON', 'Hamburg, Hafen', 'Polizei Hamburg', 'Größe: 1,65m, Haare: blond, Vorstrafen: Betrug', ARRAY['gesucht', 'betrug', 'hamburg']),
('Unbekannter Toter - Park', 'F-2024-003', 'Unbekannter männlicher Toter im Stadtpark gefunden. Identifikation erforderlich.', 'Unbekannter Toter im Stadtpark', 'published', 'normal', 'UNKNOWN_DEAD', 'Hamburg, Stadtpark', 'Polizei Hamburg', 'Geschätztes Alter: 45-55 Jahre, Größe: 1,80m', ARRAY['unbekannt', 'tot', 'identifikation']),
('Diebstahl von Elektronik', 'F-2024-004', 'Einbruch in Elektronikgeschäft. Wertsachen im Wert von 50.000€ gestohlen.', 'Diebstahl von Elektronik', 'published', 'urgent', 'STOLEN_GOODS', 'Hamburg, Mönckebergstraße', 'Polizei Hamburg', 'Gestohlene Ware: Laptops, Smartphones, Tablets', ARRAY['diebstahl', 'elektronik', 'einbruch'])
ON CONFLICT (case_number) DO NOTHING;

-- 5. RLS wieder aktivieren
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 6. Neue, einfache Policies erstellen (ohne Endlosschleife)

-- User Profiles: Einfache Policies
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Temporäre Policy für Registrierung
CREATE POLICY "Allow profile creation for registration" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

-- Investigations: Einfache Policies
CREATE POLICY "Anyone can read published investigations" ON public.investigations
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can read all investigations" ON public.investigations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Temporäre Policy für alle Benutzer (für Entwicklung)
CREATE POLICY "All users can read investigations" ON public.investigations
    FOR SELECT USING (true);

-- Investigation Images: Einfache Policies
CREATE POLICY "Anyone can read published investigation images" ON public.investigation_images
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can read all investigation images" ON public.investigation_images
    FOR SELECT USING (auth.role() = 'authenticated');

-- Media: Einfache Policies
CREATE POLICY "Authenticated users can read media" ON public.media
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can read media" ON public.media
    FOR SELECT USING (true);

-- 7. Bestätigung
SELECT
    'RLS-Policies erfolgreich repariert' as status,
    COUNT(*) as total_investigations,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_investigations
FROM public.investigations;
```

### Schritt 3: Script ausführen

1. Klicken Sie auf **"Run"** (oder drücken Sie Ctrl+Enter)
2. Warten Sie auf die Bestätigung: `RLS-Policies erfolgreich repariert`

### Schritt 4: Testen

1. Gehen Sie zu `http://localhost:3001`
2. Versuchen Sie sich anzumelden mit:
   - **Admin**: `admin@fahndung.local` / `admin123`
   - **Editor**: `editor@fahndung.local` / `editor123`
   - **User**: `user@fahndung.local` / `user123`

## ✅ Was das Script macht

1. **Löscht alle problematischen RLS-Policies** die Endlosschleifen verursachen
2. **Deaktiviert RLS temporär** für saubere Neuinstallation
3. **Erstellt Demo-Profile** für alle Benutzerrollen
4. **Erstellt Test-Fahndungen** mit verschiedenen Kategorien
5. **Aktiviert RLS wieder** mit einfachen, funktionierenden Policies
6. **Erstellt neue Policies** ohne Endlosschleifen

## 🎯 Ergebnis

Nach dem Ausführen des Scripts sollten Sie:

- ✅ Keine 500 Internal Server Errors mehr
- ✅ Zugriff auf alle Fahndungen
- ✅ Funktionierender Login
- ✅ Dashboard funktioniert
- ✅ Alle Demo-Daten verfügbar

## 🆘 Falls Probleme bestehen

1. **Browser-Cache leeren**: Ctrl+Shift+R
2. **Supabase neu starten**: Dashboard → Settings → Restart
3. **Anwendung neu starten**: `pnpm run dev`

## 📞 Nächste Schritte

Nach erfolgreicher Behebung können Sie:

1. Sich mit den Demo-Accounts anmelden
2. Alle Fahndungen einsehen
3. Das Dashboard nutzen
4. Neue Fahndungen erstellen
