#!/usr/bin/env node

// Direktes Admin-Benutzer Erstellungs-Skript
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔧 Erstelle Admin-Benutzer...");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Environment-Variablen");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  try {
    console.log("\n📋 Prüfe existierende Benutzer...");

    // Prüfe ob Admin bereits existiert
    const { data: existingProfiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", "admin@fahndung.local");

    if (profileError) {
      console.error(
        "❌ Fehler beim Prüfen existierender Profile:",
        profileError,
      );
      return;
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log("✅ Admin-Benutzer existiert bereits:");
      existingProfiles.forEach((profile) => {
        console.log(`  - ${profile.email} (${profile.user_id})`);
        console.log(`    Name: ${profile.name || "Kein Name"}`);
        console.log(`    Role: ${profile.role}`);
        console.log(`    Active: ${profile.is_active ? "Ja" : "Nein"}`);
        console.log(
          `    Department: ${profile.department || "Keine Abteilung"}`,
        );
      });
      return;
    }

    console.log("❌ Kein Admin-Benutzer gefunden. Erstelle neuen Admin...");

    // Versuche Auth-Benutzer zu erstellen oder existierenden zu verwenden
    let userId;

    try {
      // Versuche sich anzumelden, um die User-ID zu bekommen
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: "admin@fahndung.local",
          password: "admin123",
        });

      if (signInError) {
        console.error("❌ Fehler beim Anmelden:", signInError);
        return;
      }

      userId = signInData.user?.id;
      console.log("✅ Existierender Auth-Benutzer gefunden:", userId);
    } catch (error) {
      console.log("ℹ️  Versuche neuen Auth-Benutzer zu erstellen...");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: "admin@fahndung.local",
        password: "admin123",
        options: {
          data: {
            name: "Administrator",
            role: "admin",
          },
        },
      });

      if (authError) {
        console.error(
          "❌ Fehler beim Erstellen des Auth-Benutzers:",
          authError,
        );
        return;
      }

      userId = authData.user?.id;
      console.log("✅ Neuer Auth-Benutzer erstellt:", userId);
    }

    if (!userId) {
      console.error("❌ Keine User-ID verfügbar");
      return;
    }

    // Erstelle Benutzer-Profil
    const { data: profileData, error: profileCreateError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        email: "admin@fahndung.local",
        name: "Administrator",
        role: "admin",
        department: "IT",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileCreateError) {
      console.error(
        "❌ Fehler beim Erstellen des Benutzer-Profils:",
        profileCreateError,
      );
      return;
    }

    console.log("✅ Benutzer-Profil erstellt:", {
      id: profileData.id,
      email: profileData.email,
      name: profileData.name,
      role: profileData.role,
      active: profileData.is_active,
    });

    console.log("\n✅ Admin-Benutzer erfolgreich erstellt!");
    console.log("📧 E-Mail: admin@fahndung.local");
    console.log("🔑 Passwort: admin123");
    console.log("👤 Rolle: Administrator");
    console.log("✅ Status: Aktiv");
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

createAdminUser();
