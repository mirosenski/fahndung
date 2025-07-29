#!/usr/bin/env node

/**
 * Skript zum Überprüfen und Erstellen von Storage Buckets
 * Verwendet die Supabase Management API
 */

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Supabase Client mit Service Role Key erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase Umgebungsvariablen nicht gefunden");
  console.log("📝 Bitte stelle sicher, dass .env.local konfiguriert ist:");
  console.log("   NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url");
  console.log("   SUPABASE_SERVICE_ROLE_KEY=dein_service_role_key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function checkAndCreateBuckets() {
  console.log("🔧 Überprüfe und erstelle Storage Buckets...");
  console.log("=============================================");

  try {
    // 1. Liste alle Buckets auf
    console.log("📋 1. Liste alle verfügbaren Buckets auf...");

    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Fehler beim Abrufen der Buckets:", bucketsError);
      console.log("");
      console.log("📋 Mögliche Lösungen:");
      console.log("1. Prüfe die Supabase URL und Service Role Key");
      console.log("2. Stelle sicher, dass Storage in Supabase aktiviert ist");
      console.log(
        "3. Führe das SQL-Script manuell in der Supabase Console aus",
      );
      return false;
    }

    console.log(
      "📦 Verfügbare Buckets:",
      buckets.map((bucket) => bucket.id),
    );

    // 2. Prüfe ob media-gallery Bucket existiert
    const mediaGalleryBucket = buckets.find(
      (bucket) => bucket.id === "media-gallery",
    );

    if (mediaGalleryBucket) {
      console.log("✅ media-gallery Bucket existiert bereits");
      return true;
    }

    console.log("⚠️ media-gallery Bucket nicht gefunden, erstelle ihn...");

    // 3. Erstelle den media-gallery Bucket
    const { data: bucket, error: createError } =
      await supabase.storage.createBucket("media-gallery", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
          "video/mp4",
          "video/mov",
          "video/avi",
          "video/mkv",
          "video/webm",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

    if (createError) {
      console.error("❌ Fehler beim Erstellen des Buckets:", createError);
      console.log("");
      console.log("📋 Alternative Lösung:");
      console.log("Führe das SQL-Script in der Supabase Console aus:");
      console.log("1. Gehe zu https://supabase.com/dashboard");
      console.log("2. Wähle dein Projekt aus");
      console.log("3. Gehe zu SQL Editor");
      console.log("4. Führe scripts/setup-storage-bucket.sql aus");
      return false;
    }

    console.log("✅ media-gallery Bucket erfolgreich erstellt:", bucket);

    // 4. Teste den neuen Bucket
    console.log("📋 4. Teste den neuen Bucket...");

    const { data: testBuckets, error: testError } =
      await supabase.storage.listBuckets();

    if (testError) {
      console.error("❌ Fehler beim Testen des Buckets:", testError);
      return false;
    }

    const newBucket = testBuckets.find(
      (bucket) => bucket.id === "media-gallery",
    );
    if (newBucket) {
      console.log("✅ Bucket erfolgreich erstellt und verfügbar");
      return true;
    } else {
      console.error("❌ Bucket wurde nicht korrekt erstellt");
      return false;
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
    return false;
  }
}

// Führe das Script aus
checkAndCreateBuckets()
  .then((success) => {
    if (success) {
      console.log("");
      console.log("🎉 Storage Bucket Setup erfolgreich!");
      console.log("Die App sollte jetzt Dateien hochladen können.");
    } else {
      console.log("");
      console.log("❌ Storage Bucket Setup fehlgeschlagen");
      console.log(
        "Bitte führe das SQL-Script manuell in der Supabase Console aus.",
      );
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });
