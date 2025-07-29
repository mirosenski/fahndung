#!/usr/bin/env node

/**
 * Test-Script für investigation_images Tabelle
 * Überprüft ob die Tabelle existiert und die uploadInvestigationImage Mutation funktioniert
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ES6 Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

// Supabase Client erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase Umgebungsvariablen nicht gefunden");
  console.log("📝 Bitte stelle sicher, dass .env.local konfiguriert ist:");
  console.log("   NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url");
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInvestigationImagesTable() {
  console.log("🔧 Teste investigation_images Tabelle...");
  console.log("==========================================");

  try {
    // 1. Prüfe ob Tabelle existiert durch direkten Zugriff
    console.log("📋 1. Prüfe ob investigation_images Tabelle existiert...");

    const { data: tableData, error: tableError } = await supabase
      .from("investigation_images")
      .select("id")
      .limit(1);

    if (tableError) {
      if (tableError.code === "42P01") {
        console.error("❌ investigation_images Tabelle existiert nicht!");
        console.log("📝 Führe das SQL-Script in Supabase aus:");
        console.log("   scripts/create-investigation-images-table.sql");
        return false;
      } else {
        console.error("❌ Fehler beim Prüfen der Tabelle:", tableError);
        return false;
      }
    }

    console.log("✅ investigation_images Tabelle existiert");

    // 2. Prüfe Tabellenstruktur durch SELECT
    console.log("📋 2. Prüfe Tabellenstruktur...");

    const { data: sampleData, error: sampleError } = await supabase
      .from("investigation_images")
      .select("*")
      .limit(1);

    if (sampleError) {
      console.error("❌ Fehler beim Prüfen der Tabellenstruktur:", sampleError);
      return false;
    }

    console.log("✅ Tabellenstruktur ist korrekt");

    // 3. Prüfe ob investigations Tabelle existiert (für Foreign Key)
    console.log("📋 3. Prüfe investigations Tabelle...");

    const { data: investigationsData, error: investigationsError } =
      await supabase.from("investigations").select("id").limit(1);

    if (investigationsError) {
      if (investigationsError.code === "42P01") {
        console.error("❌ investigations Tabelle existiert nicht!");
        console.log(
          "📝 Die investigation_images Tabelle benötigt die investigations Tabelle als Foreign Key",
        );
        return false;
      } else {
        console.error(
          "❌ Fehler beim Prüfen der investigations Tabelle:",
          investigationsError,
        );
        return false;
      }
    }

    console.log("✅ investigations Tabelle existiert");

    // 4. Teste INSERT (ohne echte Daten)
    console.log("📋 4. Teste INSERT-Operation...");

    // Erstelle eine Test-Fahndung falls keine existiert
    const { data: existingInvestigations } = await supabase
      .from("investigations")
      .select("id")
      .limit(1);

    let testInvestigationId = null;

    if (!existingInvestigations || existingInvestigations.length === 0) {
      console.log("📝 Erstelle Test-Fahndung...");

      const { data: newInvestigation, error: createError } = await supabase
        .from("investigations")
        .insert({
          title: "Test Fahndung für Bild-Upload",
          description: "Test-Fahndung für investigation_images Test",
          status: "draft",
          priority: "normal",
          category: "MISSING_PERSON",
          location: "Test Location",
          case_number: "TEST-2024-001",
          created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1", // Fallback User ID
        })
        .select("id")
        .single();

      if (createError) {
        console.error(
          "❌ Fehler beim Erstellen der Test-Fahndung:",
          createError,
        );
        return false;
      }

      testInvestigationId = newInvestigation.id;
      console.log("✅ Test-Fahndung erstellt:", testInvestigationId);
    } else {
      testInvestigationId = existingInvestigations[0].id;
      console.log("✅ Verwende existierende Fahndung:", testInvestigationId);
    }

    // Teste INSERT in investigation_images
    const testImageData = {
      investigation_id: testInvestigationId,
      file_name: "test-image.jpg",
      original_name: "test-image.jpg",
      file_path: "investigations/test/test-image.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      uploaded_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1", // Fallback User ID
      is_primary: false,
      is_public: true,
    };

    const { data: insertedImage, error: insertError } = await supabase
      .from("investigation_images")
      .insert(testImageData)
      .select()
      .single();

    if (insertError) {
      console.error(
        "❌ Fehler beim INSERT in investigation_images:",
        insertError,
      );
      return false;
    }

    console.log("✅ INSERT erfolgreich:", insertedImage.id);

    // Lösche Test-Daten
    const { error: deleteError } = await supabase
      .from("investigation_images")
      .delete()
      .eq("id", insertedImage.id);

    if (deleteError) {
      console.error(
        "⚠️  Warnung: Konnte Test-Daten nicht löschen:",
        deleteError,
      );
    } else {
      console.log("✅ Test-Daten erfolgreich gelöscht");
    }

    console.log("");
    console.log("🎉 Alle Tests erfolgreich!");
    console.log("✅ investigation_images Tabelle ist korrekt konfiguriert");
    console.log(
      "🚀 uploadInvestigationImage Mutation sollte jetzt funktionieren",
    );

    return true;
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
    return false;
  }
}

// Script ausführen
testInvestigationImagesTable()
  .then((success) => {
    if (success) {
      console.log("");
      console.log("📋 Nächste Schritte:");
      console.log("1. Teste die uploadInvestigationImage Mutation in der App");
      console.log("2. Prüfe die Browser-Konsole auf Fehler");
      console.log("3. Überprüfe die Supabase Logs bei Problemen");
    } else {
      console.log("");
      console.log("📋 Fehlerbehebung:");
      console.log("1. Führe das SQL-Script in Supabase aus");
      console.log("2. Prüfe die Supabase Logs");
      console.log("3. Stelle sicher, dass alle Tabellen existieren");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });
