import type { SupabaseClient } from "@supabase/supabase-js";

export interface MediaItem {
  id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  media_type: "image" | "video" | "document";
  directory: string;
  uploaded_at: string;
  uploaded_by: string;
  tags: string[];
  description?: string;
  is_public: boolean;
  metadata: Record<string, unknown>;
  url?: string;
  thumbnail_url?: string;
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface MediaFilters {
  search: string;
  mediaType: string;
  directory: string;
  tags: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

export interface MediaUploadOptions {
  directory?: string;
  tags?: string[];
  description?: string;
  is_public?: boolean;
  generate_thumbnail?: boolean;
}

export interface MediaSearchOptions {
  search?: string;
  media_type?: string;
  directory?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
  sort_by?: "uploaded_at" | "created_at" | "original_name" | "file_size";
  sort_order?: "asc" | "desc";
}

export interface MediaStats {
  total_items: number;
  total_size: number;
  by_type: Record<string, number>;
  by_directory: Record<string, number>;
  recent_uploads: number;
}

export class MediaService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    // Remote Supabase Bucket
    this.bucketName = "media-gallery";
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadFiles(
    files: File[],
    options: MediaUploadOptions = {},
    onProgress?: (progress: number, fileIndex: number) => void,
  ): Promise<MediaItem[]> {
    const {
      directory = "allgemein",
      tags = [],
      description,
      is_public = true,
      generate_thumbnail = true,
    } = options;

    const results: MediaItem[] = [];

    // Get user session - this is now handled by tRPC middleware
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      throw new Error(
        "Nicht authentifiziert - Bitte melden Sie sich als Admin an",
      );
    }

    // Check if bucket exists
    try {
      const { data: buckets, error: bucketError } =
        await this.supabase.storage.listBuckets();
      if (bucketError) throw bucketError;

      const bucketExists = buckets?.some(
        (bucket) => bucket.id === this.bucketName,
      );
      if (!bucketExists) {
        throw new Error(
          `Storage Bucket '${this.bucketName}' nicht gefunden. Bitte führen Sie das Setup-Script aus.`,
        );
      }
    } catch (error) {
      console.error("Fehler beim Prüfen des Storage Buckets:", error);
      throw new Error(
        "Storage Bucket nicht konfiguriert. Bitte führen Sie das Setup-Script aus.",
      );
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      // Sanitize filename to prevent illegal path errors
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${directory}/${Date.now()}_${crypto.randomUUID()}_${sanitizedFileName}`;

      try {
        // Upload to Storage
        const uploadResult = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadResult.error) {
          console.error("Storage Upload Error:", uploadResult.error);

          // Handle specific storage errors
          if (uploadResult.error.message.includes("illegal path")) {
            console.error("❌ Illegal path error - Bucket nicht konfiguriert");
            throw new Error(
              "Storage Bucket nicht korrekt konfiguriert. Bitte führen Sie das Setup-Script aus.",
            );
          }

          throw uploadResult.error;
        }

        if (!uploadResult.data) throw new Error("Upload failed");

        // Extract metadata
        const metadata = await this.extractMetadata(file);

        // Create database record
        const insertResult = await this.supabase
          .from("media")
          .insert({
            original_name: file.name,
            file_name: fileName,
            file_path: uploadResult.data.path,
            file_size: file.size,
            mime_type: file.type,
            width: metadata["width"] as number | undefined,
            height: metadata["height"] as number | undefined,
            media_type: this.getMediaType(file.type),
            directory,
            uploaded_by: user.id,
            tags,
            description,
            is_public,
            metadata,
          })
          .select()
          .single();

        if (insertResult.error) {
          console.error("Database Insert Error:", insertResult.error);
          throw insertResult.error;
        }

        if (!insertResult.data) throw new Error("Database insert failed");

        const mediaData = insertResult.data as MediaItem;

        // Generate thumbnail if needed
        if (generate_thumbnail && this.isImage(file.type)) {
          await this.generateThumbnail(mediaData.id, file);
        }

        // Get public URL
        const publicUrl = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(uploadResult.data.path);

        const mediaItem: MediaItem = {
          ...mediaData,
          url: publicUrl.data.publicUrl,
          thumbnail_url: generate_thumbnail
            ? this.getThumbnailUrl(mediaData.id)
            : publicUrl.data.publicUrl,
        };

        results.push(mediaItem);
        onProgress?.(((i + 1) / files.length) * 100, i);
      } catch (error) {
        console.error(`Fehler beim Upload von ${file.name}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Upload a single file
   */
  async uploadMedia(options: {
    file: File;
    directory?: string;
    tags?: string[];
    description?: string;
    is_public?: boolean;
  }): Promise<MediaItem> {
    const results = await this.uploadFiles([options.file], {
      directory: options.directory,
      tags: options.tags,
      description: options.description,
      is_public: options.is_public,
    });

    if (results.length === 0) {
      throw new Error("Upload failed - no results returned");
    }

    return results[0]!;
  }

  /**
   * Get media items with advanced filtering and pagination
   */
  async getMediaList(
    options: MediaSearchOptions = {},
    page = 1,
    limit = 50,
  ): Promise<{
    items: MediaItem[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      search,
      media_type,
      directory,
      tags,
      date_from,
      date_to,
      sort_by = "uploaded_at",
      sort_order = "desc",
    } = options;

    const offset = (page - 1) * limit;

    try {
      let query = this.supabase.from("media").select("*", { count: "exact" });

      // Apply filters
      if (search) {
        query = query.or(
          `original_name.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      if (media_type) {
        query = query.eq("media_type", media_type);
      }

      if (directory) {
        query = query.eq("directory", directory);
      }

      if (tags && tags.length > 0) {
        query = query.overlaps("tags", tags);
      }

      if (date_from) {
        query = query.gte("uploaded_at", date_from);
      }

      if (date_to) {
        query = query.lte("uploaded_at", date_to);
      }

      // Apply sorting and pagination
      const result = await query
        .order(sort_by, { ascending: sort_order === "asc" })
        .range(offset, offset + limit - 1);

      if (result.error) throw result.error;

      const items = (result.data ?? []) as MediaItem[];
      const total = result.count ?? 0;
      const hasMore = offset + limit < total;

      // Add public URLs
      const itemsWithUrls = items.map((item) => ({
        ...item,
        url: this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(item.file_path).data.publicUrl,
        thumbnail_url: this.getThumbnailUrl(item.id),
      }));

      return {
        items: itemsWithUrls,
        total,
        hasMore,
      };
    } catch (error) {
      console.error("Fehler beim Abrufen der Medien:", error);
      return {
        items: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Get a single media item by ID
   */
  async getMediaItem(id: string): Promise<MediaItem> {
    try {
      const result = await this.supabase
        .from("media")
        .select("*")
        .eq("id", id)
        .single();

      if (result.error) throw result.error;
      if (!result.data) throw new Error("Medium nicht gefunden");
      const mediaItem: MediaItem = result.data as MediaItem;
      return {
        ...mediaItem,
        url: this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(mediaItem.file_path).data.publicUrl,
        thumbnail_url: this.getThumbnailUrl(mediaItem.id),
      };
    } catch (error) {
      console.error("Fehler beim Abrufen des Mediums:", error);
      throw error;
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(
    id: string,
    updates: Partial<
      Pick<MediaItem, "tags" | "description" | "directory" | "is_public">
    >,
  ): Promise<MediaItem> {
    try {
      const result = await this.supabase
        .from("media")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (result.error) throw result.error;
      if (!result.data) throw new Error("Update fehlgeschlagen");

      const mediaItem = result.data as MediaItem;

      return {
        ...mediaItem,
        url: this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(mediaItem.file_path).data.publicUrl,
        thumbnail_url: this.getThumbnailUrl(mediaItem.id),
      };
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Mediums:", error);
      throw error;
    }
  }

  /**
   * Delete media items
   */
  async deleteMedia(ids: string[]): Promise<void> {
    try {
      // Get file paths before deletion
      const { data: mediaItems, error: fetchError } = await this.supabase
        .from("media")
        .select("file_path")
        .in("id", ids);

      if (fetchError) throw fetchError;

      // Lösche aus dem Storage ohne unsichere any-Rückgabe
      const filePaths: string[] = Array.isArray(mediaItems)
        ? mediaItems
            .map((item: { file_path?: string }) => item.file_path)
            .filter((path): path is string => Boolean(path))
        : [];

      if (filePaths.length > 0) {
        const { error: storageError } = await this.supabase.storage
          .from(this.bucketName)
          .remove(filePaths);

        if (storageError) {
          console.warn("Fehler beim Löschen aus Storage:", storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from("media")
        .delete()
        .in("id", ids);

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Fehler beim Löschen der Medien:", error);
      throw error;
    }
  }

  /**
   * Move media items to different directory
   */
  async moveToDirectory(ids: string[], targetDirectory: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("media")
        .update({ directory: targetDirectory })
        .in("id", ids);

      if (error) throw error;
    } catch (error) {
      console.error("Fehler beim Verschieben der Medien:", error);
      throw error;
    }
  }

  /**
   * Get media statistics
   */
  async getStats(): Promise<MediaStats> {
    try {
      const { data, error } = await this.supabase
        .from("media")
        .select("media_type, directory, file_size, uploaded_at");

      if (error) throw error;

      const items = (data ?? []) as Array<{
        media_type?: string;
        directory?: string;
        file_size?: number;
        uploaded_at?: string | Date;
      }>;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: MediaStats = {
        total_items: items.length,
        total_size: items.reduce(
          (sum: number, item) => sum + (item.file_size ?? 0),
          0,
        ),
        by_type: {},
        by_directory: {},
        recent_uploads: items.filter((item) => {
          // Sicherstellen, dass uploaded_at ein gültiges Datum ist
          const uploadedAt =
            item.uploaded_at instanceof Date
              ? item.uploaded_at
              : new Date(item.uploaded_at!);
          return uploadedAt > thirtyDaysAgo;
        }).length,
      };

      for (const item of items) {
        const type: string =
          typeof item.media_type === "string" ? item.media_type : "unknown";
        stats.by_type[type] = (stats.by_type[type] ?? 0) + 1;
      }

      // Count by directory
      for (const item of items) {
        const dir = item.directory ?? "unknown";
        stats.by_directory[dir] = (stats.by_directory[dir] ?? 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error("Fehler beim Abrufen der Statistiken:", error);
      return {
        total_items: 0,
        total_size: 0,
        by_type: {},
        by_directory: {},
        recent_uploads: 0,
      };
    }
  }

  /**
   * Verfügbare Verzeichnisse abrufen
   */
  async getDirectories(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("media")
        .select("directory")
        .not("directory", "is", null);

      if (error) throw error;

      const directories = [
        ...Array.from(
          new Set(
            data?.map((item) => item.directory as string).filter(Boolean) ?? [],
          ),
        ),
      ];
      return directories.sort();
    } catch (error) {
      console.error("Fehler beim Abrufen der Verzeichnisse:", error);
      return [];
    }
  }

  /**
   * Get available tags
   */
  async getTags(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("media")
        .select("tags")
        .not("tags", "is", null);

      if (error) throw error;

      const allTags: string[] =
        data
          ?.flatMap((item: { tags?: string[] }) =>
            Array.isArray(item.tags) ? item.tags : [],
          )
          .filter(Boolean) ?? [];
      const uniqueTags: string[] = Array.from(new Set(allTags));
      return uniqueTags.sort();
    } catch (error) {
      console.error("Fehler beim Abrufen der Tags:", error);
      return [];
    }
  }

  /**
   * Extract metadata from file
   */
  private async extractMetadata(file: File): Promise<Record<string, unknown>> {
    const metadata: Record<string, unknown> = {};

    if (this.isImage(file.type)) {
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            metadata["width"] = img.naturalWidth;
            metadata["height"] = img.naturalHeight;
            URL.revokeObjectURL(objectUrl);
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
          };
          img.src = objectUrl;
        });
      } catch (error) {
        console.warn("Fehler beim Extrahieren der Bild-Metadaten:", error);
      }
    }

    return metadata;
  }

  /**
   * Generate thumbnail for image
   */
  private async generateThumbnail(mediaId: string, _file: File): Promise<void> {
    console.log(
      `Thumbnail generation for ${mediaId} would be implemented here`,
    );
  }

  /**
   * Get thumbnail URL
   */
  private getThumbnailUrl(mediaId: string): string {
    return this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(`thumbnails/${mediaId}.jpg`).data.publicUrl;
  }

  /**
   * Get media type from MIME type
   */
  private getMediaType(mimeType: string): "image" | "video" | "document" {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
  }

  /**
   * Check if file is an image
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }
}
