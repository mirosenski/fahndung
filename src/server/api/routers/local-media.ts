import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  LocalStorageService,
  type LocalImageMetadata,
} from "~/lib/services/local-storage.service";

const localStorageService = new LocalStorageService();

export const localMediaRouter = createTRPCRouter({
  // Upload Bild lokal
  uploadLocalImage: publicProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file data
        filename: z.string(),
        contentType: z.string(),
        directory: z.string().default("uploads"),
        tags: z.array(z.string()).default([]),
        description: z.string().optional(),
        is_public: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prüfe ob User authentifiziert ist (optional)
      const userId = ctx.session?.user?.id;
      console.log("👤 Upload Request - User ID:", userId ?? "Nicht authentifiziert");

      try {
        console.log("🚀 Lokaler Upload startet für:", input.filename);

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

        console.log("📦 Buffer erstellt, Größe:", buffer.length);

        // Upload zu lokalem Storage
        const metadata = await localStorageService.uploadImage({
          file: buffer,
          originalName: input.filename,
          mimeType: input.contentType,
          directory: input.directory,
          tags: input.tags,
          description: input.description,
          isPublic: input.is_public,
        });

        console.log("✅ Lokaler Upload erfolgreich:", metadata);

        return {
          success: true,
          media: metadata,
          url: localStorageService.getImageUrl(metadata.filePath),
        };
      } catch (error) {
        console.error("❌ Lokaler Upload failed:", error);
        throw error;
      }
    }),

  // Alle lokalen Bilder abrufen
  getAllLocalImages: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        let images = await localStorageService.getAllImages();

        // Suche anwenden falls vorhanden
        if (input.search) {
          images = await localStorageService.searchImages(input.search);
        }

        // Sortiere nach Upload-Datum (neueste zuerst)
        images.sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );

        // Pagination anwenden
        const paginatedImages = images.slice(
          input.offset,
          input.offset + input.limit,
        );

        return {
          images: paginatedImages.map((img) => ({
            ...img,
            url: localStorageService.getImageUrl(img.filePath),
          })),
          total: images.length,
          hasMore: input.offset + input.limit < images.length,
        };
      } catch (error) {
        console.error("❌ Fehler beim Laden lokaler Bilder:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler beim Laden der lokalen Bilder",
        });
      }
    }),

  // Spezifisches lokales Bild abrufen
  getLocalImage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const image = await localStorageService.getImage(input.id);
        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Bild nicht gefunden",
          });
        }

        return {
          ...image,
          url: localStorageService.getImageUrl(image.filePath),
        };
      } catch (error) {
        console.error("❌ Fehler beim Laden des lokalen Bildes:", error);
        throw error;
      }
    }),

  // Lokales Bild löschen
  deleteLocalImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prüfe Admin-Rechte
      const userRole = ctx.session?.profile?.role;
      if (userRole !== "admin" && userRole !== "editor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin- oder Editor-Rechte erforderlich",
        });
      }

      try {
        const success = await localStorageService.deleteImage(input.id);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Bild nicht gefunden",
          });
        }

        return { success: true };
      } catch (error) {
        console.error("❌ Fehler beim Löschen des lokalen Bildes:", error);
        throw error;
      }
    }),

  // Lokales Bild Metadaten aktualisieren
  updateLocalImageMetadata: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        is_public: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prüfe Admin-Rechte
      const userRole = ctx.session?.profile?.role;
      if (userRole !== "admin" && userRole !== "editor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin- oder Editor-Rechte erforderlich",
        });
      }

      try {
        const updates: Partial<
          Pick<LocalImageMetadata, "tags" | "description" | "isPublic">
        > = {};
        if (input.tags !== undefined) updates.tags = input.tags;
        if (input.description !== undefined)
          updates.description = input.description;
        if (input.is_public !== undefined) updates.isPublic = input.is_public;

        const updatedImage = await localStorageService.updateImageMetadata(
          input.id,
          updates,
        );
        if (!updatedImage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Bild nicht gefunden",
          });
        }

        return {
          ...updatedImage,
          url: localStorageService.getImageUrl(updatedImage.filePath),
        };
      } catch (error) {
        console.error(
          "❌ Fehler beim Aktualisieren der Bild-Metadaten:",
          error,
        );
        throw error;
      }
    }),

  // Statistiken über lokale Bilder
  getLocalImageStats: publicProcedure.query(async () => {
    try {
      return await localStorageService.getStats();
    } catch (error) {
      console.error("❌ Fehler beim Laden der Statistiken:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Fehler beim Laden der Statistiken",
      });
    }
  }),

  // Suche lokale Bilder
  searchLocalImages: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        const images = await localStorageService.searchImages(input.query);
        return {
          images: images.map((img) => ({
            ...img,
            url: localStorageService.getImageUrl(img.filePath),
          })),
          total: images.length,
        };
      } catch (error) {
        console.error("❌ Fehler bei der Bildsuche:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Fehler bei der Bildsuche",
        });
      }
    }),
});
