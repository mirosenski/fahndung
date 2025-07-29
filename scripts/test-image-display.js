// Test-Skript für Bild-Anzeige in Fahndungen
// Führen Sie dieses Script mit: node scripts/test-image-display.js

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

async function testImageDisplay() {
  console.log("🔧 Teste Bild-Anzeige in Fahndungen...");
  console.log("=========================================");

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

    console.log("✅ Session gefunden:", session.user.email);

    // 2. Lade alle Fahndungen mit Bildern
    console.log("📋 2. Lade Fahndungen mit Bildern...");

    const { data: investigations, error: investigationsError } = await supabase
      .from("investigations")
      .select(
        `
        *,
        images:investigation_images(*)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (investigationsError) {
      console.error(
        "❌ Fehler beim Laden der Fahndungen:",
        investigationsError,
      );
      return false;
    }

    console.log("✅ Fahndungen geladen:", investigations?.length ?? 0);

    // 3. Prüfe Bilder in jeder Fahndung
    console.log("📋 3. Prüfe Bilder in Fahndungen...");

    let totalImages = 0;
    let fahndungenWithImages = 0;

    for (const investigation of investigations ?? []) {
      console.log(`\n🔍 Fahndung: ${investigation.title}`);
      console.log(`   ID: ${investigation.id}`);
      console.log(`   Status: ${investigation.status}`);
      console.log(`   Kategorie: ${investigation.category}`);

      if (investigation.images && investigation.images.length > 0) {
        fahndungenWithImages++;
        totalImages += investigation.images.length;

        console.log(`   📸 Bilder gefunden: ${investigation.images.length}`);

        for (const image of investigation.images) {
          console.log(`     - ${image.original_name} (${image.file_path})`);

          // Generiere öffentliche URL
          const { data: urlData } = supabase.storage
            .from("media-gallery")
            .getPublicUrl(image.file_path);

          console.log(`       URL: ${urlData.publicUrl}`);

          // Teste ob die URL erreichbar ist
          try {
            const response = await fetch(urlData.publicUrl, { method: "HEAD" });
            if (response.ok) {
              console.log(`       ✅ URL ist erreichbar`);
            } else {
              console.log(
                `       ❌ URL nicht erreichbar (${response.status})`,
              );
            }
          } catch (error) {
            console.log(`       ❌ URL-Test fehlgeschlagen:`, error.message);
          }
        }
      } else {
        console.log(`   📸 Keine Bilder gefunden`);
      }
    }

    // 4. Statistiken
    console.log("\n📊 Statistiken:");
    console.log(`   - Fahndungen insgesamt: ${investigations?.length ?? 0}`);
    console.log(`   - Fahndungen mit Bildern: ${fahndungenWithImages}`);
    console.log(`   - Bilder insgesamt: ${totalImages}`);

    // 5. Prüfe investigation_images Tabelle direkt
    console.log("\n📋 4. Prüfe investigation_images Tabelle...");

    const { data: allImages, error: imagesError } = await supabase
      .from("investigation_images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (imagesError) {
      console.error("❌ Fehler beim Laden der Bilder:", imagesError);
    } else {
      console.log(
        `✅ ${allImages?.length ?? 0} Bilder in der Datenbank gefunden`,
      );

      if (allImages && allImages.length > 0) {
        console.log("\n📸 Letzte 5 Bilder:");
        for (const image of allImages.slice(0, 5)) {
          console.log(`   - ${image.original_name} (${image.file_path})`);
          console.log(`     Investigation ID: ${image.investigation_id}`);
          console.log(`     Größe: ${image.file_size} bytes`);
          console.log(`     Typ: ${image.mime_type}`);
          console.log(`     Primär: ${image.is_primary ? "Ja" : "Nein"}`);
        }
      }
    }

    // 6. Teste Storage-Zugriff
    console.log("\n📋 5. Teste Storage-Zugriff...");

    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Storage-Bucket-Fehler:", bucketError);
    } else {
      const mediaGalleryBucket = buckets?.find(
        (bucket) => bucket.id === "media-gallery",
      );
      if (mediaGalleryBucket) {
        console.log("✅ media-gallery Bucket gefunden");

        // Liste Dateien im Bucket
        const { data: files, error: filesError } = await supabase.storage
          .from("media-gallery")
          .list("investigations", { limit: 10 });

        if (filesError) {
          console.error("❌ Fehler beim Auflisten der Dateien:", filesError);
        } else {
          console.log(
            `✅ ${files?.length ?? 0} Dateien im investigations Ordner gefunden`,
          );

          if (files && files.length > 0) {
            console.log("\n📁 Letzte 5 Dateien:");
            for (const file of files.slice(0, 5)) {
              console.log(
                `   - ${file.name} (${file.metadata?.size ?? "unbekannt"} bytes)`,
              );
            }
          }
        }
      } else {
        console.error("❌ media-gallery Bucket nicht gefunden");
      }
    }

    console.log("\n✅ Bild-Anzeige-Test erfolgreich abgeschlossen!");
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Testen der Bild-Anzeige:", error);
    return false;
  }
}

// Führe den Test aus
testImageDisplay().catch(console.error);
