#!/usr/bin/env node

/**
 * Test-Script für investigation_images Tabelle mit authentifiziertem Super-Admin
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

async function testInvestigationImagesTableWithAuth() {
  console.log("🔧 Teste investigation_images Tabelle mit Super-Admin Auth...");
  console.log("============================================================");

  try {
    // 1. Authentifiziere als Super-Admin
    console.log("📋 1. Authentifiziere als Super-Admin...");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "ptlsweb@gmail.com",
        password: "Heute-2025!sp",
      });

    if (authError) {
      console.error("❌ Authentifizierung fehlgeschlagen:", authError);
      return false;
    }

    if (!authData.user) {
      console.error("❌ Kein Benutzer nach Authentifizierung gefunden");
      return false;
    }

    console.log("✅ Authentifizierung erfolgreich als:", authData.user.email);
    console.log("👤 User ID:", authData.user.id);

    // 2. Prüfe Benutzerrolle
    console.log("📋 2. Prüfe Benutzerrolle...");

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("role, name")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      console.error(
        "❌ Fehler beim Abrufen des Benutzerprofils:",
        profileError,
      );
      return false;
    }

    console.log("✅ Benutzerrolle:", profileData.role);
    console.log("👤 Name:", profileData.name);

    // 3. Prüfe ob Tabelle existiert
    console.log("📋 3. Prüfe ob investigation_images Tabelle existiert...");

    const { data: tableData, error: tableError } = await supabase
      .from("investigation_images")
      .select("id")
      .limit(1);

    if (tableError) {
      if (tableError.code === "42P01") {
        console.error("❌ investigation_images Tabelle existiert nicht!");
        return false;
      } else {
        console.error("❌ Fehler beim Prüfen der Tabelle:", tableError);
        return false;
      }
    }

    console.log("✅ investigation_images Tabelle existiert");

    // 4. Prüfe investigations Tabelle
    console.log("📋 4. Prüfe investigations Tabelle...");

    const { data: investigationsData, error: investigationsError } =
      await supabase.from("investigations").select("id, title").limit(1);

    if (investigationsError) {
      console.error(
        "❌ Fehler beim Prüfen der investigations Tabelle:",
        investigationsError,
      );
      return false;
    }

    console.log("✅ investigations Tabelle existiert");

    // 5. Teste INSERT mit authentifiziertem Benutzer
    console.log(
      "📋 5. Teste INSERT-Operation mit authentifiziertem Benutzer...",
    );

    let testInvestigationId = null;

    if (investigationsData && investigationsData.length > 0) {
      testInvestigationId = investigationsData[0].id;
      console.log(
        "✅ Verwende existierende Fahndung:",
        investigationsData[0].title,
      );
    } else {
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
          created_by: authData.user.id,
        })
        .select("id, title")
        .single();

      if (createError) {
        console.error(
          "❌ Fehler beim Erstellen der Test-Fahndung:",
          createError,
        );
        return false;
      }

      testInvestigationId = newInvestigation.id;
      console.log("✅ Test-Fahndung erstellt:", newInvestigation.title);
    }

    // Teste INSERT in investigation_images mit authentifiziertem Benutzer
    const testImageData = {
      investigation_id: testInvestigationId,
      file_name: "test-image.jpg",
      original_name: "test-image.jpg",
      file_path: "investigations/test/test-image.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      uploaded_by: authData.user.id, // Verwende die echte User ID
      is_primary: false,
      is_public: true,
    };

    console.log("📝 Teste INSERT mit User ID:", authData.user.id);

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
      console.log("🔍 RLS Policy Problem - Prüfe die Policies in Supabase");
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

    // 6. Teste tRPC Mutation (simuliert)
    console.log(
      "📋 6. Teste tRPC uploadInvestigationImage Mutation (simuliert)...",
    );

    const mockMutationData = {
      investigationId: testInvestigationId,
      fileName: "test-mutation.jpg",
      filePath: "investigations/test/test-mutation.jpg",
      originalName: "test-mutation.jpg",
      fileSize: 2048,
      mimeType: "image/jpeg",
      isPrimary: true,
    };

    console.log("📝 Simuliere uploadInvestigationImage mit:", mockMutationData);

    const { data: mutationTestImage, error: mutationError } = await supabase
      .from("investigation_images")
      .insert({
        investigation_id: mockMutationData.investigationId,
        file_name: mockMutationData.fileName,
        original_name: mockMutationData.originalName,
        file_path: mockMutationData.filePath,
        file_size: mockMutationData.fileSize,
        mime_type: mockMutationData.mimeType,
        uploaded_by: authData.user.id,
        is_primary: mockMutationData.isPrimary,
        is_public: true,
      })
      .select()
      .single();

    if (mutationError) {
      console.error("❌ tRPC Mutation Test fehlgeschlagen:", mutationError);
      return false;
    }

    console.log("✅ tRPC Mutation Test erfolgreich:", mutationTestImage.id);

    // Lösche Test-Daten
    await supabase
      .from("investigation_images")
      .delete()
      .eq("id", mutationTestImage.id);

    console.log("");
    console.log("🎉 Alle Tests erfolgreich!");
    console.log("✅ investigation_images Tabelle ist korrekt konfiguriert");
    console.log("✅ RLS-Policies funktionieren mit authentifiziertem Benutzer");
    console.log(
      "🚀 uploadInvestigationImage Mutation sollte jetzt funktionieren",
    );

    return true;
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
    return false;
  } finally {
    // Logout
    await supabase.auth.signOut();
  }
}

// Script ausführen
testInvestigationImagesTableWithAuth()
  .then((success) => {
    if (success) {
      console.log("");
      console.log("📋 Nächste Schritte:");
      console.log("1. Teste die uploadInvestigationImage Mutation in der App");
      console.log(
        "2. Stelle sicher, dass der Benutzer in der App angemeldet ist",
      );
      console.log("3. Prüfe die Browser-Konsole auf Fehler");
    } else {
      console.log("");
      console.log("📋 Fehlerbehebung:");
      console.log("1. Prüfe die RLS-Policies in Supabase");
      console.log("2. Stelle sicher, dass der Benutzer die richtige Rolle hat");
      console.log("3. Prüfe die Supabase Logs");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });
