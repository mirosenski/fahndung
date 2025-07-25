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

  // Session aus Headers extrahieren
  let session: Session | null = null;
  let user: TRPCUser | null = null;

  try {
    const authHeader = opts.headers.get("Authorization");
    console.log("🔍 Auth header found:", !!authHeader);

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        console.log("🔍 Token extracted, length:", token.length);

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
              2000, // Reduziert auf 2000ms für schnellere Antwort
            ),
          );

          const result = await Promise.race([userPromise, timeoutPromise]);
          const {
            data: { user: supabaseUser },
            error,
          } = result;

          if (error) {
            console.log("❌ Token ungültig:", error.message);
            console.log("🔄 Auth-Fehler - verwende öffentlichen Zugriff");
          } else if (supabaseUser) {
            console.log("✅ User authentifiziert:", supabaseUser.email);

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
          }
        } catch (tokenError) {
          console.error("❌ Token validation error:", tokenError);
          console.log("🔄 Token-Fehler - verwende öffentlichen Zugriff");
        }
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
  if (!ctx.user) {
    console.log("❌ Auth middleware: Kein User gefunden");
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
