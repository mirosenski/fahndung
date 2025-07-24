-- 🔧 FIX FÜR FUNKTION DATA TYPE MISMATCHES
-- Führen Sie dieses Script in Ihrem Supabase SQL Editor aus

-- ============================================
-- 1. ÜBERPRÜFUNG DER TABELLEN-STRUKTUR
-- ============================================

-- Zeige die aktuelle Struktur der user_profiles Tabelle
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 2. FUNKTIONEN MIT KORREKTEN DATA TYPES ERSTELLEN
-- ============================================

-- Funktion zum Abrufen aller ausstehenden Registrierungen (FIXED)
CREATE OR REPLACE FUNCTION public.get_pending_registrations()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  department VARCHAR(255),
  phone VARCHAR(255),
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
  target_email VARCHAR(255), 
  approved BOOLEAN,
  admin_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  updated_count INT;
  user_name VARCHAR(255);
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
GRANT EXECUTE ON FUNCTION public.approve_user(VARCHAR(255), BOOLEAN, TEXT) TO authenticated;

-- ============================================
-- 4. TEST DER FUNKTIONEN
-- ============================================

-- Test 1: Ausstehende Registrierungen
SELECT '=== TEST: AUSSTEHENDE REGISTRIERUNGEN ===' as test_section;
SELECT * FROM get_pending_registrations();

-- Test 2: Benutzer-Statistiken
SELECT '=== TEST: BENUTZER-STATISTIKEN ===' as test_section;
SELECT get_user_statistics();

-- Test 3: Alle Benutzer anzeigen
SELECT '=== TEST: ALLE BENUTZER ===' as test_section;
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
-- 5. ÜBERPRÜFUNG DER FUNKTIONEN
-- ============================================

-- Zeige alle verfügbaren Funktionen
SELECT 
  'Verfügbare Funktionen:' as info;
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('get_pending_registrations', 'get_user_statistics', 'approve_user')
ORDER BY proname;

-- ============================================
-- ERFOLGSMELDUNG
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ FUNKTION DATA TYPE FIX ERFOLGREICH!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 KORRIGIERTE FUNKTIONEN:';
  RAISE NOTICE '   • get_pending_registrations() - VARCHAR(255) statt TEXT';
  RAISE NOTICE '   • approve_user() - VARCHAR(255) Parameter';
  RAISE NOTICE '   • get_user_statistics() - Unverändert';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 NÄCHSTE SCHRITTE:';
  RAISE NOTICE '   1. Testen Sie die Funktionen erneut';
  RAISE NOTICE '   2. Verwenden Sie die Admin-Funktionen';
  RAISE NOTICE '   3. Überwachen Sie die Registrierungen';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$; 