#!/usr/bin/env node

// Debug-Script für Authentifizierung
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Debug: Authentifizierung");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Environment-Variablen");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  try {
    console.log("\n📋 Prüfe Session...");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session-Fehler:", sessionError);
      return;
    }

    if (!session) {
      console.log("❌ Keine aktive Session gefunden");
      console.log("💡 Melden Sie sich an: http://localhost:3002/login");
      console.log("💡 Verwenden Sie: admin@fahndung.local / admin123");
      return;
    }

    console.log("✅ Session gefunden:", {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: new Date(session.expires_at * 1000).toISOString(),
    });

    // Prüfe Benutzer-Profil
    console.log("\n📋 Prüfe Benutzer-Profil...");

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profileError) {
      console.error("❌ Profil-Fehler:", profileError);
      return;
    }

    if (!profile) {
      console.log("❌ Kein Benutzer-Profil gefunden");
      return;
    }

    console.log("✅ Benutzer-Profil gefunden:", {
      name: profile.name,
      role: profile.role,
      department: profile.department,
    });

    // Prüfe Storage Bucket
    console.log("\n📋 Prüfe Storage Bucket...");

    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Bucket-Fehler:", bucketError);
      return;
    }

    const mediaBucket = buckets?.find(
      (bucket) => bucket.id === "media-gallery",
    );

    if (mediaBucket) {
      console.log("✅ media-gallery Bucket gefunden:", {
        id: mediaBucket.id,
        name: mediaBucket.name,
        public: mediaBucket.public,
      });
    } else {
      console.log("❌ media-gallery Bucket nicht gefunden");
      console.log(
        "💡 Führen Sie das Setup-Script aus: ./scripts/setup-storage.sh",
      );
    }

    // Prüfe Media-Tabelle
    console.log("\n📋 Prüfe Media-Tabelle...");

    const { data: mediaCount, error: mediaError } = await supabase
      .from("media")
      .select("*", { count: "exact", head: true });

    if (mediaError) {
      console.error("❌ Media-Tabelle-Fehler:", mediaError);
      return;
    }

    console.log(
      "✅ Media-Tabelle verfügbar, Anzahl Einträge:",
      mediaCount?.length || 0,
    );

    console.log("\n✅ Debug abgeschlossen - Authentifizierung funktioniert!");
    console.log("💡 Sie können jetzt Media-Uploads testen");
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

debugAuth();
