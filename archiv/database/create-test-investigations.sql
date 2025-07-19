-- Test-Fahndungen erstellen
-- Führe das in Supabase SQL Editor aus

-- 1. RLS temporär deaktivieren für Test-Daten
ALTER TABLE public.investigations DISABLE ROW LEVEL SECURITY;

-- 2. Bestehende Test-Fahndungen löschen (falls vorhanden)
DELETE FROM public.investigations WHERE title LIKE 'Test-Fahndung%';

-- 3. Test-Fahndungen erstellen
INSERT INTO public.investigations (
  id,
  title,
  description,
  status,
  priority,
  category,
  location,
  station,
  contact_info,
  features,
  tags,
  metadata,
  created_at,
  updated_at
) VALUES 
(
  '25a820e9-3806-4e62-a208-44dec5edfa91',
  'Unfallflucht auf der A1',
  'Ein Fahrzeugflucht nach einem Verkehrsunfall auf der Autobahn A1. Zeugen gesucht.',
  'active',
  'high',
  'WANTED_PERSON',
  'Autobahn A1, Hamburg',
  'Polizei Hamburg',
  '{"phone": "040-123456", "email": "verkehr@polizei.hamburg.de"}',
  'Fahrzeug: Silberner BMW, Kennzeichen HH-AB-1234',
  ARRAY['verkehr', 'unfall', 'flucht'],
  '{"witnesses": 2, "damage": "high"}',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Vermisste Person - Maria Schmidt',
  'Maria Schmidt wurde zuletzt am 15. Juli 2024 gesehen. Familienangehörige sind besorgt.',
  'active',
  'urgent',
  'MISSING_PERSON',
  'Hamburg, Stadtteil Eimsbüttel',
  'Polizei Hamburg',
  '{"phone": "040-654321", "email": "vermisst@polizei.hamburg.de"}',
  'Alter: 28 Jahre, Größe: 1.65m, Haarfarbe: braun',
  ARRAY['vermisst', 'person', 'familie'],
  '{"last_seen": "2024-07-15", "concern_level": "high"}',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Diebstahl von Elektronik',
  'Einbruch in ein Elektronikgeschäft. Wertsachen im Wert von 50.000€ gestohlen.',
  'active',
  'medium',
  'STOLEN_GOODS',
  'Hamburg, Mönckebergstraße',
  'Polizei Hamburg',
  '{"phone": "040-789012", "email": "diebstahl@polizei.hamburg.de"}',
  'Gestohlene Ware: Laptops, Smartphones, Tablets',
  ARRAY['diebstahl', 'elektronik', 'einbruch'],
  '{"value": 50000, "items": ["laptops", "smartphones", "tablets"]}',
  NOW(),
  NOW()
);

-- 4. RLS wieder aktivieren
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

-- 5. Bestätigung
SELECT 
  'Test-Fahndungen erstellt' as status,
  COUNT(*) as total_investigations,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_investigations,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
FROM public.investigations 
WHERE title LIKE 'Test-Fahndung%' OR title LIKE 'Vermisste Person%' OR title LIKE 'Diebstahl%'; 