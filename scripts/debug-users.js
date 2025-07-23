#!/usr/bin/env node

// Debug-Script für Benutzer-Datenbank
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Debug: Benutzer-Datenbank");
console.log("URL:", supabaseUrl);
console.log("Anon Key:", supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Environment-Variablen");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugUsers() {
  try {
    console.log("\n📋 Prüfe alle Benutzer...");

    // Prüfe auth.users Tabelle (über RPC)
    console.log("\n🔐 Auth Users:");
    console.log(
      "ℹ️  Auth Users können nicht direkt abgefragt werden (Sicherheitsrichtlinien)",
    );
    console.log("💡 Verwenden Sie das Supabase Dashboard für Auth-Benutzer");

    // Prüfe user_profiles Tabelle
    console.log("\n👥 User Profiles:");
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("*");

    if (profileError) {
      console.error("❌ User Profiles Fehler:", profileError);
    } else {
      console.log("✅ User Profiles gefunden:", profiles?.length || 0);
      profiles?.forEach((profile) => {
        console.log(`  - ${profile.email} (${profile.user_id})`);
        console.log(`    Name: ${profile.name || "Kein Name"}`);
        console.log(`    Role: ${profile.role}`);
        console.log(`    Active: ${profile.is_active ? "Ja" : "Nein"}`);
        console.log(
          `    Department: ${profile.department || "Keine Abteilung"}`,
        );
        console.log(`    Created: ${profile.created_at}`);
        console.log(`    Updated: ${profile.updated_at}`);
        console.log("");
      });
    }

    // Prüfe admin_actions Tabelle
    console.log("\n⚡ Admin Actions:");
    const { data: actions, error: actionError } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (actionError) {
      console.error("❌ Admin Actions Fehler:", actionError);
    } else {
      console.log("✅ Admin Actions gefunden:", actions?.length || 0);
      actions?.forEach((action) => {
        console.log(`  - ${action.action_type} (${action.created_at})`);
        console.log(`    Admin: ${action.admin_id}`);
        console.log(`    Target: ${action.target_user_id || "N/A"}`);
        console.log(
          `    Description: ${action.description || "Keine Beschreibung"}`,
        );
        console.log("");
      });
    }

    // Statistiken
    if (profiles) {
      const stats = {
        total: profiles.length,
        active: profiles.filter((p) => p.is_active).length,
        blocked: profiles.filter((p) => !p.is_active).length,
        admins: profiles.filter((p) => p.role === "admin").length,
        editors: profiles.filter((p) => p.role === "editor").length,
        users: profiles.filter((p) => p.role === "user").length,
      };

      console.log("\n📊 Statistiken:");
      console.log(`  Gesamt: ${stats.total}`);
      console.log(`  Aktiv: ${stats.active}`);
      console.log(`  Gesperrt: ${stats.blocked}`);
      console.log(`  Admins: ${stats.admins}`);
      console.log(`  Editoren: ${stats.editors}`);
      console.log(`  Benutzer: ${stats.users}`);
    }

    console.log("\n✅ Debug abgeschlossen!");
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

debugUsers();
