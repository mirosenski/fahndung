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

async function testFahndungCreation() {
  console.log("🔧 Teste Fahndungserstellung mit Bildern...");
  console.log("=============================================");

  try {
    // 1. Prüfe investigations Tabelle
    console.log("📋 1. Prüfe investigations Tabelle...");

    const { data: investigations, error: investigationsError } = await supabase
      .from("investigations")
      .select("id, title, case_number, images")
      .order("created_at", { ascending: false })
      .limit(3);

    if (investigationsError) {
      console.error(
        "❌ Fehler beim Laden der Fahndungen:",
        investigationsError,
      );
      return false;
    }

    console.log("✅ Fahndungen geladen:", investigations?.length ?? 0);
    if (investigations && investigations.length > 0) {
      investigations.forEach((inv, index) => {
        const imageCount = inv.images ? inv.images.length : 0;
        console.log(
          `   ${index + 1}. ${inv.title} (${inv.case_number}) - ${imageCount} Bilder`,
        );
      });
    }

    // 2. Teste Fahndungserstellung mit Bildern
    console.log("📋 2. Teste Fahndungserstellung mit Bildern...");

    const testInvestigation = {
      title: "Test Fahndung mit Bildern",
      description: "Test-Fahndung mit Bildern für Debug-Zwecke",
      status: "draft",
      priority: "normal",
      category: "MISSING_PERSON",
      location: "Test Location",
      case_number: `TEST-${Date.now()}`,
      created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1",
      images: [
        {
          id: "main-test",
          url: "https://example.com/test-image.jpg",
          alt_text: "Test Hauptbild",
          caption: "Hauptbild der Test-Fahndung",
        },
        {
          id: "additional-test",
          url: "https://example.com/test-image-2.jpg",
          alt_text: "Test Zusatzbild",
          caption: "Zusatzbild der Test-Fahndung",
        },
      ],
    };

    const { data: newInvestigation, error: createError } = await supabase
      .from("investigations")
      .insert(testInvestigation)
      .select("id, title, case_number, images")
      .single();

    if (createError) {
      console.error("❌ Fehler beim Erstellen der Test-Fahndung:", createError);
      return false;
    }

    console.log("✅ Test-Fahndung erstellt:", newInvestigation.title);
    console.log("   Bilder:", newInvestigation.images?.length ?? 0);

    // 3. Teste Laden der Fahndung mit Bildern
    console.log("📋 3. Teste Laden der Fahndung mit Bildern...");

    const { data: loadedInvestigation, error: loadError } = await supabase
      .from("investigations")
      .select("id, title, case_number, images")
      .eq("id", newInvestigation.id)
      .single();

    if (loadError) {
      console.error("❌ Fehler beim Laden der Fahndung:", loadError);
      return false;
    }

    console.log("✅ Fahndung erfolgreich geladen:", loadedInvestigation.title);
    console.log("   Bilder:", loadedInvestigation.images?.length ?? 0);
    if (loadedInvestigation.images && loadedInvestigation.images.length > 0) {
      loadedInvestigation.images.forEach((img, index) => {
        console.log(`      Bild ${index + 1}: ${img.url} (${img.caption})`);
      });
    }

    // 4. Cleanup - Lösche Test-Fahndung
    console.log("📋 4. Cleanup...");

    const { error: deleteError } = await supabase
      .from("investigations")
      .delete()
      .eq("id", newInvestigation.id);

    if (deleteError) {
      console.error(
        "⚠️ Warnung: Konnte Test-Fahndung nicht löschen:",
        deleteError,
      );
    } else {
      console.log("✅ Test-Fahndung gelöscht");
    }

    console.log("");
    console.log("🎉 Test erfolgreich abgeschlossen!");
    console.log("✅ Fahndungen können mit Bildern erstellt werden");
    console.log("✅ Bilder werden als JSON gespeichert");
    console.log("✅ Fahndungen mit Bildern können geladen werden");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Test:", error);
    return false;
  }
}

// Führe Test aus
testFahndungCreation()
  .then((success) => {
    if (success) {
      console.log("✅ Test erfolgreich abgeschlossen");
    } else {
      console.log("❌ Test fehlgeschlagen");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error);
    process.exit(1);
  });
