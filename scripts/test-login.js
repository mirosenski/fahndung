import { createClient } from "@supabase/supabase-js";

// Remote Supabase-Konfiguration mit korrektem anon public Key
const supabaseUrl = "https://rgbxdxrhwrszidbnsmuy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYnhkeHJod3JzemlkYm5zbXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzgyODUsImV4cCI6MjA2ODI1NDI4NX0.E3E02E91-Wu_dsUioIWumWhn3eaZ0dZ0SzbgvQOs7ts";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("🔐 Teste Admin-Login...");

  try {
    // Teste Login mit admin@example.com
    console.log("📧 Versuche Login mit admin@example.com...");
    const { data: data1, error: error1 } =
      await supabase.auth.signInWithPassword({
        email: "admin@example.com",
        password: "admin123",
      });

    if (error1) {
      console.log(
        "❌ Login mit admin@example.com fehlgeschlagen:",
        error1.message,
      );
    } else {
      console.log("✅ Login mit admin@example.com erfolgreich!");
      console.log("👤 User ID:", data1.user?.id);
      console.log("📧 Email:", data1.user?.email);
    }

    // Teste Login mit admin@fahndung.local
    console.log("\n📧 Versuche Login mit admin@fahndung.local...");
    const { data: data2, error: error2 } =
      await supabase.auth.signInWithPassword({
        email: "admin@fahndung.local",
        password: "admin123",
      });

    if (error2) {
      console.log(
        "❌ Login mit admin@fahndung.local fehlgeschlagen:",
        error2.message,
      );
    } else {
      console.log("✅ Login mit admin@fahndung.local erfolgreich!");
      console.log("👤 User ID:", data2.user?.id);
      console.log("📧 Email:", data2.user?.email);
    }

    // Prüfe aktuelle Session
    console.log("\n🔍 Prüfe aktuelle Session...");
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.log("❌ Session-Fehler:", sessionError.message);
    } else if (session.session) {
      console.log("✅ Aktive Session gefunden!");
      console.log("👤 User ID:", session.session.user.id);
      console.log("📧 Email:", session.session.user.email);
    } else {
      console.log("❌ Keine aktive Session");
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

testLogin();
