import type { SupabaseClient } from "@supabase/supabase-js";

// Article content block types
export interface ArticleBlock {
  type: "paragraph" | "heading" | "image" | "quote" | "list" | "code";
  content?: string;
  level?: number;
  src?: string;
  alt?: string;
  caption?: string;
  author?: string;
  ordered?: boolean;
  items?: string[];
  language?: string;
}

// Article metadata structure
export interface ArticleMeta {
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  keywords?: string[];
  author?: string;
  reading_time?: number;
}

export interface InvestigationData {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: "draft" | "active" | "published" | "closed";
  priority: "normal" | "urgent" | "new";
  category:
    | "WANTED_PERSON"
    | "MISSING_PERSON"
    | "UNKNOWN_DEAD"
    | "STOLEN_GOODS";
  location: string;
  station: string;
  contact_info: {
    person?: string;
    phone?: string;
    email?: string;
  };
  features?: string;
  date: string;
  created_by: string;
  assigned_to?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  images?: InvestigationImage[];
  created_by_user?: {
    name: string;
    email: string;
  };

  // Article publishing features
  published_as_article?: boolean;
  article_slug?: string;
  article_content?: {
    blocks: ArticleBlock[];
  };
  article_meta?: ArticleMeta;
  article_published_at?: string;
  article_views?: number;
}

export interface InvestigationImage {
  id: string;
  investigation_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  uploaded_at: string;
  uploaded_by: string;
  tags?: string[];
  description?: string;
  is_primary: boolean;
  is_public: boolean;
  metadata?: Record<string, unknown>;
  url?: string;
}

// Hilfstyp für Supabase-Response (wird nicht mehr verwendet)
// interface SupabaseResponse<T> {
//   data: T;
//   error: Error | null;
// }

export class FahndungsService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // Create new investigation
  async createInvestigation(
    data: Partial<InvestigationData>,
  ): Promise<InvestigationData> {
    const { data: investigation, error } = (await this.supabase
      .from("investigations")
      .insert(data)
      .select()
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) throw error;
    return investigation!;
  }

  // Get all investigations
  async getInvestigations(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<InvestigationData[]> {
    let query = this.supabase
      .from("investigations")
      .select(
        `
        *,
        created_by_user:user_profiles!investigations_created_by_fkey(name, email),
        images:investigation_images(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,case_number.ilike.%${filters.search}%`,
      );
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit ?? 10) - 1,
      );
    }

    const { data, error } = (await query) as {
      data: InvestigationData[] | null;
      error: Error | null;
    };
    if (error) throw error;
    return data!;
  }

  // Get single investigation
  async getInvestigation(id: string): Promise<InvestigationData> {
    const { data, error } = (await this.supabase
      .from("investigations")
      .select(
        `
        *,
        created_by_user:user_profiles!investigations_created_by_fkey(name, email),
        assigned_to_user:user_profiles!investigations_assigned_to_fkey(name, email),
        images:investigation_images(*)
      `,
      )
      .eq("id", id)
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) throw error;
    return data!;
  }

  // Update investigation
  async updateInvestigation(
    id: string,
    data: Partial<InvestigationData>,
  ): Promise<InvestigationData> {
    const { data: investigation, error } = (await this.supabase
      .from("investigations")
      .update(data)
      .eq("id", id)
      .select()
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) throw error;
    return investigation!;
  }

  // Delete investigation
  async deleteInvestigation(id: string): Promise<void> {
    // First delete related images
    await this.deleteInvestigationImages(id);

    const { error } = await this.supabase
      .from("investigations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // Upload investigation image
  async uploadImage(
    investigationId: string,
    file: File,
    metadata?: {
      description?: string;
      is_primary?: boolean;
      tags?: string[];
    },
  ): Promise<InvestigationImage> {
    const fileName = `${investigationId}/${Date.now()}_${file.name}`;

    // Upload to storage
    const { error: uploadError } = await this.supabase.storage
      .from("investigation-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get current user
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("Nicht authentifiziert");

    // Save metadata
    const { data: imageData, error: dbError } = (await this.supabase
      .from("investigation_images")
      .insert({
        investigation_id: investigationId,
        file_name: fileName,
        original_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
        ...metadata,
      })
      .select()
      .single()) as { data: InvestigationImage | null; error: Error | null };

    if (dbError) throw dbError;
    return imageData!;
  }

  // Get investigation images
  async getInvestigationImages(
    investigationId: string,
  ): Promise<InvestigationImage[]> {
    const { data, error } = (await this.supabase
      .from("investigation_images")
      .select("*")
      .eq("investigation_id", investigationId)
      .order("is_primary", { ascending: false })
      .order("uploaded_at", { ascending: false })) as {
      data: InvestigationImage[] | null;
      error: Error | null;
    };

    if (error) throw error;

    // Add public URLs
    const imagesWithUrls = (data ?? []).map((img: InvestigationImage) => ({
      ...img,
      url: this.supabase.storage
        .from("investigation-images")
        .getPublicUrl(img.file_path).data.publicUrl,
    }));

    return imagesWithUrls;
  }

  // Delete investigation images
  async deleteInvestigationImages(investigationId: string): Promise<void> {
    const images = await this.getInvestigationImages(investigationId);

    // Delete from storage
    const filePaths = images.map((img) => img.file_path);
    if (filePaths.length > 0) {
      await this.supabase.storage
        .from("investigation-images")
        .remove(filePaths);
    }

    // Delete from database
    const { error } = await this.supabase
      .from("investigation_images")
      .delete()
      .eq("investigation_id", investigationId);

    if (error) throw error;
  }

  // Search investigations
  async searchInvestigations(query: string): Promise<InvestigationData[]> {
    const { data, error } = (await this.supabase
      .from("investigations")
      .select(
        `
        *,
        created_by_user:user_profiles!investigations_created_by_fkey(name, email),
        images:investigation_images(*)
      `,
      )
      .or(
        `
        title.ilike.%${query}%,
        description.ilike.%${query}%,
        short_description.ilike.%${query}%,
        case_number.ilike.%${query}%,
        location.ilike.%${query}%,
        station.ilike.%${query}%
      `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })) as {
      data: InvestigationData[] | null;
      error: Error | null;
    };

    if (error) throw error;
    return data!;
  }

  // Get statistics
  async getStatistics(): Promise<Record<string, unknown>> {
    const { data: stats, error } = (await this.supabase.rpc(
      "get_investigation_statistics",
    )) as { data: Record<string, unknown> | null; error: Error | null };

    if (error) throw error;
    return stats!;
  }

  // ============================================
  // ARTICLE PUBLISHING METHODS
  // ============================================

  // Publish investigation as article
  async publishAsArticle(
    investigationId: string,
    articleData: {
      content?: { blocks: ArticleBlock[] };
      meta?: ArticleMeta;
    },
  ): Promise<InvestigationData> {
    const { data, error } = (await this.supabase
      .from("investigations")
      .update({
        published_as_article: true,
        article_content: articleData.content,
        article_meta: articleData.meta,
        article_published_at: new Date().toISOString(),
      })
      .eq("id", investigationId)
      .select()
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) throw error;
    return data!;
  }

  // Unpublish article
  async unpublishArticle(investigationId: string): Promise<InvestigationData> {
    const { data, error } = (await this.supabase
      .from("investigations")
      .update({
        published_as_article: false,
        article_slug: null,
        article_published_at: null,
      })
      .eq("id", investigationId)
      .select()
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) throw error;
    return data!;
  }

  // Get published articles
  async getPublishedArticles(filters?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
  }): Promise<InvestigationData[]> {
    let query = this.supabase
      .from("investigations")
      .select(
        `
        *,
        created_by_user:user_profiles!investigations_created_by_fkey(name, email),
        images:investigation_images(*)
      `,
      )
      .eq("published_as_article", true)
      .eq("status", "published")
      .not("article_slug", "is", null)
      .order("article_published_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`,
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit ?? 10) - 1,
      );
    }

    const { data, error } = (await query) as {
      data: InvestigationData[] | null;
      error: Error | null;
    };

    if (error) throw error;
    return data!;
  }

  // Get article by slug
  async getArticleBySlug(slug: string): Promise<InvestigationData | null> {
    const { data, error } = (await this.supabase
      .from("investigations")
      .select(
        `
        *,
        created_by_user:user_profiles!investigations_created_by_fkey(name, email),
        images:investigation_images(*)
      `,
      )
      .eq("article_slug", slug)
      .eq("published_as_article", true)
      .eq("status", "published")
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) {
      if (error.message.includes("No rows found")) {
        return null;
      }
      throw error;
    }

    return data;
  }

  // Increment article views
  async incrementArticleViews(articleId: string): Promise<void> {
    const { error } = await this.supabase.rpc("increment_article_views", {
      article_id: articleId,
    });

    if (error) throw error;
  }

  // Update article content
  async updateArticleContent(
    investigationId: string,
    content: { blocks: ArticleBlock[] },
    meta?: ArticleMeta,
  ): Promise<InvestigationData> {
    const updateData: Partial<InvestigationData> = {
      article_content: content,
    };

    if (meta) {
      updateData.article_meta = meta;
    }

    const { data, error } = (await this.supabase
      .from("investigations")
      .update(updateData)
      .eq("id", investigationId)
      .eq("published_as_article", true)
      .select()
      .single()) as { data: InvestigationData | null; error: Error | null };

    if (error) throw error;
    return data!;
  }

  // Get article statistics
  async getArticleStatistics(): Promise<{
    total_published: number;
    total_views: number;
    most_viewed: Partial<InvestigationData>[];
    recent_articles: Partial<InvestigationData>[];
  }> {
    // Get total published articles
    const { count: totalPublished } = await this.supabase
      .from("investigations")
      .select("*", { count: "exact", head: true })
      .eq("published_as_article", true)
      .eq("status", "published");

    // Get total views
    const { data: viewsData } = await this.supabase
      .from("investigations")
      .select("article_views")
      .eq("published_as_article", true)
      .eq("status", "published");

    const totalViews =
      viewsData?.reduce(
        (sum: number, item: { article_views: number | null }) =>
          sum + (item.article_views ?? 0),
        0,
      ) ?? 0;

    // Get most viewed articles
    const { data: mostViewed } = await this.supabase
      .from("investigations")
      .select("id, title, article_slug, article_views, article_published_at")
      .eq("published_as_article", true)
      .eq("status", "published")
      .not("article_views", "is", null)
      .order("article_views", { ascending: false })
      .limit(5);

    // Get recent articles
    const { data: recentArticles } = await this.supabase
      .from("investigations")
      .select("id, title, article_slug, article_published_at")
      .eq("published_as_article", true)
      .eq("status", "published")
      .order("article_published_at", { ascending: false })
      .limit(5);

    return {
      total_published: totalPublished ?? 0,
      total_views: totalViews,
      most_viewed: mostViewed ?? [],
      recent_articles: recentArticles ?? [],
    };
  }
}
