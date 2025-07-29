const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const { join, dirname } = require("path");
const { fileURLToPath } = require("url");

const __dirname = dirname(__filename);

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

async function debugFahndungCreation() {
  console.log("🔧 Debug Fahndungserstellung...");
  console.log("==================================");

  try {
    // 1. Prüfe aktuelle Fahndungen
    console.log("📋 1. Prüfe aktuelle Fahndungen...");

    const { data: investigations, error: investigationsError } = await supabase
      .from("investigations")
      .select("id, title, case_number, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5);

    if (investigationsError) {
      console.error(
        "❌ Fehler beim Laden der Fahndungen:",
        investigationsError,
      );
      return false;
    }

    console.log("✅ Aktuelle Fahndungen:", investigations?.length ?? 0);
    if (investigations && investigations.length > 0) {
      investigations.forEach((inv, index) => {
        console.log(
          `   ${index + 1}. ${inv.title} (${inv.case_number}) - ${inv.status}`,
        );
      });
    }

    // 2. Prüfe investigation_images
    console.log("📋 2. Prüfe investigation_images...");

    const { data: images, error: imagesError } = await supabase
      .from("investigation_images")
      .select("id, investigation_id, file_name, is_primary, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (imagesError) {
      console.error("❌ Fehler beim Laden der Bilder:", imagesError);
      return false;
    }

    console.log("✅ Bilder in investigation_images:", images?.length ?? 0);
    if (images && images.length > 0) {
      images.forEach((img, index) => {
        console.log(
          `   ${index + 1}. ${img.file_name} (${img.is_primary ? "Hauptbild" : "Zusatzbild"})`,
        );
      });
    }

    // 3. Prüfe Verbindung zwischen Fahndungen und Bildern
    console.log("📋 3. Prüfe Verbindung zwischen Fahndungen und Bildern...");

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
      .order("created_at", { ascending: false })
      .limit(3);

    if (joinedError) {
      console.error("❌ Fehler beim Laden der verbundenen Daten:", joinedError);
      return false;
    }

    console.log("✅ Verbundene Daten:");
    if (joinedData && joinedData.length > 0) {
      joinedData.forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.title} (${inv.case_number})`);
        if (inv.images && inv.images.length > 0) {
          inv.images.forEach((img, imgIndex) => {
            console.log(
              `      Bild ${imgIndex + 1}: ${img.file_name} (${img.is_primary ? "Hauptbild" : "Zusatzbild"})`,
            );
          });
        } else {
          console.log(`      Keine Bilder gefunden`);
        }
      });
    }

    // 4. Teste Fahndungserstellung
    console.log("📋 4. Teste Fahndungserstellung...");

    const testInvestigation = {
      title: "Test Fahndung Debug",
      description: "Test-Fahndung für Debug-Zwecke",
      status: "draft",
      priority: "normal",
      category: "MISSING_PERSON",
      location: "Test Location",
      case_number: `DEBUG-${Date.now()}`,
      created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1",
    };

    const { data: newInvestigation, error: createError } = await supabase
      .from("investigations")
      .insert(testInvestigation)
      .select("id, title, case_number")
      .single();

    if (createError) {
      console.error("❌ Fehler beim Erstellen der Test-Fahndung:", createError);
      return false;
    }

    console.log("✅ Test-Fahndung erstellt:", newInvestigation.title);

    // 5. Teste Bild-Upload
    console.log("📋 5. Teste Bild-Upload...");

    const testImageData = {
      investigation_id: newInvestigation.id,
      file_name: "test-debug-image.jpg",
      original_name: "test-debug-image.jpg",
      file_path: "fahndungen/test/test-debug-image.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      uploaded_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1",
      is_primary: true,
      is_public: true,
      description: "Test-Bild für Debug",
    };

    const { data: newImage, error: imageError } = await supabase
      .from("investigation_images")
      .insert(testImageData)
      .select("id, file_name, investigation_id")
      .single();

    if (imageError) {
      console.error("❌ Fehler beim Erstellen des Test-Bildes:", imageError);
      return false;
    }

    console.log("✅ Test-Bild erstellt:", newImage.file_name);

    // 6. Prüfe erneut die verbundenen Daten
    console.log("📋 6. Prüfe erneut die verbundenen Daten...");

    const { data: finalData, error: finalError } = await supabase
      .from("investigations")
      .select(
        `
        id,
        title,
        case_number,
        images:investigation_images(id, file_name, is_primary)
      `,
      )
      .eq("id", newInvestigation.id)
      .single();

    if (finalError) {
      console.error("❌ Fehler beim Laden der finalen Daten:", finalError);
      return false;
    }

    console.log("✅ Finale Daten für Test-Fahndung:");
    console.log(`   Titel: ${finalData.title}`);
    console.log(`   Bilder: ${finalData.images?.length ?? 0}`);
    if (finalData.images && finalData.images.length > 0) {
      finalData.images.forEach((img, index) => {
        console.log(
          `      Bild ${index + 1}: ${img.file_name} (${img.is_primary ? "Hauptbild" : "Zusatzbild"})`,
        );
      });
    }

    // 7. Cleanup - Lösche Test-Daten
    console.log("📋 7. Cleanup...");

    const { error: deleteImageError } = await supabase
      .from("investigation_images")
      .delete()
      .eq("id", newImage.id);

    if (deleteImageError) {
      console.error(
        "⚠️ Warnung: Konnte Test-Bild nicht löschen:",
        deleteImageError,
      );
    } else {
      console.log("✅ Test-Bild gelöscht");
    }

    const { error: deleteInvestigationError } = await supabase
      .from("investigations")
      .delete()
      .eq("id", newInvestigation.id);

    if (deleteInvestigationError) {
      console.error(
        "⚠️ Warnung: Konnte Test-Fahndung nicht löschen:",
        deleteInvestigationError,
      );
    } else {
      console.log("✅ Test-Fahndung gelöscht");
    }

    console.log("");
    console.log("🎉 Debug abgeschlossen!");
    console.log("✅ Datenbankstruktur funktioniert korrekt");
    console.log("✅ Fahndungen können erstellt werden");
    console.log("✅ Bilder können hinzugefügt werden");
    console.log("✅ Verbindung zwischen Fahndungen und Bildern funktioniert");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Debug:", error);
    return false;
  }
}

// Führe Debug aus
debugFahndungCreation()
  .then((success) => {
    if (success) {
      console.log("✅ Debug erfolgreich abgeschlossen");
    } else {
      console.log("❌ Debug fehlgeschlagen");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error);
    process.exit(1);
  });
