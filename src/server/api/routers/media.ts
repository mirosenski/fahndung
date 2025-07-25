import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { MediaService } from "~/lib/services/media.service";
import { supabase } from "~/lib/supabase";

const mediaService = new MediaService(supabase);

export const mediaRouter = createTRPCRouter({
  // Upload media with base64 data
  uploadMedia: protectedProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file data
        filename: z.string(),
        contentType: z.string(),
        directory: z.string().default("allgemein"),
        tags: z.array(z.string()).default([]),
        is_public: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prüfe ob User authentifiziert ist
      if (!ctx.session?.user?.id) {
        console.error("❌ No user session found");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht authentifiziert - Bitte melden Sie sich an",
        });
      }

      // Prüfe Admin-Rechte
      const userRole = ctx.session?.profile?.role;
      if (userRole !== "admin" && userRole !== "editor") {
        console.error("❌ Insufficient permissions:", userRole);
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin- oder Editor-Rechte erforderlich für Media-Uploads",
        });
      }

      console.log(
        "✅ User authenticated:",
        ctx.session.user.id,
        "Role:",
        userRole,
      );

      try {
        console.log("🚀 Upload startet für:", input.filename, {
          fileLength: input.file.length,
          contentType: input.contentType,
          userId: ctx.session.user.id,
          userRole: ctx.session.profile?.role,
        });

        // Decode base64 to buffer
        const buffer = Buffer.from(input.file, "base64");

        // Prüfe Dateigröße (max 8MB nach Base64-Kodierung)
        const maxSize = 8 * 1024 * 1024; // 8MB
        if (buffer.length > maxSize) {
          console.error("❌ File too large:", {
            size: buffer.length,
            maxSize,
            filename: input.filename,
          });
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: `Datei zu groß (${Math.round(buffer.length / 1024 / 1024)}MB). Maximale Größe: 8MB`,
          });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${input.filename}`;
        const path = `${input.directory}/${uniqueFilename}`;

        console.log("📦 Upload-Daten vorbereitet:", {
          bufferLength: buffer.length,
          uniqueFilename,
          path,
        });

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media-gallery")
          .upload(path, buffer, {
            contentType: input.contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error("❌ Storage Upload Error:", uploadError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Storage upload failed: ${uploadError.message}`,
          });
        }

        console.log("✅ Storage Upload erfolgreich:", uploadData);

        // Determine media type
        const media_type = input.contentType.startsWith("image/")
          ? "image"
          : input.contentType.startsWith("video/")
            ? "video"
            : "document";

        // INSERT mit uploaded_by gesetzt
        const { data: mediaRecord, error: dbError } = await supabase
          .from("media")
          .insert({
            original_name: input.filename,
            file_name: uniqueFilename,
            file_path: uploadData.path,
            file_size: buffer.length,
            media_type,
            mime_type: input.contentType,
            directory: input.directory,
            tags: input.tags,
            is_public: input.is_public,
            uploaded_by: ctx.session.user.id, // 🔥 KRITISCH: User ID setzen
          })
          .select()
          .single();

        if (dbError) {
          console.error("❌ Database Insert Error:", dbError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Database insert failed: ${dbError.message}`,
          });
        }

        console.log("✅ Media record created:", mediaRecord);

        // Return success response
        return {
          success: true,
          media: mediaRecord,
          path: uploadData.path,
          url: `${process.env["NEXT_PUBLIC_SUPABASE_URL"]}/storage/v1/object/public/media-gallery/${uploadData.path}`,
        };
      } catch (error) {
        console.error("❌ Upload failed:", error);
        throw error;
      }
    }),

  // Get media list with filters and pagination
  getMediaList: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        media_type: z.enum(["image", "video", "document"]).optional(),
        directory: z.string().optional(),
        tags: z.array(z.string()).optional(),
        uploaded_by: z.string().optional(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
        sort_by: z
          .enum(["uploaded_at", "created_at", "original_name", "file_size"])
          .optional(),
        sort_order: z.enum(["asc", "desc"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input }) => {
      try {
        return await mediaService.getMediaList(input, input.page, input.limit);
      } catch (error) {
        console.error("Fehler beim Abrufen der Medien:", error);
        return {
          items: [],
          total: 0,
          hasMore: false,
        };
      }
    }),

  // Save media record metadata after direct storage upload
  saveMediaRecord: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        original_filename: z.string(),
        file_path: z.string(),
        file_size: z.number(),
        mime_type: z.string(),
        directory: z.string(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        is_public: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has editor or admin role
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht authentifiziert - Bitte melden Sie sich an",
        });
      }
      const userRole = ctx.session?.profile?.role;
      if (userRole !== "admin" && userRole !== "editor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Editor- oder Admin-Rechte erforderlich für Media-Uploads",
        });
      }

      try {
        const media_type = input.mime_type.startsWith("image/")
          ? "image"
          : input.mime_type.startsWith("video/")
            ? "video"
            : "document";

        const { data, error } = await supabase
          .from("media")
          .insert({
            filename: input.filename,
            original_name: input.original_filename,
            file_name: input.filename,
            file_path: input.file_path,
            file_size: input.file_size,
            mime_type: input.mime_type,
            media_type,
            directory: input.directory,
            tags: input.tags ?? [],
            description: input.description,
            is_public: input.is_public ?? true,
            uploaded_by: ctx.session.user.id,
          })
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Database insert failed: ${error.message}`,
          });
        }

        return {
          success: true,
          media: data,
          url: `${process.env["NEXT_PUBLIC_SUPABASE_URL"]}/storage/v1/object/public/media-gallery/${input.file_path}`,
        };
      } catch (error) {
        console.error("Fehler beim Speichern der Medien-Metadaten:", error);
        throw error instanceof TRPCError
          ? error
          : new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Speichern der Metadaten fehlgeschlagen",
            });
      }
    }),

  // Delete media item - requires admin privileges
  deleteMedia: adminProcedure
    .input(
      z.object({
        mediaId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await mediaService.deleteMedia([input.mediaId]);
        return { success: true };
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
        throw new Error(
          `Löschen fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        );
      }
    }),

  // Update media metadata - requires editor or admin privileges
  updateMedia: protectedProcedure
    .input(
      z.object({
        mediaId: z.string().uuid(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        directory: z.string().optional(),
        is_public: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has editor or admin role
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht authentifiziert - Bitte melden Sie sich an",
        });
      }
      const userRole = ctx.session?.profile?.role;
      if (userRole !== "admin" && userRole !== "editor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Editor- oder Admin-Rechte erforderlich für Media-Updates",
        });
      }

      try {
        const { mediaId, ...updates } = input;
        return await mediaService.updateMedia(mediaId, updates);
      } catch (error) {
        console.error("Fehler beim Aktualisieren:", error);
        throw new Error(
          `Aktualisierung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        );
      }
    }),

  // Get available directories
  getDirectories: publicProcedure.query(async () => {
    try {
      return await mediaService.getDirectories();
    } catch (error) {
      console.error("Fehler beim Abrufen der Verzeichnisse:", error);
      return ["allgemein", "fahndungen", "dokumente"];
    }
  }),

  // Get available tags
  getTags: publicProcedure.query(async () => {
    try {
      return await mediaService.getTags();
    } catch (error) {
      console.error("Fehler beim Abrufen der Tags:", error);
      return ["wichtig", "dringend", "person", "fahrzeug", "dokument"];
    }
  }),

  // Bulk delete media items - requires admin privileges
  bulkDeleteMedia: adminProcedure
    .input(
      z.object({
        mediaIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await mediaService.deleteMedia(input.mediaIds);
        return {
          success: true,
          deleted: input.mediaIds.length,
          failed: 0,
          total: input.mediaIds.length,
        };
      } catch (error) {
        console.error("Fehler beim Bulk-Löschen:", error);
        throw new Error(
          `Bulk-Löschen fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        );
      }
    }),

  // Bulk update media items - requires editor or admin privileges
  bulkUpdateMedia: protectedProcedure
    .input(
      z.object({
        mediaIds: z.array(z.string().uuid()),
        updates: z.object({
          tags: z.array(z.string()).optional(),
          directory: z.string().optional(),
          is_public: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has editor or admin role
      if (!ctx.session?.user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht authentifiziert - Bitte melden Sie sich an",
        });
      }
      const userRole = ctx.session?.profile?.role;
      if (userRole !== "admin" && userRole !== "editor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Editor- oder Admin-Rechte erforderlich für Media-Updates",
        });
      }

      try {
        const results = await Promise.allSettled(
          input.mediaIds.map((id) =>
            mediaService.updateMedia(id, input.updates),
          ),
        );

        const successful = results.filter(
          (result) => result.status === "fulfilled",
        ).length;
        const failed = results.filter(
          (result) => result.status === "rejected",
        ).length;

        return {
          success: true,
          updated: successful,
          failed,
          total: input.mediaIds.length,
        };
      } catch (error) {
        console.error("Fehler beim Bulk-Update:", error);
        throw new Error(
          `Bulk-Update fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        );
      }
    }),
});
