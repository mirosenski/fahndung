"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
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

// 🔥 VERBESSERTE TOKEN-EXTRAKTION MIT SUPABASE CLIENT
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    console.log("🔍 tRPC: Hole Auth-Token von Supabase...");
    
    // Direkte Supabase Session-Abfrage
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn("❌ tRPC: Supabase Session-Fehler:", error.message);
      return null;
    }

    if (!session?.access_token) {
      console.warn("❌ tRPC: Kein Access-Token in Session gefunden");
      return null;
    }

    console.log("✅ tRPC: Token erfolgreich extrahiert", {
      tokenLength: session.access_token.length,
      tokenStart: session.access_token.substring(0, 20) + "...",
    });

    return session.access_token;
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
          headers: async () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");

            // 🔥 VERBESSERTE AUTH-HEADER-SETZUNG MIT ASYNC
            try {
              const authToken = await getAuthToken();

              if (authToken) {
                headers.set("Authorization", `Bearer ${authToken}`);
                console.log("✅ tRPC: Auth-Header gesetzt", {
                  tokenLength: authToken.length,
                  tokenStart: authToken.substring(0, 20) + "...",
                });
              } else {
                console.warn("❌ tRPC: Kein Auth-Token für Header verfügbar");
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
