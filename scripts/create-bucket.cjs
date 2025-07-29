#!/usr/bin/env node

/**
 * Skript zum Erstellen des media-gallery Storage Buckets
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

async function createMediaGalleryBucket() {
  console.log("🔧 Erstelle media-gallery Storage Bucket...");
  console.log("=============================================");

  try {
    // 1. Prüfe ob Bucket bereits existiert
    console.log("📋 1. Prüfe existierende Buckets...");

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Fehler beim Abrufen der Buckets:", bucketsError);
      return false;
    }

    const existingBucket = buckets.find(bucket => bucket.id === "media-gallery");
    if (existingBucket) {
      console.log("✅ media-gallery Bucket existiert bereits");
      return true;
    }

    console.log("📦 Verfügbare Buckets:", buckets.map(bucket => bucket.id));

    // 2. Erstelle den media-gallery Bucket
    console.log("📋 2. Erstelle media-gallery Bucket...");

    const { data: bucket, error: createError } = await supabase.storage.createBucket("media-gallery", {
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
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    });

    if (createError) {
      console.error("❌ Fehler beim Erstellen des Buckets:", createError);
      return false;
    }

    console.log("✅ media-gallery Bucket erfolgreich erstellt:", bucket);

    // 3. Teste den Bucket
    console.log("📋 3. Teste den neuen Bucket...");

    const { data: testBuckets, error: testError } = await supabase.storage.listBuckets();

    if (testError) {
      console.error("❌ Fehler beim Testen des Buckets:", testError);
      return false;
    }

    const newBucket = testBuckets.find(bucket => bucket.id === "media-gallery");
    if (newBucket) {
      console.log("✅ Bucket erfolgreich erstellt und verfügbar:", {
        id: newBucket.id,
        name: newBucket.name,
        public: newBucket.public,
        fileSizeLimit: newBucket.fileSizeLimit,
      });
    } else {
      console.error("❌ Bucket nicht in der Liste gefunden");
      return false;
    }

    console.log("");
    console.log("🎉 media-gallery Bucket Setup erfolgreich!");
    console.log("✅ Bucket erstellt und konfiguriert");
    console.log("✅ Öffentlicher Zugriff aktiviert");
    console.log("✅ Dateigrößen-Limit: 50MB");
    console.log("✅ Unterstützte Dateitypen konfiguriert");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Buckets:", error);
    return false;
  }
}

// Script ausführen
createMediaGalleryBucket()
  .then((success) => {
    if (success) {
      console.log("");
      console.log("📋 Nächste Schritte:");
      console.log("1. Teste die App mit Bild-Upload");
      console.log("2. Prüfe ob Bilder korrekt hochgeladen werden");
      console.log("3. Teste die Authentifizierung erneut");
    } else {
      console.log("");
      console.log("📋 Fehlerbehebung:");
      console.log("1. Prüfe die Supabase-Konfiguration");
      console.log("2. Stelle sicher, dass der Service Role Key korrekt ist");
      console.log("3. Prüfe die Supabase Logs");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });