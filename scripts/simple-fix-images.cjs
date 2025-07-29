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

async function simpleFixImages() {
  console.log("🔧 Einfacher Fix für investigation_images...");
  console.log("=============================================");

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
      console.log(
        "📝 Bitte führe das SQL-Script manuell in der Supabase-Konsole aus:",
      );
      console.log("   scripts/create-investigation-images-table.sql");
      return false;
    }

    console.log("✅ Authentifiziert als:", authData.user.email);

    // 2. Teste ob Tabelle existiert
    console.log("📋 2. Teste ob investigation_images Tabelle existiert...");

    const { data: tableTest, error: tableError } = await supabase
      .from("investigation_images")
      .select("id")
      .limit(1);

    if (tableError) {
      if (tableError.code === "42P01") {
        console.error("❌ investigation_images Tabelle existiert nicht!");
        console.log(
          "📝 Bitte führe das SQL-Script in der Supabase-Konsole aus:",
        );
        console.log("   scripts/create-investigation-images-table.sql");
        return false;
      } else {
        console.error("❌ Fehler beim Testen der Tabelle:", tableError);
        return false;
      }
    }

    console.log("✅ investigation_images Tabelle existiert");

    // 3. Teste INSERT mit authentifiziertem Benutzer
    console.log("📋 3. Teste INSERT mit authentifiziertem Benutzer...");

    // Hole eine existierende Fahndung
    const { data: investigations } = await supabase
      .from("investigations")
      .select("id")
      .limit(1);

    if (!investigations || investigations.length === 0) {
      console.error("❌ Keine Fahndungen gefunden");
      return false;
    }

    const testInvestigationId = investigations[0].id;

    const testImageData = {
      investigation_id: testInvestigationId,
      file_name: "test-simple-fix.jpg",
      original_name: "test-simple-fix.jpg",
      file_path: "fahndungen/test/test-simple-fix.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      uploaded_by: authData.user.id,
      is_primary: true,
      is_public: true,
      description: "Test-Bild für Simple Fix",
    };

    const { data: newImage, error: insertError } = await supabase
      .from("investigation_images")
      .insert(testImageData)
      .select("id, file_name, investigation_id")
      .single();

    if (insertError) {
      console.error("❌ Fehler beim INSERT:", insertError);
      console.log("📝 RLS-Policies sind nicht korrekt konfiguriert");
      console.log("📝 Bitte führe das SQL-Script in der Supabase-Konsole aus:");
      console.log("   scripts/create-investigation-images-table.sql");
      return false;
    }

    console.log("✅ INSERT erfolgreich:", newImage.file_name);

    // 4. Teste SELECT
    console.log("📋 4. Teste SELECT...");

    const { data: selectData, error: selectError } = await supabase
      .from("investigation_images")
      .select("id, file_name, investigation_id")
      .eq("id", newImage.id)
      .single();

    if (selectError) {
      console.error("❌ Fehler beim SELECT:", selectError);
      return false;
    }

    console.log("✅ SELECT erfolgreich:", selectData.file_name);

    // 5. Teste DELETE
    console.log("📋 5. Teste DELETE...");

    const { error: deleteError } = await supabase
      .from("investigation_images")
      .delete()
      .eq("id", newImage.id);

    if (deleteError) {
      console.error("❌ Fehler beim DELETE:", deleteError);
      return false;
    }

    console.log("✅ DELETE erfolgreich");

    // 6. Teste Verbindung mit investigations
    console.log("📋 6. Teste Verbindung mit investigations...");

    const { data: joinedData, error: joinedError } = await supabase
      .from("investigations")
      .select(
        `
        id,
        title,
        case_number,
        images:investigation_images(id, file_name, is_primary)
      `,
      )
      .eq("id", testInvestigationId)
      .single();

    if (joinedError) {
      console.error("❌ Fehler beim Laden der verbundenen Daten:", joinedError);
      return false;
    }

    console.log("✅ Verbindung funktioniert:", joinedData.title);

    console.log("");
    console.log("🎉 investigation_images Tabelle funktioniert korrekt!");
    console.log("✅ Tabelle existiert");
    console.log("✅ RLS-Policies funktionieren");
    console.log("✅ INSERT/SELECT/DELETE funktionieren");
    console.log("✅ Verbindung mit investigations funktioniert");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Simple Fix:", error);
    return false;
  }
}

// Führe Simple Fix aus
simpleFixImages()
  .then((success) => {
    if (success) {
      console.log("✅ Simple Fix erfolgreich abgeschlossen");
    } else {
      console.log("❌ Simple Fix fehlgeschlagen");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error);
    process.exit(1);
  });
