"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

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

// 🔥 VERBESSERTE TOKEN-EXTRAKTION
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // Methode 1: Direkte Supabase-Schlüssel suchen
    const sessionKeys = Object.keys(localStorage).filter(
      (key) => key.includes("supabase") && key.includes("auth-token"),
    );

    console.log("🔍 tRPC: Gefundene Auth-Schlüssel:", sessionKeys);

    for (const key of sessionKeys) {
      const sessionStr = localStorage.getItem(key);
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr) as Record<string, unknown>;

          // Verschiedene Token-Pfade versuchen
          const token =
            (session?.["access_token"] as string) ??
            ((session?.["currentSession"] as Record<string, unknown>)?.["access_token"] as string) ??
            ((session?.["session"] as Record<string, unknown>)?.["access_token"] as string);

          if (token && typeof token === "string") {
            console.log("✅ tRPC: Token gefunden in", key);
            return token;
          }
        } catch (parseError) {
          console.warn("Failed to parse localStorage session:", parseError);
        }
      }
    }

    // Methode 2: Alle Supabase-Schlüssel durchsuchen
    const allSupabaseKeys = Object.keys(localStorage).filter((key) =>
      key.includes("supabase"),
    );

    console.log("🔍 tRPC: Alle Supabase-Schlüssel:", allSupabaseKeys);

    for (const key of allSupabaseKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value) as unknown;

          // Rekursive Token-Suche
          function findToken(obj: unknown): string | null {
            if (typeof obj !== "object" || obj === null) return null;

            if (
              typeof obj === "object" &&
              obj !== null &&
              "access_token" in obj &&
              typeof (obj as Record<string, unknown>)["access_token"] === "string"
            ) {
              return (obj as Record<string, unknown>)["access_token"] as string;
            }

            if (typeof obj === "object" && obj !== null) {
              for (const [, v] of Object.entries(obj)) {
                const found = findToken(v);
                if (found) return found;
              }
            }
            return null;
          }

          const foundToken = findToken(parsed);
          if (foundToken) {
            console.log(
              "✅ tRPC: Token gefunden durch rekursive Suche in",
              key,
            );
            return foundToken;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    console.warn("❌ tRPC: Kein Auth-Token gefunden");
    return null;
  } catch (error) {
    console.error("❌ tRPC: Fehler bei Token-Extraktion:", error);
    return null;
  }
}

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
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");

            // 🔥 VERBESSERTE AUTH-HEADER-SETZUNG
            try {
              const authToken = getAuthToken();

              if (authToken) {
                headers.set("Authorization", `Bearer ${authToken}`);
                console.log("✅ tRPC: Auth-Header gesetzt", {
                  tokenLength: authToken.length,
                  tokenStart: authToken.substring(0, 20) + "...",
                });
              } else {
                console.warn("❌ tRPC: Kein Auth-Token für Header verfügbar");

                // Debug-Informationen
                const allKeys = Object.keys(localStorage);
                const supabaseKeys = allKeys.filter((key) =>
                  key.includes("supabase"),
                );
                console.log(
                  "🔍 tRPC: Alle localStorage-Schlüssel:",
                  allKeys.length,
                );
                console.log("🔍 tRPC: Supabase-Schlüssel:", supabaseKeys);
              }
            } catch (error) {
              console.error(
                "❌ tRPC: Fehler beim Setzen des Auth-Headers:",
                error,
              );
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
