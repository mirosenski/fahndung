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
  clientQueryClientSingleton =
    clientQueryClientSingleton ?? createQueryClient();

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
    console.log("🔑 tRPC: Versuche Token zu extrahieren...");

    // Direkte Supabase Session-Abfrage mit kürzerem Timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<null>(
      (resolve) => setTimeout(() => resolve(null), 5000), // Erhöht auf 5000ms für stabilere Verbindung
    );

    const result = await Promise.race([sessionPromise, timeoutPromise]);

    if (!result) {
      console.log("⚠️ tRPC: Timeout bei Token-Extraktion");
      return null;
    }

    const {
      data: { session },
      error,
    } = result;

    if (error) {
      console.error("❌ tRPC: Session-Fehler bei Token-Extraktion:", error);

      // Bei spezifischen Auth-Fehlern Session bereinigen
      if (
        error.message.includes("Invalid Refresh Token") ||
        error.message.includes("Refresh Token Not Found") ||
        error.message.includes("JWT expired") ||
        error.message.includes("Token has expired")
      ) {
        console.log("🔄 tRPC: Auth-Fehler erkannt - bereinige Session...");
        await supabase.auth.signOut();
        return null;
      }

      return null;
    }

    if (!session?.access_token) {
      console.log("⚠️ tRPC: Kein Access-Token in Session");
      return null;
    }

    // Prüfe Token-Ablauf
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;

    if (expiresAt && now >= expiresAt) {
      console.log("🔄 tRPC: Token ist abgelaufen - bereinige Session...");
      await supabase.auth.signOut();
      return null;
    }

    console.log("✅ tRPC: Token erfolgreich extrahiert:", {
      tokenLength: session.access_token.length,
      tokenStart: session.access_token.substring(0, 20) + "...",
      userEmail: session.user?.email,
      expiresAt: new Date(expiresAt! * 1000).toISOString(),
      tokenValid: expiresAt ? now < expiresAt : true,
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
                console.log("🔑 Auth-Token gesetzt:", {
                  tokenLength: authToken.length,
                  tokenStart: authToken.substring(0, 20) + "...",
                });
              } else {
                console.log("⚠️ Kein Auth-Token verfügbar");
              }
            } catch (error) {
              console.error(
                "❌ tRPC: Fehler beim Setzen des Auth-Headers:",
                error,
              );
            }

            // 🔥 ZUSÄTZLICHE DEBUGGING-HEADER
            headers.set("x-debug-auth", "true");

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
