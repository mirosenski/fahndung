import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Typen für Fahndungen
interface Investigation {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  tags?: string[];
  location?: string;
  contact_info?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface InvestigationImage {
  id: string;
  investigation_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  tags?: string[];
  description?: string;
  is_primary: boolean;
  uploaded_at: string;
}

// Mock-Daten für den Fall, dass Supabase noch nicht eingerichtet ist
const mockInvestigations: Investigation[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Vermisste Person - Max Mustermann",
    description:
      "Max Mustermann wurde zuletzt am 15.03.2024 gesehen. Er trug eine blaue Jacke und schwarze Jeans.",
    status: "active",
    priority: "high",
    tags: ["vermisst", "person"],
    location: "Berlin, Innenstadt",
    created_at: new Date("2024-03-15").toISOString(),
    updated_at: new Date("2024-03-15").toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Diebstahl in der Innenstadt",
    description:
      "Mehrere Diebstähle in der Fußgängerzone gemeldet. Verdächtige Person mit Kapuze beobachtet.",
    status: "active",
    priority: "medium",
    tags: ["diebstahl", "innenstadt"],
    location: "München, Fußgängerzone",
    created_at: new Date("2024-03-20").toISOString(),
    updated_at: new Date("2024-03-20").toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Unfallflucht auf der A1",
    description:
      "Unfallflucht am 20.03.2024 auf der A1, Kilometer 45. Fahrzeug mit beschädigter Stoßstange.",
    status: "active",
    priority: "high",
    tags: ["unfallflucht", "autobahn"],
    location: "A1, Kilometer 45",
    created_at: new Date("2024-03-20").toISOString(),
    updated_at: new Date("2024-03-20").toISOString(),
  },
];

// UUID-Generator für Mock-Daten
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // Fahndungen abrufen
  getInvestigations: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        priority: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }): Promise<Investigation[]> => {
      try {
        // Versuche Supabase zu verwenden
        let query = ctx.db
          .investigations()
          .select("*")
          .order("created_at", { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        if (input.status) {
          query = query.eq("status", input.status);
        }

        if (input.priority) {
          query = query.eq("priority", input.priority);
        }

        const { data, error } = await query;

        if (error) {
          console.warn("Supabase-Fehler, verwende Mock-Daten:", error.message);
          // Fallback zu Mock-Daten
          return mockInvestigations.slice(
            input.offset,
            input.offset + input.limit,
          );
        }

        return (data as Investigation[]) || [];
      } catch (error) {
        console.warn("Supabase nicht verfügbar, verwende Mock-Daten:", error);
        // Fallback zu Mock-Daten
        return mockInvestigations.slice(
          input.offset,
          input.offset + input.limit,
        );
      }
    }),

  // Neue Fahndung erstellen
  createInvestigation: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.string().default("active"),
        priority: z.string().default("medium"),
        tags: z.array(z.string()).default([]),
        location: z.string().optional(),
        contact_info: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Investigation> => {
      try {
        const result = await ctx.db
          .investigations()
          .insert({
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            tags: input.tags,
            location: input.location,
            contact_info: input.contact_info,
          })
          .select()
          .single();

        if (result.error) {
          throw new Error(
            `Fehler beim Erstellen der Fahndung: ${result.error.message}`,
          );
        }

        return result.data as Investigation;
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Erstellung:", error);
        // Mock-Erstellung mit UUID
        const newInvestigation: Investigation = {
          id: generateUUID(),
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return newInvestigation;
      }
    }),

  // Fahndung aktualisieren
  updateInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(), // UUID optional für Mock-Daten
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        tags: z.array(z.string()).optional(),
        location: z.string().optional(),
        contact_info: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Investigation> => {
      try {
        const { id, ...updates } = input;

        if (!id) {
          throw new Error("ID ist erforderlich für Updates");
        }

        // Zuerst prüfen, ob die Fahndung existiert
        const existingInvestigation = await ctx.db
          .investigations()
          .select("id")
          .eq("id", id)
          .single();

        if (existingInvestigation.error || !existingInvestigation.data) {
          console.warn(
            "Fahndung nicht in Datenbank gefunden, verwende Mock-Daten",
          );
          // Fallback zu Mock-Daten
          const mockInvestigation = mockInvestigations.find((i) => i.id === id);
          if (mockInvestigation) {
            return {
              ...mockInvestigation,
              ...updates,
              updated_at: new Date().toISOString(),
            };
          }
          throw new Error("Fahndung nicht gefunden");
        }

        const result = await ctx.db
          .investigations()
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (result.error) {
          throw new Error(
            `Fehler beim Aktualisieren der Fahndung: ${result.error.message}`,
          );
        }

        return result.data as Investigation;
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Update:", error);
        // Mock-Update
        const mockInvestigation = mockInvestigations.find(
          (i) => i.id === input.id,
        );
        if (mockInvestigation) {
          return {
            ...mockInvestigation,
            ...input,
            updated_at: new Date().toISOString(),
          };
        }
        throw new Error("Fahndung nicht gefunden");
      }
    }),

  // Fahndung löschen
  deleteInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(), // UUID optional für Mock-Daten
      }),
    )
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        if (!input.id) {
          throw new Error("ID ist erforderlich für Löschungen");
        }

        const { error } = await ctx.db
          .investigations()
          .delete()
          .eq("id", input.id);

        if (error) {
          throw new Error(`Fehler beim Löschen der Fahndung: ${error.message}`);
        }

        return { success: true };
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Löschung:", error);
        // Mock-Löschung
        return { success: true };
      }
    }),

  // Bilder zu einer Fahndung abrufen
  getInvestigationImages: publicProcedure
    .input(
      z.object({
        investigation_id: z.string().uuid().optional(), // UUID optional für Mock-Daten
      }),
    )
    .query(async ({ ctx, input }): Promise<InvestigationImage[]> => {
      try {
        if (!input.investigation_id) {
          return [];
        }

        const { data, error } = await ctx.db
          .investigationImages()
          .select("*")
          .eq("investigation_id", input.investigation_id)
          .order("uploaded_at", { ascending: false });

        if (error) {
          throw new Error(`Fehler beim Abrufen der Bilder: ${error.message}`);
        }

        return (data as InvestigationImage[]) || [];
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Bilder:", error);
        // Mock-Bilder
        return [];
      }
    }),

  // Bild zu einer Fahndung hinzufügen
  addInvestigationImage: publicProcedure
    .input(
      z.object({
        investigation_id: z.string().uuid().optional(), // UUID optional für Mock-Daten
        file_name: z.string(),
        file_path: z.string(),
        file_size: z.number().optional(),
        mime_type: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        tags: z.array(z.string()).default([]),
        description: z.string().optional(),
        is_primary: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<InvestigationImage> => {
      try {
        const result = await ctx.db
          .investigationImages()
          .insert(input)
          .select()
          .single();

        if (result.error) {
          throw new Error(
            `Fehler beim Hinzufügen des Bildes: ${result.error.message}`,
          );
        }

        return result.data as InvestigationImage;
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Bild-Erstellung:", error);
        // Mock-Bild-Erstellung mit UUID
        const newImage: InvestigationImage = {
          id: generateUUID(),
          investigation_id: input.investigation_id ?? "",
          file_name: input.file_name,
          file_path: input.file_path,
          file_size: input.file_size,
          mime_type: input.mime_type,
          width: input.width,
          height: input.height,
          tags: input.tags,
          description: input.description,
          is_primary: input.is_primary,
          uploaded_at: new Date().toISOString(),
        };
        return newImage;
      }
    }),
});
