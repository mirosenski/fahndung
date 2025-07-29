// Test-Skript für die verbesserte Aktennummer-Generierung
// Führen Sie dieses Script mit: node scripts/test-case-number-generation.js

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Lade Umgebungsvariablen
dotenv.config({ path: ".env.local" });

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

async function testCaseNumberGeneration() {
  console.log("🔧 Teste verbesserte Aktennummer-Generierung...");
  console.log("================================================");

  try {
    // 1. Teste die aktuelle Aktennummer-Generierung
    console.log("📋 1. Teste Aktennummer-Generierung...");

    const { generateNewCaseNumber } = await import(
      "../src/lib/utils/caseNumberGenerator.ts"
    );

    // Generiere mehrere Aktennummern
    const testNumbers = [];
    for (let i = 0; i < 5; i++) {
      const caseNumber = generateNewCaseNumber("MISSING_PERSON", "draft");
      testNumbers.push(caseNumber);
      console.log(`   Test ${i + 1}: ${caseNumber}`);
    }

    // Prüfe auf Duplikate
    const uniqueNumbers = new Set(testNumbers);
    if (uniqueNumbers.size === testNumbers.length) {
      console.log("✅ Keine Duplikate in den generierten Aktennummern");
    } else {
      console.log("⚠️ Duplikate in den generierten Aktennummern gefunden");
    }

    // 2. Teste Datenbankfunktion für Sequenznummern
    console.log("📋 2. Teste Datenbankfunktion für Sequenznummern...");

    const { data: sequenceData, error: sequenceError } = await supabase.rpc(
      "get_next_case_number_sequence",
      {
        p_year: 2024,
        p_subject: "K",
      },
    );

    if (sequenceError) {
      console.error("❌ Fehler beim Abrufen der Sequenznummer:", sequenceError);
      console.log("📝 Stelle sicher, dass die Datenbankfunktion existiert:");
      console.log("   Führe scripts/check-investigations-schema.sql aus");
    } else {
      console.log("✅ Sequenznummer erfolgreich abgerufen:", sequenceData);
    }

    // 3. Teste Erstellung von Fahndungen mit eindeutigen Aktennummern
    console.log("📋 3. Teste Erstellung von Fahndungen...");

    const testInvestigations = [];
    for (let i = 0; i < 3; i++) {
      const testData = {
        title: `Test Fahndung ${i + 1}`,
        description: `Test-Fahndung für Aktennummer-Test ${i + 1}`,
        status: "draft",
        priority: "normal",
        category: "MISSING_PERSON",
        location: "Test Location",
        created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1", // Fallback User ID
      };

      const { data: investigation, error: createError } = await supabase
        .from("investigations")
        .insert(testData)
        .select("id, title, case_number")
        .single();

      if (createError) {
        console.error(
          `❌ Fehler beim Erstellen der Test-Fahndung ${i + 1}:`,
          createError,
        );
      } else {
        console.log(
          `✅ Test-Fahndung ${i + 1} erstellt:`,
          investigation.case_number,
        );
        testInvestigations.push(investigation);
      }
    }

    // 4. Prüfe auf doppelte Aktennummern in der Datenbank
    console.log("📋 4. Prüfe auf doppelte Aktennummern in der Datenbank...");

    const { data: duplicateCheck, error: duplicateError } = await supabase
      .from("investigations")
      .select("case_number")
      .not("case_number", "is", null);

    if (duplicateError) {
      console.error("❌ Fehler beim Prüfen auf Duplikate:", duplicateError);
    } else {
      const caseNumbers = duplicateCheck.map((inv) => inv.case_number);
      const uniqueCaseNumbers = new Set(caseNumbers);

      if (uniqueCaseNumbers.size === caseNumbers.length) {
        console.log("✅ Keine doppelten Aktennummern in der Datenbank");
      } else {
        console.log("⚠️ Doppelte Aktennummern in der Datenbank gefunden");

        // Zeige Duplikate
        const duplicates = caseNumbers.filter(
          (item, index) => caseNumbers.indexOf(item) !== index,
        );
        console.log("   Duplikate:", duplicates);
      }
    }

    // 5. Cleanup: Lösche Test-Fahndungen
    console.log("📋 5. Cleanup: Lösche Test-Fahndungen...");

    for (const investigation of testInvestigations) {
      const { error: deleteError } = await supabase
        .from("investigations")
        .delete()
        .eq("id", investigation.id);

      if (deleteError) {
        console.error(
          `❌ Fehler beim Löschen der Test-Fahndung ${investigation.id}:`,
          deleteError,
        );
      } else {
        console.log(`✅ Test-Fahndung ${investigation.case_number} gelöscht`);
      }
    }

    console.log("✅ Test erfolgreich abgeschlossen!");
  } catch (error) {
    console.error("❌ Fehler beim Testen:", error);
  }
}

// Führe den Test aus
testCaseNumberGeneration().catch(console.error);
