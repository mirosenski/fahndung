import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

// Verbesserte Environment-Variablen-Prüfung
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Supabase Environment-Variablen:");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✅ Gesetzt" : "❌ Fehlt",
  );
  console.error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt",
  );
  throw new Error(
    "Missing Supabase environment variables - Bitte prüfen Sie Ihre .env.local Datei",
  );
}

// Validiere URL-Format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
}

// Singleton-Pattern für Supabase-Client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseInstance = () => {
  if (!supabaseInstance) {
    console.log("✅ Supabase-Konfiguration erfolgreich validiert");
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce" as const,
        // Optimierte Auth-Konfiguration
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
        // Verbesserte Session-Behandlung
      },
      // Optimierte Realtime-Konfiguration
      realtime: {
        params: {
          eventsPerSecond: 1 as const, // Reduziert auf 1 für bessere Stabilität
        },
        // Kürzere Reconnect-Intervalle
        heartbeatIntervalMs: 10000 as const, // 10 Sekunden statt 15
        reconnectAfterMs: (tries: number) => Math.min(tries * 200, 2000), // Max 2 Sekunden
      },
      // Optimierte HTTP-Konfiguration
      // Verbesserte Global-Konfiguration
      global: {
        headers: {
          "X-Client-Info": "fahndung-web" as const,
          "X-Requested-With": "XMLHttpRequest" as const,
        },
        // Timeouts für bessere Stabilität
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Timeout für Requests
            signal: AbortSignal.timeout(30000), // 30 Sekunden Timeout
          });
        },
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseInstance();

// Performance-Monitoring
if (typeof window !== "undefined") {
  // Client-seitige Performance-Monitoring
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - start;

      // Log langsame Requests (> 2 Sekunden)
      if (duration > 2000) {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof URL
              ? args[0].href
              : "unknown";
        console.warn(`🐌 Langsame Request: ${url} (${duration.toFixed(0)}ms)`);
      }

      return response;
    } catch (error) {
      const duration = performance.now() - start;
      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] instanceof URL
            ? args[0].href
            : "unknown";
      console.error(
        `❌ Request-Fehler: ${url} (${duration.toFixed(0)}ms)`,
        error,
      );
      throw error;
    }
  };
}

// Verbesserte Error-Behandlung für Message Port Fehler
const handleMessagePortError = (error: unknown) => {
  if (error instanceof Error && error.message.includes("message port closed")) {
    console.log(
      "ℹ️ Message Port Fehler (normal bei Auth-Listener):",
      error.message,
    );
    return true; // Fehler behandelt
  }
  return false; // Fehler nicht behandelt
};

// Optimierte Connection-Pooling mit Error-Handling
let connectionPool: Promise<typeof supabase> | null = null;

export const getSupabaseClient = () => {
  connectionPool ??= Promise.resolve(supabase).catch((error) => {
    if (handleMessagePortError(error)) {
      // Bei Message Port Fehlern neu initialisieren
      console.log(
        "🔄 Reinitialisiere Supabase Client nach Message Port Fehler...",
      );
      return supabase;
    }
    throw error;
  });
  return connectionPool;
};

// Verbesserte Auth-Listener-Behandlung
export const setupAuthListener = (
  callback: (event: string, session: unknown) => void,
) => {
  if (!supabase) return null;

  try {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        callback(event, session);
      } catch (error) {
        if (handleMessagePortError(error)) {
          console.log("ℹ️ Auth-Listener Fehler behandelt");
        } else {
          console.error("❌ Auth-Listener Fehler:", error);
        }
      }
    });

    return subscription;
  } catch (error) {
    if (handleMessagePortError(error)) {
      console.log("ℹ️ Auth-Listener Setup Fehler behandelt");
      return null;
    }
    console.error("❌ Auth-Listener Setup Fehler:", error);
    return null;
  }
};

// Cleanup-Funktion für bessere Memory-Management
export const cleanupSupabase = () => {
  if (supabase.realtime) {
    supabase.realtime.disconnect();
  }
  connectionPool = null;
};

// Real-time subscription für Fahndungen mit optimierter Konfiguration
export const subscribeToInvestigations = (
  callback: (payload: Record<string, unknown>) => void,
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
    .subscribe((status: string) => {
      console.log("🔌 Real-time Status:", status);
    });
};

// Optimierte Batch-Operationen
export const batchOperations = {
  // Batch-Insert für bessere Performance
  async batchInsert(table: string, data: Record<string, unknown>[]) {
    if (!supabase)
      return { data: null, error: new Error("Supabase nicht verfügbar") };

    const batchSize = 100; // Optimale Batch-Größe
    const results: unknown[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { data: batchData, error } = await supabase
        .from(table)
        .insert(batch)
        .select();

      if (error) {
        console.error(`Batch-Insert Fehler (${i}-${i + batchSize}):`, error);
        return { data: null, error };
      }

      if (batchData) {
        results.push(...(batchData as unknown[]));
      }
    }

    return { data: results, error: null };
  },

  // Batch-Update für bessere Performance
  async batchUpdate(
    table: string,
    updates: { id: string; [key: string]: unknown }[],
  ) {
    if (!supabase)
      return { data: null, error: new Error("Supabase nicht verfügbar") };

    const results: unknown[] = [];

    for (const update of updates) {
      const updateItem = update as {
        id: string;
        [key: string]: unknown;
      };

      // Manuell id extrahieren und updateData erstellen
      const id = updateItem.id;
      const updateData: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(updateItem)) {
        if (key !== "id") {
          updateData[key] = value;
        }
      }

      const result = await supabase
        .from(table)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (result.error) {
        console.error(`Batch-Update Fehler für ID ${id}:`, result.error);
        return { data: null, error: result.error };
      }

      if (result.data) {
        results.push(result.data);
      }
    }

    return { data: results, error: null };
  },
};

// Export für TypeScript
export type { User } from "@supabase/supabase-js";
