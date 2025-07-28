// src/server/api/routers/post.ts - Erweitert mit Auth & CRUD
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { mediaRouter } from "./media";
import { generateNewCaseNumber } from "~/lib/utils/caseNumberGenerator";

// TypeScript-Typen für Supabase-Responses
interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
  // Article publishing features
  published_as_article?: boolean;
  article_slug?: string;
  article_content?: {
    blocks: Array<{
      type: string;
      content: Record<string, unknown>;
      id?: string;
    }>;
  };
  article_meta?: {
    seo_title?: string;
    seo_description?: string;
    og_image?: string;
    keywords?: string[];
    author?: string;
    reading_time?: number;
  };
  article_published_at?: string;
  article_views?: number;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  role: string;
  department?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Typ für Supabase-Response
interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

export const postRouter = createTRPCRouter({
  // Öffentlich: Fahndungen lesen
  getInvestigations: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("🔍 getInvestigations aufgerufen mit:", input);

      try {
        let query = ctx.db
          .from("investigations")
          .select("*")
          .order("created_at", { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        // Filter anwenden
        if (input.status) {
          query = query.eq("status", input.status);
        }
        if (input.priority) {
          query = query.eq("priority", input.priority);
        }
        if (input.category) {
          query = query.eq("category", input.category);
        }

        const response = (await query) as SupabaseResponse<Investigation[]>;
        const { data, error } = response;

        if (error) {
          console.error("❌ Supabase-Fehler:", error);
          throw new Error(
            `Fehler beim Abrufen der Fahndungen: ${error.message}`,
          );
        }

        console.log("✅ Fahndungen erfolgreich geladen:", data?.length ?? 0);
        return data ?? [];
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Fahndungen:", error);
        throw new Error(`Fehler beim Abrufen der Fahndungen: ${String(error)}`);
      }
    }),

  // Öffentlich: Einzelne Fahndung lesen
  getInvestigation: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        // First get the investigation with basic data and images
        const response = (await ctx.db
          .from("investigations")
          .select(
            `
            *,
            images:investigation_images(*)
          `,
          )
          .eq("id", input.id)
          .single()) as SupabaseResponse<Investigation>;

        const { data, error } = response;

        if (error) {
          throw new Error(`Fahndung nicht gefunden: ${error.message}`);
        }

        // Then get user data separately if needed
        if (data?.created_by) {
          const { data: createdByUser } = await ctx.db
            .from("user_profiles")
            .select("name, email")
            .eq("id", data.created_by)
            .single();

          if (data && createdByUser?.name && createdByUser?.email) {
            data.created_by_user = {
              name: String(createdByUser.name),
              email: String(createdByUser.email),
            };
          }
        }

        if (data?.assigned_to) {
          const { data: assignedToUser } = await ctx.db
            .from("user_profiles")
            .select("name, email")
            .eq("id", data.assigned_to)
            .single();

          if (data && assignedToUser?.name && assignedToUser?.email) {
            data.assigned_to_user = {
              name: String(assignedToUser.name),
              email: String(assignedToUser.email),
            };
          }
        }

        console.log("✅ Fahndung erfolgreich geladen:", data?.title);

        return data!;
      } catch (error) {
        console.error("❌ Fehler beim Laden der Fahndung:", error);
        throw new Error(`Fehler beim Laden der Fahndung: ${String(error)}`);
      }
    }),

  // Öffentlich: Fahndung erstellen (temporär für Tests)
  createInvestigation: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.string().default("active"),
        priority: z.enum(["normal", "urgent", "new"]).default("normal"),
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
        location: z.string().optional(),
        contact_info: z.record(z.any()).optional(),
        case_number: z.string().optional(),
        features: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("🚀 createInvestigation aufgerufen mit:", input);

      try {
        const response = (await ctx.db
          .from("investigations")
          .insert({
            title: input.title,
            description: input.description ?? "",
            status: input.status,
            priority: input.priority,
            category: input.category ?? "MISSING_PERSON",
            tags: input.tags,
            location: input.location ?? "",
            short_description: input.title,
            station: "Allgemein",
            features: input.features ?? "",
            date: new Date().toISOString(),
            case_number:
              input.case_number ??
              generateNewCaseNumber(
                input.category ?? "MISSING_PERSON",
                input.status,
              ),
            contact_info: input.contact_info ?? {},
            metadata: {},
            created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1", // ptlsweb@gmail.com (wichtigster User)
          })
          .select()
          .single()) as SupabaseResponse<Investigation>;

        const { data, error } = response;

        if (error) {
          console.error("❌ Supabase-Fehler:", error);
          throw new Error(
            `Fehler beim Erstellen der Fahndung: ${error.message}`,
          );
        }

        console.log("✅ Fahndung erfolgreich erstellt:", data?.title);
        return data!;
      } catch (error) {
        console.error("❌ Fehler beim Erstellen der Fahndung:", error);
        throw new Error(`Fehler beim Erstellen der Fahndung: ${String(error)}`);
      }
    }),

  // Öffentlich: Fahndung bearbeiten (temporär für Tests)
  updateInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.enum(["normal", "urgent", "new"]).optional(),
        tags: z.array(z.string()).optional(),
        location: z.string().optional(),
        contact_info: z.record(z.any()).optional(),
        features: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("✏️ updateInvestigation aufgerufen mit:", input);

      try {
        // Prüfe ob Fahndung existiert
        const existingResponse = (await ctx.db
          .from("investigations")
          .select("id")
          .eq("id", input.id)
          .single()) as SupabaseResponse<{ id: string }>;

        const { error: fetchError } = existingResponse;

        if (fetchError) {
          throw new Error("Fahndung nicht gefunden");
        }

        const { id, ...updateData } = input;

        const response = (await ctx.db
          .from("investigations")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()) as SupabaseResponse<Investigation>;

        const { data, error } = response;

        if (error) {
          throw new Error(
            `Fehler beim Aktualisieren der Fahndung: ${error.message}`,
          );
        }

        console.log("✅ Fahndung erfolgreich aktualisiert:", data?.title);
        return data!;
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren der Fahndung:", error);
        throw new Error(
          `Fehler beim Aktualisieren der Fahndung: ${String(error)}`,
        );
      }
    }),

  // Öffentlich: Fahndung löschen
  deleteInvestigation: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      console.log("🗑️ deleteInvestigation aufgerufen mit:", input);
      console.log("👤 Benutzer:", ctx.user?.email, "Rolle:", ctx.user?.role);

      try {
        // Prüfe ob Fahndung existiert
        const existingResponse = (await ctx.db
          .from("investigations")
          .select("created_by, title")
          .eq("id", input.id)
          .single()) as SupabaseResponse<{ created_by: string; title: string }>;

        const { data: existing, error: fetchError } = existingResponse;

        if (fetchError) {
          throw new Error("Fahndung nicht gefunden");
        }

        // Lösche die Fahndung
        const deleteResponse = (await ctx.db
          .from("investigations")
          .delete()
          .eq("id", input.id)) as SupabaseResponse<unknown>;

        const { error } = deleteResponse;

        if (error) {
          throw new Error(`Fehler beim Löschen der Fahndung: ${error.message}`);
        }

        console.log("✅ Fahndung erfolgreich gelöscht:", existing?.title);
        return true;
      } catch (error) {
        console.error("❌ Fehler beim Löschen der Fahndung:", error);
        throw new Error(`Fehler beim Löschen der Fahndung: ${String(error)}`);
      }
    }),

  // Öffentlich: Fahndung veröffentlichen/unveröffentlichen
  publishInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        publish: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("📢 publishInvestigation aufgerufen mit:", input);

      try {
        const newStatus = input.publish ? "published" : "active";

        const response = (await ctx.db
          .from("investigations")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
            ...(input.publish && {
              article_published_at: new Date().toISOString(),
            }),
          })
          .eq("id", input.id)
          .select()
          .single()) as SupabaseResponse<Investigation>;

        const { data, error } = response;

        if (error) {
          throw new Error(`Fehler beim Veröffentlichen: ${error.message}`);
        }

        console.log(
          `✅ Fahndung ${input.publish ? "veröffentlicht" : "unveröffentlicht"}:`,
          data?.title,
        );
        return data!;
      } catch (error) {
        console.error("❌ Fehler beim Veröffentlichen:", error);
        throw new Error(`Fehler beim Veröffentlichen: ${String(error)}`);
      }
    }),

  // Öffentlich: Fahndung archivieren/entarchivieren
  archiveInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        archive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("📦 archiveInvestigation aufgerufen mit:", input);

      try {
        const newStatus = input.archive ? "draft" : "active";

        const response = (await ctx.db
          .from("investigations")
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.id)
          .select()
          .single()) as SupabaseResponse<Investigation>;

        const { data, error } = response;

        if (error) {
          throw new Error(`Fehler beim Archivieren: ${error.message}`);
        }

        console.log(
          `✅ Fahndung ${input.archive ? "als Entwurf gesetzt" : "aktiviert"}:`,
          data?.title,
        );
        return data!;
      } catch (error) {
        console.error("❌ Fehler beim Archivieren:", error);
        throw new Error(`Fehler beim Archivieren: ${String(error)}`);
      }
    }),

  // Öffentlich: Meine Fahndungen (alle vom ptlsweb User)
  getMyInvestigations: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("🔍 getMyInvestigations aufgerufen mit:", input);

      try {
        // Zeige alle Fahndungen vom ptlsweb User (da alle neuen Fahndungen diesem User zugeordnet werden)
        const response = (await ctx.db
          .from("investigations")
          .select("*")
          .eq("created_by", "305f1ebf-01ed-4007-8cd7-951f6105b8c1") // ptlsweb@gmail.com
          .order("created_at", { ascending: false })
          .range(
            input.offset,
            input.offset + input.limit - 1,
          )) as SupabaseResponse<Investigation[]>;

        const { data, error } = response;

        if (error) {
          console.error("❌ Supabase-Fehler:", error);
          throw new Error(
            `Fehler beim Abrufen der Fahndungen: ${error.message}`,
          );
        }

        console.log(
          "✅ Meine Fahndungen erfolgreich geladen:",
          data?.length ?? 0,
        );
        return data ?? [];
      } catch (error) {
        console.error("❌ Fehler beim Abrufen eigener Fahndungen:", error);
        throw new Error(`Fehler beim Abrufen der Fahndungen: ${String(error)}`);
      }
    }),

  // Admin: Alle Benutzer verwalten
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user as { permissions?: { canManageUsers?: boolean } };
    if (!user?.permissions?.canManageUsers) {
      throw new Error("Keine Berechtigung zur Benutzerverwaltung");
    }

    try {
      const response = (await ctx.db
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })) as SupabaseResponse<
        UserProfile[]
      >;

      const { data, error } = response;

      if (error) {
        throw new Error(`Fehler beim Abrufen der Benutzer: ${error.message}`);
      }

      return data ?? [];
    } catch (error) {
      console.error("❌ Fehler beim Abrufen der Benutzer:", error);
      throw new Error(`Fehler beim Abrufen der Benutzer: ${String(error)}`);
    }
  }),

  // Admin: Benutzer genehmigen
  approveUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user as { permissions?: { canManageUsers?: boolean } };
      if (!user?.permissions?.canManageUsers) {
        throw new Error("Keine Berechtigung zur Benutzerverwaltung");
      }

      try {
        const response = (await ctx.db
          .from("user_profiles")
          .update({ status: "approved" })
          .eq("user_id", input.userId)
          .select()
          .single()) as SupabaseResponse<UserProfile>;

        const { data, error } = response;

        if (error) {
          throw new Error(
            `Fehler beim Genehmigen des Benutzers: ${error.message}`,
          );
        }

        return data!;
      } catch (error) {
        console.error("❌ Fehler beim Genehmigen des Benutzers:", error);
        throw new Error(
          `Fehler beim Genehmigen des Benutzers: ${String(error)}`,
        );
      }
    }),

  // Media Router
  media: mediaRouter,
});
