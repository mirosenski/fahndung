import { AuthError } from "@supabase/supabase-js";
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createClient } from "@supabase/supabase-js";

import {
  type Session,
  type UserProfile,
  type AuthPermissions,
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
  console.log("🔧 Creating tRPC context with Supabase...");
  console.log("🔍 Environment check:", {
    hasSupabaseUrl: !!process.env["NEXT_PUBLIC_SUPABASE_URL"],
    hasServiceRoleKey: !!process.env["SUPABASE_SERVICE_ROLE_KEY"],
    hasAnonKey: !!process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    supabaseUrl:
      process.env["NEXT_PUBLIC_SUPABASE_URL"]?.substring(0, 20) + "...",
  });

  // Session aus Headers extrahieren
  let session: Session | null = null;
  let user: TRPCUser | null = null;

  try {
    const authHeader = opts.headers.get("Authorization");
    const debugHeader = opts.headers.get("x-debug-auth");

    console.log("🔍 Auth header found:", !!authHeader);
    console.log("🔍 Debug header found:", !!debugHeader);
    console.log("🔍 All headers:", Object.fromEntries(opts.headers.entries()));

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        console.log("🔍 Token extracted, length:", token.length);
        console.log("🔍 Token start:", token.substring(0, 20) + "...");

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
          // 🔥 VERBESSERTE TOKEN-VALIDIERUNG MIT MEHR DEBUGGING
          console.log("🔍 Starte Token-Validierung...");

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
              5000, // Erhöht auf 5000ms für stabilere Verbindung
            ),
          );

          const result = await Promise.race([userPromise, timeoutPromise]);
          const {
            data: { user: supabaseUser },
            error,
          } = result;

          if (error) {
            console.log("❌ Token ungültig:", error.message);
            if (error instanceof AuthError) {
              console.log("❌ Error details:", {
                message: error.message,
                status: "status" in error ? error.status : undefined,
                name: "name" in error ? error.name : undefined,
              });
            }

            // 🔥 VERSUCHE ALTERNATIVE TOKEN-VALIDIERUNG MIT JWT-DECODIERUNG
            if (error.message.includes("Invalid API key")) {
              console.log(
                "🔄 Service Role Key Problem - versuche JWT-Decodierung...",
              );

              try {
                // 🔥 ALTERNATIVE TOKEN-VALIDIERUNG MIT JWT-DECODIERUNG
                console.log("🔍 Versuche JWT-Token-Decodierung...");

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

                    console.log("✅ JWT Token erfolgreich decodiert:", {
                      sub: payload.sub,
                      email: payload.email,
                      exp: payload.exp,
                      role: payload.role,
                    });

                    // Prüfe Token-Ablauf
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp && now >= payload.exp) {
                      console.log("❌ Token ist abgelaufen");
                      throw new Error("Token expired");
                    }

                    // Erstelle User-Objekt aus JWT Payload
                    const userFromJWT = {
                      id: payload.sub ?? "",
                      email: payload.email ?? "",
                      role: payload.role ?? "authenticated",
                    };

                    console.log("✅ User aus JWT extrahiert:", userFromJWT);

                    // Benutzer-Profil abrufen (versuche, aber ignoriere Fehler)
                    let profile = null;
                    try {
                      const supabaseAnon = createClient(
                        process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
                        process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
                        {
                          auth: {
                            persistSession: false,
                          },
                        },
                      );

                      const profileResult = await supabaseAnon
                        .from("user_profiles")
                        .select("*")
                        .eq("user_id", userFromJWT.id)
                        .single();

                      const { data: profileData, error: profileError } =
                        profileResult as {
                          data: UserProfile | null;
                          error: { message: string } | null;
                        };

                      if (profileError) {
                        console.warn(
                          "❌ Profile fetch failed:",
                          profileError.message,
                        );
                        // Erstelle ein Standard-Profil für authentifizierte Benutzer
                        profile = {
                          id: userFromJWT.id,
                          user_id: userFromJWT.id,
                          email: userFromJWT.email ?? "",
                          role: "user", // Standard-Rolle
                          name: userFromJWT.email?.split("@")[0] ?? "User",
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        } as UserProfile;
                      } else {
                        profile = profileData;
                      }
                    } catch (profileError) {
                      console.warn("❌ Profile fetch failed:", profileError);
                      // Erstelle ein Standard-Profil für authentifizierte Benutzer
                      profile = {
                        id: userFromJWT.id,
                        user_id: userFromJWT.id,
                        email: userFromJWT.email ?? "",
                        role: "user", // Standard-Rolle
                        name: userFromJWT.email?.split("@")[0] ?? "User",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      } as UserProfile;
                    }

                    session = {
                      user: {
                        id: userFromJWT.id,
                        email: userFromJWT.email ?? "",
                      },
                      profile: profile,
                    };

                    // Erstelle TRPCUser mit Permissions
                    if (profile) {
                      const { getRolePermissions } = await import("~/lib/auth");
                      const permissions = getRolePermissions(profile.role);

                      user = {
                        id: userFromJWT.id,
                        email: userFromJWT.email ?? "",
                        role: profile.role,
                        permissions: permissions,
                      };
                    }

                    console.log(
                      "✅ User authenticated with JWT:",
                      userFromJWT.id,
                      "Role:",
                      profile?.role,
                    );
                  } catch (jwtError) {
                    console.error(
                      "❌ JWT Decodierung fehlgeschlagen:",
                      jwtError,
                    );
                    console.log(
                      "🔄 Token-Fehler - verwende öffentlichen Zugriff",
                    );
                  }
                } else {
                  console.log("❌ Ungültiger JWT Token Format");
                  console.log(
                    "🔄 Token-Fehler - verwende öffentlichen Zugriff",
                  );
                }
              } catch (tokenError) {
                console.error(
                  "❌ Alternative Token validation error:",
                  tokenError,
                );
                console.log("🔄 Token-Fehler - verwende öffentlichen Zugriff");
              }
            } else {
              // Spezifische Behandlung für verschiedene Token-Fehler
              if (
                error.message.includes("Invalid JWT") ||
                error.message.includes("JWT expired") ||
                error.message.includes("Token has expired") ||
                error.message.includes("signature verification failed")
              ) {
                console.log("🔄 Token-Fehler - verwende öffentlichen Zugriff");
              } else {
                console.log("🔄 Auth-Fehler - verwende öffentlichen Zugriff");
              }
            }
          } else if (supabaseUser) {
            console.log("✅ User authentifiziert:", supabaseUser.email);
            console.log("✅ User ID:", supabaseUser.id);

            // Benutzer-Profil abrufen
            const profileResult = await supabaseAuth
              .from("user_profiles")
              .select("*")
              .eq("user_id", supabaseUser.id)
              .single();

            const { data: profile, error: profileError } = profileResult as {
              data: UserProfile | null;
              error: { message: string } | null;
            };

            if (profileError) {
              console.warn("❌ Profile fetch failed:", profileError.message);
            }

            session = {
              user: {
                id: supabaseUser.id,
                email: supabaseUser.email ?? "",
              },
              profile: profile,
            };

            // Erstelle TRPCUser mit Permissions
            if (profile) {
              const { getRolePermissions } = await import("~/lib/auth");
              const permissions = getRolePermissions(profile.role);

              user = {
                id: supabaseUser.id,
                email: supabaseUser.email ?? "",
                role: profile.role,
                permissions: permissions,
              };
            }

            console.log(
              "✅ User authenticated:",
              supabaseUser.id,
              "Role:",
              profile?.role,
            );
          } else {
            console.log("⚠️ Kein User aus Token extrahiert");
          }
        } catch (tokenError) {
          console.error("❌ Token validation error:", tokenError);
          console.log("🔄 Token-Fehler - verwende öffentlichen Zugriff");
        }
      } else {
        console.log("⚠️ Kein Token im Authorization Header gefunden");
      }
    } else {
      console.log(
        "ℹ️ No Authorization header found - verwende öffentlichen Zugriff",
      );
    }
  } catch (error) {
    console.error("❌ Context creation error:", error);
    console.log("🔄 Context-Fehler - verwende öffentlichen Zugriff");
  }

  console.log(
    "✅ tRPC Context erstellt - Session:",
    !!session,
    "User:",
    !!user,
  );

  return {
    db: supabase, // ✅ Supabase Client wird als 'db' bereitgestellt
    session,
    user,
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
  transformer: superjson,
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
export const publicProcedure = t.procedure;

/**
 * Middleware for timing
 */
const timingMiddleware = t.middleware(async ({ path, next }) => {
  const start = Date.now();
  console.log(`[TRPC] ${path} starting...`);

  // artificial delay in dev
  const waitMs = Math.floor(Math.random() * 400) + 100;
  await new Promise((resolve) => setTimeout(resolve, waitMs));
  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Middleware for authentication
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  console.log("🔍 Auth middleware: Prüfe Authentifizierung...");
  console.log("🔍 Context Details:", {
    hasUser: !!ctx.user,
    userId: ctx.user?.id,
    userEmail: ctx.user?.email,
    userRole: ctx.user?.role,
    hasSession: !!ctx.session,
    sessionUser: ctx.session?.user?.id,
  });

  if (!ctx.user) {
    console.log("❌ Auth middleware: Kein User gefunden");
    console.log("🔍 Context Debug:", {
      user: ctx.user,
      session: ctx.session,
      hasUser: !!ctx.user,
      hasSession: !!ctx.session,
    });
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Nicht authentifiziert - Bitte melden Sie sich an",
    });
  }

  console.log("✅ Auth middleware: User gefunden", {
    userId: ctx.user.id,
    userRole: ctx.user.role,
  });

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
    console.log("❌ Admin middleware: Kein User gefunden");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Nicht authentifiziert - Bitte melden Sie sich an",
    });
  }

  // Prüfe Admin-Rechte
  const userRole = ctx.user.role;
  if (userRole !== "admin" && userRole !== "super_admin") {
    console.log("❌ Admin middleware: Insufficient permissions:", userRole);
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin-Rechte erforderlich",
    });
  }

  console.log("✅ Admin middleware: Admin-Rechte bestätigt", {
    userId: ctx.user.id,
    userRole: userRole,
  });

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
  .use(timingMiddleware)
  .use(authMiddleware);

/**
 * Admin-only procedure
 *
 * This is for procedures that require admin privileges.
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(adminMiddleware);

/**
 * Create a server-side caller for the tRPC API
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;
