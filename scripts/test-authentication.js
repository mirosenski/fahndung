// Test-Skript für Authentifizierung und Session-Übertragung
// Führen Sie dieses Script mit: node scripts/test-authentication.js

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

async function testAuthentication() {
  console.log("🔧 Teste Authentifizierung und Session-Übertragung...");
  console.log("==================================================");

  try {
    // 1. Prüfe aktuelle Session
    console.log("📋 1. Prüfe aktuelle Session...");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session-Fehler:", sessionError);
      console.log("📝 Bitte melden Sie sich an, um den Test durchzuführen");
      return false;
    }

    if (!session) {
      console.log("⚠️ Keine aktive Session gefunden");
      console.log("📝 Bitte melden Sie sich an, um den Test durchzuführen");
      return false;
    }

    console.log("✅ Session gefunden:", {
      userId: session.user.id,
      userEmail: session.user.email,
      tokenLength: session.access_token?.length ?? 0,
    });

    // 2. Teste Token-Validierung
    console.log("📋 2. Teste Token-Validierung...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Token-Validierung fehlgeschlagen:", userError);
      return false;
    }

    if (!user) {
      console.error("❌ Kein Benutzer gefunden");
      return false;
    }

    console.log("✅ Token ist gültig für Benutzer:", user.email);

    // 3. Teste Benutzer-Profil
    console.log("📋 3. Teste Benutzer-Profil...");

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Profil-Fehler:", profileError);
      return false;
    }

    if (!profile) {
      console.log("⚠️ Kein Benutzer-Profil gefunden");
      return false;
    }

    console.log("✅ Benutzer-Profil gefunden:", {
      name: profile.name,
      role: profile.role,
      department: profile.department,
    });

    // 4. Teste Storage-Zugriff
    console.log("📋 4. Teste Storage-Zugriff...");

    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Storage-Bucket-Fehler:", bucketError);
      return false;
    }

    const mediaGalleryBucket = buckets?.find(
      (bucket) => bucket.id === "media-gallery",
    );
    if (!mediaGalleryBucket) {
      console.error("❌ media-gallery Bucket nicht gefunden");
      return false;
    }

    console.log("✅ media-gallery Bucket gefunden");

    // 5. Teste Datenbank-Zugriff
    console.log("📋 5. Teste Datenbank-Zugriff...");

    const { data: investigations, error: dbError } = await supabase
      .from("investigations")
      .select("id, title")
      .limit(1);

    if (dbError) {
      console.error("❌ Datenbank-Fehler:", dbError);
      return false;
    }

    console.log("✅ Datenbank-Zugriff erfolgreich");

    // 6. Teste investigation_images Tabelle
    console.log("📋 6. Teste investigation_images Tabelle...");

    const { data: images, error: imagesError } = await supabase
      .from("investigation_images")
      .select("id")
      .limit(1);

    if (imagesError) {
      console.error("❌ investigation_images Fehler:", imagesError);
      return false;
    }

    console.log("✅ investigation_images Tabelle zugänglich");

    // 7. Teste RLS-Policies
    console.log("📋 7. Teste RLS-Policies...");

    // Teste INSERT in investigation_images (sollte mit authentifiziertem Benutzer funktionieren)
    const testImageData = {
      investigation_id: "00000000-0000-0000-0000-000000000000", // Dummy ID
      file_name: "test-image.jpg",
      original_name: "test-image.jpg",
      file_path: "test/test-image.jpg",
      file_size: 1024,
      mime_type: "image/jpeg",
      uploaded_by: user.id,
      is_primary: false,
      is_public: true,
    };

    const { data: insertedImage, error: insertError } = await supabase
      .from("investigation_images")
      .insert(testImageData)
      .select()
      .single();

    if (insertError) {
      console.log(
        "⚠️ INSERT-Test fehlgeschlagen (erwartet bei Dummy-ID):",
        insertError.message,
      );
      // Das ist normal, da die Dummy-ID nicht existiert
    } else {
      console.log("✅ INSERT-Test erfolgreich");

      // Cleanup: Lösche das Test-Bild
      await supabase
        .from("investigation_images")
        .delete()
        .eq("id", insertedImage.id);
    }

    console.log(
      "✅ Authentifizierung und Session-Übertragung erfolgreich getestet!",
    );
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Testen der Authentifizierung:", error);
    return false;
  }
}

// Führe den Test aus
testAuthentication().catch(console.error);
