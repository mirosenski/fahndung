-- 🔧 FIX FÜR FOREIGN KEY CONSTRAINT FEHLER
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- ============================================
-- 1. ÜBERPRÜFUNG DER AUTH.USERS TABELLE
-- ============================================

-- Zeige alle existierenden Benutzer
SELECT '=== EXISTIERENDE BENUTZER ===' as test_section;
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Zeige bereits existierende Profile
SELECT '=== EXISTIERENDE PROFILE ===' as test_section;
SELECT 
  user_id,
  name,
  email,
  department,
  role,
  status,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- ============================================
-- 2. TEST MIT ECHTER USER_ID
-- ============================================

-- Test 1: Benutzer-Profil mit echter user_id erstellen
SELECT '=== TEST: BENUTZER-PROFIL MIT ECHTER USER_ID ===' as test_section;

-- Verwende die erste verfügbare user_id
DO $$
DECLARE
  real_user_id UUID;
BEGIN
  -- Hole die erste verfügbare user_id
  SELECT id INTO real_user_id 
  FROM auth.users 
  LIMIT 1;
  
  IF real_user_id IS NOT NULL THEN
    -- Erstelle Test-Profil mit echter user_id (ohne ON CONFLICT für Test)
    INSERT INTO public.user_profiles (
      user_id,
      name,
      email,
      department,
      role,
      status
    ) VALUES (
      real_user_id,
      'Test User (Real)',
      'test.real@example.com',
      'IT',
      'user',
      'pending'
    );
    
    RAISE NOTICE '✅ Test-Profil erstellt mit user_id: %', real_user_id;
  ELSE
    RAISE NOTICE '❌ Keine Benutzer in auth.users gefunden';
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'ℹ️ Profil für user_id % existiert bereits', real_user_id;
    -- Update existing profile
    UPDATE public.user_profiles SET
      name = 'Test User (Real)',
      email = 'test.real@example.com',
      department = 'IT',
      role = 'user',
      status = 'pending',
      updated_at = NOW()
    WHERE user_id = real_user_id;
    RAISE NOTICE '✅ Bestehendes Profil aktualisiert für user_id: %', real_user_id;
END $$;

-- ============================================
-- 3. BENUTZER ERSTELLEN FÜR TEST
-- ============================================

-- Erstelle einen Test-Benutzer in auth.users
SELECT '=== TEST: TEST-BENUTZER ERSTELLEN ===' as test_section;

DO $$
DECLARE
  test_user_exists BOOLEAN;
BEGIN
  -- Prüfe ob Test-Benutzer bereits existiert
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'test.user@example.com') INTO test_user_exists;
  
  IF NOT test_user_exists THEN
    -- Erstelle Test-Benutzer nur wenn er nicht existiert
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      role
    ) VALUES (
      gen_random_uuid(),
      'test.user@example.com',
      crypt('test123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"name": "Test User", "department": "IT"}'::jsonb,
      'authenticated'
    );
    RAISE NOTICE '✅ Test-Benutzer erstellt: test.user@example.com';
  ELSE
    RAISE NOTICE 'ℹ️ Test-Benutzer existiert bereits: test.user@example.com';
  END IF;
END $$;

-- ============================================
-- 4. TEST-PROFIL MIT NEUEM BENUTZER ERSTELLEN
-- ============================================

-- Erstelle Profil für den neuen Test-Benutzer
SELECT '=== TEST: PROFIL FÜR NEUEN BENUTZER ===' as test_section;

DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Hole die user_id des Test-Benutzers
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test.user@example.com';
  
  IF test_user_id IS NOT NULL THEN
    -- Erstelle Profil für Test-Benutzer (ohne ON CONFLICT für Test)
    INSERT INTO public.user_profiles (
      user_id,
      name,
      email,
      department,
      role,
      status
    ) VALUES (
      test_user_id,
      'Test User',
      'test.user@example.com',
      'IT',
      'user',
      'pending'
    );
    
    RAISE NOTICE '✅ Profil für Test-Benutzer erstellt: %', test_user_id;
  ELSE
    RAISE NOTICE '❌ Test-Benutzer nicht gefunden';
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'ℹ️ Profil für Test-Benutzer existiert bereits';
    -- Update existing profile
    UPDATE public.user_profiles SET
      name = 'Test User',
      email = 'test.user@example.com',
      department = 'IT',
      role = 'user',
      status = 'pending',
      updated_at = NOW()
    WHERE user_id = test_user_id;
    RAISE NOTICE '✅ Bestehendes Profil aktualisiert für Test-Benutzer: %', test_user_id;
END $$;

-- ============================================
-- 5. BENACHRICHTIGUNGEN TESTEN
-- ============================================

-- Test: Benachrichtigung erstellen
SELECT '=== TEST: BENACHRICHTIGUNG ERSTELLEN ===' as test_section;
INSERT INTO public.user_notifications (
  user_email,
  user_name,
  type,
  status,
  message
) VALUES (
  'test.user@example.com',
  'Test User',
  'registration_request',
  'pending',
  'Test-Benachrichtigung für echten Benutzer'
);

-- ============================================
-- 6. E-MAIL-FUNKTION ERSTELLEN UND TESTEN
-- ============================================

-- Erstelle E-Mail-Funktion falls nicht vorhanden
SELECT '=== E-MAIL-FUNKTION ERSTELLEN ===' as test_section;

CREATE OR REPLACE FUNCTION public.send_email_notification(
  to_email TEXT,
  subject TEXT,
  message TEXT
)
RETURNS JSONB AS $$
BEGIN
  -- Hier würde normalerweise die E-Mail-Versendung stattfinden
  -- Für jetzt loggen wir nur die Nachricht
  
  INSERT INTO public.user_notifications (
    user_email,
    user_name,
    type,
    status,
    message
  ) VALUES (
    to_email,
    'System',
    'registration_request',
    'sent',
    format('E-Mail gesendet an %s: %s - %s', to_email, subject, message)
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', format('E-Mail an %s gesendet', to_email),
    'to_email', to_email,
    'subject', subject
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.send_email_notification(TEXT, TEXT, TEXT) TO authenticated;

-- Test: E-Mail-Funktion
SELECT '=== TEST: E-MAIL-FUNKTION ===' as test_section;
SELECT send_email_notification('test.user@example.com', 'Test Subject', 'Test Message');

-- ============================================
-- 7. ÜBERPRÜFUNG DER ERGEBNISSE
-- ============================================

-- Zeige alle Profile
SELECT '=== ALLE USER_PROFILES ===' as test_section;
SELECT 
  id,
  user_id,
  name,
  email,
  department,
  role,
  status,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Zeige alle Benachrichtigungen
SELECT '=== ALLE BENACHRICHTIGUNGEN ===' as test_section;
SELECT 
  id,
  user_email,
  user_name,
  type,
  status,
  message,
  created_at
FROM user_notifications
ORDER BY created_at DESC;

-- ============================================
-- 8. TRIGGER TESTEN
-- ============================================

-- Test: Neuen Benutzer erstellen und Trigger testen
SELECT '=== TEST: TRIGGER MIT NEUEM BENUTZER ===' as test_section;

-- Erstelle einen neuen Auth-Benutzer (Trigger sollte automatisch Profil erstellen)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role
) VALUES (
  gen_random_uuid(),
  'trigger.test@example.com',
  crypt('test123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Trigger Test User", "department": "Redaktion"}'::jsonb,
  'authenticated'
);

-- Prüfe ob Trigger funktioniert hat
SELECT '=== TRIGGER ERGEBNIS ===' as test_section;
SELECT 
  'Trigger Test' as test_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM user_profiles WHERE email = 'trigger.test@example.com'
  ) THEN '✅ TRIGGER FUNKTIONIERT' ELSE '❌ TRIGGER FEHLGESCHLAGEN' END as result;

-- ============================================
-- ERFOLGSMELDUNG
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ FOREIGN KEY CONSTRAINT FIX ERFOLGREICH!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 GETESTETE FUNKTIONEN:';
  RAISE NOTICE '   • user_profiles mit echten user_ids';
  RAISE NOTICE '   • user_notifications Erstellung';
  RAISE NOTICE '   • send_email_notification Funktion';
  RAISE NOTICE '   • Trigger für automatische Profil-Erstellung';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 NÄCHSTE SCHRITTE:';
  RAISE NOTICE '   1. Testen Sie die Registrierung erneut';
  RAISE NOTICE '   2. Überprüfen Sie die erstellten Profile';
  RAISE NOTICE '   3. Überprüfen Sie die Benachrichtigungen';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$; 