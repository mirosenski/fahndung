import type { SupabaseClient } from "@supabase/supabase-js";

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
  contact_info: Record<string, unknown>;
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
}
