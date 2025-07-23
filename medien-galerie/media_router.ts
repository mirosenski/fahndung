import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { MediaService } from "~/lib/services/media.service";

// Validation schemas
const MediaSearchSchema = z.object({
  search: z.string().optional(),
  media_type: z.enum(['image', 'video', 'document']).optional(),
  directory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sort_by: z.enum(['created_at', 'name', 'size']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

const MediaUpdateSchema = z.object({
  id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  directory: z.string().optional(),
  is_public: z.boolean().optional(),
});

const MediaUploadMetadataSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  directory: z.string().default('allgemein'),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
});

export const mediaRouter = createTRPCRouter({
  /**
   * Get media items with advanced filtering
   */
  getMedia: publicProcedure
    .input(MediaSearchSchema)
    .query(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        return await mediaService.getMedia(input);
      } catch (error) {
        console.error('Error fetching media:', error);
        throw new Error('Fehler beim Laden der Medien');
      }
    }),

  /**
   * Get single media item
   */
  getMediaItem: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        return await mediaService.getMediaItem(input.id);
      } catch (error) {
        console.error('Error fetching media item:', error);
        throw new Error('Medium nicht gefunden');
      }
    }),

  /**
   * Create signed upload URL for client-side upload
   */
  createUploadUrl: protectedProcedure
    .input(MediaUploadMetadataSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const fileName = `${input.directory}/${Date.now()}_${crypto.randomUUID()}_${input.fileName}`;
        
        // Create signed URL for upload
        const { data: signedUrl, error } = await ctx.db.supabase.storage
          .from('media-gallery')
          .createSignedUploadUrl(fileName);

        if (error) throw error;

        return {
          uploadUrl: signedUrl.signedUrl,
          token: signedUrl.token,
          path: signedUrl.path,
          fileName,
          metadata: input
        };
      } catch (error) {
        console.error('Error creating upload URL:', error);
        throw new Error('Fehler beim Erstellen der Upload-URL');
      }
    }),

  /**
   * Confirm upload and create database record
   */
  confirmUpload: protectedProcedure
    .input(z.object({
      path: z.string(),
      fileName: z.string(),
      metadata: MediaUploadMetadataSchema,
      width: z.number().optional(),
      height: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        const { data: { user } } = await ctx.db.supabase.auth.getUser();
        if (!user) throw new Error('Nicht authentifiziert');

        // Create database record
        const { data: mediaData, error } = await ctx.db.supabase
          .from('media')
          .insert({
            original_name: input.metadata.fileName,
            file_name: input.fileName,
            file_path: input.path,
            file_size: input.metadata.fileSize,
            mime_type: input.metadata.mimeType,
            width: input.width,
            height: input.height,
            media_type: input.metadata.mimeType.startsWith('image/') ? 'image' :
                       input.metadata.mimeType.startsWith('video/') ? 'video' : 'document',
            directory: input.metadata.directory,
            uploaded_by: user.id,
            tags: input.metadata.tags,
            description: input.metadata.description,
            is_public: input.metadata.is_public,
            metadata: {
              width: input.width,
              height: input.height,
              aspectRatio: input.width && input.height ? input.width / input.height : undefined
            }
          })
          .select()
          .single();

        if (error) throw error;

        // Get public URL
        const publicUrl = ctx.db.supabase.storage
          .from('media-gallery')
          .getPublicUrl(input.path);

        return {
          ...mediaData,
          url: publicUrl.data.publicUrl,
          thumbnail_url: publicUrl.data.publicUrl // For now, same as main URL
        };
      } catch (error) {
        console.error('Error confirming upload:', error);
        throw new Error('Fehler beim Bestätigen des Uploads');
      }
    }),

  /**
   * Update media metadata
   */
  updateMedia: protectedProcedure
    .input(MediaUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        const { id, ...updates } = input;
        return await mediaService.updateMedia(id, updates);
      } catch (error) {
        console.error('Error updating media:', error);
        throw new Error('Fehler beim Aktualisieren des Mediums');
      }
    }),

  /**
   * Delete media items (bulk operation)
   */
  deleteMedia: protectedProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()).min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        await mediaService.deleteMedia(input.ids);
        return { success: true, deleted: input.ids.length };
      } catch (error) {
        console.error('Error deleting media:', error);
        throw new Error('Fehler beim Löschen der Medien');
      }
    }),

  /**
   * Move media to different directory
   */
  moveToDirectory: protectedProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()).min(1),
      targetDirectory: z.string().min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        await mediaService.moveToDirectory(input.ids, input.targetDirectory);
        return { success: true, moved: input.ids.length };
      } catch (error) {
        console.error('Error moving media:', error);
        throw new Error('Fehler beim Verschieben der Medien');
      }
    }),

  /**
   * Get media statistics
   */
  getStats: publicProcedure
    .query(async ({ ctx }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        return await mediaService.getStats();
      } catch (error) {
        console.error('Error fetching media stats:', error);
        throw new Error('Fehler beim Laden der Statistiken');
      }
    }),

  /**
   * Get all directories
   */
  getDirectories: publicProcedure
    .query(async ({ ctx }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        return await mediaService.getDirectories();
      } catch (error) {
        console.error('Error fetching directories:', error);
        return ['allgemein']; // Fallback
      }
    }),

  /**
   * Get all tags
   */
  getTags: publicProcedure
    .query(async ({ ctx }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        return await mediaService.getTags();
      } catch (error) {
        console.error('Error fetching tags:', error);
        return []; // Fallback
      }
    }),

  /**
   * Search media with autocomplete
   */
  searchMedia: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const mediaService = new MediaService(ctx.db.supabase);
      
      try {
        const result = await mediaService.getMedia({
          search: input.query,
          limit: input.limit,
          offset: 0
        });
        
        return result.items;
      } catch (error) {
        console.error('Error searching media:', error);
        return [];
      }
    }),

  /**
   * Get media by IDs (for bulk operations)
   */
  getMediaByIds: publicProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()).min(1).max(50)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.db.supabase
          .from('media')
          .select('*')
          .in('id', input.ids);

        if (error) throw error;

        // Add URLs to items
        const itemsWithUrls = (data || []).map(item => ({
          ...item,
          url: ctx.db.supabase.storage
            .from('media-gallery')
            .getPublicUrl(item.file_path).data.publicUrl,
          thumbnail_url: ctx.db.supabase.storage
            .from('media-gallery')
            .getPublicUrl(`thumbnails/${item.id}_thumb.jpg`).data.publicUrl
        }));

        return itemsWithUrls;
      } catch (error) {
        console.error('Error fetching media by IDs:', error);
        throw new Error('Fehler beim Laden der Medien');
      }
    }),

  /**
   * Create new directory
   */
  createDirectory: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 
        'Verzeichnisname darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if directory already exists
        const { data: existing } = await ctx.db.supabase
          .from('media')
          .select('directory')
          .eq('directory', input.name)
          .limit(1);

        if (existing && existing.length > 0) {
          throw new Error('Verzeichnis existiert bereits');
        }

        return { success: true, directory: input.name };
      } catch (error) {
        console.error('Error creating directory:', error);
        throw new Error('Fehler beim Erstellen des Verzeichnisses');
      }
    }),

  /**
   * Get recently uploaded media
   */
  getRecentMedia: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
      days: z.number().min(1).max(30).default(7)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - input.days);

        const { data, error } = await ctx.db.supabase
          .from('media')
          .select('*')
          .gte('uploaded_at', daysAgo.toISOString())
          .order('uploaded_at', { ascending: false })
          .limit(input.limit);

        if (error) throw error;

        // Add URLs to items
        const itemsWithUrls = (data || []).map(item => ({
          ...item,
          url: ctx.db.supabase.storage
            .from('media-gallery')
            .getPublicUrl(item.file_path).data.publicUrl,
          thumbnail_url: ctx.db.supabase.storage
            .from('media-gallery')
            .getPublicUrl(`thumbnails/${item.id}_thumb.jpg`).data.publicUrl
        }));

        return itemsWithUrls;
      } catch (error) {
        console.error('Error fetching recent media:', error);
        return [];
      }
    })
});

export type MediaRouter = typeof mediaRouter;