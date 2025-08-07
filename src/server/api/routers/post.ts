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

        return data ?? [];
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Fahndungen:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Fehler beim Abrufen der Fahndungen: ${errorMessage}`);
      }
    }),

  // Öffentlich: Einzelne Fahndung lesen (mit UUID oder Fallnummer)
  getInvestigation: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        console.log(
          "🔍 API DEBUG: getInvestigation aufgerufen mit ID:",
          input.id,
        );

        let query = ctx.db.from("investigations").select("*");

        // Prüfe ob es eine UUID ist oder eine Fallnummer
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            input.id,
          );

        if (isUUID) {
          query = query.eq("id", input.id);
        } else {
          query = query.eq("case_number", input.id);
        }

        const response =
          (await query.single()) as SupabaseResponse<Investigation>;

        const { data, error } = response;

        if (error) {
          console.error("❌ API DEBUG: Fahndung nicht gefunden:", error);
          throw new Error(`Fahndung nicht gefunden: ${error.message}`);
        }

        if (!data) {
          console.error("❌ API DEBUG: Keine Daten zurückgegeben");
          throw new Error("Fahndung nicht gefunden");
        }

        console.log("✅ API DEBUG: Fahndung gefunden:", {
          id: data.id,
          title: data.title,
          case_number: data.case_number,
          category: data.category,
          priority: data.priority,
          images_count: data.images?.length ?? 0,
        });

        // Bilder sind bereits als JSON in der investigations Tabelle gespeichert
        if (data?.images && data.images.length > 0) {
          console.log("📸 Bilder aus JSON-Feld geladen:", data.images.length);
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

        console.log(
          "✅ Fahndung erfolgreich geladen:",
          data?.title,
          "mit",
          data?.images?.length ?? 0,
          "Bildern",
        );

        return data;
      } catch (error) {
        console.error("❌ Fehler beim Laden der Fahndung:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Fehler beim Laden der Fahndung: ${errorMessage}`);
      }
    }),

  // Öffentlich: Fahndung basierend auf SEO-Slug finden
  findInvestigationBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Lade alle Fahndungen und suche nach dem passenden Titel
        const { data: investigations, error } = await ctx.db
          .from("investigations")
          .select("title, case_number")
          .limit(50);

        if (error) {
          throw new Error(
            `Fehler beim Abrufen der Fahndungen: ${error.message}`,
          );
        }

        // Importiere generateSeoSlug für Client-Side Kompatibilität
        const { generateSeoSlug } = await import("~/lib/seo");

        for (const investigation of investigations ?? []) {
          const expectedSlug = generateSeoSlug(investigation.title as string);
          if (expectedSlug === input.slug) {
            return investigation.case_number as string;
          }
        }

        return null;
      } catch (error) {
        console.error("❌ Fehler beim Suchen der Fahndung nach Slug:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(`Fehler beim Suchen der Fahndung: ${errorMessage}`);
      }
    }),

  // Öffentlich: Fahndung erstellen (temporär für Tests)
  createInvestigation: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        short_description: z.string().optional(), // Kurze Beschreibung hinzugefügt
        status: z.string().default("active"),
        priority: z.enum(["normal", "urgent", "new"]).default("normal"),
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
        location: z.string().optional(),
        contact_info: z.record(z.unknown()).optional(),
        case_number: z.string().optional(),
        features: z.string().optional(),
        mainImageUrl: z.string().optional(), // URL des Hauptbildes
        additionalImageUrls: z.array(z.string()).optional(), // URLs der zusätzlichen Bilder
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("🚀 createInvestigation aufgerufen mit:", input);
      console.log("👤 Benutzer:", ctx.user?.email, "Rolle:", ctx.user?.role);

      try {
        // Verwende die aktuelle Session oder Fallback auf Standard-User
        const createdBy =
          ctx.user?.id ?? "305f1ebf-01ed-4007-8cd7-951f6105b8c1";

        // Generiere eine eindeutige Aktennummer
        let caseNumber = input.case_number;
        if (!caseNumber) {
          let attempts = 0;
          const maxAttempts = 10;

          do {
            caseNumber = generateNewCaseNumber(
              input.category ?? "MISSING_PERSON",
              input.status,
            );

            // Prüfe ob die Aktennummer bereits existiert
            const { data: existing } = await ctx.db
              .from("investigations")
              .select("id")
              .eq("case_number", caseNumber)
              .single();

            if (!existing) {
              break; // Aktennummer ist eindeutig
            }

            attempts++;
            console.log(
              `⚠️ Aktennummer ${caseNumber} existiert bereits, versuche erneut... (${attempts}/${maxAttempts})`,
            );
          } while (attempts < maxAttempts);

          if (attempts >= maxAttempts) {
            throw new Error(
              "Konnte keine eindeutige Aktennummer generieren nach 10 Versuchen",
            );
          }
        }

        // Erstelle das images Array aus den URLs
        const images: Array<{
          id: string;
          url: string;
          alt_text?: string;
          caption?: string;
        }> = [];

        // Hauptbild hinzufügen
        if (input.mainImageUrl) {
          images.push({
            id: `main-${Date.now()}`,
            url: input.mainImageUrl,
            alt_text: "Hauptbild der Fahndung",
            caption: "Hauptbild",
          });
        }

        // Zusätzliche Bilder hinzufügen
        if (input.additionalImageUrls && input.additionalImageUrls.length > 0) {
          input.additionalImageUrls.forEach((url, index) => {
            images.push({
              id: `additional-${Date.now()}-${index}`,
              url: url,
              alt_text: `Zusätzliches Bild ${index + 1}`,
              caption: `Bild ${index + 1}`,
            });
          });
        }

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
            short_description: input.short_description ?? input.title, // Verwende die kurze Beschreibung oder Fallback auf Titel
            station: "Allgemein",
            features: input.features ?? "",
            date: new Date().toISOString(),
            case_number: caseNumber,
            contact_info: input.contact_info ?? {},
            metadata: {},
            created_by: createdBy,
            images: images.length > 0 ? images : undefined, // Bilder als JSON speichern
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
        if (images.length > 0) {
          console.log("📸 Bilder hinzugefügt:", images.length);
        }
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
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        short_description: z.string().optional(),
        status: z.enum(["draft", "active", "published", "archived"]).optional(),
        priority: z.enum(["normal", "urgent", "new"]).optional(),
        category: z
          .enum([
            "WANTED_PERSON",
            "MISSING_PERSON",
            "UNKNOWN_DEAD",
            "STOLEN_GOODS",
          ])
          .optional(),
        tags: z.array(z.string()).optional(),
        location: z.string().optional(),
        contact_info: z
          .object({
            person: z.string().optional(),
            phone: z.string().optional(),
            email: z
              .string()
              .optional()
              .refine(
                (email) =>
                  !email ||
                  email === "" ||
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
                { message: "Ungültige E-Mail-Adresse" },
              ),
            hours: z.string().optional(),
          })
          .optional(),
        features: z.string().optional(),
        station: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("🔍 API DEBUG: updateInvestigation aufgerufen");
      console.log("🔍 API DEBUG: Input:", input);
      console.log("🔍 API DEBUG: User:", ctx.user?.email);

      try {
        // Prüfe ob Fahndung existiert
        console.log("🔍 API DEBUG: Prüfe ob Fahndung existiert...");
        const existingResponse = (await ctx.db
          .from("investigations")
          .select("id")
          .eq("id", input.id)
          .single()) as SupabaseResponse<{ id: string }>;

        const { error: fetchError } = existingResponse;

        if (fetchError) {
          console.error("❌ API DEBUG: Fahndung nicht gefunden:", fetchError);
          throw new Error("Fahndung nicht gefunden");
        }

        console.log("✅ API DEBUG: Fahndung gefunden");

        // Berechtigungsprüfung (falls implementiert)
        // const hasPermission = await checkEditPermission(ctx.user?.id, input.id);
        // if (!hasPermission) {
        //   throw new Error("Keine Berechtigung zum Bearbeiten");
        // }

        const { id, ...updateData } = input;
        console.log("🔍 API DEBUG: Update-Daten:", updateData);

        console.log("🔍 API DEBUG: Sende Update an Supabase...");
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
          console.error("❌ API DEBUG: Supabase Update Fehler:", error);
          throw new Error(
            `Fehler beim Aktualisieren der Fahndung: ${error.message}`,
          );
        }

        console.log(
          "✅ API DEBUG: Fahndung erfolgreich aktualisiert:",
          data?.title,
        );
        return data!;
      } catch (error) {
        console.error(
          "❌ API DEBUG: Fehler beim Aktualisieren der Fahndung:",
          error,
        );
        throw new Error(
          `Fehler beim Aktualisieren der Fahndung: ${String(error)}`,
        );
      }
    }),

  // Geschützt: Bild zu Fahndung hochladen
  uploadInvestigationImage: publicProcedure
    .input(
      z.object({
        investigationId: z.string().uuid(),
        fileName: z.string(),
        originalName: z.string(),
        filePath: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        isPrimary: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("📸 uploadInvestigationImage aufgerufen mit:", input);
      console.log("👤 Benutzer:", ctx.user?.email, "Rolle:", ctx.user?.role);
      console.log("🔍 Context Details:", {
        hasUser: !!ctx.user,
        userId: ctx.user?.id,
        userEmail: ctx.user?.email,
        userRole: ctx.user?.role,
        hasSession: !!ctx.session,
        sessionUser: ctx.session?.user?.id,
      });

      // 🔥 MANUELLE AUTHENTIFIZIERUNGSPRÜFUNG
      if (!ctx.user?.id) {
        console.error("❌ Keine Benutzer-ID im Context");
        console.error("🔍 Context Debug:", {
          user: ctx.user,
          session: ctx.session,
          hasUser: !!ctx.user,
          hasSession: !!ctx.session,
        });
        throw new Error("Nicht authentifiziert - Bitte melden Sie sich an");
      }

      console.log("✅ Benutzer authentifiziert:", ctx.user.id);

      try {
        // Prüfe ob Fahndung existiert
        const existingResponse = (await ctx.db
          .from("investigations")
          .select("id")
          .eq("id", input.investigationId)
          .single()) as SupabaseResponse<{ id: string }>;

        const { error: fetchError } = existingResponse;

        if (fetchError) {
          console.error("❌ Fahndung nicht gefunden:", fetchError);
          throw new Error("Fahndung nicht gefunden");
        }

        // Füge Bild-Metadaten zur Datenbank hinzu
        const response = (await ctx.db
          .from("investigation_images")
          .insert({
            investigation_id: input.investigationId,
            file_name: input.fileName,
            original_name: input.originalName,
            file_path: input.filePath,
            file_size: input.fileSize,
            mime_type: input.mimeType,
            uploaded_by: ctx.user.id, // Verwende die echte User ID
            is_primary: input.isPrimary,
            is_public: true,
          })
          .select()
          .single()) as SupabaseResponse<{
          id: string;
          investigation_id: string;
          file_name: string;
          file_path: string;
          url?: string;
        }>;

        const { data, error } = response;

        if (error) {
          console.error("❌ Database-Fehler beim Bild-Upload:", error);
          throw new Error(
            `Fehler beim Speichern der Bild-Metadaten: ${error.message}`,
          );
        }

        // Generiere öffentliche URL
        // Extrahiere Bucket-Namen aus dem Pfad (z.B. "media-gallery/investigations/...")
        const pathParts = input.filePath.split("/");
        const bucketName = pathParts[0] ?? "media-gallery"; // Fallback auf media-gallery

        console.log("📦 Verwende Bucket für URL-Generierung:", bucketName);

        const { data: urlData } = ctx.db.storage
          .from(bucketName)
          .getPublicUrl(input.filePath.replace(`${bucketName}/`, "")); // Entferne Bucket-Namen aus Pfad

        console.log(
          "✅ Bild-Metadaten erfolgreich gespeichert:",
          data?.file_name,
        );
        return {
          ...data,
          url: urlData.publicUrl,
        };
      } catch (error) {
        console.error("❌ Fehler beim Bild-Upload:", error);
        throw new Error(`Fehler beim Bild-Upload: ${String(error)}`);
      }
    }),

  // Öffentlich: Fahndung löschen
  deleteInvestigation: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Prüfe ob Fahndung existiert
        const existingResponse = (await ctx.db
          .from("investigations")
          .select("created_by, title")
          .eq("id", input.id)
          .single()) as SupabaseResponse<{ created_by: string; title: string }>;

        const { error: fetchError } = existingResponse;

        if (fetchError) {
          throw new Error("Fahndung nicht gefunden");
        }

        // Lösche zuerst die zugehörigen Bilder
        const imagesResponse = await ctx.db
          .from("investigation_images")
          .select("file_path")
          .eq("investigation_id", input.id);

        if (imagesResponse.data && imagesResponse.data.length > 0) {
          // Lösche Bilder aus dem Storage
          const filePaths = imagesResponse.data.map(
            (img: { file_path: string }) => img.file_path,
          );
          await ctx.db.storage.from("investigation-images").remove(filePaths);

          // Lösche Bild-Metadaten aus der Datenbank
          await ctx.db
            .from("investigation_images")
            .delete()
            .eq("investigation_id", input.id);
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

        return data ?? [];
      } catch (error) {
        console.error("❌ Fehler beim Abrufen eigener Fahndungen:", error);
        throw new Error(`Fehler beim Abrufen der Fahndungen: ${String(error)}`);
      }
    }),

  // Admin: Alle Benutzer verwalten
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user as {
      permissions?: { canManageUsers?: boolean };
      role?: string;
    };
    if (!user?.permissions?.canManageUsers && user?.role !== "super_admin") {
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
      const user = ctx.user as {
        permissions?: { canManageUsers?: boolean };
        role?: string;
      };
      if (!user?.permissions?.canManageUsers && user?.role !== "super_admin") {
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
