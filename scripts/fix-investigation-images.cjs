const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const { join } = require("path");

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

// Supabase Client erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase Umgebungsvariablen nicht gefunden");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixInvestigationImages() {
  console.log("🔧 Behebe investigation_images Tabelle...");
  console.log("==========================================");

  try {
    // 1. Authentifiziere als Super-Admin
    console.log("📋 1. Authentifiziere als Super-Admin...");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "ptlsweb@gmail.com",
        password: process.env.SUPABASE_ADMIN_PASSWORD || "test123",
      });

    if (authError) {
      console.error("❌ Authentifizierungsfehler:", authError);
      return false;
    }

    console.log("✅ Authentifiziert als:", authData.user.email);

    // 2. Lösche existierende Tabelle falls vorhanden
    console.log("📋 2. Lösche existierende investigation_images Tabelle...");

    const { error: dropError } = await supabase.rpc("exec_sql", {
      sql: "DROP TABLE IF EXISTS public.investigation_images CASCADE;",
    });

    if (dropError) {
      console.log(
        "⚠️ Konnte Tabelle nicht löschen (möglicherweise nicht vorhanden):",
        dropError.message,
      );
    } else {
      console.log("✅ Existierende Tabelle gelöscht");
    }

    // 3. Erstelle die Tabelle neu
    console.log("📋 3. Erstelle investigation_images Tabelle...");

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.investigation_images (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
        file_name VARCHAR(500) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        width INTEGER,
        height INTEGER,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        tags TEXT[] DEFAULT '{}',
        description TEXT,
        is_primary BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: createTableError } = await supabase.rpc("exec_sql", {
      sql: createTableSQL,
    });

    if (createTableError) {
      console.error("❌ Fehler beim Erstellen der Tabelle:", createTableError);
      return false;
    }

    console.log("✅ Tabelle erstellt");

    // 4. Erstelle Indexe
    console.log("📋 4. Erstelle Indexe...");

    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_investigation_images_investigation_id ON public.investigation_images(investigation_id);
      CREATE INDEX IF NOT EXISTS idx_investigation_images_uploaded_at ON public.investigation_images(uploaded_at DESC);
      CREATE INDEX IF NOT EXISTS idx_investigation_images_is_primary ON public.investigation_images(is_primary);
      CREATE INDEX IF NOT EXISTS idx_investigation_images_is_public ON public.investigation_images(is_public);
      CREATE INDEX IF NOT EXISTS idx_investigation_images_uploaded_by ON public.investigation_images(uploaded_by);
    `;

    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: indexSQL,
    });

    if (indexError) {
      console.error("❌ Fehler beim Erstellen der Indexe:", indexError);
    } else {
      console.log("✅ Indexe erstellt");
    }

    // 5. Aktiviere RLS
    console.log("📋 5. Aktiviere Row Level Security...");

    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE public.investigation_images ENABLE ROW LEVEL SECURITY;",
    });

    if (rlsError) {
      console.error("❌ Fehler beim Aktivieren von RLS:", rlsError);
    } else {
      console.log("✅ RLS aktiviert");
    }

    // 6. Erstelle RLS Policies
    console.log("📋 6. Erstelle RLS Policies...");

    const policiesSQL = `
      DROP POLICY IF EXISTS "Public can view public investigation images" ON public.investigation_images;
      DROP POLICY IF EXISTS "Authenticated users can view all investigation images" ON public.investigation_images;
      DROP POLICY IF EXISTS "Authenticated users can insert investigation images" ON public.investigation_images;
      DROP POLICY IF EXISTS "Users can update their own investigation images" ON public.investigation_images;
      DROP POLICY IF EXISTS "Admins can update all investigation images" ON public.investigation_images;
      DROP POLICY IF EXISTS "Users can delete their own investigation images" ON public.investigation_images;
      DROP POLICY IF EXISTS "Admins can delete all investigation images" ON public.investigation_images;

      CREATE POLICY "Public can view public investigation images" ON public.investigation_images
      FOR SELECT USING (is_public = true);

      CREATE POLICY "Authenticated users can view all investigation images" ON public.investigation_images
      FOR SELECT USING (auth.role() = 'authenticated');

      CREATE POLICY "Authenticated users can insert investigation images" ON public.investigation_images
      FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        uploaded_by = auth.uid()
      );

      CREATE POLICY "Users can update their own investigation images" ON public.investigation_images
      FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        uploaded_by = auth.uid()
      );

      CREATE POLICY "Admins can update all investigation images" ON public.investigation_images
      FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );

      CREATE POLICY "Users can delete their own investigation images" ON public.investigation_images
      FOR DELETE USING (
        auth.role() = 'authenticated' AND
        uploaded_by = auth.uid()
      );

      CREATE POLICY "Admins can delete all investigation images" ON public.investigation_images
      FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
    `;

    const { error: policiesError } = await supabase.rpc("exec_sql", {
      sql: policiesSQL,
    });

    if (policiesError) {
      console.error("❌ Fehler beim Erstellen der Policies:", policiesError);
    } else {
      console.log("✅ RLS Policies erstellt");
    }

    // 7. Teste die Tabelle
    console.log("📋 7. Teste die Tabelle...");

    const { data: testData, error: testError } = await supabase
      .from("investigation_images")
      .select("id")
      .limit(1);

    if (testError) {
      console.error("❌ Fehler beim Testen der Tabelle:", testError);
      return false;
    }

    console.log("✅ Tabelle funktioniert korrekt");

    console.log("");
    console.log("🎉 investigation_images Tabelle erfolgreich erstellt!");
    console.log("✅ Tabelle existiert und ist funktionsfähig");
    console.log("✅ RLS ist aktiviert");
    console.log("✅ Policies sind konfiguriert");
    console.log("✅ Indexe sind erstellt");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Beheben der Tabelle:", error);
    return false;
  }
}

// Führe Fix aus
fixInvestigationImages()
  .then((success) => {
    if (success) {
      console.log("✅ Fix erfolgreich abgeschlossen");
    } else {
      console.log("❌ Fix fehlgeschlagen");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error);
    process.exit(1);
  });
