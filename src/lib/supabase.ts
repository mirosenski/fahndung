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
  new URL(supabaseUrl ?? "");
} catch {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
}

// Singleton-Pattern für Supabase-Client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseInstance = () => {
  supabaseInstance ??= createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 100, // Erhöht für bessere Performance
        heartbeatIntervalMs: 500, // Häufigere Heartbeats
        reconnectAfterMs: 500, // Schnellere Reconnection
        maxRetries: 5, // Mehr Reconnection-Versuche
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

// Exportiere die Supabase-Instanz mit Error-Handling
export const supabase = (() => {
  try {
    return getSupabaseInstance();
  } catch (error) {
    console.error("❌ Fehler beim Initialisieren von Supabase:", error);
    // Fallback: Erstelle einen minimalen Client für bessere Fehlerbehandlung
    return createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
          heartbeatIntervalMs: 1000,
          reconnectAfterMs: 1000,
          maxRetries: 3,
        },
      },
    });
  }
})();

// Performance-Monitoring (nur in Development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    try {
      // Sicherstellen, dass originalFetch korrekt aufgerufen wird
      if (typeof originalFetch !== "function") {
        console.error("❌ Original fetch ist keine Funktion");
        throw new Error("Original fetch function is not available");
      }

      const response = await originalFetch.apply(window, args);
      const duration = performance.now() - start;

      if (duration > 3000) {
        // Erhöht auf 3000ms für weniger Warnungen
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
      // Bessere Fehlerbehandlung für Network-Fehler
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error(
          "🌐 Netzwerkfehler - Überprüfen Sie Ihre Internetverbindung",
        );
      }
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
      supabaseInstance = null;
      return getSupabaseInstance();
    }
    throw error;
  });
  return connectionPool;
};

// Hilfsfunktion für Message Port Fehler
function handleMessagePortError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("MessagePort") ||
      error.message.includes("port") ||
      error.message.includes("connection")
    );
  }
  return false;
}

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

  if (process.env.NODE_ENV === "development") {
    console.log(
      "🔗 Erstelle Supabase Real-time Subscription für investigations",
    );
  }

  // Verwende Postgres Changes (einfacher Ansatz)
  return supabase
    .channel("investigations-realtime")
    .on(
      "postgres_changes",
      {
        event: "*", // Alle Events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "investigations",
      },
      (payload) => {
        if (process.env.NODE_ENV === "development") {
          console.log("📡 Real-time Event erhalten:", payload);
        }
        callback(payload);
      },
    )
    .subscribe((status) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔗 Real-time Subscription Status:", status);
      }
    });
};

// Alternative: Broadcast-basierte Real-time Subscriptions (für bessere Skalierbarkeit)
export const subscribeToInvestigationsBroadcast = (
  investigationId: string,
  callback: (payload: Record<string, unknown>) => void,
) => {
  if (!supabase) {
    console.warn(
      "⚠️ Supabase nicht konfiguriert - Broadcast Real-time Updates deaktiviert",
    );
    return {
      unsubscribe: () => {
        // No-op da Supabase nicht verfügbar
      },
    };
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      "🔗 Erstelle Broadcast Real-time Subscription für Investigation:",
      investigationId,
    );
  }

  // Verwende Broadcast (empfohlen für Skalierbarkeit)
  return supabase
    .channel(`topic:${investigationId}`, {
      config: { private: true }, // Private Channel für Broadcast
    })
    .on("broadcast", { event: "INSERT" }, (payload) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📡 Broadcast INSERT Event:", payload);
      }
      callback(payload);
    })
    .on("broadcast", { event: "UPDATE" }, (payload) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📡 Broadcast UPDATE Event:", payload);
      }
      callback(payload);
    })
    .on("broadcast", { event: "DELETE" }, (payload) => {
      if (process.env.NODE_ENV === "development") {
        console.log("📡 Broadcast DELETE Event:", payload);
      }
      callback(payload);
    })
    .subscribe((status) => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔗 Broadcast Real-time Subscription Status:", status);
      }
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
