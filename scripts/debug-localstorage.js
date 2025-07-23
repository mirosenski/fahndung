// Debug localStorage für Supabase Session
console.log("🔍 Debug localStorage für Supabase Session...");

// Simuliere Browser-Umgebung
if (typeof window === "undefined") {
  console.log("❌ Nicht im Browser - localStorage nicht verfügbar");
  process.exit(1);
}

// Alle localStorage Keys anzeigen
const allKeys = Object.keys(localStorage);
console.log("📋 Alle localStorage Keys:", allKeys);

// Supabase-spezifische Keys finden
const supabaseKeys = allKeys.filter((key) => key.includes("supabase"));
console.log("🔍 Supabase Keys:", supabaseKeys);

// Auth-spezifische Keys finden
const authKeys = allKeys.filter((key) => key.includes("auth"));
console.log("🔐 Auth Keys:", authKeys);

// Session-Keys finden
const sessionKeys = allKeys.filter((key) => key.includes("session"));
console.log("📱 Session Keys:", sessionKeys);

// Token-Keys finden
const tokenKeys = allKeys.filter((key) => key.includes("token"));
console.log("🎫 Token Keys:", tokenKeys);

// Versuche Session-Daten zu lesen
for (const key of supabaseKeys) {
  try {
    const value = localStorage.getItem(key);
    console.log(`\n📄 Key: ${key}`);
    console.log(`📄 Value: ${value?.substring(0, 100)}...`);

    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`📄 Parsed:`, parsed);
      } catch (e) {
        console.log(`❌ Parse error:`, e.message);
      }
    }
  } catch (e) {
    console.log(`❌ Error reading ${key}:`, e.message);
  }
}

console.log(
  "\n💡 Tipp: Öffnen Sie die Browser-Konsole und führen Sie dieses Script aus",
);
