#!/usr/bin/env node

/**
 * Test-Skript für JWT-Token-Decodierung
 * Testet die JWT-Token-Decodierung direkt
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJWTDecode() {
  console.log("🔧 Teste JWT-Token-Decodierung...");
  console.log("===================================");

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

    console.log("✅ Authentifizierung erfolgreich als:", authData.user.email);

    // 2. Hole Session
    console.log("📋 2. Hole Session...");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session-Fehler:", sessionError);
      return false;
    }

    if (!sessionData.session) {
      console.error("❌ Keine Session gefunden");
      return false;
    }

    const token = sessionData.session.access_token;
    console.log("✅ Token verfügbar:", {
      length: token.length,
      start: token.substring(0, 20) + "...",
    });

    // 3. Teste JWT-Decodierung
    console.log("📋 3. Teste JWT-Decodierung...");

    // Decodiere den JWT Token manuell
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString(),
        );
        console.log("✅ JWT Token erfolgreich decodiert:", {
          sub: payload.sub,
          email: payload.email,
          exp: payload.exp,
          role: payload.role,
          iat: payload.iat,
        });

        // Prüfe Token-Ablauf
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && now >= payload.exp) {
          console.log("❌ Token ist abgelaufen");
          return false;
        }

        console.log(
          "✅ Token ist gültig (läuft ab:",
          new Date(payload.exp * 1000).toISOString(),
          ")",
        );

        // Erstelle User-Objekt aus JWT Payload
        const userFromJWT = {
          id: payload.sub,
          email: payload.email,
          role: payload.role || "authenticated",
        };

        console.log("✅ User aus JWT extrahiert:", userFromJWT);

        // 4. Teste Benutzer-Profil Abruf
        console.log("📋 4. Teste Benutzer-Profil Abruf...");

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("role, name")
          .eq("user_id", userFromJWT.id)
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

        console.log("");
        console.log("🎉 JWT-Token-Decodierung erfolgreich getestet!");
        console.log("✅ JWT-Token-Decodierung funktioniert");
        console.log("✅ Token-Validierung funktioniert");
        console.log("✅ Benutzer-Extraktion funktioniert");
        console.log("✅ Benutzer-Profil-Zugriff funktioniert");

        return true;
      } catch (jwtError) {
        console.error("❌ JWT Decodierung fehlgeschlagen:", jwtError);
        return false;
      }
    } else {
      console.error("❌ Ungültiger JWT Token Format");
      return false;
    }
  } catch (error) {
    console.error("❌ Fehler beim Testen der JWT-Decodierung:", error);
    return false;
  }
}

// Script ausführen
testJWTDecode()
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
      console.log("3. Prüfe die Supabase Logs");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });
