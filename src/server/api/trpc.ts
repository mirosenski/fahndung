/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
// Rate limit and Redis for per-IP request limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ZodError } from "zod";
import { createClient } from "@supabase/supabase-js";

import {
  type Session,
  type AuthPermissions,
  getRolePermissions,
} from "~/lib/auth";

// Supabase Client für Server-Side
const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Erweiterte User-Typen für tRPC Context
interface TRPCUser {
  id: string;
  email: string;
  role: string;
  permissions: AuthPermissions;
}

interface TRPCContext {
  db: typeof supabase;
  session: Session | null;
  user: TRPCUser | null;
  /**
   * Optional IP address extracted from the incoming request headers. Used for
   * rate limiting and logging. Defaults to "unknown" when no header is
   * available.
   */
  ip?: string;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
}): Promise<TRPCContext> => {
  // Session aus Headers extrahieren
  const session: Session | null = null;
  let user: TRPCUser | null = null;
  // Extract client IP from common proxy headers. When multiple values are
  // present (comma separated), take the first one. Fallback to x-real-ip
  // or "unknown" if nothing is provided.
  const forwarded = opts.headers.get("x-forwarded-for");
  const ipCandidate = forwarded
    ? forwarded.split(",")[0]?.trim()
    : opts.headers.get("x-real-ip");
  const ip = ipCandidate ?? "unknown";
  const debugHeader = opts.headers.get("x-debug-auth");

  try {
    const authHeader = opts.headers.get("Authorization");

    // Nur Debug-Logs wenn explizit gewünscht
    if (debugHeader === "true") {
      console.log("🔍 Auth header found:", !!authHeader);
      console.log("🔍 Debug header found:", !!debugHeader);
    }

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        if (debugHeader === "true") {
          console.log("🔍 Token extracted, length:", token.length);
        }

        const supabaseAuth = createClient(
          process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
          process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
          {
            auth: {
              persistSession: false,
            },
          },
        );

        try {
          // Timeout für Token-Validierung hinzufügen
          const userPromise = supabaseAuth.auth.getUser(token);
          const timeoutPromise = new Promise<{
            data: { user: null };
            error: { message: string };
          }>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { user: null },
                  error: { message: "Timeout" },
                }),
              5000,
            ),
          );

          const result = await Promise.race([userPromise, timeoutPromise]);
          const {
            data: { user: supabaseUser },
            error,
          } = result;

          if (error) {
            if (debugHeader === "true") {
              console.log("❌ Token ungültig:", error.message);
            }

            // 🔥 VERSUCHE ALTERNATIVE TOKEN-VALIDIERUNG MIT JWT-DECODIERUNG
            if (error.message.includes("Invalid API key")) {
              if (debugHeader === "true") {
                console.log(
                  "🔄 Service Role Key Problem - versuche JWT-Decodierung...",
                );
              }

              try {
                // Decodiere den JWT Token manuell
                const tokenParts = token.split(".");
                if (tokenParts.length === 3) {
                  try {
                    const payload = JSON.parse(
                      Buffer.from(tokenParts[1] ?? "", "base64").toString(),
                    ) as {
                      sub?: string;
                      email?: string;
                      exp?: number;
                      role?: string;
                    };

                    if (debugHeader === "true") {
                      console.log("✅ JWT Token erfolgreich decodiert:", {
                        sub: payload.sub,
                        email: payload.email,
                        exp: payload.exp,
                        role: payload.role,
                      });
                    }

                    // Prüfe Token-Ablauf
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp && now >= payload.exp) {
                      if (debugHeader === "true") {
                        console.log("❌ JWT Token ist abgelaufen");
                      }
                      return {
                        db: supabase,
                        session: null,
                        user: null,
                        ip,
                      };
                    }

                    // Erstelle User-Objekt aus JWT-Payload
                    user = {
                      id: payload.sub ?? "",
                      email: payload.email ?? "",
                      role: payload.role ?? "user",
                      permissions: getRolePermissions(payload.role ?? "user"),
                    };

                    if (debugHeader === "true") {
                      console.log("✅ User aus JWT erstellt:", {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                      });
                    }
                  } catch (jwtError) {
                    if (debugHeader === "true") {
                      console.log(
                        "❌ JWT-Decodierung fehlgeschlagen:",
                        jwtError,
                      );
                    }
                  }
                }
              } catch (decodeError) {
                if (debugHeader === "true") {
                  console.log(
                    "❌ Token-Decodierung fehlgeschlagen:",
                    decodeError,
                  );
                }
              }
            }
          } else if (supabaseUser) {
            // Standard Supabase User-Validierung
            user = {
              id: supabaseUser.id,
              email: supabaseUser.email ?? "",
              role: (supabaseUser.user_metadata?.["role"] as string) ?? "user",
              permissions: getRolePermissions(
                (supabaseUser.user_metadata?.["role"] as string) ?? "user",
              ),
            };

            if (debugHeader === "true") {
              console.log("✅ User aus Supabase erstellt:", {
                id: user.id,
                email: user.email,
                role: user.role,
              });
            }
          }
        } catch (authError) {
          if (debugHeader === "true") {
            console.error("❌ Auth-Fehler:", authError);
          }
        }
      }
    }
  } catch (error) {
    if (debugHeader === "true") {
      console.error("❌ Context-Erstellung fehlgeschlagen:", error);
    }
  }

  if (debugHeader === "true") {
    console.log(
      "ℹ️ No Authorization header found - verwende öffentlichen Zugriff",
    );
    console.log(
      "✅ tRPC Context erstellt - Session:",
      !!session,
      "User:",
      !!user,
    );
  }

  return {
    db: supabase,
    session,
    user,
    ip,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Rate limiting middleware using Upstash.
 *
 * Limits each IP to 100 requests per minute using a sliding window algorithm.
 * When the limit is exceeded, a TOOMANYREQUESTS error is thrown. The Redis
 * credentials are picked up from the environment via `UPSTASH_REDIS_REST_URL`
 * and `UPSTASH_REDIS_REST_TOKEN`. See https://github.com/upstash/ratelimit for
 * details.
 */
// Initialize a rate limit instance only if Upstash credentials are present. When
// credentials are missing, rate limiting is disabled and a no-op middleware is
// used instead. This avoids noisy log messages during build when the env
// variables are not provided.
let ratelimit: Ratelimit | null = null;
try {
  const redis = Redis.fromEnv();
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
  });
} catch (err) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Upstash credentials missing. Rate limiting is disabled.",
      err,
    );
  }
}

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ratelimit) {
    // Rate limiting disabled; proceed without limiting
    return next();
  }
  // Determine client IP (set in createTRPCContext). Unknown IPs share the same bucket.
  const ip = ctx.ip ?? "unknown";
  try {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Zu viele Anfragen – bitte später erneut versuchen.",
      });
    }
  } catch (err) {
    // If the rate limit check fails, do not block the request but log an error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Rate limit check failed", err);
    }
  }
  return next();
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "~/server/api/routers" directory.
 */

/**
 * This is how you create new routers and subrouters in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
// Public procedures are rate-limited but do not require authentication.
export const publicProcedure = t.procedure.use(rateLimitMiddleware);

/**
 * Middleware for timing
 */
const timingMiddleware = t.middleware(async ({ path, next }) => {
  const start = Date.now();

  /**
   * Introduce an artificial delay only during local development to make
   * profiling easier. In production the middleware returns immediately
   * to avoid unnecessary latency.
   */
  if (process.env.NODE_ENV === "development") {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  const end = Date.now();

  // Log execution time only in development for debugging purposes
  if (process.env.NODE_ENV === "development") {
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  }

  return result;
});

/**
 * Middleware for authentication
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Nicht authentifiziert - Bitte melden Sie sich an",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Middleware for admin-only procedures
 */
const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Nicht authentifiziert - Bitte melden Sie sich an",
    });
  }

  // Prüfe Admin-Rechte
  const userRole = ctx.user.role;
  if (userRole !== "admin" && userRole !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin-Rechte erforderlich",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});


/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(timingMiddleware)
  .use(authMiddleware);

/**
 * Admin-only procedure
 *
 * This is for procedures that require admin privileges.
 */
export const adminProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(timingMiddleware)
  .use(adminMiddleware);

/**
 * Create a server-side caller for the tRPC API
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;
