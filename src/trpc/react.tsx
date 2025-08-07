"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";

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
    // Direkte Supabase Session-Abfrage mit kürzerem Timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000),
    );

    const result = await Promise.race([sessionPromise, timeoutPromise]);

    if (!result) {
      return null;
    }

    const {
      data: { session },
      error,
    } = result;

    if (error) {
      // Bei spezifischen Auth-Fehlern Session bereinigen
      if (
        error.message.includes("Invalid Refresh Token") ||
        error.message.includes("Refresh Token Not Found") ||
        error.message.includes("JWT expired") ||
        error.message.includes("Token has expired")
      ) {
        await supabase.auth.signOut();
        return null;
      }

      return null;
    }

    if (!session?.access_token) {
      return null;
    }

    // Prüfe Token-Ablauf
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;

    if (expiresAt && now >= expiresAt) {
      await supabase.auth.signOut();
      return null;
    }

    return session.access_token;
  } catch {
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
          logger: (opts) => {
            // Verbesserte Logging für getInvestigation-Fehler - nur in Development
            if (
              opts.path === "post.getInvestigation" &&
              process.env.NODE_ENV === "development"
            ) {
              if (opts.direction === "down" && opts.result instanceof Error) {
                console.error("❌ getInvestigation Fehler:", {
                  error: opts.result.message,
                  input: opts.input,
                  timestamp: new Date().toISOString(),
                });
              } else if (opts.direction === "up") {
                console.log("🔍 getInvestigation Query:", {
                  input: opts.input,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          },
        }),
        unstable_httpBatchStreamLink({
          url: getBaseUrl() + "/api/trpc",
          headers: async () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");

            // 🔥 VERBESSERTE AUTH-HEADER-SETZUNG MIT ASYNC
            try {
              const authToken = await getAuthToken();

              if (authToken) {
                headers.set("Authorization", `Bearer ${authToken}`);
              }
            } catch {
              // Silent error handling
            }

            // Debug-Header nur in Development
            if (process.env.NODE_ENV === "development") {
              headers.set("x-debug-auth", "true");
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
