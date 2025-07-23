#!/usr/bin/env node

// Test Admin Login Script
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔧 Teste Admin-Login...");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Environment-Variablen");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminLogin() {
  try {
    console.log("\n📋 Versuche Admin-Login...");

    // Versuche sich anzumelden
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "admin@fahndung.local",
        password: "admin123",
      });

    if (signInError) {
      console.error("❌ Login-Fehler:", signInError);
      return;
    }

    if (!signInData.user) {
      console.error("❌ Kein Benutzer nach Login");
      return;
    }

    console.log("✅ Login erfolgreich!");
    console.log("👤 Benutzer:", {
      id: signInData.user.id,
      email: signInData.user.email,
      emailConfirmed: signInData.user.email_confirmed_at ? "Ja" : "Nein",
    });

    // Prüfe Benutzer-Profil
    console.log("\n📋 Prüfe Benutzer-Profil...");

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", signInData.user.id)
      .single();

    if (profileError) {
      console.error("❌ Profil-Fehler:", profileError);

      // Versuche Profil zu erstellen
      console.log("\n📋 Erstelle Benutzer-Profil...");

      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: signInData.user.id,
          email: signInData.user.email,
          name: "Administrator",
          role: "admin",
          department: "IT",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Fehler beim Erstellen des Profils:", createError);
        return;
      }

      console.log("✅ Profil erstellt:", {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        department: newProfile.department,
      });
    } else {
      console.log("✅ Profil gefunden:", {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        status: profile.status,
        department: profile.department,
      });
    }

    // Prüfe alle Profile
    console.log("\n📋 Alle Benutzer-Profile:");
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("user_profiles")
      .select("*");

    if (allProfilesError) {
      console.error("❌ Fehler beim Abrufen aller Profile:", allProfilesError);
    } else {
      console.log("✅ Profile gefunden:", allProfiles?.length || 0);
      allProfiles?.forEach((profile) => {
        console.log(`  - ${profile.email} (${profile.user_id})`);
        console.log(`    Name: ${profile.name || "Kein Name"}`);
        console.log(`    Role: ${profile.role}`);
        console.log(`    Status: ${profile.status || "Kein Status"}`);
        console.log(
          `    Active: ${profile.status === "approved" ? "Ja" : "Nein"}`,
        );
        console.log(
          `    Department: ${profile.department || "Keine Abteilung"}`,
        );
        console.log("");
      });
    }

    console.log("\n✅ Admin-Login Test abgeschlossen!");
    console.log(
      "💡 Sie können sich jetzt mit admin@fahndung.local / admin123 anmelden",
    );
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

testAdminLogin();
