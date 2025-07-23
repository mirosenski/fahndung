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

import { db } from "~/server/db";
import { getCurrentSession } from "~/lib/auth";
import { supabase } from "~/lib/supabase";

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
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Try to get session from headers first (for tRPC calls)
  let session = null;

  try {
    const authHeader = opts.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      console.log("🔍 tRPC: Token erhalten, validiere...", {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + "...",
      });

      // Verify token with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        console.log("✅ tRPC: Token validiert für Benutzer:", user.email);

        // Get user profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        session = {
          user: {
            id: user.id,
            email: user.email ?? "",
          },
          profile: profile,
        };

        console.log("✅ tRPC: Session erstellt", {
          userId: user.id,
          role: profile?.["role"],
        });
      } else {
        console.warn("❌ tRPC: Token-Validierung fehlgeschlagen:", error);
      }
    } else {
      console.log("ℹ️ tRPC: Kein Authorization-Header gefunden");
    }
  } catch (error) {
    console.warn("❌ tRPC: Fehler beim Token-Handling:", error);
  }

  // Fallback to getCurrentSession if no session from headers
  if (!session) {
    try {
      console.log("🔄 tRPC: Fallback - Verwende getCurrentSession...");
      session = await getCurrentSession();

      if (session) {
        console.log("✅ tRPC: Session über Fallback erhalten", {
          userId: session.user.id,
          role: session.profile?.role,
        });
      } else {
        console.log("ℹ️ tRPC: Keine Session über Fallback verfügbar");
      }
    } catch (error) {
      console.warn("❌ tRPC: Fehler beim Fallback-Session-Check:", error);
    }
  }

  return {
    db,
    session,
    ...opts,
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
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Middleware for authentication
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    console.log("❌ Auth middleware: Keine Session gefunden");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Nicht authentifiziert - Bitte melden Sie sich an",
    });
  }

  console.log("✅ Auth middleware: Session gefunden", {
    userId: ctx.session.user.id,
    role: ctx.session.profile?.role,
  });

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Middleware for admin-only procedures
 */
const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    console.log("❌ Admin middleware: Keine Session gefunden");
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Nicht authentifiziert - Bitte melden Sie sich an",
    });
  }

  if (ctx.session.profile?.role !== "admin") {
    console.log("❌ Admin middleware: Keine Admin-Rechte", {
      userId: ctx.session.user.id,
      role: ctx.session.profile?.role,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin-Rechte erforderlich",
    });
  }

  console.log("✅ Admin middleware: Admin-Rechte bestätigt", {
    userId: ctx.session.user.id,
    role: ctx.session.profile.role,
  });

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
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
