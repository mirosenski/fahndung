# 🔐 Supabase Auth Setup Guide

## Problem

Ihre Registrierungsform zeigt 400-Fehler, weil sie nicht korrekt mit Supabase Auth konfiguriert ist.

## ✅ Lösung: Korrekte Supabase Auth Konfiguration

### 1. Supabase Dashboard Einstellungen

#### A. Auth Settings konfigurieren

1. **Gehen Sie zu Ihrem Supabase Dashboard**
   - URL: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/settings

2. **Email Auth aktivieren**
   - ✅ **Enable email confirmations** aktivieren
   - ✅ **Enable email signups** aktivieren
   - ✅ **Enable phone confirmations** deaktivieren (falls nicht benötigt)

3. **Site URL konfigurieren**
   - **Site URL**: `http://localhost:3000` (für Entwicklung)
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/login`
     - `http://localhost:3000/register`

#### B. SMTP-Konfiguration (optional für E-Mail-Benachrichtigungen)

1. **SMTP Settings aktivieren**
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `ptlsweb@gmail.com`
   - **SMTP Pass**: [Gmail App-Passwort]
   - **Sender Name**: `Fahndung System`

2. **Gmail App-Passwort erstellen**
   - Gehen Sie zu Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Erstellen Sie ein App-Passwort für "Fahndung"

### 2. Datenbank-Schema überprüfen

#### A. user_profiles Tabelle

```sql
-- Überprüfen Sie, ob die Tabelle existiert
SELECT * FROM information_schema.tables
WHERE table_name = 'user_profiles';

-- Falls nicht, erstellen Sie sie:
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT DEFAULT 'Allgemein',
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS-Policies für user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Benutzer können ihr eigenes Profil lesen
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Benutzer können ihr eigenes Profil aktualisieren
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins können alle Profile verwalten
CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Neue Benutzer können ihr Profil erstellen
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### B. Trigger für automatische Profil-Erstellung

```sql
-- Trigger-Funktion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Neuer Benutzer'),
    NEW.email,
    'user',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Environment-Variablen überprüfen

Stellen Sie sicher, dass in `.env.local` gesetzt sind:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rgbxdxrhwrszidbnsmuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: SMTP für E-Mail-Benachrichtigungen
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ptlsweb@gmail.com
SMTP_PASS=your-app-password
```

### 4. Test-Prozedur

#### A. Registrierung testen

1. **Server neu starten**

   ```bash
   pnpm dev
   ```

2. **Registrierung testen**
   - Gehen Sie zu `http://localhost:3000/register`
   - Füllen Sie das Formular aus
   - Überprüfen Sie die Browser-Konsole für Fehler

3. **E-Mail-Bestätigung testen**
   - Überprüfen Sie Ihre E-Mail-Inbox
   - Klicken Sie auf den Bestätigungslink

#### B. Admin-Genehmigung testen

1. **Als Admin anmelden**
   - Gehen Sie zu `http://localhost:3000/login`
   - Melden Sie sich als Admin an

2. **Benutzer genehmigen**
   - Gehen Sie zu `http://localhost:3000/admin/users`
   - Klicken Sie auf "Genehmigen" für neue Benutzer

### 5. Debugging

#### A. Browser-Konsole prüfen

```javascript
// In der Browser-Konsole
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Session:", await supabase.auth.getSession());
```

#### B. Supabase Logs prüfen

1. **Gehen Sie zu Supabase Dashboard**
2. **Logs → Auth Logs**
3. **Suchen Sie nach Fehlern bei der Registrierung**

#### C. Häufige Fehler und Lösungen

**Fehler: "User already registered"**

- Lösung: Benutzer existiert bereits, verwenden Sie Login

**Fehler: "Invalid email"**

- Lösung: Überprüfen Sie das E-Mail-Format

**Fehler: "Password too weak"**

- Lösung: Passwort muss mindestens 6 Zeichen haben

**Fehler: "Email not confirmed"**

- Lösung: Überprüfen Sie E-Mail-Inbox und bestätigen Sie

### 6. Erweiterte Konfiguration

#### A. E-Mail-Templates anpassen

1. **Gehen Sie zu Auth → Email Templates**
2. **Confirmation Email anpassen**
3. **Recovery Email anpassen**

#### B. OAuth-Provider hinzufügen (optional)

1. **Google OAuth**
   - Client ID und Secret von Google Console
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

2. **GitHub OAuth**
   - Client ID und Secret von GitHub
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 7. Sicherheits-Checkliste

- ✅ **RLS-Policies aktiviert**
- ✅ **E-Mail-Bestätigung aktiviert**
- ✅ **Sichere Passwort-Richtlinien**
- ✅ **Rate Limiting konfiguriert**
- ✅ **Audit Logs aktiviert**

### 8. Performance-Optimierung

- ✅ **Session-Caching aktiviert**
- ✅ **Token-Refresh konfiguriert**
- ✅ **Connection Pooling aktiviert**

## 🎯 Erwartetes Verhalten nach der Konfiguration

1. **Registrierung funktioniert ohne 400-Fehler**
2. **E-Mail-Bestätigung wird gesendet**
3. **Benutzer-Profil wird automatisch erstellt**
4. **Admin kann Benutzer genehmigen**
5. **Login funktioniert nach Genehmigung**

## 🔧 Support

Bei Problemen:

1. **Überprüfen Sie die Browser-Konsole**
2. **Prüfen Sie Supabase Auth Logs**
3. **Testen Sie mit einem neuen E-Mail-Account**
4. **Überprüfen Sie die Environment-Variablen**
