import { z } from "zod";

// Schema für UI-Eingabe (streng)
export const UIInvestigationInputSchema = z.object({
  step1: z.object({
    title: z.string().min(1, "Titel ist erforderlich"),
    category: z.enum([
      "WANTED_PERSON",
      "MISSING_PERSON",
      "UNKNOWN_DEAD",
      "STOLEN_GOODS",
    ]),
    caseNumber: z.string().optional(),
  }),
  step2: z.object({
    shortDescription: z.string().min(5, "Mindestens 5 Zeichen"), // Von 10 auf 5 reduziert
    description: z.string().min(10, "Mindestens 10 Zeichen"), // Von 20 auf 10 reduziert
    priority: z.enum(["normal", "urgent", "new"]),
    tags: z.array(z.string()).optional().default([]), // Optional gemacht
    features: z.string(),
  }),
  step3: z.object({
    mainImage: z.string().nullable(),
    additionalImages: z.array(z.string()),
  }),
  step4: z.object({
    mainLocation: z.object({ address: z.string() }).nullable(),
  }),
  step5: z.object({
    contactPerson: z.string().min(1, "Kontaktperson erforderlich"),
    contactPhone: z.string().optional().default(""), // Komplett optional gemacht
    contactEmail: z.string().email().optional().or(z.literal("")),
    department: z.string(),
    availableHours: z.string(),
  }),
});

// Schema für das Bearbeiten bestehender Daten (toleranter)
export const UIInvestigationEditSchema = z.object({
  step1: z.object({
    title: z.string().min(1, "Titel ist erforderlich"),
    category: z.enum([
      "WANTED_PERSON",
      "MISSING_PERSON",
      "UNKNOWN_DEAD",
      "STOLEN_GOODS",
    ]),
    caseNumber: z.string().optional(),
  }),
  step2: z.object({
    shortDescription: z.string().min(1, "Kurzbeschreibung ist erforderlich"), // Mindestens 1 Zeichen
    description: z.string().min(1, "Beschreibung ist erforderlich"), // Mindestens 1 Zeichen
    priority: z.enum(["normal", "urgent", "new"]),
    tags: z.array(z.string()).optional().default([]),
    features: z.string(),
  }),
  step3: z.object({
    mainImage: z.string().nullable(),
    additionalImages: z.array(z.string()),
  }),
  step4: z.object({
    mainLocation: z.object({ address: z.string() }).nullable(),
  }),
  step5: z.object({
    contactPerson: z.string().min(1, "Kontaktperson erforderlich"),
    contactPhone: z.string().optional().default(""),
    contactEmail: z.string().email().optional().or(z.literal("")),
    department: z.string(),
    availableHours: z.string(),
  }),
});

// Schema für DB-Daten (lockerer, für Konvertierung)
export const UIInvestigationDBSchema = z.object({
  step1: z.object({
    title: z.string().optional().default(""),
    category: z
      .enum(["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"])
      .optional()
      .default("MISSING_PERSON"),
    caseNumber: z.string().optional(),
  }),
  step2: z.object({
    shortDescription: z.string().optional().default(""),
    description: z.string().optional().default(""), // Keine Mindestlänge für DB-Daten
    priority: z.enum(["normal", "urgent", "new"]).optional().default("normal"),
    tags: z.array(z.string()).optional().default([]),
    features: z.string().optional().default(""),
  }),
  step3: z.object({
    mainImage: z.string().nullable().optional(),
    additionalImages: z.array(z.string()).optional().default([]),
  }),
  step4: z.object({
    mainLocation: z.object({ address: z.string() }).nullable().optional(),
  }),
  step5: z.object({
    contactPerson: z.string().optional().default(""),
    contactPhone: z.string().optional().default(""), // Kein Regex für DB-Daten
    contactEmail: z.string().optional().default(""), // Keine Email-Validierung für DB-Daten
    department: z.string().optional().default(""),
    availableHours: z.string().optional().default(""),
  }),
  // Zusätzliche Felder für DB
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt_text: z.string().optional(),
        caption: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  contact_info: z.record(z.unknown()).optional().default({}),
});

export type UIInvestigationData = z.infer<typeof UIInvestigationDBSchema>;

// API Input Schema
export const ContactInfoSchema = z.object({
  person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hours: z.string().optional(),
});

export const UpdateInvestigationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  short_description: z.string().optional(),
  status: z.enum(["draft", "active", "published", "archived"]).optional(),
  priority: z.enum(["normal", "urgent", "new"]).optional(),
  category: z
    .enum(["WANTED_PERSON", "MISSING_PERSON", "UNKNOWN_DEAD", "STOLEN_GOODS"])
    .optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  contact_info: ContactInfoSchema.optional(),
  features: z.string().optional(),
  station: z.string().optional(),
});

export type UpdateInvestigationInput = z.infer<
  typeof UpdateInvestigationSchema
>;

// Result Type für Fehlerbehandlung
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error | z.ZodError };

// Database Types
export interface DBInvestigationData {
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
  tags: string[];
  contact_info?: Record<string, unknown>;
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}
