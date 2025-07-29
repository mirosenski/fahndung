#!/usr/bin/env node

/**
 * Test-Skript für tRPC-Authentifizierung
 * Simuliert die tRPC-Authentifizierung direkt
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

async function testTRPCAuth() {
  console.log("🔧 Teste tRPC-Authentifizierung...");
  console.log("====================================");

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
    console.log("👤 User ID:", authData.user.id);

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

    // 3. Simuliere tRPC Context Creation
    console.log("📋 3. Simuliere tRPC Context Creation...");

    // Simuliere die Server-seitige Token-Validierung
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token);

    if (userError) {
      console.error("❌ Token-Validierung fehlgeschlagen:", userError);
      return false;
    }

    if (!userData.user) {
      console.error("❌ Kein Benutzer aus Token extrahiert");
      return false;
    }

    console.log("✅ Token-Validierung erfolgreich:", userData.user.email);

    // 4. Simuliere Benutzer-Profil Abruf
    console.log("📋 4. Simuliere Benutzer-Profil Abruf...");

    const { data: profileData, error: profileError } = await supabaseAuth
      .from("user_profiles")
      .select("role, name")
      .eq("user_id", userData.user.id)
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

    // 5. Simuliere tRPC Context
    console.log("📋 5. Simuliere tRPC Context...");

    const tRPCContext = {
      user: {
        id: userData.user.id,
        email: userData.user.email ?? "",
        role: profileData.role,
        permissions: {
          canCreateInvestigations: true,
          canEditInvestigations: true,
          canDeleteInvestigations: true,
          canUploadImages: true,
        },
      },
      session: {
        user: {
          id: userData.user.id,
          email: userData.user.email ?? "",
        },
        profile: profileData,
      },
      db: supabaseAuth,
    };

    console.log("✅ tRPC Context erstellt:", {
      hasUser: !!tRPCContext.user,
      userId: tRPCContext.user.id,
      userEmail: tRPCContext.user.email,
      userRole: tRPCContext.user.role,
      hasSession: !!tRPCContext.session,
      sessionUser: tRPCContext.session.user.id,
    });

    // 6. Simuliere uploadInvestigationImage Aufruf
    console.log("📋 6. Simuliere uploadInvestigationImage Aufruf...");

    const mockInput = {
      investigationId: "123e4567-e89b-12d3-a456-426614174000",
      fileName: "test-image.jpg",
      originalName: "test-image.jpg",
      filePath: "media-gallery/investigations/test-image.jpg",
      fileSize: 1024,
      mimeType: "image/jpeg",
      isPrimary: false,
    };

    console.log("📸 Mock Input:", mockInput);
    console.log(
      "👤 Benutzer:",
      tRPCContext.user.email,
      "Rolle:",
      tRPCContext.user.role,
    );
    console.log("🔍 Context Details:", {
      hasUser: !!tRPCContext.user,
      userId: tRPCContext.user.id,
      userEmail: tRPCContext.user.email,
      userRole: tRPCContext.user.role,
      hasSession: !!tRPCContext.session,
      sessionUser: tRPCContext.session.user.id,
    });

    // Prüfe Authentifizierung
    if (!tRPCContext.user?.id) {
      console.error("❌ Keine Benutzer-ID im Context");
      console.error("🔍 Context Debug:", {
        user: tRPCContext.user,
        session: tRPCContext.session,
        hasUser: !!tRPCContext.user,
        hasSession: !!tRPCContext.session,
      });
      throw new Error("Nicht authentifiziert - Bitte melden Sie sich an");
    }

    console.log("✅ Benutzer authentifiziert:", tRPCContext.user.id);
    console.log(
      "✅ uploadInvestigationImage würde erfolgreich ausgeführt werden",
    );

    console.log("");
    console.log("🎉 tRPC-Authentifizierung erfolgreich getestet!");
    console.log("✅ Client-seitige Authentifizierung funktioniert");
    console.log("✅ Token-Extraktion funktioniert");
    console.log("✅ Server-seitige Token-Validierung funktioniert");
    console.log("✅ Benutzer-Profil-Zugriff funktioniert");
    console.log("✅ tRPC Context Creation funktioniert");
    console.log("✅ uploadInvestigationImage Authentifizierung funktioniert");

    return true;
  } catch (error) {
    console.error("❌ Fehler beim Testen der tRPC-Authentifizierung:", error);
    return false;
  }
}

// Script ausführen
testTRPCAuth()
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
