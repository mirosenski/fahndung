import { supabase } from "./supabase";

export interface MediaItem {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: "image" | "document" | "video";
  directory: string;
  bucket_name?: string;
  is_public: boolean;
  uploaded_by: string | null;
  uploaded_at: string;
  is_primary: boolean;
  metadata: Record<string, unknown>;
  tags: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
  public_url: string;
  formatted_size: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export interface MediaUploadOptions {
  file: File;
  directory: string;
  isPrimary?: boolean;
  metadata?: Record<string, unknown>;
  tags?: string[];
  description?: string;
}

export class MediaService {
  private static instance: MediaService;
  private bucketName = "media-gallery";
  private supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "";
  }

  static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  /**
   * Upload a file to Supabase Storage and create media record
   */
  async uploadFile(
    options: MediaUploadOptions,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<MediaItem> {
    try {
      const {
        file,
        directory,
        isPrimary = false,
        metadata = {},
        tags = [],
        description,
      } = options;

      // Generate unique file path
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `${directory}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Update progress
      onProgress?.({
        fileName: file.name,
        progress: 100,
        status: "success",
      });

      // Get public URL
      supabase.storage.from(this.bucketName).getPublicUrl(filePath);

      // Create media record in database
      const { data: mediaData, error: dbError } = await supabase
        .from("media")
        .insert({
          file_name: fileName,
          original_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          media_type: this.getMediaType(file.type),
          directory,
          is_primary: isPrimary,
          metadata,
          tags,
          description,
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from(this.bucketName).remove([filePath]);
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      // Generate correct public URL
      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;

      return {
        ...mediaData,
        public_url: publicUrl,
        formatted_size: this.formatFileSize(file.size),
      } as MediaItem;
    } catch (error) {
      onProgress?.({
        fileName: options.file.name,
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get media gallery items with optional filtering
   */
  async getMediaGallery(
    options: {
      searchTerm?: string;
      directory?: string;
      mediaType?: "image" | "document" | "video";
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<MediaItem[]> {
    try {
      let query = supabase.from("media").select("*").eq("is_public", true);

      if (options.searchTerm) {
        query = query.or(
          `original_name.ilike.%${options.searchTerm}%,directory.ilike.%${options.searchTerm}%`,
        );
      }

      if (options.directory && options.directory !== "all") {
        query = query.eq("directory", options.directory);
      }

      if (options.mediaType) {
        query = query.eq("media_type", options.mediaType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit ?? 50) - 1,
        );
      }

      query = query.order("uploaded_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch media gallery: ${error.message}`);
      }

      return (data ?? []) as unknown as MediaItem[];
    } catch (error) {
      console.error("Error fetching media gallery:", error);
      throw error;
    }
  }

  /**
   * Get media items for a specific investigation (placeholder for future)
   */
  async getInvestigationMedia(_investigationId: string): Promise<MediaItem[]> {
    try {
      // For now, return all media items
      // This will be updated when investigations table exists
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .eq("is_public", true);

      if (error) {
        throw new Error(`Failed to fetch media: ${error.message}`);
      }

      return (data ?? []) as unknown as MediaItem[];
    } catch (error) {
      console.error("Error fetching media:", error);
      throw error;
    }
  }

  /**
   * Delete a media item
   */
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      // Get media item to get file path
      const { data: mediaItem, error: fetchError } = await supabase
        .from("media")
        .select("file_path")
        .eq("id", mediaId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch media item: ${fetchError.message}`);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([mediaItem.file_path as string]);

      if (storageError) {
      }

      // Delete from database (this will cascade to related tables)
      const { error: dbError } = await supabase
        .from("media")
        .delete()
        .eq("id", mediaId);

      if (dbError) {
        throw new Error(`Failed to delete media record: ${dbError.message}`);
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(
    mediaId: string,
    updates: {
      is_primary?: boolean;
      tags?: string[];
      description?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<MediaItem> {
    try {
      const { data, error } = await supabase
        .from("media")
        .update(updates)
        .eq("id", mediaId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update media: ${error.message}`);
      }

      return {
        ...data,
        public_url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${String(data["file_path"])}`,
        formatted_size: this.formatFileSize(data["file_size"] as number),
      } as MediaItem;
    } catch (error) {
      console.error("Error updating media:", error);
      throw error;
    }
  }

  /**
   * Get directories for filtering
   */
  async getDirectories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("media")
        .select("directory")
        .eq("is_public", true);

      if (error) {
        throw new Error(`Failed to fetch directories: ${error.message}`);
      }

      const directories = [
        ...new Set(data?.map((item) => item.directory) || []),
      ];
      return directories.sort() as string[];
    } catch (error) {
      console.error("Error fetching directories:", error);
      return [];
    }
  }

  /**
   * Download a file from storage
   */
  async downloadFile(mediaId: string): Promise<Blob> {
    try {
      const { data: mediaItem, error: fetchError } = await supabase
        .from("media")
        .select("file_path")
        .eq("id", mediaId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch media item: ${fetchError.message}`);
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(mediaItem.file_path as string);

      if (error) {
        throw new Error(`Failed to download file: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  /**
   * Helper method to determine media type from MIME type
   */
  private getMediaType(mimeType: string): "image" | "document" | "video" {
    if (mimeType.startsWith("image/")) {
      return "image";
    } else if (mimeType.startsWith("video/")) {
      return "video";
    } else {
      return "document";
    }
  }

  /**
   * Helper method to format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }
}

// Export singleton instance
export const mediaService = MediaService.getInstance();
