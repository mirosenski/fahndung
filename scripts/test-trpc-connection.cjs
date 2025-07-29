#!/usr/bin/env node

/**
 * Test-Skript für tRPC-Verbindung
 * Testet die tRPC-Verbindung direkt über HTTP
 */

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
const https = require("https");
const http = require("http");

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

async function testTRPCConnection() {
  console.log("🔧 Teste tRPC-Verbindung...");
  console.log("=============================");

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

    // 3. Teste tRPC-Verbindung
    console.log("📋 3. Teste tRPC-Verbindung...");

    const tRPCRequest = {
      0: {
        json: {
          investigationId: "123e4567-e89b-12d3-a456-426614174000",
          fileName: "test-image.jpg",
          originalName: "test-image.jpg",
          filePath: "media-gallery/investigations/test-image.jpg",
          fileSize: 1024,
          mimeType: "image/jpeg",
          isPrimary: false,
        },
      },
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-debug-auth": "true",
      "x-trpc-source": "nextjs-react",
    };

    console.log("📤 Sende tRPC Request...");
    console.log("🔍 Headers:", headers);
    console.log("📦 Payload:", JSON.stringify(tRPCRequest, null, 2));

    // Teste die tRPC-Verbindung
    const response = await fetch(
      "http://localhost:3004/api/trpc/post.uploadInvestigationImage",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(tRPCRequest),
      },
    );

    console.log("📥 Response Status:", response.status);
    console.log(
      "📥 Response Headers:",
      Object.fromEntries(response.headers.entries()),
    );

    const responseText = await response.text();
    console.log("📥 Response Body:", responseText);

    if (response.ok) {
      console.log("✅ tRPC-Verbindung erfolgreich!");
      return true;
    } else {
      console.error("❌ tRPC-Verbindung fehlgeschlagen:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Fehler beim Testen der tRPC-Verbindung:", error);
    return false;
  }
}

// Script ausführen
testTRPCConnection()
  .then((success) => {
    if (success) {
      console.log("");
      console.log("🎉 tRPC-Verbindung erfolgreich getestet!");
      console.log("✅ Authentifizierung funktioniert");
      console.log("✅ Token-Übertragung funktioniert");
      console.log("✅ tRPC-Request funktioniert");
    } else {
      console.log("");
      console.log("📋 Fehlerbehebung:");
      console.log("1. Prüfe, ob die App läuft (http://localhost:3004)");
      console.log("2. Prüfe die Server-Logs für Fehler");
      console.log("3. Prüfe die Supabase-Konfiguration");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Script-Fehler:", error);
    process.exit(1);
  });
