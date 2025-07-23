"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";
import { supabase } from "~/lib/supabase";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient();

  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: async () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");

            // Verbesserte Token-Extraktion mit Supabase Client
            try {
              if (typeof window !== "undefined") {
                // Methode 1: Direkt über Supabase Client (empfohlen)
                const {
                  data: { session },
                } = await supabase.auth.getSession();

                if (session?.access_token) {
                  headers.set(
                    "Authorization",
                    `Bearer ${session.access_token}`,
                  );
                  console.log("✅ tRPC: Token von Supabase Client", {
                    tokenLength: session.access_token.length,
                    tokenStart: session.access_token.substring(0, 20) + "...",
                  });
                  return headers;
                }

                // Methode 2: Fallback - localStorage durchsuchen
                console.log(
                  "🔍 tRPC: Fallback - Suche Token in localStorage...",
                );

                const sessionKeys = Object.keys(localStorage).filter(
                  (key) =>
                    key.includes("supabase") && key.includes("auth-token"),
                );

                console.log(
                  "🔍 tRPC: Gefundene Supabase-Schlüssel:",
                  sessionKeys,
                );

                for (const key of sessionKeys) {
                  const sessionStr = localStorage.getItem(key);
                  if (sessionStr) {
                    try {
                      const session = JSON.parse(sessionStr) as {
                        access_token?: string;
                        currentSession?: { access_token?: string };
                      };

                      const authToken =
                        session?.access_token ??
                        session?.currentSession?.access_token ??
                        null;

                      if (authToken) {
                        headers.set("Authorization", `Bearer ${authToken}`);
                        console.log("✅ tRPC: Token gefunden in localStorage", {
                          tokenLength: authToken.length,
                          tokenStart: authToken.substring(0, 20) + "...",
                        });
                        return headers;
                      }
                    } catch (parseError) {
                      console.warn(
                        "Failed to parse localStorage session:",
                        parseError,
                      );
                    }
                  }
                }

                // Methode 3: Erweiterte Suche in allen Supabase-Schlüsseln
                const allSupabaseKeys = Object.keys(localStorage).filter(
                  (key) => key.includes("supabase"),
                );

                for (const key of allSupabaseKeys) {
                  const value = localStorage.getItem(key);
                  if (value) {
                    try {
                      const parsed = JSON.parse(value) as Record<
                        string,
                        unknown
                      >;

                      // Suche nach access_token
                      if (
                        parsed["access_token"] &&
                        typeof parsed["access_token"] === "string"
                      ) {
                        const authToken = parsed["access_token"];
                        headers.set("Authorization", `Bearer ${authToken}`);
                        console.log(
                          "✅ tRPC: Token gefunden in erweiterter Suche",
                          {
                            tokenLength: authToken.length,
                            tokenStart: authToken.substring(0, 20) + "...",
                          },
                        );
                        return headers;
                      }

                      // Suche in currentSession
                      if (
                        parsed["currentSession"] &&
                        typeof parsed["currentSession"] === "object"
                      ) {
                        const currentSession = parsed[
                          "currentSession"
                        ] as Record<string, unknown>;
                        if (
                          currentSession["access_token"] &&
                          typeof currentSession["access_token"] === "string"
                        ) {
                          const authToken = currentSession["access_token"];
                          headers.set("Authorization", `Bearer ${authToken}`);
                          console.log(
                            "✅ tRPC: Token gefunden in currentSession",
                            {
                              tokenLength: authToken.length,
                              tokenStart: authToken.substring(0, 20) + "...",
                            },
                          );
                          return headers;
                        }
                      }
                    } catch {
                      // Ignore parse errors
                    }
                  }
                }

                console.warn("❌ tRPC: Kein Auth-Token gefunden");

                // Debug-Informationen
                const allKeys = Object.keys(localStorage);
                const supabaseKeys = allKeys.filter((key) =>
                  key.includes("supabase"),
                );
                console.log("🔍 tRPC: Alle localStorage-Schlüssel:", allKeys);
                console.log("🔍 tRPC: Supabase-Schlüssel:", supabaseKeys);

                // Zeige Inhalt der ersten Supabase-Schlüssel
                if (supabaseKeys.length > 0) {
                  const firstKey = supabaseKeys[0];
                  if (firstKey) {
                    const firstValue = localStorage.getItem(firstKey);
                    if (firstValue) {
                      console.log(
                        "🔍 tRPC: Inhalt von",
                        firstKey,
                        ":",
                        firstValue.substring(0, 200) + "...",
                      );
                    }
                  }
                }
              }
            } catch (error) {
              console.warn("Failed to get auth token for tRPC headers:", error);
            }

            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env["VERCEL_URL"]) return `https://${process.env["VERCEL_URL"]}`;
  return `http://localhost:${process.env["PORT"] ?? 3000}`;
}
