import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { MediaService } from "~/lib/services/media.service";
import { supabase } from "~/lib/supabase";

const mediaService = new MediaService(supabase);

export const mediaRouter = createTRPCRouter({
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

  // Upload media file - requires admin privileges
  uploadMedia: adminProcedure
    .input(
      z.object({
        file: z.custom<File>((val) => val instanceof File, {
          message: "File must be a valid File object",
        }),
        directory: z.string().default("allgemein"),
        tags: z.array(z.string()).default([]),
        description: z.string().optional(),
        is_public: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await mediaService.uploadMedia({
          file: input.file,
          directory: input.directory,
          tags: input.tags,
          description: input.description,
          is_public: input.is_public,
        });
      } catch (error) {
        console.error("Fehler beim Upload:", error);
        throw new Error(
          `Upload fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        );
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

  // Update media metadata - requires admin privileges
  updateMedia: adminProcedure
    .input(
      z.object({
        mediaId: z.string().uuid(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        directory: z.string().optional(),
        is_public: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
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

  // Bulk update media items - requires admin privileges
  bulkUpdateMedia: adminProcedure
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
    .mutation(async ({ input }) => {
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
