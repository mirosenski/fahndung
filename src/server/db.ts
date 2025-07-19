import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL und Anon Key müssen in den Umgebungsvariablen gesetzt sein",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Für tRPC Kompatibilität
export const db = {
  supabase,
  // Alias für einfacheren Zugriff
  investigations: () => supabase.from("investigations"),
  investigationImages: () => supabase.from("investigation_images"),
};
