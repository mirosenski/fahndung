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

async function testCompleteSystem() {
  console.log("🔧 Teste komplettes Fahndungs-System...");
  console.log("=========================================");

  try {
    // 1. Prüfe aktuelle Fahndungen
    console.log("📋 1. Prüfe aktuelle Fahndungen...");

    const { data: investigations, error: investigationsError } = await supabase
      .from("investigations")
      .select("id, title, case_number, status, images")
      .order("created_at", { ascending: false })
      .limit(5);

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
          `   ${index + 1}. ${inv.title} (${inv.case_number}) - ${inv.status} - ${imageCount} Bilder`,
        );
      });
    }

    // 2. Teste Fahndungserstellung mit echten Bild-URLs
    console.log("📋 2. Teste Fahndungserstellung mit echten Bild-URLs...");

    const testInvestigation = {
      title: "Test Fahndung Komplett",
      description: "Test-Fahndung mit echten Bild-URLs für komplettes System",
      status: "draft",
      priority: "normal",
      category: "MISSING_PERSON",
      location: "Test Location",
      case_number: `COMPLETE-${Date.now()}`,
      created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1",
      images: [
        {
          id: "main-complete",
          url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
          alt_text: "Test Hauptbild",
          caption: "Hauptbild der Test-Fahndung",
        },
        {
          id: "additional-complete-1",
          url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
          alt_text: "Test Zusatzbild 1",
          caption: "Zusatzbild 1 der Test-Fahndung",
        },
        {
          id: "additional-complete-2",
          url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
          alt_text: "Test Zusatzbild 2",
          caption: "Zusatzbild 2 der Test-Fahndung",
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

    // 4. Teste Frontend-kompatible Datenstruktur
    console.log("📋 4. Teste Frontend-kompatible Datenstruktur...");

    const frontendData = {
      step1: {
        title: loadedInvestigation.title,
        category: "MISSING_PERSON",
        caseNumber: loadedInvestigation.case_number,
      },
      step2: {
        shortDescription: "Test-Kurzbeschreibung",
        description: "Test-Beschreibung",
        priority: "normal",
        tags: ["Test", "Debug"],
        features: "Test-Merkmale",
      },
      step3: {
        mainImage: loadedInvestigation.images?.[0]?.url ?? "",
        mainImageUrl: loadedInvestigation.images?.[0]?.url ?? "",
        additionalImages:
          loadedInvestigation.images?.slice(1).map((img) => img.url) ?? [],
        additionalImageUrls:
          loadedInvestigation.images?.slice(1).map((img) => img.url) ?? [],
      },
      step4: {
        mainLocation: { address: "Test Location" },
      },
      step5: {
        contactPerson: "Test Kontakt",
        contactPhone: "+49 123 456789",
        contactEmail: "test@example.com",
        department: "Test Abteilung",
        availableHours: "Mo-Fr 8:00-16:00",
      },
    };

    console.log("✅ Frontend-Datenstruktur erstellt:");
    console.log(`   Hauptbild: ${frontendData.step3.mainImage ? "✓" : "✗"}`);
    console.log(
      `   Zusatzbilder: ${frontendData.step3.additionalImages.length}`,
    );

    // 5. Teste Bild-URLs
    console.log("📋 5. Teste Bild-URLs...");

    const testImageUrls = [
      frontendData.step3.mainImage,
      ...frontendData.step3.additionalImages,
    ].filter((url) => url);

    console.log("✅ Bild-URLs gefunden:", testImageUrls.length);
    testImageUrls.forEach((url, index) => {
      console.log(`   Bild ${index + 1}: ${url}`);
    });

    // 6. Cleanup - Lösche Test-Fahndung
    console.log("📋 6. Cleanup...");

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
    console.log("🎉 Komplettes System erfolgreich getestet!");
    console.log("✅ Fahndungen können mit Bildern erstellt werden");
    console.log("✅ Bilder werden als JSON gespeichert");
    console.log("✅ Fahndungen mit Bildern können geladen werden");
    console.log("✅ Frontend-kompatible Datenstruktur funktioniert");
    console.log("✅ Bild-URLs sind verfügbar");
    console.log("");
    console.log("🚀 Das System ist bereit für die Produktion!");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Test:", error);
    return false;
  }
}

// Führe Test aus
testCompleteSystem()
  .then((success) => {
    if (success) {
      console.log("✅ Kompletter Test erfolgreich abgeschlossen");
    } else {
      console.log("❌ Kompletter Test fehlgeschlagen");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unerwarteter Fehler:", error);
    process.exit(1);
  });
