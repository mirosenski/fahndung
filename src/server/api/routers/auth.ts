import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getCurrentSession, createOrUpdateProfile } from "~/lib/auth";
import type { UserProfile } from "~/lib/auth";

export const authRouter = createTRPCRouter({
  // Aktuelle Session abrufen
  getSession: publicProcedure.query(async () => {
    try {
      console.log("🔍 tRPC Auth: getSession aufgerufen...");
      const session = await getCurrentSession();

      if (session) {
        console.log("✅ tRPC Auth: Session gefunden", {
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: session.profile?.role,
        });
        return session;
      } else {
        console.log("❌ tRPC Auth: Keine Session gefunden");
        return null;
      }
    } catch (error) {
      console.error("❌ tRPC Auth: Fehler beim Abrufen der Session:", error);
      throw new Error("Keine tRPC Auth Session");
    }
  }),

  // Benutzer-Profil erstellen oder aktualisieren
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        role: z.enum(["admin", "editor", "user"]).optional(),
        department: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx: _ctx, input }) => {
      const session = await getCurrentSession();
      if (!session) {
        throw new Error("Nicht authentifiziert");
      }

      const profile = await createOrUpdateProfile(
        session.user.id,
        session.user.email,
        input,
      );

      return profile;
    }),

  // Alle Benutzer abrufen (nur für Admins)
  getAllUsers: protectedProcedure.query(async ({ ctx: _ctx }) => {
    const session = await getCurrentSession();
    if (
      !session?.profile ||
      (session.profile.role !== "admin" &&
        session.profile.role !== "super_admin")
    ) {
      throw new Error("Admin-Rechte erforderlich");
    }

    const usersResult = await _ctx.db
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: users, error } = usersResult as {
      data: UserProfile[] | null;
      error: { message: string } | null;
    };

    if (error) {
      throw new Error(`Fehler beim Abrufen der Benutzer: ${error.message}`);
    }

    return users ?? [];
  }),

  // Benutzer-Rolle aktualisieren (nur für Admins)
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "editor", "user", "super_admin"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getCurrentSession();
      if (
        !session?.profile ||
        (session.profile.role !== "admin" &&
          session.profile.role !== "super_admin")
      ) {
        throw new Error("Admin-Rechte erforderlich");
      }

      const updateResult = await ctx.db
        .from("user_profiles")
        .update({ role: input.role })
        .eq("user_id", input.userId)
        .select()
        .single();

      const { data, error } = updateResult as {
        data: UserProfile | null;
        error: { message: string } | null;
      };

      if (error) {
        throw new Error(
          `Fehler beim Aktualisieren der Benutzer-Rolle: ${error.message}`,
        );
      }

      return data!;
    }),

  // Benutzer löschen (nur für Admins)
  deleteUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await getCurrentSession();
      if (
        !session?.profile ||
        (session.profile.role !== "admin" &&
          session.profile.role !== "super_admin")
      ) {
        throw new Error("Admin-Rechte erforderlich");
      }

      const { error } = await ctx.db
        .from("user_profiles")
        .delete()
        .eq("user_id", input.userId);

      if (error) {
        throw new Error(`Fehler beim Löschen des Benutzers: ${error.message}`);
      }

      return { success: true };
    }),
});
