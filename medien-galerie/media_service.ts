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
  media_type: 'image' | 'video' | 'document';
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
  sort_by?: 'created_at' | 'name' | 'size';
  sort_order?: 'asc' | 'desc';
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
  private bucketName = 'media-gallery';

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Upload single or multiple files with progress tracking
   */
  async uploadFiles(
    files: File[],
    options: MediaUploadOptions = {},
    onProgress?: (progress: number, fileIndex: number) => void
  ): Promise<MediaItem[]> {
    const {
      directory = 'allgemein',
      tags = [],
      description,
      is_public = true,
      generate_thumbnail = true
    } = options;

    const results: MediaItem[] = [];
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) throw new Error('Nicht authentifiziert');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${directory}/${Date.now()}_${crypto.randomUUID()}_${file.name}`;

      try {
        // Upload to Storage with progress tracking
        const { data: uploadData, error: uploadError } = await this.supabase.storage
          .from(this.bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Extract metadata
        const metadata = await this.extractMetadata(file);
        
        // Create database record
        const { data: mediaData, error: dbError } = await this.supabase
          .from('media')
          .insert({
            original_name: file.name,
            file_name: fileName,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            width: metadata.width,
            height: metadata.height,
            media_type: this.getMediaType(file.type),
            directory,
            uploaded_by: user.id,
            tags,
            description,
            is_public,
            metadata
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Generate thumbnail if needed
        if (generate_thumbnail && this.isImage(file.type)) {
          await this.generateThumbnail(mediaData.id, file);
        }

        // Get public URL
        const publicUrl = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(uploadData.path);

        const mediaItem: MediaItem = {
          ...mediaData,
          url: publicUrl.data.publicUrl,
          thumbnail_url: generate_thumbnail 
            ? this.getThumbnailUrl(mediaData.id) 
            : publicUrl.data.publicUrl
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
   * Get media items with advanced filtering and pagination
   */
  async getMedia(options: MediaSearchOptions = {}): Promise<{
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
      limit = 20,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = options;

    let query = this.supabase
      .from('media')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order(sort_by === 'created_at' ? 'uploaded_at' : sort_by, { ascending: sort_order === 'asc' });

    // Apply filters
    if (search) {
      query = query.or(`original_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (media_type) {
      query = query.eq('media_type', media_type);
    }

    if (directory) {
      query = query.eq('directory', directory);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (date_from) {
      query = query.gte('uploaded_at', date_from);
    }

    if (date_to) {
      query = query.lte('uploaded_at', date_to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Add URLs to items
    const itemsWithUrls = (data || []).map(item => ({
      ...item,
      url: this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(item.file_path).data.publicUrl,
      thumbnail_url: this.getThumbnailUrl(item.id)
    }));

    return {
      items: itemsWithUrls,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }

  /**
   * Get single media item by ID
   */
  async getMediaItem(id: string): Promise<MediaItem> {
    const { data, error } = await this.supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      url: this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.file_path).data.publicUrl,
      thumbnail_url: this.getThumbnailUrl(data.id)
    };
  }

  /**
   * Update media metadata
   */
  async updateMedia(
    id: string, 
    updates: Partial<Pick<MediaItem, 'tags' | 'description' | 'directory' | 'is_public'>>
  ): Promise<MediaItem> {
    const { data, error } = await this.supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      url: this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.file_path).data.publicUrl,
      thumbnail_url: this.getThumbnailUrl(data.id)
    };
  }

  /**
   * Delete media items (bulk operation)
   */
  async deleteMedia(ids: string[]): Promise<void> {
    // Get file paths first
    const { data: mediaItems, error: fetchError } = await this.supabase
      .from('media')
      .select('file_path')
      .in('id', ids);

    if (fetchError) throw fetchError;

    // Delete from storage
    const filePaths = mediaItems.map(item => item.file_path);
    if (filePaths.length > 0) {
      const { error: storageError } = await this.supabase.storage
        .from(this.bucketName)
        .remove(filePaths);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
      }
    }

    // Delete from database
    const { error: dbError } = await this.supabase
      .from('media')
      .delete()
      .in('id', ids);

    if (dbError) throw dbError;
  }

  /**
   * Move media items to different directory
   */
  async moveToDirectory(ids: string[], targetDirectory: string): Promise<void> {
    const { error } = await this.supabase
      .from('media')
      .update({ directory: targetDirectory })
      .in('id', ids);

    if (error) throw error;
  }

  /**
   * Get media statistics
   */
  async getStats(): Promise<MediaStats> {
    const { data, error } = await this.supabase
      .from('media')
      .select('media_type, directory, file_size, uploaded_at');

    if (error) throw error;

    const items = data || [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: MediaStats = {
      total_items: items.length,
      total_size: items.reduce((sum, item) => sum + (item.file_size || 0), 0),
      by_type: {},
      by_directory: {},
      recent_uploads: items.filter(item => 
        new Date(item.uploaded_at) > weekAgo
      ).length
    };

    // Count by type
    items.forEach(item => {
      stats.by_type[item.media_type] = (stats.by_type[item.media_type] || 0) + 1;
      stats.by_directory[item.directory] = (stats.by_directory[item.directory] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get all directories
   */
  async getDirectories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('media')
      .select('directory')
      .not('directory', 'is', null);

    if (error) throw error;

    const directories = [...new Set((data || []).map(item => item.directory))];
    return directories.sort();
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('media')
      .select('tags');

    if (error) throw error;

    const allTags = (data || []).flatMap(item => item.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }

  // Private helper methods
  private async extractMetadata(file: File): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      if (this.isImage(file.type)) {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          });
        };
        img.onerror = () => resolve({});
        img.src = URL.createObjectURL(file);
      } else {
        resolve({});
      }
    });
  }

  private async generateThumbnail(mediaId: string, file: File): Promise<void> {
    // In a real implementation, you would generate thumbnails here
    // For now, we'll just store the thumbnail path
    console.log(`Generating thumbnail for ${mediaId}`, file.name);
  }

  private getThumbnailUrl(mediaId: string): string {
    return this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(`thumbnails/${mediaId}_thumb.jpg`).data.publicUrl;
  }

  private getMediaType(mimeType: string): 'image' | 'video' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}