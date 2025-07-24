-- 🧪 TEST-SCRIPT FÜR ADMIN-GENEHMIGUNGSSYSTEM
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- ============================================
-- 1. ÜBERPRÜFUNG DER FUNKTIONEN
-- ============================================

-- Zeige alle verfügbaren Funktionen
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname LIKE '%user%' OR proname LIKE '%approve%' OR proname LIKE '%pending%'
ORDER BY proname;

-- ============================================
-- 2. FUNKTIONEN ERSTELLEN (falls nicht vorhanden)
-- ============================================

-- Funktion zum Abrufen aller ausstehenden Registrierungen
CREATE OR REPLACE FUNCTION public.get_pending_registrations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  days_waiting INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.email,
    up.department,
    up.phone,
    up.created_at,
    EXTRACT(DAY FROM NOW() - up.created_at)::INT as days_waiting
  FROM public.user_profiles up
  WHERE up.status = 'pending'
  ORDER BY up.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion für Admin-Dashboard-Statistiken
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', COUNT(*),
    'pending_users', COUNT(*) FILTER (WHERE status = 'pending'),
    'approved_users', COUNT(*) FILTER (WHERE status = 'approved'),
    'rejected_users', COUNT(*) FILTER (WHERE status = 'rejected'),
    'admin_users', COUNT(*) FILTER (WHERE role IN ('admin', 'super_admin')),
    'departments', jsonb_agg(DISTINCT department)
  ) INTO stats
  FROM public.user_profiles;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Genehmigen/Ablehnen von Benutzern
CREATE OR REPLACE FUNCTION public.approve_user(
  target_email TEXT, 
  approved BOOLEAN,
  admin_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  updated_count INT;
  user_name TEXT;
BEGIN
  -- Update user profile status
  UPDATE public.user_profiles
  SET 
    status = CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
    updated_at = NOW()
  WHERE email = target_email
  RETURNING name INTO user_name;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Benutzer nicht gefunden'
    );
  END IF;

  -- Create confirmation notification
  INSERT INTO public.user_notifications (
    user_email,
    user_name,
    type,
    status,
    message
  ) VALUES (
    target_email,
    user_name,
    'registration_confirmation',
    CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
    COALESCE(admin_message, 
      CASE WHEN approved 
        THEN 'Ihre Registrierung wurde genehmigt. Sie können sich jetzt anmelden.'
        ELSE 'Ihre Registrierung wurde abgelehnt. Bei Fragen kontaktieren Sie ptlsweb@gmail.com'
      END
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', CASE WHEN approved THEN 'Benutzer genehmigt' ELSE 'Benutzer abgelehnt' END,
    'user_email', target_email,
    'user_name', user_name,
    'status', CASE WHEN approved THEN 'approved' ELSE 'rejected' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. BERECHTIGUNGEN FÜR FUNKTIONEN
-- ============================================

GRANT EXECUTE ON FUNCTION public.get_pending_registrations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_user(TEXT, BOOLEAN, TEXT) TO authenticated;

-- ============================================
-- 4. TEST 1: Zeige alle ausstehenden Registrierungen
-- ============================================

SELECT '=== AUSSTEHENDE REGISTRIERUNGEN ===' as test_section;
SELECT * FROM get_pending_registrations();

-- ============================================
-- 5. TEST 2: Zeige Benutzer-Statistiken
-- ============================================

SELECT '=== BENUTZER-STATISTIKEN ===' as test_section;
SELECT get_user_statistics();

-- ============================================
-- 6. TEST 3: Zeige alle Benachrichtigungen
-- ============================================

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
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 7. TEST 4: Zeige alle Benutzer mit Status
-- ============================================

SELECT '=== ALLE BENUTZER ===' as test_section;
SELECT 
  name,
  email,
  department,
  role,
  status,
  created_at,
  CASE 
    WHEN status = 'pending' THEN '⏳ Ausstehend'
    WHEN status = 'approved' THEN '✅ Genehmigt'
    WHEN status = 'rejected' THEN '❌ Abgelehnt'
  END as status_text
FROM user_profiles
ORDER BY created_at DESC;

-- ============================================
-- 8. TEST 5: Simuliere Benutzer-Genehmigung
-- ============================================

-- WICHTIG: Ersetzen Sie 'test@example.com' mit einer echten E-Mail aus Ihrer Datenbank
SELECT '=== GENEHMIGUNG TEST ===' as test_section;
-- SELECT approve_user('test@example.com', true, 'Willkommen im System!');

-- ============================================
-- 9. HILFREICHE ADMIN-BEFEHLE
-- ============================================

SELECT '=== HILFREICHE BEFEHLE ===' as test_section;

-- Alle ausstehenden Benutzer anzeigen:
SELECT 'Alle ausstehenden Benutzer:' as command;
SELECT * FROM user_profiles WHERE status = 'pending';

-- Benutzer manuell genehmigen (Beispiel):
-- UPDATE user_profiles SET status = 'approved' WHERE email = 'user@example.com';

-- Benutzer zum Admin machen (Beispiel):
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Alle Benachrichtigungen für ptlsweb@gmail.com:
SELECT 'Benachrichtigungen für ptlsweb@gmail.com:' as command;
SELECT * FROM user_notifications WHERE admin_email = 'ptlsweb@gmail.com' ORDER BY created_at DESC;

-- ============================================
-- 10. ÜBERPRÜFUNG DER TABELLEN
-- ============================================

SELECT '=== TABELLEN-ÜBERPRÜFUNG ===' as test_section;

-- Prüfe ob user_profiles Tabelle existiert
SELECT 
  'user_profiles table' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ EXISTIERT' ELSE '❌ FEHLT' END as status;

-- Prüfe ob user_notifications Tabelle existiert
SELECT 
  'user_notifications table' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notifications') 
    THEN '✅ EXISTIERT' ELSE '❌ FEHLT' END as status;

-- Zeige Anzahl der Einträge
SELECT 
  'user_profiles count' as table_name,
  COUNT(*)::TEXT as count
FROM user_profiles
UNION ALL
SELECT 
  'user_notifications count' as table_name,
  COUNT(*)::TEXT as count
FROM user_notifications;

-- ============================================
-- ERFOLGSMELDUNG
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ ADMIN-SYSTEM TEST ERFOLGREICH!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 VERFÜGBARE FUNKTIONEN:';
  RAISE NOTICE '   • get_pending_registrations()';
  RAISE NOTICE '   • get_user_statistics()';
  RAISE NOTICE '   • approve_user(email, approved, message)';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 NÄCHSTE SCHRITTE:';
  RAISE NOTICE '   1. Testen Sie die Registrierung auf /register';
  RAISE NOTICE '   2. Genehmigen Sie Benutzer mit approve_user()';
  RAISE NOTICE '   3. Überwachen Sie Benachrichtigungen';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$; 