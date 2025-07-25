import { createClient } from "@supabase/supabase-js";

// Environment-Variablen für Remote Supabase
const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

// Environment-Variablen-Prüfung
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
    "Missing Supabase environment variables for REMOTE environment",
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
  supabaseInstance ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "x-application-name": "fahndung-app",
      },
    },
  });
  return supabaseInstance;
};

export const supabase = getSupabaseInstance();

// Hilfsfunktion für MessagePort-Fehler (häufig bei Auth-Listenern)
const handleMessagePortError = (error: unknown): boolean => {
  if (
    error instanceof Error &&
    (error.message.includes("MessagePort") ||
      error.message.includes("port") ||
      error.message.includes("disconnected"))
  ) {
    return true;
  }
  return false;
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
        } else {
          console.error("❌ Auth-Listener Fehler:", error);
        }
      }
    });

    return subscription;
  } catch (error) {
    if (handleMessagePortError(error)) {
      return null;
    }
    console.error("❌ Auth-Listener Setup Fehler:", error);
    return null;
  }
};

// Remote Supabase spezifische Konfiguration
export const REMOTE_SUPABASE_CONFIG = {
  url: supabaseUrl,
  projectId: supabaseUrl.replace("https://", "").replace(".supabase.co", ""),
  isRemote: true,
  storageBucket: "media-gallery",
  authTimeout: 30000,
  retryAttempts: 3,
} as const;

if (typeof window !== "undefined") {
  console.log("🔧 Supabase Client Konfiguration:", {
    url: supabaseUrl,
    projectId: REMOTE_SUPABASE_CONFIG.projectId,
    storageBucket: REMOTE_SUPABASE_CONFIG.storageBucket,
  });
}

// Performance-Monitoring
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - start;

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
      console.error("❌ Fetch Error:", error);
      throw error;
    }
  };
}

// Optimierte Connection-Pooling mit Error-Handling
let connectionPool: Promise<typeof supabase> | null = null;

export const getSupabaseClient = () => {
  connectionPool ??= Promise.resolve(supabase).catch((error) => {
    if (handleMessagePortError(error)) {
      // Bei Message Port Fehlern neu initialisieren

      return supabase;
    }
    throw error;
  });
  return connectionPool;
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
        // No-op da Supabase nicht verfügbar
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
    .subscribe(() => {
      // intentionally left blank
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
