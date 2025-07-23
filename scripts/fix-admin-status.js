#!/usr/bin/env node

// Fix Admin Status Script
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔧 Fixe Admin-Status...");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Environment-Variablen");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdminStatus() {
  try {
    console.log("\n📋 Melde mich als Admin an...");

    // Melde mich als Admin an
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "admin@fahndung.local",
        password: "admin123",
      });

    if (signInError) {
      console.error("❌ Login-Fehler:", signInError);
      return;
    }

    console.log("✅ Login erfolgreich!");

    // Prüfe aktuelles Profil
    console.log("\n📋 Prüfe aktuelles Profil...");
    const { data: currentProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", signInData.user.id)
      .single();

    if (profileError) {
      console.error("❌ Profil-Fehler:", profileError);
      return;
    }

    console.log("📋 Aktuelles Profil:", {
      id: currentProfile.id,
      email: currentProfile.email,
      name: currentProfile.name,
      role: currentProfile.role,
      status: currentProfile.status,
      department: currentProfile.department,
    });

    // Versuche status zu setzen
    console.log("\n📋 Setze status auf 'approved'...");

    const { data: updatedProfile, error: updateError } = await supabase
      .from("user_profiles")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", signInData.user.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Update-Fehler:", updateError);

      // Prüfe ob is_active Spalte existiert
      console.log("\n📋 Prüfe Datenbankschema...");
      const { data: schemaInfo, error: schemaError } = await supabase
        .from("user_profiles")
        .select("*")
        .limit(1);

      if (schemaError) {
        console.error("❌ Schema-Fehler:", schemaError);
      } else {
        console.log(
          "ℹ️  Verfügbare Spalten:",
          Object.keys(schemaInfo[0] || {}),
        );
      }

      return;
    }

    console.log("✅ Profil aktualisiert:", {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.name,
      role: updatedProfile.role,
      status: updatedProfile.status,
      department: updatedProfile.department,
    });

    console.log("\n✅ Admin-Status erfolgreich gefixt!");
    console.log(
      "💡 Der Admin-Benutzer sollte jetzt als aktiv angezeigt werden",
    );
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

fixAdminStatus();
