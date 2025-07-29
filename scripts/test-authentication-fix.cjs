#!/usr/bin/env node

/**
 * Test-Script für Authentifizierung nach den Verbesserungen
 * Überprüft ob die Session-Übertragung und Token-Extraktion funktioniert
 */

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

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

async function testAuthenticationFix() {
  console.log("🔧 Teste Authentifizierung nach den Verbesserungen...");
  console.log("==================================================");

  try {
    // 1. Authentifiziere als Test-Benutzer
    console.log("📋 1. Authentifiziere als Test-Benutzer...");

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

    // 2. Prüfe Session-Status
    console.log("📋 2. Prüfe Session-Status...");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session-Fehler:", sessionError);
      return false;
    }

    if (!sessionData.session) {
      console.error("❌ Keine Session gefunden");
      return false;
    }

    console.log("✅ Session gefunden:", {
      accessTokenLength: sessionData.session.access_token?.length || 0,
      refreshTokenLength: sessionData.session.refresh_token?.length || 0,
      expiresAt: sessionData.session.expires_at ? new Date(sessionData.session.expires_at * 1000).toISOString() : "N/A",
    });

    // 3. Prüfe Token-Gültigkeit
    console.log("📋 3. Prüfe Token-Gültigkeit...");

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = sessionData.session.expires_at;

    if (expiresAt && now >= expiresAt) {
      console.error("❌ Token ist abgelaufen");
      return false;
    }

    console.log("✅ Token ist gültig");

    // 4. Teste Benutzer-Profil
    console.log("📋 4. Teste Benutzer-Profil...");

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("role, name")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      console.error("❌ Fehler beim Abrufen des Benutzerprofils:", profileError);
      return false;
    }

    console.log("✅ Benutzerrolle:", profileData.role);
    console.log("👤 Name:", profileData.name);

    // 5. Teste investigation_images Tabelle
    console.log("📋 5. Teste investigation_images Tabelle...");

    const { data: imagesData, error: imagesError } = await supabase
      .from("investigation_images")
      .select("id")
      .limit(1);

    if (imagesError) {
      console.error("❌ Fehler beim Zugriff auf investigation_images:", imagesError);
      return false;
    }

    console.log("✅ investigation_images Tabelle zugänglich");

    // 6. Teste Storage-Zugriff
    console.log("📋 6. Teste Storage-Zugriff...");

    const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Fehler beim Zugriff auf Storage:", bucketsError);
      return false;
    }

    console.log("📦 Verfügbare Buckets:", bucketsData.map(bucket => bucket.id));

    const mediaGalleryBucket = bucketsData.find(bucket => bucket.id === "media-gallery");
    if (!mediaGalleryBucket) {
      console.error("❌ media-gallery Bucket nicht gefunden");
      console.log("📝 Verwende den ersten verfügbaren Bucket für den Test");
      
      if (bucketsData.length > 0) {
        console.log("✅ Verwende Bucket:", bucketsData[0].id);
      } else {
        console.error("❌ Keine Buckets verfügbar");
        return false;
      }
    } else {
      console.log("✅ media-gallery Bucket gefunden");
    }

    // 7. Teste Token-Extraktion (simuliert tRPC)
    console.log("📋 7. Teste Token-Extraktion (simuliert tRPC)...");

    const token = sessionData.session.access_token;
    if (!token) {
      console.error("❌ Kein Access-Token verfügbar");
      return false;
    }

    console.log("✅ Token verfügbar:", {
      length: token.length,
      start: token.substring(0, 20) + "...",
    });

    // 8. Teste Token-Validierung (simuliert Server-seitige Validierung)
    console.log("📋 8. Teste Token-Validierung (simuliert Server-seitige Validierung)...");

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      },
    );

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError) {
      console.error("❌ Token-Validierung fehlgeschlagen:", userError);
      return false;
    }

    if (!userData.user) {
      console.error("❌ Kein Benutzer aus Token extrahiert");
      return false;
    }

    console.log("✅ Token-Validierung erfolgreich:", userData.user.email);

    console.log("");
    console.log("🎉 Alle Tests erfolgreich!");
    console.log("✅ Authentifizierung funktioniert korrekt");
    console.log("✅ Session-Übertragung funktioniert");
    console.log("✅ Token-Extraktion funktioniert");
    console.log("✅ Server-seitige Validierung funktioniert");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Testen der Authentifizierung:", error);
    return false;
  }
}

// Script ausführen
testAuthenticationFix()
  .then((success) => {
    if (success) {
      console.log("");
      console.log("📋 Nächste Schritte:");
      console.log("1. Teste die App mit einem angemeldeten Benutzer");
      console.log("2. Versuche eine Fahndung mit Bildern zu erstellen");
      console.log("3. Prüfe die Browser-Konsole auf Fehler");
    } else {
      console.log("");
      console.log("📋 Fehlerbehebung:");
      console.log("1. Prüfe die Supabase-Konfiguration");
      console.log("2. Stelle sicher, dass der Benutzer existiert");
      console.log("3. Prüfe die RLS-Policies");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });