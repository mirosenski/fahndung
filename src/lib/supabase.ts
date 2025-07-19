import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

// Bedingte Supabase-Initialisierung
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Typen für Real-time Updates
export interface InvestigationChange {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: unknown;
  old: unknown;
  table: string;
}

export interface MediaChange {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: unknown;
  old: unknown;
  table: string;
}

// Real-time subscription für Fahndungen
export const subscribeToInvestigations = (
  callback: (payload: InvestigationChange) => void,
) => {
  if (!supabase) {
    console.warn(
      "⚠️ Supabase nicht konfiguriert - Real-time Updates deaktiviert",
    );
    return {
      unsubscribe: () => {
        console.log("Real-time subscription für Fahndungen beendet (Mock)");
      },
    };
  }

  return supabase
    .channel("investigations")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "investigations",
      },
      callback,
    )
    .subscribe();
};

// Real-time subscription für Medien
export const subscribeToMedia = (callback: (payload: MediaChange) => void) => {
  if (!supabase) {
    console.warn(
      "⚠️ Supabase nicht konfiguriert - Real-time Updates deaktiviert",
    );
    return {
      unsubscribe: () => {
        console.log("Real-time subscription für Medien beendet (Mock)");
      },
    };
  }

  return supabase
    .channel("media")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "investigation_images",
      },
      callback,
    )
    .subscribe();
};
