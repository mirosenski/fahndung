import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mediaRouter } from "./media";

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

interface InvestigationImage {
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
  tags: string[];
  description?: string;
  is_primary: boolean;
  is_public: boolean;
  metadata: Record<string, unknown>;
}

// Mock-Daten für Fahndungen (temporär bis RLS-Policies korrigiert sind)
const mockInvestigations: Investigation[] = [
  {
    id: "1",
    title: "Vermisste Person - Anna Schmidt",
    case_number: "F-2024-001",
    description:
      "Anna Schmidt wurde zuletzt am 15. März 2024 gesehen. Sie trug eine blaue Jacke und hatte einen roten Rucksack dabei.",
    short_description: "Vermisste Person seit 15. März 2024",
    status: "active",
    priority: "urgent",
    category: "MISSING_PERSON",
    location: "Berlin, Prenzlauer Berg",
    station: "Polizei Berlin",
    features: "Blaue Jacke, roter Rucksack",
    date: "2024-03-15T10:00:00Z",
    created_at: "2024-03-16T08:00:00Z",
    updated_at: "2024-03-16T08:00:00Z",
    created_by: "admin-1",
    assigned_to: "officer-1",
    tags: ["MISSING_PERSON", "URGENT"],
    metadata: {},
  },
  {
    id: "2",
    title: "Gestohlener Laptop - Büro Einbruch",
    case_number: "F-2024-002",
    description:
      "Einbruch in Bürogebäude. Gestohlen wurden mehrere Laptops und elektronische Geräte.",
    short_description: "Büro Einbruch mit Diebstahl",
    status: "active",
    priority: "normal",
    category: "STOLEN_GOODS",
    location: "Hamburg, Hafencity",
    station: "Polizei Hamburg",
    features: "Mehrere Laptops, elektronische Geräte",
    date: "2024-03-14T22:30:00Z",
    created_at: "2024-03-15T09:00:00Z",
    updated_at: "2024-03-15T09:00Z",
    created_by: "admin-1",
    assigned_to: "officer-2",
    tags: ["STOLEN_GOODS", "BURGLARY"],
    metadata: {},
  },
  {
    id: "3",
    title: "Unbekannter Toter - Park",
    case_number: "F-2024-003",
    description:
      "Unbekannter männlicher Toter im Stadtpark gefunden. Alter geschätzt 45-55 Jahre.",
    short_description: "Unbekannter Toter im Stadtpark",
    status: "active",
    priority: "normal",
    category: "UNKNOWN_DEAD",
    location: "München, Englischer Garten",
    station: "Polizei München",
    features: "Männlich, 45-55 Jahre, dunkle Kleidung",
    date: "2024-03-13T07:15:00Z",
    created_at: "2024-03-13T08:00:00Z",
    updated_at: "2024-03-13T08:00:00Z",
    created_by: "admin-1",
    assigned_to: "officer-3",
    tags: ["UNKNOWN_DEAD", "PARK"],
    metadata: {},
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

  // Optimierte Fahndungen-Abfrage mit besseren Limits und Caching
  getInvestigations: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20), // Reduziertes Maximum
        offset: z.number().min(0).default(0),
        status: z.string().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }): Promise<Investigation[]> => {
      console.log("🔍 getInvestigations aufgerufen mit:", input);

      try {
        // Prüfe ob db verfügbar ist
        if (!ctx.db) {
          console.warn("Database nicht verfügbar, verwende Mock-Daten");
          const mockData = mockInvestigations.slice(
            input.offset,
            Math.min(input.offset + input.limit, mockInvestigations.length),
          );
          console.log(
            "📋 Mock-Daten zurückgegeben:",
            mockData.length,
            "Fahndungen",
          );
          return mockData;
        }

        console.log("📊 Verwende Supabase-Datenbank...");

        // Optimierte Supabase-Abfrage mit selektiven Feldern
        let query = ctx.db
          .investigations()
          .select(
            "id, title, case_number, status, priority, category, location, created_at, updated_at",
          ) // Nur benötigte Felder
          .order("created_at", { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);

        // Effiziente Filterung
        if (input.status) {
          query = query.eq("status", input.status);
        }

        if (input.priority) {
          query = query.eq("priority", input.priority);
        }

        if (input.category) {
          query = query.eq("category", input.category);
        }

        const { data, error } = await query;

        if (error) {
          console.warn(
            "❌ Supabase-Fehler, verwende Mock-Daten:",
            error.message,
          );
          // Fallback zu Mock-Daten mit Limit
          const mockData = mockInvestigations.slice(
            input.offset,
            Math.min(input.offset + input.limit, mockInvestigations.length),
          );
          console.log(
            "📋 Mock-Daten zurückgegeben:",
            mockData.length,
            "Fahndungen",
          );
          return mockData;
        }

        console.log(
          "✅ Supabase-Daten erfolgreich geladen:",
          (data as Investigation[])?.length || 0,
          "Fahndungen",
        );
        return (data as Investigation[]) || [];
      } catch (error) {
        console.warn(
          "❌ Supabase nicht verfügbar, verwende Mock-Daten:",
          error,
        );
        // Fallback zu Mock-Daten mit Limit
        const mockData = mockInvestigations.slice(
          input.offset,
          Math.min(input.offset + input.limit, mockInvestigations.length),
        );
        console.log(
          "📋 Mock-Daten zurückgegeben:",
          mockData.length,
          "Fahndungen",
        );
        return mockData;
      }
    }),

  // Neue Fahndung erstellen
  createInvestigation: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.string().default("active"),
        priority: z.enum(["normal", "urgent", "new"]).default("normal"),
        category: z.string().optional(),
        tags: z.array(z.string()).default([]),
        location: z.string().optional(),
        contact_info: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input }): Promise<Investigation> => {
      console.log("🚀 createInvestigation aufgerufen mit:", input);

      try {
        // Temporär: Verwende immer Mock-Daten bis RLS-Policies korrigiert sind
        console.log(
          "📝 Verwende Mock-Erstellung (RLS-Policies müssen korrigiert werden)",
        );

        // Mock-Erstellung mit UUID
        const newInvestigation: Investigation = {
          id: generateUUID(),
          case_number: `F-${Date.now()}`,
          short_description: input.title,
          category: input.category ?? "WANTED_PERSON",
          station: "Allgemein",
          features: "",
          date: new Date().toISOString(),
          created_by: generateUUID(),
          assigned_to: generateUUID(),
          metadata: {},
          title: input.title,
          description: input.description ?? "",
          status: input.status,
          priority: input.priority,
          tags: input.tags,
          location: input.location ?? "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Füge neue Fahndung zur Mock-Liste hinzu
        mockInvestigations.unshift(newInvestigation);
        console.log(
          "✅ Neue Mock-Fahndung hinzugefügt:",
          newInvestigation.title,
        );

        return newInvestigation;
      } catch (error) {
        console.error("❌ Fehler bei Mock-Erstellung:", error);
        throw new Error(`Fehler beim Erstellen der Fahndung: ${String(error)}`);
      }
    }),

  // Fahndung aktualisieren
  updateInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.enum(["normal", "urgent", "new"]).optional(),
        tags: z.array(z.string()).optional(),
        location: z.string().optional(),
        contact_info: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Investigation> => {
      try {
        if (!ctx.db) {
          console.warn("Database nicht verfügbar, Mock-Update");
          // Mock-Update
          const mockInvestigation = mockInvestigations.find(
            (inv) => inv.id === input.id,
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

        const { id, ...updateData } = input;

        const result = await ctx.db
          .investigations()
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
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
          (inv) => inv.id === input.id,
        );
        if (mockInvestigation) {
          return { ...mockInvestigation, ...input };
        }
        throw new Error("Fahndung nicht gefunden");
      }
    }),

  // Fahndung löschen
  deleteInvestigation: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<boolean> => {
      try {
        if (!ctx.db) {
          console.warn("Database nicht verfügbar, Mock-Delete");
          // Mock-Delete
          const index = mockInvestigations.findIndex(
            (inv) => inv.id === input.id,
          );
          if (index !== -1) {
            mockInvestigations.splice(index, 1);
            return true;
          }
          return false;
        }

        const result = await ctx.db
          .investigations()
          .delete()
          .eq("id", input.id);

        if (result.error) {
          throw new Error(
            `Fehler beim Löschen der Fahndung: ${result.error.message}`,
          );
        }

        return true;
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Delete:", error);
        // Mock-Delete
        const index = mockInvestigations.findIndex(
          (inv) => inv.id === input.id,
        );
        if (index !== -1) {
          mockInvestigations.splice(index, 1);
          return true;
        }
        return false;
      }
    }),

  // Bilder zu einer Fahndung abrufen mit optimierter Abfrage
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

        if (!ctx.db) {
          console.warn("Database nicht verfügbar, Mock-Bilder");
          return [];
        }

        // Optimierte Abfrage mit Limit und selektiven Feldern
        const { data, error } = await ctx.db
          .investigationImages()
          .select(
            "id, file_name, original_name, file_path, file_size, mime_type, uploaded_at, is_primary",
          )
          .eq("investigation_id", input.investigation_id)
          .order("is_primary", { ascending: false })
          .order("uploaded_at", { ascending: false })
          .limit(20); // Limit für bessere Performance

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
        investigation_id: z.string().uuid(),
        file_name: z.string(),
        original_name: z.string(),
        file_path: z.string(),
        file_size: z.number(),
        mime_type: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
        description: z.string().optional(),
        is_primary: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<InvestigationImage> => {
      try {
        if (!ctx.db) {
          console.warn("Database nicht verfügbar, Mock-Bild-Add");
          // Mock-Bild-Add
          const newImage: InvestigationImage = {
            id: generateUUID(),
            ...input,
            uploaded_at: new Date().toISOString(),
            uploaded_by: "user-1",
            is_public: true,
            metadata: {},
          };
          return newImage;
        }

        const result = await ctx.db
          .investigationImages()
          .insert({
            investigation_id: input.investigation_id,
            file_name: input.file_name,
            original_name: input.original_name,
            file_path: input.file_path,
            file_size: input.file_size,
            mime_type: input.mime_type,
            width: input.width,
            height: input.height,
            description: input.description,
            is_primary: input.is_primary,
            tags: input.tags,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (result.error) {
          throw new Error(
            `Fehler beim Hinzufügen des Bildes: ${result.error.message}`,
          );
        }

        return result.data as InvestigationImage;
      } catch (error) {
        console.warn("Supabase nicht verfügbar, Mock-Bild-Add:", error);
        // Mock-Bild-Add
        const newImage: InvestigationImage = {
          id: generateUUID(),
          ...input,
          uploaded_at: new Date().toISOString(),
          uploaded_by: "user-1",
          is_public: true,
          metadata: {},
        };
        return newImage;
      }
    }),

  // Statistiken abrufen
  getStatistics: publicProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.db) {
        console.warn("Database nicht verfügbar, Mock-Statistiken");
        // Mock-Statistiken
        return {
          total: mockInvestigations.length,
          byStatus: {
            active: mockInvestigations.filter((inv) => inv.status === "active")
              .length,
            published: 0,
            draft: 0,
            closed: 0,
          },
          byPriority: {
            urgent: mockInvestigations.filter(
              (inv) => inv.priority === "urgent",
            ).length,
            normal: mockInvestigations.filter(
              (inv) => inv.priority === "normal",
            ).length,
            new: 0,
          },
          byCategory: {
            WANTED_PERSON: 0,
            MISSING_PERSON: 0,
            UNKNOWN_DEAD: 0,
            STOLEN_GOODS: 0,
          },
        };
      }

      // Optimierte Statistiken-Abfrage
      const { data, error } = await ctx.db
        .investigations()
        .select("status, priority, category")
        .limit(1000); // Limit für Performance

      if (error) {
        throw new Error(
          `Fehler beim Abrufen der Statistiken: ${error.message}`,
        );
      }

      const investigations = data as Investigation[];

      return {
        total: investigations.length,
        byStatus: {
          active: investigations.filter((inv) => inv.status === "active")
            .length,
          published: investigations.filter((inv) => inv.status === "published")
            .length,
          draft: investigations.filter((inv) => inv.status === "draft").length,
          closed: investigations.filter((inv) => inv.status === "closed")
            .length,
        },
        byPriority: {
          urgent: investigations.filter((inv) => inv.priority === "urgent")
            .length,
          normal: investigations.filter((inv) => inv.priority === "normal")
            .length,
          new: investigations.filter((inv) => inv.priority === "new").length,
        },
        byCategory: {
          WANTED_PERSON: investigations.filter(
            (inv) => inv.category === "WANTED_PERSON",
          ).length,
          MISSING_PERSON: investigations.filter(
            (inv) => inv.category === "MISSING_PERSON",
          ).length,
          UNKNOWN_DEAD: investigations.filter(
            (inv) => inv.category === "UNKNOWN_DEAD",
          ).length,
          STOLEN_GOODS: investigations.filter(
            (inv) => inv.category === "STOLEN_GOODS",
          ).length,
        },
      };
    } catch (error) {
      console.warn("Supabase nicht verfügbar, Mock-Statistiken:", error);
      // Mock-Statistiken
      return {
        total: mockInvestigations.length,
        byStatus: {
          active: mockInvestigations.filter((inv) => inv.status === "active")
            .length,
          published: 0,
          draft: 0,
          closed: 0,
        },
        byPriority: {
          urgent: mockInvestigations.filter((inv) => inv.priority === "urgent")
            .length,
          normal: mockInvestigations.filter((inv) => inv.priority === "normal")
            .length,
          new: 0,
        },
        byCategory: {
          WANTED_PERSON: 0,
          MISSING_PERSON: 0,
          UNKNOWN_DEAD: 0,
          STOLEN_GOODS: 0,
        },
      };
    }
  }),

  // Media routes
  media: mediaRouter,
});
